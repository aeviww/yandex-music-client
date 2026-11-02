import { reactive } from "vue";
import type { Track } from "@/api/types";
import type { TrailerKind } from "@/lib/trailer";

export const trackLyricsDialog = reactive<{
  open: boolean;
  track: Track | null;
}>({ open: false, track: null });

export function openTrackLyrics(track: Track): void {
  trackLyricsDialog.track = track;
  trackLyricsDialog.open = true;
}

export const trailerDialog = reactive<{
  open: boolean;
  kind: TrailerKind;
  id: string;
  uid: number | null;
  heading: string;
  subtitle: string;
  cover: string | null;
  playFull: (() => unknown) | null;
}>({
  open: false,
  kind: "track",
  id: "",
  uid: null,
  heading: "Трейлер",
  subtitle: "",
  cover: null,
  playFull: null,
});

export function openTrailerDialog(options: {
  kind: TrailerKind;
  id: string;
  uid?: number | null;
  heading: string;
  subtitle?: string;
  cover?: string | null;
  playFull?: () => unknown;
}): void {
  trailerDialog.kind = options.kind;
  trailerDialog.id = options.id;
  trailerDialog.uid = options.uid ?? null;
  trailerDialog.heading = options.heading;
  trailerDialog.subtitle = options.subtitle ?? "";
  trailerDialog.cover = options.cover ?? null;
  trailerDialog.playFull = options.playFull ?? null;
  trailerDialog.open = true;
}

type AppDialogKind = "confirm" | "prompt";

type AppDialogState = {
  open: boolean;
  kind: AppDialogKind;
  title: string;
  message: string;
  placeholder: string;
  value: string;
  okLabel: string;
  cancelLabel: string;
  danger: boolean;
};

export const appDialog = reactive<AppDialogState>({
  open: false,
  kind: "confirm",
  title: "",
  message: "",
  placeholder: "",
  value: "",
  okLabel: "Ок",
  cancelLabel: "Отмена",
  danger: false,
});

let pending: ((value: string | null) => void) | null = null;

export function resolveAppDialog(value: string | null): void {
  const resolve = pending;
  pending = null;
  appDialog.open = false;
  resolve?.(value);
}

function request(options: Partial<AppDialogState>): Promise<string | null> {
  resolveAppDialog(null);
  Object.assign(
    appDialog,
    {
      message: "",
      placeholder: "",
      value: "",
      danger: false,
      cancelLabel: "Отмена",
    },
    options,
    { open: true },
  );
  return new Promise((resolve) => {
    pending = resolve;
  });
}

export async function askConfirm(options: {
  title: string;
  message?: string;
  okLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}): Promise<boolean> {
  const result = await request({
    kind: "confirm",
    okLabel: "Подтвердить",
    ...options,
  });
  return result !== null;
}

export async function askText(options: {
  title: string;
  message?: string;
  value?: string;
  placeholder?: string;
  okLabel?: string;
  cancelLabel?: string;
}): Promise<string | null> {
  const result = await request({
    kind: "prompt",
    okLabel: "Сохранить",
    ...options,
  });
  if (result === null) return null;
  return result.trim() || null;
}
