import { watch } from "vue";
import { defineStore } from "pinia";
import { Notify } from "quasar";
import { api } from "@/api/client";
import type { Lyrics, Quality, RepeatMode, Track } from "@/api/types";
import { convertFileSrc } from "@tauri-apps/api/core";
import {
  audio,
  cancelFade,
  clearWarm,
  currentLevel,
  ensureAnalyser,
  fadeIn,
  fadeOut,
  isCurrentToken,
  nextSourceToken,
  resumeAudioContext,
  resetNormalization,
  setNormalization,
  safePlay,
  warmNext,
  resumeOnGesture,
} from "@/lib/audio";
import {
  bindMediaSession,
  mediaSessionAvailable,
  mediaSessionOwner,
  setMediaSessionEnabled,
  updateMediaMetadata,
  updatePlaybackState,
  updatePositionState,
} from "@/lib/mediaSession";
import { readCache, releaseMemoryCache, writeCache } from "@/lib/cache";
import type { LyricsOrigin } from "@/lib/lyricsSource";
import { hasText, loadTrackLyrics } from "@/lib/lyricsSource";
import { proxyStream } from "@/lib/stream";
import {
  censorUrl,
  ensureCensorList,
  prefersOriginal,
  setPrefersOriginal,
} from "@/lib/censor";
import { getOverride, overrideUrl } from "@/lib/censorOverrides";
import { createLogger, logQuality } from "@/lib/log";
import { useEqualizerStore } from "@/stores/equalizer";
import { useLibraryStore } from "@/stores/library";
import { useSleepStore } from "@/stores/sleep";
import { useStatsStore } from "@/stores/stats";
import { useTogetherStore } from "@/stores/together/index";
import type { LyricsSource } from "@/stores/ui/defaults";
import { DEFAULT_DISCORD_CLIENT_ID, useUiStore } from "@/stores/ui/index";
import { artistNames } from "@/lib/format";
import { setTrayTooltip } from "@/lib/tray";
import { resetPresenceSignature, syncDiscordPresence } from "./presence";
import { loadSession, saveSession } from "./session";
import type { PlaybackSettings } from "./settings";
import { loadPlaybackSettings, savePlaybackSettings } from "./settings";

const DEFAULT_STATION = "user:onyourwave";
const SEEN_LIMIT = 600;
const WAVE_HISTORY_KEY = "wave.history.v1";
const WAVE_HISTORY_LIMIT = 500;
const PREFETCH_LIMIT = 4;

const log = createLogger("player");

interface PrefetchEntry {
  url: string;
  codec: string | null;
  bitrate: number | null;
  local: boolean;
  censored: boolean;
  label: string | null;
  source: string;
}

const prefetched = new Map<string, PrefetchEntry>();

async function stopNeuroPlayback(): Promise<void> {
  try {
    const { neuro, stopNeuro } = await import("@/lib/neuro");
    if (neuro.item) stopNeuro();
  } catch {}
}

function dedupeTracks(tracks: Track[], known?: Set<string>): Track[] {
  const seen = known ?? new Set<string>();
  const out: Track[] = [];
  for (const track of tracks) {
    if (!track?.id || seen.has(track.id)) continue;
    seen.add(track.id);
    out.push(track);
  }
  return out;
}

function rememberPrefetch(id: string, entry: PrefetchEntry): void {
  prefetched.delete(id);
  prefetched.set(id, entry);
  while (prefetched.size > PREFETCH_LIMIT) {
    const oldest = prefetched.keys().next().value;
    if (oldest === undefined) break;
    prefetched.delete(oldest);
  }
}

interface PlayerState {
  queue: Track[];
  sourceQueue: Track[];
  index: number;
  current: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  muted: boolean;
  quality: Quality;
  playbackRate: number;
  repeat: RepeatMode;
  shuffle: boolean;
  currentCodec: string | null;
  currentBitrate: number | null;
  currentSource: string | null;
  playingLocal: boolean;
  censorReplaced: boolean;
  censorAvailable: boolean;
  replacementLabel: string | null;
  loading: boolean;
  waveBatchId: string | null;
  waveSessionId: string | null;
  waveSettings: {
    moodEnergy: string | null;
    diversity: string | null;
    language: string | null;
  };
  waveSeeds: string[];
  isWave: boolean;
  stationId: string | null;
  stationName: string | null;
  fetchingMore: boolean;
  seenIds: string[];
  lyrics: Lyrics | null;
  lyricsLoading: boolean;
  lyricsError: string | null;
  lyricsOrigin: LyricsOrigin | null;
  lyricsPick: LyricsSource | null;
  lyricsTranslation: string[] | null;
  lyricsTranslateKey: string | null;
  lyricsTranslateLoading: boolean;
  showLyrics: boolean;
  lyricsFullscreen: boolean;
  fullscreen: boolean;
  waveError: string | null;
  presenceError: string | null;
  presenceConnected: boolean;
  presenceReconnecting: boolean;
  presenceUser: string | null;
  pendingResume: boolean;
}

let presenceTimer: number | null = null;
let lastSessionSave = 0;
let lastProgress = 0;
let lastMediaSync = 0;
let mediaBound = false;
let normBound = false;
let translateBound = false;
let quietSince = 0;
let skipGuard = 0;

let loadChain: Promise<void> = Promise.resolve();
let navSeq = 0;
let lastLoadAt = 0;
let stallTimer: number | null = null;
let stallAt = 0;
let stallSince = 0;
let recoverStep = 0;
let lastRecover = 0;
let radioStarted = false;

export const usePlayerStore = defineStore("player", {
  state: (): PlayerState => {
    const s = loadPlaybackSettings();
    return {
      queue: [],
      sourceQueue: [],
      index: -1,
      current: null,
      isPlaying: false,
      progress: 0,
      duration: 0,
      volume: s.volume,
      muted: s.muted,
      quality: s.quality,
      playbackRate: s.playbackRate,
      repeat: s.repeat,
      shuffle: false,
      currentCodec: null,
      currentBitrate: null,
      currentSource: null,
      playingLocal: false,
      censorReplaced: false,
      censorAvailable: false,
      replacementLabel: null,
      loading: false,
      waveBatchId: null,
      waveSessionId: null,
      waveSettings: {
        moodEnergy: null,
        diversity: null,
        language: null,
      },
      waveSeeds: [],
      isWave: false,
      stationId: null,
      stationName: null,
      fetchingMore: false,
      seenIds: [],
      lyrics: null,
      lyricsLoading: false,
      lyricsError: null,
      lyricsOrigin: null,
      lyricsPick: null,
      lyricsTranslation: null,
      lyricsTranslateKey: null,
      lyricsTranslateLoading: false,
      showLyrics: false,
      lyricsFullscreen: false,
      fullscreen: false,
      waveError: null,
      presenceError: null,
      presenceConnected: false,
      presenceReconnecting: false,
      presenceUser: null,
      pendingResume: false,
    };
  },

  getters: {
    hasNext: (s) => {
      if (s.index < s.queue.length - 1 || s.repeat === "all") return true;
      if (!s.queue.length) return false;
      const ui = useUiStore().settings;
      return ui.repeatPlaylistAlways || ui.autoWaveOnQueueEnd;
    },
    hasPrev: (s) => s.index > 0,
    waveActive: (s) => s.isWave && Boolean(s.current),
    qualityLabel: (s) => {
      if (!s.currentCodec) return "";
      const codec = s.currentCodec.toUpperCase();
      return s.currentBitrate ? `${codec} ${s.currentBitrate} kbps` : codec;
    },
    activeLine: (s) => {
      const lines = s.lyrics?.lines || [];
      if (!s.lyrics?.synced || !lines.length) return -1;
      const ms = s.progress * 1000;
      let found = -1;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line && line.time_ms <= ms + 150) found = i;
        else break;
      }
      return found;
    },
  },

  actions: {
    persist() {
      const payload: PlaybackSettings = {
        volume: this.volume,
        quality: this.quality,
        playbackRate: this.playbackRate,
        repeat: this.repeat,
        muted: this.muted,
      };
      savePlaybackSettings(payload);
    },

    bind() {
      if (useUiStore().settings.censorBypass) void ensureCensorList();
      audio.volume = this.muted ? 0 : this.volume;
      audio.playbackRate = this.playbackRate;
      const startSettings = useUiStore().settings;
      if (startSettings.trimSilence || startSettings.gaplessEnabled) {
        ensureAnalyser();
      }
      audio.ontimeupdate = () => {
        const previous = lastProgress;
        this.progress = audio.currentTime;
        this.duration = audio.duration || 0;
        lastProgress = this.progress;

        if (
          Date.now() - lastMediaSync > 1000 &&
          mediaSessionOwner() === "main"
        ) {
          lastMediaSync = Date.now();
          updatePositionState(this.duration, this.progress, this.playbackRate);
        }

        const delta = this.progress - previous;
        if (delta > 0 && delta < 6 && !audio.paused) {
          useStatsStore().tick(delta);
        }

        const settings = useUiStore().settings;
        const gapless = settings.gaplessEnabled;
        if (
          (settings.trimSilence || gapless) &&
          this.duration > 20 &&
          !audio.paused
        ) {
          const left = this.duration - this.progress;
          const minLeft = gapless ? 0.2 : 1.5;
          const quietLevel = gapless ? 0.007 : 0.004;
          const hold = gapless ? 380 : 1100;
          if (left > minLeft && left < 25) {
            if (currentLevel() < quietLevel) {
              if (quietSince === 0) quietSince = Date.now();
              else if (Date.now() - quietSince > hold) {
                quietSince = 0;
                if (!useTogetherStore().isGuest) void this.next(true);
              }
            } else {
              quietSince = 0;
            }
          } else {
            quietSince = 0;
          }
        }

        const now = Date.now();
        if (now - lastSessionSave > 5000) {
          lastSessionSave = now;
          this.persistSession();
        }
      };
      audio.onended = () => {
        if (useSleepStore().onTrackEnded()) return;
        if (useTogetherStore().isGuest) return;
        void this.next(true);
      };
      audio.onplay = () => {
        this.isPlaying = true;
        resumeAudioContext();
        if (mediaSessionOwner() === "main") {
          updatePlaybackState(true, Boolean(this.current));
          updatePositionState(this.duration, this.progress, this.playbackRate);
        }
        void this.syncPresence();
        void this.syncTray();
      };
      audio.onpause = () => {
        this.isPlaying = false;
        if (mediaSessionOwner() === "main") {
          updatePlaybackState(false, Boolean(this.current));
        }
        void this.syncPresence();
        this.persistSession();
        void this.syncTray();
      };
      audio.onplaying = () => {
        stallAt = audio.currentTime;
        stallSince = 0;
        recoverStep = 0;
      };
      audio.onerror = () => {
        if (!this.current || this.loading) return;
        log.warn("audio error", audio.error?.code ?? null);
        void this.recoverPlayback(audio.currentTime, true);
      };

      useEqualizerStore().apply();

      if (presenceTimer === null) {
        presenceTimer = window.setInterval(() => {
          void this.syncPresence();
        }, 15000);
      }

      if (stallTimer === null) {
        stallTimer = window.setInterval(() => {
          this.watchStall();
        }, 2000);
      }

      this.setupMediaSession();

      setNormalization(useUiStore().settings.normalizeVolume);
      if (!normBound) {
        normBound = true;
        watch(
          () => useUiStore().settings.normalizeVolume,
          (on) => setNormalization(on),
        );
      }

      if (!translateBound) {
        translateBound = true;
        watch(
          () => [
            useUiStore().settings.lyricsTranslate,
            useUiStore().settings.lyricsTranslateTarget,
          ],
          () => void this.loadTranslation(true),
        );
      }
    },

    setupMediaSession() {
      if (!mediaSessionAvailable()) return;
      this.refreshMediaSession();
      if (!mediaBound) {
        mediaBound = true;
        watch(
          () => [this.current?.id ?? null, this.isPlaying] as const,
          () => this.refreshMediaSession(),
        );
      }
    },

    refreshMediaSession() {
      if (!mediaSessionAvailable() || mediaSessionOwner() === "neuro") return;
      setMediaSessionEnabled(true);
      bindMediaSession({
        play: () => {
          if (this.pendingResume) {
            void this.loadCurrent({ startAt: this.progress, autoplay: true });
          } else {
            void stopNeuroPlayback().then(() => safePlay());
          }
        },
        pause: () => audio.pause(),
        stop: () => audio.pause(),
        next: () => void this.next(),
        prev: () => void this.prev(),
        seekTo: (time) => this.seek(time),
        seekBy: (offset) =>
          this.seek((audio.currentTime || this.progress) + offset),
      });
      updateMediaMetadata(this.current);
      updatePlaybackState(this.isPlaying, Boolean(this.current));
      updatePositionState(this.duration, this.progress, this.playbackRate);
    },

    async syncPresence(force = false) {
      const error = await syncDiscordPresence(
        {
          track: this.current,
          isPlaying: this.isPlaying,
          progress: this.progress,
          duration: this.duration,
          playbackRate: this.playbackRate,
        },
        { force },
      );
      this.presenceError = error;
      void this.refreshPresenceStatus();
      return error;
    },

    async refreshPresenceStatus() {
      try {
        const status = await api.discordPresenceStatus();
        this.presenceConnected = Boolean(status?.connected);
        this.presenceUser = status?.user ?? null;
        this.presenceError = status?.lastError ?? null;
        log.info("presence status", status);
      } catch (error) {
        this.presenceConnected = false;
        this.presenceUser = null;
        log.warn("presence status failed", error);
      }
      return this.presenceConnected;
    },

    async reconnectPresence() {
      const settings = useUiStore().settings;
      const clientId =
        settings.discordClientId.trim() || DEFAULT_DISCORD_CLIENT_ID;

      this.presenceReconnecting = true;
      try {
        const status = await api.reconnectDiscordPresence(clientId);
        this.presenceConnected = Boolean(status?.connected ?? true);
        this.presenceUser = status?.user ?? null;
        this.presenceError = null;
        log.info("presence reconnected", status);
        resetPresenceSignature();
        const error = await this.syncPresence(true);
        Notify.create(
          error
            ? { type: "negative", message: error }
            : { message: "Discord подкл����ён заново" },
        );
        return error;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Discord недоступен";
        this.presenceConnected = false;
        this.presenceError = message;
        Notify.create({ type: "negative", message });
        return message;
      } finally {
        this.presenceReconnecting = false;
      }
    },

    async testPresence() {
      resetPresenceSignature();
      const error = await this.syncPresence(true);
      if (error) {
        Notify.create({ type: "negative", message: error });
      } else if (!this.current) {
        Notify.create({ message: "Включи трек - статус появится в Discord" });
      } else {
        Notify.create({ message: "Статус отправлен в Discord" });
      }
    },

    persistSession() {
      if (!this.current || !this.queue.length) return;
      saveSession({
        queue: this.queue,
        sourceQueue: this.sourceQueue.length ? this.sourceQueue : this.queue,
        shuffle: this.shuffle,
        index: this.index,
        progress: this.progress,
        isWave: this.isWave,
        stationId: this.stationId,
        stationName: this.stationName,
        waveBatchId: this.waveBatchId,
        savedAt: Date.now(),
      });
    },

    async restoreSession(autoplay: boolean) {
      if (this.current) return false;
      const data = loadSession();
      if (!data) return false;
      const track = data.queue[data.index];
      if (!track) return false;
      this.queue = data.queue;
      this.sourceQueue = data.sourceQueue.length
        ? [...data.sourceQueue]
        : [...data.queue];
      this.shuffle = data.shuffle;
      this.index = data.index;
      this.isWave = data.isWave;
      this.stationId = data.stationId;
      this.stationName = data.stationName;
      this.waveBatchId = data.waveBatchId;
      this.seenIds = data.queue.map((t) => t.id).slice(-2000);
      this.current = track;
      this.duration = (track.duration_ms ?? 0) / 1000;
      this.progress = data.progress;
      this.pendingResume = true;
      updateMediaMetadata(track);
      updatePlaybackState(false, true);
      updatePositionState(this.duration, this.progress, this.playbackRate);
      void this.syncTray();
      log.info("session restored", track.title, data.progress);
      if (autoplay) {
        await this.loadCurrent({ startAt: data.progress, autoplay: true });
      }
      if (this.isWave) void this.armWave();
      return true;
    },

    async syncTray() {
      const track = this.current;
      const text = track
        ? `${track.title} - ${artistNames(track.artists)}`
        : "mashiro";
      await setTrayTooltip(text);
    },

    releaseMemory() {
      prefetched.clear();
      void api.clearStreamCache().catch(() => undefined);
      releaseMemoryCache();
      this.lyrics = null;
      this.lyricsOrigin = null;
      this.showLyrics = false;
      this.lyricsFullscreen = false;
      this.fullscreen = false;
      if (this.queue.length > 120) {
        const from = Math.max(0, this.index - 20);
        const slice = this.queue.slice(from, from + 120);
        this.index = Math.max(0, this.index - from);
        this.queue = slice;
        this.sourceQueue = [...slice];
      }
      if (this.seenIds.length > 2000) this.seenIds = this.seenIds.slice(-2000);
      log.info("memory released");
    },

    remember(tracks: Track[]) {
      for (const t of tracks) this.seenIds.push(t.id);
      try {
        const isPersonal =
          !this.stationId ||
          this.stationId === DEFAULT_STATION ||
          this.stationId === "personal:collection";
        if (isPersonal) {
          const hist = readCache<string[]>(WAVE_HISTORY_KEY) ?? [];
          const set = new Set(hist);
          for (const t of tracks) {
            if (!set.has(t.id)) {
              set.add(t.id);
              hist.push(t.id);
            }
          }
          writeCache(WAVE_HISTORY_KEY, hist.slice(-WAVE_HISTORY_LIMIT));
        }
      } catch {}
      if (this.seenIds.length > SEEN_LIMIT) {
        this.seenIds = this.seenIds.slice(-SEEN_LIMIT);
      }
    },

    async startWave(
      stationId?: string,
      stationName?: string,
      opts?: { seeds?: string[] },
    ) {
      this.loading = true;
      this.waveError = null;
      const station = stationId ?? this.stationId ?? DEFAULT_STATION;
      if (station !== this.stationId) {
        this.seenIds = [];
        this.waveSeeds = [];
      }
      if (opts?.seeds?.length) {
        this.waveSeeds = opts.seeds;
      }
      try {
        const isPersonal =
          station === DEFAULT_STATION || station === "personal:collection";
        const history = isPersonal
          ? readCache<string[]>(WAVE_HISTORY_KEY) ?? []
          : [];

        const recent = new Set<string>([...history, ...this.seenIds]);
        const fresh: Track[] = [];
        let batchId: string | null = null;
        let fallback: Track[] = [];
        let sessionId: string | null = null;
        const delivered: string[] = [];

        for (let attempt = 0; attempt < 6 && fresh.length < 8; attempt++) {
          const res = await api.wave(
            sessionId
              ? { station, sessionId, queue: delivered }
              : {
                  station,
                  seeds: this.waveSeeds.length ? this.waveSeeds : undefined,
                },
          );
          if (res.radio_session_id) sessionId = res.radio_session_id;
          if (!res.tracks.length) break;
          batchId = res.batch_id ?? batchId;
          if (!fallback.length) fallback = res.tracks;
          for (const t of res.tracks) {
            delivered.push(t.id);
            if (recent.has(t.id) || fresh.some((c) => c.id === t.id)) continue;
            recent.add(t.id);
            fresh.push(t);
          }
          if (!sessionId) break;
        }

        let tracks = dedupeTracks(fresh);
        if (!tracks.length) {
          const playing = this.current?.id;
          const deduped = dedupeTracks(fallback).filter(
            (t) => t.id !== playing,
          );
          const offset = deduped.length
            ? Math.floor(Date.now() / 1000) % deduped.length
            : 0;
          tracks = offset
            ? [...deduped.slice(offset), ...deduped.slice(0, offset)]
            : deduped;
        }
        if (!tracks.length) throw new Error("Ротор вернул пустой плейлист");

        this.stationId = station;
        if (stationName) this.stationName = stationName;
        else if (station === DEFAULT_STATION) this.stationName = "Моя волна";
        this.waveBatchId = batchId;
        this.waveSessionId = sessionId;
        this.queue = [...tracks];
        this.sourceQueue = [...tracks];
        this.shuffle = false;
        this.remember(tracks);
        this.index = 0;
        this.isWave = true;
        radioStarted = true;

        void api
          .sendFeedback({
            type: "radioStarted",
            station_id: station,
            session_id: sessionId,
            batch_id: batchId,
          })
          .catch(() => undefined);

        writeCache(`wave.last.${station}`, tracks.slice(0, 30));
        await this.loadCurrent();
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Не удалось запустить волну";
        this.waveError = message;
        Notify.create({ type: "negative", message });
      } finally {
        this.loading = false;
      }
    },

    async updateWaveFilters(payload: {
      station?: string;
      moodEnergy?: string | null;
      diversity?: string | null;
      language?: string | null;
      seeds?: string[];
    }) {
      const station = payload.station ?? this.stationId ?? DEFAULT_STATION;
      if (payload.moodEnergy !== undefined) {
        this.waveSettings.moodEnergy = payload.moodEnergy;
      }
      if (payload.diversity !== undefined) {
        this.waveSettings.diversity = payload.diversity;
      }
      if (payload.language !== undefined) {
        this.waveSettings.language = payload.language;
      }

      // 1. Save settings to server so user profile preferences update
      try {
        await api.setStationSettings({
          station,
          moodEnergy: this.waveSettings.moodEnergy ?? "all",
          diversity: this.waveSettings.diversity ?? "default",
          language: this.waveSettings.language ?? "any",
        });
      } catch (err) {
        log.warn("setStationSettings failed", err);
      }

      // 2. Build explicit seeds
      const seeds: string[] = [station];
      if (payload.seeds?.length) {
        for (const s of payload.seeds) {
          if (!seeds.includes(s)) seeds.push(s);
        }
      } else {
        const me = this.waveSettings.moodEnergy;
        if (me && me !== "all") seeds.push(`settingMoodEnergy:${me}`);
        const div = this.waveSettings.diversity;
        if (div && div !== "default") seeds.push(`settingDiversity:${div}`);
        const lang = this.waveSettings.language;
        if (lang && lang !== "any") seeds.push(`settingLanguage:${lang}`);
      }
      this.waveSeeds = seeds;

      // 3. If currently playing, perform seamless queue transition!
      if (this.current && (this.isPlaying || this.queue.length > 0)) {
        this.loading = true;
        try {
          const currentId = this.current.id;
          const res = await api.wave({
            station,
            seeds,
            queue: this.seenIds.slice(-25),
            trackToStartFrom: currentId,
          });

          if (res.radio_session_id) this.waveSessionId = res.radio_session_id;
          if (res.batch_id) this.waveBatchId = res.batch_id;

          const playingId = this.current?.id;
          const fresh = dedupeTracks(res.tracks).filter((t) => t.id !== playingId);

          if (fresh.length > 0) {
            const currentIndex = Math.max(0, this.index);
            const historyPart = this.queue.slice(0, currentIndex + 1);
            this.queue = [...historyPart, ...fresh];
            this.sourceQueue = [...this.queue];
            this.remember(fresh);
            this.isWave = true;
            this.stationId = station;
            radioStarted = true;

            void api
              .sendFeedback({
                type: "radioStarted",
                station_id: station,
                session_id: this.waveSessionId,
                batch_id: this.waveBatchId,
              })
              .catch(() => undefined);

            writeCache(`wave.last.${station}`, this.queue.slice(0, 30));
          }
        } catch (e) {
          log.warn("updateWaveFilters seamless fetch failed", e);
          Notify.create({ type: "negative", message: "Не удалось переключить волну" });
        } finally {
          this.loading = false;
        }
        return;
      }

      // If nothing was playing, start wave fresh with the new seeds
      await this.startWave(station, undefined, { seeds });
    },

    async playQueue(
      tracks: Track[],
      startIndex = 0,
      opts?: { wave?: boolean; batchId?: string | null },
    ) {
      this.sourceQueue = [...tracks];
      this.queue = [...tracks];
      this.shuffle = false;
      this.index = startIndex;
      this.isWave = opts?.wave ?? false;
      this.waveBatchId = opts?.batchId ?? null;
      radioStarted = false;
      await this.loadCurrent();
    },

    async loadCurrent(opts?: { startAt?: number; autoplay?: boolean }) {
      const ticket = ++navSeq;
      const previous = loadChain;
      const run = (async () => {
        await previous.catch(() => undefined);
        if (ticket !== navSeq) return;
        await this.performLoad(opts);
      })();
      loadChain = run.catch(() => undefined);
      await run;
    },

    async performLoad(opts?: { startAt?: number; autoplay?: boolean }) {
      await stopNeuroPlayback();
      const track = this.queue[this.index];
      if (!track) return;
      if (
        useUiStore().settings.autoSkipDisliked &&
        useLibraryStore().disliked(track.id) &&
        skipGuard < 30 &&
        this.index < this.queue.length - 1
      ) {
        skipGuard += 1;
        this.index += 1;
        await this.performLoad(opts);
        return;
      }
      skipGuard = 0;
      const startAt = Math.max(0, opts?.startAt ?? 0);
      const autoplay = opts?.autoplay ?? true;
      this.pendingResume = false;
      this.current = track;
      this.progress = startAt;
      lastProgress = startAt;
      quietSince = 0;
      updateMediaMetadata(track);
      updatePositionState(
        (track.duration_ms ?? 0) / 1000,
        startAt,
        this.playbackRate,
      );
      useStatsStore().begin(track);
      this.duration = (track.duration_ms ?? 0) / 1000;
      this.loading = true;
      this.lyrics = null;
      this.lyricsError = null;
      this.lyricsOrigin = null;
      this.lyricsPick = null;
      const token = nextSourceToken();
      const ui = useUiStore().settings;
      const rapid = Date.now() - lastLoadAt < 900;
      lastLoadAt = Date.now();
      if (ui.normalizeVolume) resetNormalization();
      const fadeMs =
        ui.crossfadeEnabled && !ui.gaplessEnabled && !rapid
          ? Math.round(Math.max(0, ui.crossfadeSeconds) * 1000)
          : 0;
      stallAt = startAt;
      stallSince = 0;
      recoverStep = 0;
      try {
        if (fadeMs > 0) await fadeOut(Math.min(fadeMs, 1200));

        let source: string | null = null;
        this.playingLocal = false;
        this.censorReplaced = false;
        this.censorAvailable = false;
        this.replacementLabel = null;

        const custom = overrideUrl(track.id);
        if (custom) {
          source = custom;
          this.censorReplaced = true;
          this.replacementLabel =
            getOverride(track.id)?.label.trim() || "FckCensorData";
          this.currentCodec = null;
          this.currentBitrate = null;
          this.currentSource = "custom-replacement";
          log.info("source from custom replacement", track.title);
        }

        if (!source && ui.censorBypass) {
          await ensureCensorList();
          const replacement = censorUrl(track.id);
          this.censorAvailable = Boolean(replacement);
          if (replacement && !prefersOriginal(track.id)) {
            source = replacement;
            this.censorReplaced = true;
            this.replacementLabel = "FckCensorData";
            this.currentCodec = null;
            this.currentBitrate = null;
            this.currentSource = "censor-replacement";
            log.info("source from FckCensor", track.title);
          }
        }

        const ready = source ? undefined : prefetched.get(track.id);
        if (ready) {
          prefetched.delete(track.id);
          source = ready.url;
          this.playingLocal = ready.local;
          this.censorReplaced = ready.censored;
          this.replacementLabel = ready.censored ? ready.label : null;
          this.currentCodec = ready.codec;
          this.currentBitrate = ready.bitrate;
          this.currentSource = ready.source;
          logQuality({
            title: track.title,
            codec: ready.codec,
            bitrate: ready.bitrate,
            source: ready.source,
            requested: this.quality,
          });
          log.info("source from prefetch", track.title);
        }

        if (!source && ui.preferLocalFiles) {
          const local = await api
            .findLocalTrack(track.id, ui.downloadDir || null)
            .catch(() => null);
          if (local) {
            source = convertFileSrc(local);
            this.playingLocal = true;
            this.currentCodec = local.split(".").pop() ?? null;
            this.currentBitrate = null;
            this.currentSource = "local-file";
            logQuality({
              title: track.title,
              codec: this.currentCodec,
              bitrate: null,
              source: "local-file",
              requested: this.quality,
            });
            log.info("source from disk", local);
          }
        }

        if (!source) {
          const stream = await log.time(`stream ${track.id}`, () =>
            api.stream(track.id, this.quality),
          );
          if (!isCurrentToken(token)) return;
          this.currentCodec = stream.codec;
          this.currentBitrate = stream.bitrate;
          this.currentSource = stream.source;
          source = proxyStream(stream.url);
          logQuality({
            title: track.title,
            codec: stream.codec,
            bitrate: stream.bitrate,
            source: stream.source,
            requested: this.quality,
          });
        }

        if (!isCurrentToken(token)) return;
        const target = this.muted ? 0 : this.volume;
        cancelFade(fadeMs > 0 && autoplay ? 0 : target);
        audio.src = source;
        audio.playbackRate = this.playbackRate;
        useEqualizerStore().apply();
        if (startAt > 0) {
          const seekOnce = () => {
            audio.removeEventListener("loadedmetadata", seekOnce);
            try {
              audio.currentTime = startAt;
            } catch {}
          };
          audio.addEventListener("loadedmetadata", seekOnce);
        }
        if (autoplay) {
          await safePlay(token);
          if (fadeMs > 0 && isCurrentToken(token)) {
            void fadeIn(target, Math.min(fadeMs, 2500));
          }
        } else {
          audio.load();
          this.isPlaying = false;
        }
        this.persistSession();
        void this.syncTray();
        void this.syncPresence(true);
        void this.prefetchNext();
        if (this.isWave) {
          void api.sendFeedback({
            type: "trackStarted",
            track_id: track.id,
            session_id: this.waveSessionId,
            batch_id: this.waveBatchId,
            station_id: this.stationId ?? undefined,
          });
        }
        if (this.showLyrics) void this.loadLyrics();
      } catch (e) {
        const name = (e as DOMException | undefined)?.name;
        log.error("loadCurrent failed", e);
        if (!isCurrentToken(token) || name === "AbortError") return;
        if (name === "NotAllowedError") {
          this.isPlaying = false;
          resumeOnGesture(() => {
            void stopNeuroPlayback().then(() => safePlay());
          });
          return;
        }
        cancelFade(this.muted ? 0 : this.volume);
        Notify.create({
          type: "negative",
          message:
            e instanceof Error ? e.message : "Не удалось воспроизвести трек",
        });
      } finally {
        this.loading = false;
        if (isCurrentToken(token) && fadeMs === 0) {
          cancelFade(this.muted ? 0 : this.volume);
        }
      }
    },

    dedupeQueue() {
      const seen = new Set<string>();
      const cleaned: Track[] = [];
      let index = this.index;
      this.queue.forEach((track, position) => {
        if (track?.id && !seen.has(track.id)) {
          seen.add(track.id);
          cleaned.push(track);
          return;
        }
        if (position <= index && index > 0) index -= 1;
      });
      if (cleaned.length !== this.queue.length) {
        this.queue = cleaned;
        this.index = Math.min(index, Math.max(cleaned.length - 1, 0));
      }
      const cleanedSource = dedupeTracks(this.sourceQueue);
      if (cleanedSource.length !== this.sourceQueue.length) {
        this.sourceQueue = cleanedSource;
      }
    },

    async prefetchNext() {
      const ui = useUiStore().settings;
      if (
        this.isWave &&
        !this.fetchingMore &&
        this.index >= this.queue.length - 2
      ) {
        await this.extendWave();
      }
      const targets = [this.queue[this.index + 1], this.queue[this.index + 2]]
        .filter((track): track is Track => Boolean(track))
        .filter((track) => !prefetched.has(track.id));
      await Promise.all(
        targets.map(async (next) => {
          const custom = overrideUrl(next.id);
          if (custom) {
            rememberPrefetch(next.id, {
              url: custom,
              codec: null,
              bitrate: null,
              local: false,
              censored: true,
              label: getOverride(next.id)?.label.trim() || "FckCensorData",
              source: "custom-replacement",
            });
            return;
          }
          if (ui.censorBypass && !prefersOriginal(next.id)) {
            const censored = censorUrl(next.id);
            if (censored) {
              rememberPrefetch(next.id, {
                url: proxyStream(censored),
                codec: null,
                bitrate: null,
                local: false,
                censored: true,
                label: "FckCensorData",
                source: "censor-replacement",
              });
              void api.prefetchStream(censored).catch(() => undefined);
              return;
            }
          }
          try {
            if (ui.preferLocalFiles) {
              const local = await api
                .findLocalTrack(next.id, ui.downloadDir || null)
                .catch(() => null);
              if (local) {
                rememberPrefetch(next.id, {
                  url: convertFileSrc(local),
                  codec: local.split(".").pop() ?? null,
                  bitrate: null,
                  local: true,
                  censored: false,
                  label: null,
                  source: "local-file",
                });
                log.info("prefetched from disk", next.title);
                return;
              }
            }
            const stream = await api.stream(next.id, this.quality);
            rememberPrefetch(next.id, {
              url: proxyStream(stream.url),
              codec: stream.codec,
              bitrate: stream.bitrate,
              local: false,
              censored: false,
              label: null,
              source: stream.source,
            });
            await api.prefetchStream(stream.url).catch(() => undefined);
            log.info("prefetched from network", next.title, stream.codec);
          } catch (error) {
            log.warn("prefetch failed", next.title, error);
          }
        }),
      );

      if (ui.gaplessEnabled) {
        const upcoming = this.queue[this.index + 1];
        const entry = upcoming ? prefetched.get(upcoming.id) : undefined;
        if (entry && !entry.local) warmNext(entry.url);
        else clearWarm();
      } else {
        clearWarm();
      }
    },

    async loadLyrics(force = false, mode?: LyricsSource) {
      const track = this.current;
      if (!track) return;
      if (!force && this.lyrics?.track_id === track.id) {
        void this.loadTranslation();
        return;
      }

      const pick = mode ?? this.lyricsPick ?? undefined;
      this.lyricsLoading = true;
      this.lyricsError = null;
      this.lyricsTranslation = null;
      this.lyricsTranslateKey = null;

      const key = pick ? `lyrics.${track.id}.${pick}` : `lyrics.${track.id}`;
      const cached = force ? null : readCache<Lyrics>(key);
      if (hasText(cached)) {
        this.lyrics = cached;
        this.lyricsLoading = false;
      } else {
        this.lyrics = null;
      }

      try {
        const found = await loadTrackLyrics(track, pick, force);
        if (this.current?.id !== track.id) return;
        if (found) {
          this.lyrics = found.lyrics;
          this.lyricsOrigin = found.origin;
          this.lyricsError = null;
          writeCache(key, found.lyrics);
        } else if (!hasText(this.lyrics)) {
          this.lyrics = null;
          this.lyricsOrigin = null;
          this.lyricsError = "Текста для этого трека нет";
        }
      } catch {
        if (this.current?.id !== track.id) return;
        if (!hasText(this.lyrics)) {
          this.lyrics = null;
          this.lyricsOrigin = null;
          this.lyricsError = "Не удалось загрузить текст";
        }
      } finally {
        if (this.current?.id === track.id) this.lyricsLoading = false;
      }

      if (this.lyricsFullscreen && !this.lyrics?.lines?.length) {
        this.openFullscreen();
      }

      void this.loadTranslation();
    },

    async loadTranslation(force = false) {
      const ui = useUiStore().settings;
      const track = this.current;
      const lyrics = this.lyrics;
      if (!ui.lyricsTranslate || !track || !lyrics?.lines?.length) {
        this.lyricsTranslation = null;
        this.lyricsTranslateKey = null;
        return;
      }
      const target = (ui.lyricsTranslateTarget || "ru").toLowerCase();
      const key = `${track.id}:${target}`;
      if (!force && key === this.lyricsTranslateKey && this.lyricsTranslation) {
        return;
      }
      this.lyricsTranslateLoading = true;
      try {
        const source = lyrics.lines.map((l) => l.text ?? "");
        const out = await api.translateLines(target, source);
        if (this.current?.id !== track.id || this.lyrics !== lyrics) return;
        if (out.length === source.length) {
          this.lyricsTranslation = out;
          this.lyricsTranslateKey = key;
        } else {
          this.lyricsTranslation = null;
          this.lyricsTranslateKey = null;
        }
      } catch {
        if (this.current?.id === track.id && this.lyrics === lyrics) {
          this.lyricsTranslation = null;
          this.lyricsTranslateKey = null;
        }
      } finally {
        if (this.current?.id === track.id) this.lyricsTranslateLoading = false;
      }
    },

    async setLyricsSource(mode: LyricsSource | null, force = false) {
      if (this.lyricsPick === mode && !force) return;
      this.lyricsPick = mode;
      this.lyrics = null;
      this.lyricsOrigin = null;
      await this.loadLyrics(true, mode ?? undefined);
    },

    toggleLyrics() {
      if (!this.current) {
        this.showLyrics = false;
        return;
      }
      this.showLyrics = !this.showLyrics;
      if (this.showLyrics) void this.loadLyrics();
    },

    closeLyrics() {
      this.showLyrics = false;
      this.lyricsFullscreen = false;
    },

    openFullscreen() {
      if (!this.current) return;
      this.lyricsFullscreen = false;
      this.showLyrics = false;
      this.fullscreen = true;
    },

    closeFullscreen() {
      this.fullscreen = false;
    },

    toggleFullscreen() {
      if (this.fullscreen) this.closeFullscreen();
      else this.openFullscreen();
    },

    async openLyricsFullscreen() {
      const track = this.current;
      if (!track) return;

      const ready =
        this.lyrics?.track_id === track.id
          ? this.lyrics
          : readCache<Lyrics>(`lyrics.${track.id}`);

      if (ready?.lines?.length) {
        this.lyrics = ready;
        this.lyricsError = null;
        this.fullscreen = false;
        this.showLyrics = true;
        this.lyricsFullscreen = true;
        return;
      }

      this.openFullscreen();
      await this.loadLyrics();
      if (
        this.fullscreen &&
        this.current?.id === track.id &&
        this.lyrics?.lines?.length
      ) {
        this.fullscreen = false;
        this.showLyrics = true;
        this.lyricsFullscreen = true;
      }
    },
    toggleLyricsFullscreen() {
      this.lyricsFullscreen = !this.lyricsFullscreen;
    },

    async useOriginalVersion(id: string, original: boolean) {
      if (!setPrefersOriginal(id, original)) return;
      prefetched.delete(id);
      if (this.current?.id !== id) return;
      const position = audio.currentTime;
      const wasPlaying = !audio.paused;
      await this.loadCurrent({ startAt: position, autoplay: wasPlaying });
    },

    async setQuality(quality: Quality) {
      if (quality === this.quality) return;
      this.quality = quality;
      this.persist();
      if (!this.current) return;
      if (overrideUrl(this.current.id)) return;
      const position = audio.currentTime;
      const wasPlaying = !audio.paused;
      if (this.censorReplaced) {
        await this.loadCurrent({ startAt: position, autoplay: wasPlaying });
        return;
      }
      try {
        const stream = await api.stream(this.current.id, quality);
        this.currentCodec = stream.codec;
        this.currentBitrate = stream.bitrate;
        this.currentSource = stream.source;
        logQuality({
          title: this.current.title,
          codec: stream.codec,
          bitrate: stream.bitrate,
          source: stream.source,
          requested: quality,
        });
        await api.prefetchStream(stream.url).catch(() => undefined);
        audio.src = proxyStream(stream.url);
        const restore = () => {
          audio.removeEventListener("loadedmetadata", restore);
          try {
            audio.currentTime = position;
          } catch {}
        };
        audio.addEventListener("loadedmetadata", restore);
        audio.playbackRate = this.playbackRate;
        if (wasPlaying) await safePlay();
      } catch {
        Notify.create({
          type: "negative",
          message: "Не удалось сменить качество",
        });
      }
    },

    setPlaybackRate(rate: number) {
      this.playbackRate = rate;
      audio.playbackRate = rate;
      this.persist();
      updatePositionState(this.duration, this.progress, rate);
      void this.syncPresence(true);
    },

    cycleRepeat() {
      const order: RepeatMode[] = ["off", "all", "one"];
      const next = order[(order.indexOf(this.repeat) + 1) % order.length];
      this.repeat = next ?? "off";
      this.persist();
    },

    setRepeat(mode: RepeatMode) {
      this.repeat = mode;
      this.persist();
    },

    toggleShuffle() {
      if (!this.queue.length) return;
      if (this.shuffle) {
        const currentId = this.current?.id;
        this.queue = [...this.sourceQueue];
        this.index = Math.max(
          0,
          this.queue.findIndex((t) => t.id === currentId),
        );
        this.shuffle = false;
        return;
      }

      const rest = this.queue.filter((_, i) => i !== this.index);
      for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const a = rest[i];
        const b = rest[j];
        if (a && b) {
          rest[i] = b;
          rest[j] = a;
        }
      }
      const head = this.queue[this.index];
      this.queue = head ? [head, ...rest] : rest;
      this.index = 0;
      this.shuffle = true;
    },

    async toggle() {
      if (!this.current) return;
      if (this.pendingResume) {
        void this.loadCurrent({ startAt: this.progress, autoplay: true });
        return;
      }
      if (audio.paused) {
        await stopNeuroPlayback();
        await safePlay();
      } else {
        audio.pause();
      }
    },

    async next(auto = false) {
      if (useTogetherStore().isGuest) return;
      if (auto && this.repeat === "one") {
        audio.currentTime = 0;
        await safePlay();
        return;
      }

      if (this.isWave && this.current) {
        await api
          .sendFeedback({
            type: auto ? "trackFinished" : "skip",
            track_id: this.current.id,
            session_id: this.waveSessionId,
            batch_id: this.waveBatchId,
            station_id: this.stationId ?? undefined,
            total_played_seconds: auto
              ? this.duration || this.progress
              : this.progress,
          })
          .catch(() => undefined);
      }

      if (this.isWave && this.index >= this.queue.length - 2) {
        await this.extendWave();
      }

      if (this.index < this.queue.length - 1) {
        this.index += 1;
        await this.loadCurrent();
        return;
      }

      const ui = useUiStore().settings;

      if (
        this.queue.length &&
        (this.repeat === "all" || ui.repeatPlaylistAlways)
      ) {
        this.index = 0;
        await this.loadCurrent();
        return;
      }

      if (ui.autoWaveOnQueueEnd && (await this.continueWithWave())) return;

      this.isPlaying = false;
      audio.pause();
    },

    async ensureRadioStarted() {
      if (!this.isWave || radioStarted) return;
      const station = this.stationId ?? DEFAULT_STATION;
      this.stationId = station;
      radioStarted = true;
      await api
        .sendFeedback({
          type: "radioStarted",
          station_id: station,
          session_id: this.waveSessionId,
          batch_id: this.waveBatchId,
        })
        .catch(() => undefined);
    },

    async armWave() {
      if (useTogetherStore().isGuest) return;
      if (!this.isWave) return;
      radioStarted = false;
      const station = this.stationId ?? DEFAULT_STATION;
      this.stationId = station;
      if (!this.stationName) {
        this.stationName = station === DEFAULT_STATION ? "Моя волна" : "Волна";
      }
      await this.ensureRadioStarted();
      if (this.index >= this.queue.length - 2) {
        const added = await this.extendWave();
        if (!added) log.warn("wave did not extend after restart", station);
      }
      this.waveError = null;
      log.info("wave armed", station, this.queue.length - this.index - 1);
    },

    async rescueWave(station: string) {
      try {
        const res = await api.wave(
          this.waveSessionId
            ? { station, sessionId: this.waveSessionId, queue: this.queue.map((t) => t.id) }
            : { station, seeds: this.waveSeeds.length ? this.waveSeeds : undefined },
        );
        if (res.radio_session_id) this.waveSessionId = res.radio_session_id;
        if (res.batch_id) this.waveBatchId = res.batch_id;
        const playing = this.current?.id;
        const all = dedupeTracks(res.tracks).filter((t) => t.id !== playing);
        if (!all.length) return 0;
        const inQueue = new Set(this.queue.map((t) => t.id));
        const tail = all.filter((t) => !inQueue.has(t.id));
        if (tail.length) {
          this.queue.push(...tail);
          if (this.sourceQueue !== this.queue) this.sourceQueue.push(...tail);
          this.remember(tail);
          this.dedupeQueue();
          return tail.length;
        }
        this.queue.push(...all);
        if (this.sourceQueue !== this.queue) this.sourceQueue.push(...all);
        return all.length;
      } catch (error) {
        log.warn("rescueWave failed", error);
        return 0;
      }
    },

    async continueWithWave(): Promise<boolean> {
      if (useTogetherStore().isGuest) return false;
      const ui = useUiStore().settings;
      const seed = this.queue[this.index] ?? this.current;
      const personal = ui.autoWaveSource === "personal" || !seed;
      const station = personal ? DEFAULT_STATION : `track:${seed?.id}`;
      try {
        const res = await api.wave({ station });
        const all = dedupeTracks(res.tracks).filter((t) => t.id !== seed?.id);
        const inQueue = new Set(this.queue.map((t) => t.id));
        const fresh = all.filter((t) => !inQueue.has(t.id));
        const tracks = fresh.length ? fresh : all;
        if (!tracks.length) return false;

        this.stationId = station;
        this.stationName = personal
          ? "Моя волна"
          : `Волна по «${seed?.title ?? "плейлисту"}»`;
        this.waveBatchId = res.batch_id ?? null;
        this.waveSessionId = res.radio_session_id ?? null;
        this.isWave = true;
        radioStarted = false;
        await this.ensureRadioStarted();

        this.queue.push(...tracks);
        if (this.sourceQueue !== this.queue) this.sourceQueue.push(...tracks);
        this.remember(tracks);
        this.index += 1;
        Notify.create({
          message: personal
            ? "Очередь закончилась - включаю мою волну"
            : "Очередь закончилась - включаю волну по плейлисту",
        });
        log.info("queue continued with wave", station, tracks.length);
        await this.loadCurrent();
        return true;
      } catch (error) {
        log.warn("continueWithWave failed", error);
        return false;
      }
    },

    watchStall() {
      if (!this.current || audio.paused || this.loading || this.pendingResume) {
        stallAt = audio.currentTime;
        stallSince = 0;
        return;
      }
      if (Math.abs(audio.currentTime - stallAt) > 0.05) {
        stallAt = audio.currentTime;
        stallSince = 0;
        recoverStep = 0;
        return;
      }
      const now = Date.now();
      if (stallSince === 0) {
        stallSince = now;
        return;
      }
      if (now - stallSince < 5000) return;
      stallSince = now;
      void this.recoverPlayback(audio.currentTime, false);
    },

    async recoverPlayback(at: number, hard: boolean) {
      const now = Date.now();
      if (now - lastRecover < 4000) return;
      lastRecover = now;
      const track = this.current;
      if (!track) return;
      const position = Number.isFinite(at) && at > 0 ? at : this.progress;
      recoverStep = hard ? 3 : recoverStep + 1;
      log.warn(
        "playback stuck, recovering",
        track.title,
        position,
        recoverStep,
      );

      if (recoverStep < 3) {
        try {
          audio.currentTime = Math.max(0, position + 0.4);
        } catch {}
        await safePlay().catch(() => undefined);
        return;
      }

      recoverStep = 0;
      prefetched.delete(track.id);
      await this.loadCurrent({ startAt: position, autoplay: true });
    },

    async extendWave() {
      if (useTogetherStore().isGuest) return 0;
      if (this.fetchingMore || !this.isWave) return 0;
      this.fetchingMore = true;
      let added = 0;
      try {
        await this.ensureRadioStarted();
        const station = this.stationId ?? DEFAULT_STATION;
        for (let attempt = 0; attempt < 4 && added === 0; attempt++) {
          const res = await api.wave(
            this.waveSessionId
              ? {
                  station,
                  sessionId: this.waveSessionId,
                  queue: this.queue.map((t) => t.id),
                }
              : {
                  station,
                  seeds: this.waveSeeds.length ? this.waveSeeds : undefined,
                },
          );
          if (res.radio_session_id) this.waveSessionId = res.radio_session_id;
          if (res.batch_id) this.waveBatchId = res.batch_id;

          const known = new Set([
            ...this.seenIds,
            ...this.queue.map((t) => t.id),
          ]);
          const fresh: Track[] = [];
          for (const t of res.tracks) {
            if (known.has(t.id)) continue;
            known.add(t.id);
            fresh.push(t);
          }
          if (fresh.length) {
            this.queue.push(...fresh);
            if (this.sourceQueue !== this.queue) {
              this.sourceQueue.push(...fresh);
            }
            this.remember(fresh);
            this.dedupeQueue();
            added = fresh.length;
          }
        }
        if (added === 0) added = await this.rescueWave(station);
      } catch (error) {
        log.warn("extendWave failed", error);
      } finally {
        this.fetchingMore = false;
      }
      return added;
    },

    async prev() {
      if (this.progress > 3) {
        audio.currentTime = 0;
        return;
      }
      if (this.hasPrev) {
        this.index -= 1;
        await this.loadCurrent();
      }
    },

    seek(seconds: number) {
      const limit = this.duration > 0 ? this.duration : seconds;
      const target = Math.max(0, Math.min(seconds, limit));
      this.progress = target;
      lastProgress = target;
      try {
        audio.currentTime = target;
      } catch {}
      stallAt = target;
      stallSince = 0;
      updatePositionState(this.duration, target, this.playbackRate);
      lastMediaSync = Date.now();
      void this.syncPresence(true);
    },

    setVolume(v: number) {
      this.volume = v;
      this.muted = v === 0;
      audio.volume = v;
      this.persist();
    },

    toggleMute() {
      this.muted = !this.muted;
      audio.volume = this.muted ? 0 : this.volume;
      this.persist();
    },

    playNext(track: Track) {
      if (!this.queue.length) {
        void this.playQueue([track], 0);
        return;
      }
      this.queue.splice(this.index + 1, 0, track);
      this.sourceQueue = [...this.queue];
      Notify.create({ message: "Играет следующим" });
    },

    enqueue(track: Track) {
      if (!this.queue.length) {
        void this.playQueue([track], 0);
        return;
      }
      this.queue.push(track);
      this.sourceQueue = [...this.queue];
      Notify.create({ message: "Добавил в конец очереди" });
    },

    async waveByTrack(track: Track) {
      await this.startWave(`track:${track.id}`, `Волна: «${track.title}»`);
      Notify.create({ message: `Запущена волна по треку «${track.title}»` });
    },

    async waveByArtist(artist: { id: string; name: string }) {
      await this.startWave(`artist:${artist.id}`, `Волна: ${artist.name}`);
      Notify.create({ message: `Запущена волна по артисту «${artist.name}»` });
    },

    async waveByAlbum(album: { id: string; title: string }) {
      await this.startWave(`album:${album.id}`, `Волна: «${album.title}»`);
      Notify.create({ message: `Запущена волна по альбому «${album.title}»` });
    },

    async waveByPlaylist(playlist: { kind: number; title: string; owner_uid?: number | null }) {
      const uid = playlist.owner_uid ?? 0;
      const seed = uid > 0 ? `playlist:${uid}:${playlist.kind}` : `playlist:${playlist.kind}`;
      await this.startWave(seed, `Волна: «${playlist.title}»`);
      Notify.create({ message: `Запущена волна по плейлисту «${playlist.title}»` });
    },

    async like() {
      if (!this.current) return;
      const track = this.current;
      await useLibraryStore().toggleLike(track);
      if (this.isWave) {
        void api
          .sendFeedback({
            type: "like",
            track_id: track.id,
            session_id: this.waveSessionId,
            batch_id: this.waveBatchId,
            station_id: this.stationId ?? undefined,
          })
          .catch(() => undefined);
      }
    },

    async dislike() {
      if (!this.current) return;
      const track = this.current;
      await useLibraryStore().dislike(track);
      if (this.isWave) {
        await api
          .sendFeedback({
            type: "dislike",
            track_id: track.id,
            session_id: this.waveSessionId,
            batch_id: this.waveBatchId,
            station_id: this.stationId ?? undefined,
          })
          .catch(() => undefined);
      }
      await this.next(false);
    },
  },
});
