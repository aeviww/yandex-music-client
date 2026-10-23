export type PlayerButtonId =
  | "shuffle"
  | "prev"
  | "play"
  | "next"
  | "repeat"
  | "like"
  | "dislike"
  | "sleep"
  | "mini"
  | "queue"
  | "lyrics"
  | "speed"
  | "quality"
  | "volume";

export type PlayerZone = "left" | "center" | "right" | "off";

export type PlayerButtonSlots = Record<PlayerButtonId, PlayerZone>;

export type MiniButtonId =
  | "shuffle"
  | "prev"
  | "play"
  | "next"
  | "repeat"
  | "like"
  | "dislike"
  | "lyrics"
  | "volume";

export type MiniButtonSlots = Record<MiniButtonId, boolean>;

export interface PlayerButtonMeta {
  id: PlayerButtonId;
  label: string;
  icon: string;
  hint: string;
  locked?: boolean;
}

export const playerButtonCatalog: PlayerButtonMeta[] = [
  {
    id: "play",
    label: "Play / Pause",
    icon: "mingcute:play-fill",
    hint: "Всегда в центре",
    locked: true,
  },
  { id: "prev", label: "Предыдущий", icon: "mingcute:skip-previous-fill", hint: "Трек назад" },
  { id: "next", label: "Следующий", icon: "mingcute:fast-forward-fill", hint: "Трек вперёд" },
  {
    id: "shuffle",
    label: "Перемешать",
    icon: "mingcute:shuffle-line",
    hint: "Случайный порядок",
  },
  {
    id: "repeat",
    label: "Повтор",
    icon: "mingcute:repeat-line",
    hint: "Повтор трека или списка",
  },
  {
    id: "like",
    label: "Нравится",
    icon: "mingcute:heart-line",
    hint: "Добавить в «Мне нравится»",
  },
  {
    id: "dislike",
    label: "Не нравится",
    icon: "mingcute:heart-crack-line",
    hint: "Больше не рекомендовать",
  },
  {
    id: "lyrics",
    label: "Текст песни",
    icon: "mingcute:subtitle-line",
    hint: "Панель с текстом",
  },
  {
    id: "queue",
    label: "Очередь",
    icon: "mingcute:playlist-2-line",
    hint: "Список воспроизведения",
  },
  {
    id: "mini",
    label: "Мини-плеер",
    icon: "mingcute:miniplayer-fill",
    hint: "Компактное окно поверх",
  },
  {
    id: "sleep",
    label: "Таймер сна",
    icon: "mingcute:time-line",
    hint: "Остановить через N минут",
  },
  {
    id: "speed",
    label: "Скорость",
    icon: "mingcute:dashboard-line",
    hint: "Темп воспроизведения",
  },
  { id: "quality", label: "Качество", icon: "mingcute:barcode-line", hint: "Битрейт потока" },
  {
    id: "volume",
    label: "Громкость",
    icon: "mingcute:volume-line",
    hint: "Кнопка и ползунок",
  },
];

export const miniButtonCatalog: Array<{
  id: MiniButtonId;
  label: string;
  icon: string;
  locked?: boolean;
}> = [
  { id: "play", label: "Play / Pause", icon: "mingcute:play-fill", locked: true },
  { id: "prev", label: "Предыдущий", icon: "mingcute:skip-previous-fill", locked: true },
  { id: "next", label: "Следующий", icon: "mingcute:fast-forward-fill", locked: true },
  { id: "shuffle", label: "Перемешать", icon: "mingcute:shuffle-line" },
  { id: "repeat", label: "Повтор", icon: "mingcute:repeat-line" },
  { id: "like", label: "Нравится", icon: "mingcute:heart-line" },
  { id: "dislike", label: "Не нравится", icon: "mingcute:heart-crack-line" },
  { id: "lyrics", label: "Текст песни", icon: "mingcute:subtitle-line" },
  { id: "volume", label: "Громкость", icon: "mingcute:volume-line" },
];

export const playerButtonOrder: PlayerButtonId[] = [
  "like",
  "dislike",
  "shuffle",
  "prev",
  "play",
  "next",
  "repeat",
  "lyrics",
  "queue",
  "mini",
  "sleep",
  "speed",
  "quality",
  "volume",
];

export const miniButtonOrder: MiniButtonId[] = [
  "like",
  "shuffle",
  "prev",
  "play",
  "next",
  "repeat",
  "dislike",
  "lyrics",
  "volume",
];

export const defaultPlayerButtonSlots: PlayerButtonSlots = {
  like: "left",
  dislike: "left",
  shuffle: "center",
  prev: "center",
  play: "center",
  next: "center",
  repeat: "center",
  lyrics: "right",
  queue: "right",
  mini: "right",
  sleep: "off",
  speed: "off",
  quality: "right",
  volume: "right",
};

export const defaultMiniButtons: MiniButtonSlots = {
  shuffle: false,
  prev: true,
  play: true,
  next: true,
  repeat: false,
  like: true,
  dislike: false,
  lyrics: false,
  volume: false,
};

export const playerZoneLabels: Array<{ value: PlayerZone; label: string }> = [
  { value: "left", label: "Слева" },
  { value: "center", label: "Центр" },
  { value: "right", label: "Справа" },
  { value: "off", label: "Скрыть" },
];
