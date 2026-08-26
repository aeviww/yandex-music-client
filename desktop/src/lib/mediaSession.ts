import type { Track } from "@/api/types";

/**
 * Нативные медиа-контролы ОС через Media Session API вебвью.
 * WebView2 пробрасывает это в SMTC (панель громкости Windows и медиа-клавиши),
 * WKWebView - в Now Playing / Control Center macOS, WebKitGTK - в MPRIS.
 * Здесь только метаданные и обработчики действий; сам звук играет обычный <audio>.
 */

type MediaSessionCapableNavigator = Navigator & {
  mediaSession?: MediaSession;
};

export interface MediaSessionHandlers {
  play: () => void;
  pause: () => void;
  stop: () => void;
  next: () => void;
  prev: () => void;
  seekTo: (time: number) => void;
  seekBy: (offset: number) => void;
}

const MANAGED_ACTIONS: MediaSessionAction[] = [
  "play",
  "pause",
  "stop",
  "previoustrack",
  "nexttrack",
  "seekbackward",
  "seekforward",
  "seekto",
];

const ARTWORK_SIZES = ["100x100", "200x200", "400x400", "600x600"];

let enabled = true;

function session(): MediaSession | null {
  if (typeof navigator === "undefined") return null;
  return (navigator as MediaSessionCapableNavigator).mediaSession ?? null;
}

function metadataCtor(): typeof MediaMetadata | null {
  if (typeof window === "undefined") return null;
  return (
    (window as unknown as { MediaMetadata?: typeof MediaMetadata })
      .MediaMetadata ?? null
  );
}

export function mediaSessionAvailable(): boolean {
  return session() !== null && metadataCtor() !== null;
}

function normalizeCover(url: string | null | undefined): string | null {
  if (!url) return null;
  const out = url.trim();
  if (!out) return null;
  // Приводим к https без сырого литерала со слешами.
  if (out.startsWith("//")) return "https:" + out;
  if (out.startsWith("http:")) return "https:" + out.slice(5);
  return out;
}

function artworkFor(url: string | null): MediaImage[] {
  const base = normalizeCover(url);
  if (!base) return [];
  const sizePattern = /\/\d+x\d+$/;
  if (sizePattern.test(base)) {
    return ARTWORK_SIZES.map((size) => ({
      src: base.replace(sizePattern, `/${size}`),
      sizes: size,
      type: "image/jpeg",
    }));
  }
  return [{ src: base, sizes: "400x400", type: "image/jpeg" }];
}

export function clearMediaSession(): void {
  const s = session();
  if (!s) return;
  try {
    s.metadata = null;
  } catch {}
  try {
    s.playbackState = "none";
  } catch {}
  for (const action of MANAGED_ACTIONS) {
    try {
      s.setActionHandler(action, null);
    } catch {}
  }
}

export function setMediaSessionEnabled(value: boolean): void {
  enabled = value;
  if (!value) clearMediaSession();
}

export function bindMediaSession(handlers: MediaSessionHandlers): void {
  const s = session();
  if (!s || !enabled) return;

  const bind = (
    action: MediaSessionAction,
    handler: MediaSessionActionHandler,
  ) => {
    try {
      s.setActionHandler(action, handler);
    } catch {}
  };

  bind("play", () => handlers.play());
  bind("pause", () => handlers.pause());
  bind("stop", () => handlers.stop());
  bind("previoustrack", () => handlers.prev());
  bind("nexttrack", () => handlers.next());
  bind("seekbackward", (details) =>
    handlers.seekBy(-(details.seekOffset ?? 10)),
  );
  bind("seekforward", (details) => handlers.seekBy(details.seekOffset ?? 10));
  bind("seekto", (details) => {
    if (typeof details.seekTime === "number") handlers.seekTo(details.seekTime);
  });
}

export function updateMediaMetadata(track: Track | null): void {
  const s = session();
  if (!s || !enabled) return;
  if (!track) {
    try {
      s.metadata = null;
    } catch {}
    return;
  }
  const Ctor = metadataCtor();
  if (!Ctor) return;
  try {
    s.metadata = new Ctor({
      title: track.title || "",
      artist: track.artists?.map((artist) => artist.name).join(", ") || "",
      album: track.album_title || "",
      artwork: artworkFor(track.cover_url),
    });
  } catch {}
}

export function updatePlaybackState(
  isPlaying: boolean,
  hasTrack: boolean,
): void {
  const s = session();
  if (!s || !enabled) return;
  try {
    s.playbackState = !hasTrack ? "none" : isPlaying ? "playing" : "paused";
  } catch {}
}

export function updatePositionState(
  duration: number,
  position: number,
  playbackRate: number,
): void {
  const s = session();
  if (!s || !enabled) return;
  if (typeof s.setPositionState !== "function") return;
  try {
    const dur = Number.isFinite(duration) && duration > 0 ? duration : 0;
    if (dur <= 0) {
      s.setPositionState();
      return;
    }
    const pos = Math.max(0, Math.min(position, dur));
    const rate =
      Number.isFinite(playbackRate) && playbackRate > 0 ? playbackRate : 1;
    s.setPositionState({ duration: dur, position: pos, playbackRate: rate });
  } catch {}
}
