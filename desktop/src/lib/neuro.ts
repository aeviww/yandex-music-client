import { reactive } from "vue";
import Hls from "hls.js";
import { Notify } from "quasar";
import { api } from "@/api/client";
import type { NeuroItem, NeuroStream } from "@/api/types";
import { proxyStream } from "@/lib/stream";
import { audio as mainAudio, nextSourceToken } from "@/lib/audio";
import {
  bindMediaSession,
  setMediaSessionOwner,
  updateMediaMetadataInfo,
  updatePlaybackState,
  updatePositionState,
} from "@/lib/mediaSession";
import { usePlayerStore } from "@/stores/player/index";

type NeuroState = {
  item: NeuroItem | null;
  stream: NeuroStream | null;
  playing: boolean;
  loading: boolean;
  built: boolean;
  error: string;
};

export const neuro = reactive<NeuroState>({
  item: null,
  stream: null,
  playing: false,
  loading: false,
  built: false,
  error: "",
});

let hls: Hls | null = null;
let audio: HTMLAudioElement | null = null;
let watchdog: number | null = null;
let runId = 0;

function teardown() {
  if (watchdog !== null) {
    window.clearTimeout(watchdog);
    watchdog = null;
  }
  if (hls) {
    hls.destroy();
    hls = null;
  }
  if (audio) {
    audio.pause();
    audio.src = "";
    audio = null;
  }
}

function reset() {
  runId += 1;
  teardown();
  neuro.item = null;
  neuro.stream = null;
  neuro.playing = false;
  neuro.built = false;
  neuro.loading = false;
  setMediaSessionOwner("main");
  usePlayerStore().refreshMediaSession();
}

function syncNeuroMetadata() {
  if (!neuro.item) return;
  updateMediaMetadataInfo({
    title: neuro.stream?.title || neuro.item.title,
    artist: neuro.stream?.subtitle || "Нейромузыка Яндекса",
    album: "Нейромузыка",
    artwork: neuro.stream?.cover_url || neuro.item.cover_url,
  });
}

function bindNeuroMediaSession() {
  setMediaSessionOwner("neuro");
  bindMediaSession({
    play: resumeNeuro,
    pause: pauseNeuro,
    stop: stopNeuro,
    seekTo: seekNeuro,
    seekBy: (offset) => seekNeuro((audio?.currentTime ?? 0) + offset),
  });
  syncNeuroMetadata();
  updatePlaybackState(neuro.playing, true);
  updatePositionState(audio?.duration ?? 0, audio?.currentTime ?? 0, 1);
}

export async function startNeuro(item: NeuroItem) {
  let id = 0;
  try {
    const player = usePlayerStore();
    if (!mainAudio.paused) mainAudio.pause();
    nextSourceToken();
    reset();
    id = runId;
    neuro.loading = true;
    neuro.error = "";
    neuro.item = item;
    bindNeuroMediaSession();
    const stream = await api.neuroStream(item.id);
    if (id !== runId) return;
    neuro.stream = stream;
    syncNeuroMetadata();
    let raw = stream.stream_url;
    if (raw.startsWith("//")) raw = "https:" + raw;
    const source = proxyStream(raw);
    console.log("[neuro] stream", stream.title, source);
    audio = new Audio();
    audio.volume = player.muted
      ? 0
      : typeof player.volume === "number"
        ? player.volume
        : 0.9;
    audio.onended = () => {
      if (id === runId) reset();
    };
    audio.onplaying = () => {
      if (id !== runId) return;
      neuro.built = true;
      neuro.playing = true;
      updatePlaybackState(true, true);
      updatePositionState(audio?.duration ?? 0, audio?.currentTime ?? 0, 1);
    };
    audio.onpause = () => {
      if (id !== runId) return;
      neuro.playing = false;
      updatePlaybackState(false, true);
      updatePositionState(audio?.duration ?? 0, audio?.currentTime ?? 0, 1);
    };
    audio.ontimeupdate = () => {
      if (id !== runId || !audio) return;
      updatePositionState(audio.duration, audio.currentTime, 1);
    };
    let netRetries = 0;
    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        manifestLoadPolicy: {
          default: {
            totalTime: 40_000,
            maxLoadTimeMs: 40_000,
            maxRetry: 6,
            maxRetryDelayMs: 4_000,
            retryDelayMs: 500,
          },
        },
        playlistLoadPolicy: {
          default: {
            totalTime: 40_000,
            maxLoadTimeMs: 40_000,
            maxRetry: 6,
            maxRetryDelayMs: 4_000,
            retryDelayMs: 500,
          },
        },
        fragmentLoadPolicy: {
          default: {
            totalTime: 60_000,
            maxLoadTimeMs: 60_000,
            maxRetry: 12,
            maxRetryDelayMs: 4_000,
            retryDelayMs: 500,
          },
        },
      });
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (id !== runId) return;
        console.log("[neuro] manifest parsed, hls");
        void audio?.play().catch((e) => console.warn("[neuro] play", e));
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (id !== runId) return;
        console.warn("[neuro] hls", data.type, data.details, data.fatal);
        if (!data.fatal) return;
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          netRetries += 1;
          if (netRetries > 4) {
            fail();
            return;
          }
          hls.startLoad();
          return;
        }
        fail();
      });
      hls.attachMedia(audio);
      hls.loadSource(source);
    } else if (audio.canPlayType("application/vnd.apple.mpegurl")) {
      audio.src = source;
      void audio.play().catch((e) => console.warn("[neuro] play", e));
    } else {
      fail("Поток не поддерживается");
      return;
    }
    watchdog = window.setTimeout(() => {
      if (id !== runId) return;
      const element = audio;
      if (!element || neuro.item !== item || neuro.built) return;
      console.error(
        "[neuro] тишина после 10с — buffered:",
        element.buffered.length,
        "readyState:",
        element.readyState,
        "networkState:",
        element.networkState,
      );
      Notify.create({
        type: "warning",
        message: "Стрим не отвечает — нажми play ещё раз",
      });
    }, 10_000);
    console.log("[neuro] stream started", stream.title);
  } catch (e) {
    if (id !== runId) return;
    console.error("[neuro] start failed", e);
    const message =
      typeof e === "string"
        ? e
        : e instanceof Error
          ? e.message
          : "Не удалось включить";
    fail(message || "Не удалось включить");
  } finally {
    if (id === runId) neuro.loading = false;
  }
}

function fail(message = "Стрим прервался") {
  neuro.error = message;
  Notify.create({ type: "negative", message });
  reset();
}

export function pauseNeuro() {
  audio?.pause();
  neuro.playing = false;
  if (neuro.item) updatePlaybackState(false, true);
}

export function resumeNeuro() {
  void audio?.play().then(
    () => {
      neuro.playing = true;
      if (neuro.item) updatePlaybackState(true, true);
    },
    () => undefined,
  );
}

export function toggleNeuro() {
  if (neuro.playing) pauseNeuro();
  else resumeNeuro();
}

export function seekNeuro(time: number) {
  if (!audio) return;
  const duration =
    Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
  const target = duration
    ? Math.max(0, Math.min(time, duration))
    : Math.max(0, time);
  try {
    audio.currentTime = target;
  } catch {}
  updatePositionState(duration, target, 1);
}

export function setNeuroVolume(volume: number) {
  if (audio) audio.volume = Math.max(0, Math.min(1, volume));
}

export function stopNeuro() {
  reset();
}
