import type { Track } from "@/api/types";

type MediaSessionCapableNavigator = Navigator & {
  mediaSession?: MediaSession;
};

export interface MediaSessionHandlers {
  play?: () => void;
  pause?: () => void;
  stop?: () => void;
  next?: () => void;
  prev?: () => void;
  seekTo?: (time: number) => void;
  seekBy?: (offset: number) => void;
}

export type MediaSessionOwner = "main" | "neuro";

export interface MediaSessionMetadata {
  title: string;
  artist?: string;
  album?: string;
  artwork?: string | null;
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
let owner: MediaSessionOwner = "main";

export function setMediaSessionOwner(value: MediaSessionOwner): void {
  owner = value;
}

export function mediaSessionOwner(): MediaSessionOwner {
  return owner;
}

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
  if (out.startsWith("//")) return "https:" + out;
  if (out.startsWith("http:")) return "https:" + out.slice(5);
  return out;
}

function artworkFor(url: string | null): MediaImage[] {
  const base = normalizeCover(url);
  if (!base) return [];
  if (base.endsWith("%%")) {
    const stem = base.slice(0, -2);
    return ARTWORK_SIZES.map((size) => ({
      src: stem + size,
      sizes: size,
      type: "image/jpeg",
    }));
  }
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
    handler: MediaSessionActionHandler | null,
  ) => {
    try {
      s.setActionHandler(action, handler);
    } catch {}
  };

  bind("play", handlers.play ? () => handlers.play!() : null);
  bind("pause", handlers.pause ? () => handlers.pause!() : null);
  bind("stop", handlers.stop ? () => handlers.stop!() : null);
  bind("previoustrack", handlers.prev ? () => handlers.prev!() : null);
  bind("nexttrack", handlers.next ? () => handlers.next!() : null);
  bind(
    "seekbackward",
    handlers.seekBy
      ? (details) => handlers.seekBy!(-(details.seekOffset ?? 10))
      : null,
  );
  bind(
    "seekforward",
    handlers.seekBy
      ? (details) => handlers.seekBy!(details.seekOffset ?? 10)
      : null,
  );
  bind(
    "seekto",
    handlers.seekTo
      ? (details) => {
          if (typeof details.seekTime === "number")
            handlers.seekTo!(details.seekTime);
        }
      : null,
  );
}

export function updateMediaMetadataInfo(info: MediaSessionMetadata): void {
  const s = session();
  if (!s || !enabled) return;
  const Ctor = metadataCtor();
  if (!Ctor) return;
  try {
    s.metadata = new Ctor({
      title: info.title || "",
      artist: info.artist || "",
      album: info.album || "",
      artwork: artworkFor(info.artwork ?? null),
    });
  } catch {}
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
  updateMediaMetadataInfo({
    title: track.title || "",
    artist: track.artists?.map((artist) => artist.name).join(", ") || "",
    album: track.album_title || "",
    artwork: track.cover_url,
  });
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
