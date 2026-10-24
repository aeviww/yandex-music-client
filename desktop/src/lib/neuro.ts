import { reactive } from "vue";
import Hls from "hls.js";
import { Notify } from "quasar";
import { api } from "@/api/client";
import type { NeuroItem, NeuroStream } from "@/api/types";
import { proxyStream } from "@/lib/stream";
import { audio as mainAudio } from "@/lib/audio";
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
  teardown();
  neuro.item = null;
  neuro.stream = null;
  neuro.playing = false;
  neuro.built = false;
  neuro.loading = false;
}

export async function startNeuro(item: NeuroItem) {
  try {
    const player = usePlayerStore();
    if (!mainAudio.paused) mainAudio.pause();
    reset();
    neuro.loading = true;
    neuro.error = "";
    neuro.item = item;
    const stream = await api.neuroStream(item.id);
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
    audio.onended = () => reset();
    audio.onplaying = () => {
      neuro.built = true;
      neuro.playing = true;
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
        console.log("[neuro] manifest parsed, hls");
        void audio?.play().catch((e) => console.warn("[neuro] play", e));
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
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
    neuro.stream = stream;
    console.log("[neuro] stream started", stream.title);
  } catch (e) {
    console.error("[neuro] start failed", e);
    const message =
      typeof e === "string"
        ? e
        : e instanceof Error
          ? e.message
          : "Не удалось включить";
    fail(message || "Не удалось включить");
  } finally {
    neuro.loading = false;
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
}

export function resumeNeuro() {
  void audio?.play().then(
    () => {
      neuro.playing = true;
    },
    () => undefined,
  );
}

export function toggleNeuro() {
  if (neuro.playing) pauseNeuro();
  else resumeNeuro();
}

export function setNeuroVolume(volume: number) {
  if (audio) audio.volume = Math.max(0, Math.min(1, volume));
}

export function stopNeuro() {
  reset();
}
