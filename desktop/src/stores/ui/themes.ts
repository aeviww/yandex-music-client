export type ThemeName =
  | "black"
  | "oled"
  | "graphite"
  | "slate"
  | "midnight"
  | "forest"
  | "plum"
  | "warm"
  | "nord"
  | "dracula"
  | "tokyo"
  | "gruvbox"
  | "onedark"
  | "catppuccin"
  | "custom";

export interface Palette {
  background: string;
  surface: string;
  surface2: string;
  hover: string;
  text: string;
}

export const themePalettes: Record<Exclude<ThemeName, "custom">, Palette> = {
  black: {
    background: "#09090b",
    surface: "#151518",
    surface2: "#1c1c20",
    hover: "#242429",
    text: "#f5f5f7",
  },
  oled: {
    background: "#000000",
    surface: "#090909",
    surface2: "#121212",
    hover: "#1b1b1b",
    text: "#ffffff",
  },
  graphite: {
    background: "#111214",
    surface: "#1b1d20",
    surface2: "#24272b",
    hover: "#2c3035",
    text: "#f3f4f6",
  },
  slate: {
    background: "#101316",
    surface: "#1a2025",
    surface2: "#222a31",
    hover: "#2b353e",
    text: "#edf2f6",
  },
  midnight: {
    background: "#090d16",
    surface: "#111827",
    surface2: "#1a2333",
    hover: "#222e42",
    text: "#eef4ff",
  },
  forest: {
    background: "#0b100e",
    surface: "#141c18",
    surface2: "#1c2822",
    hover: "#26362e",
    text: "#edf7f1",
  },
  plum: {
    background: "#110d14",
    surface: "#1d1721",
    surface2: "#291f2e",
    hover: "#37283e",
    text: "#f8f0fb",
  },
  warm: {
    background: "#100e0d",
    surface: "#1a1715",
    surface2: "#24201d",
    hover: "#2d2824",
    text: "#f7f2ed",
  },
  nord: {
    background: "#2e3440",
    surface: "#3b4252",
    surface2: "#434c5e",
    hover: "#4c566a",
    text: "#eceff4",
  },
  dracula: {
    background: "#282a36",
    surface: "#343746",
    surface2: "#44475a",
    hover: "#4d5068",
    text: "#f8f8f2",
  },
  tokyo: {
    background: "#1a1b26",
    surface: "#24283b",
    surface2: "#2f3549",
    hover: "#3b4261",
    text: "#c0caf5",
  },
  gruvbox: {
    background: "#1d2021",
    surface: "#282828",
    surface2: "#32302f",
    hover: "#3c3836",
    text: "#ebdbb2",
  },
  onedark: {
    background: "#21252b",
    surface: "#282c34",
    surface2: "#333842",
    hover: "#3e4451",
    text: "#abb2bf",
  },
  catppuccin: {
    background: "#1e1e2e",
    surface: "#252538",
    surface2: "#313244",
    hover: "#45475a",
    text: "#cdd6f4",
  },
};

export const retiredThemeMap: Record<string, ThemeName> = {
  light: "black",
  paper: "warm",
  sky: "midnight",
};

export function isLightColor(color: string): boolean {
  const hex = color.trim().replace("#", "");
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  if (full.length < 6) return false;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if ([r, g, b].some((v) => Number.isNaN(v))) return false;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55;
}

export const themeNames: Array<{
  value: Exclude<ThemeName, "custom">;
  label: string;
}> = [
  { value: "black", label: "Чёрная" },
  { value: "oled", label: "OLED" },
  { value: "graphite", label: "Графит" },
  { value: "slate", label: "Сланец" },
  { value: "midnight", label: "Ночная" },
  { value: "forest", label: "Лесная" },
  { value: "plum", label: "Сливовая" },
  { value: "warm", label: "Тёплая" },
  { value: "nord", label: "Nord" },
  { value: "dracula", label: "Dracula" },
  { value: "tokyo", label: "Tokyo Night" },
  { value: "gruvbox", label: "Gruvbox" },
  { value: "onedark", label: "One Dark" },
  { value: "catppuccin", label: "Catppuccin" },
];

export const accentColors = [
  { label: "Розовый", value: "#ff2d8d" },
  { label: "Красный", value: "#fa2d48" },
  { label: "Фиолетовый", value: "#bf5af2" },
  { label: "Синий", value: "#0a84ff" },
  { label: "Бирюзовый", value: "#32ade6" },
  { label: "Зелёный", value: "#30d158" },
  { label: "Оранжевый", value: "#ff9f0a" },
  { label: "Жёлтый", value: "#ffd60a" },
];
