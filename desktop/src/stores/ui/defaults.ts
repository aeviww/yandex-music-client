import type {
  MiniButtonId,
  MiniButtonSlots,
  PlayerButtonId,
  PlayerButtonSlots,
} from "./playerButtons";
import {
  defaultMiniButtons,
  defaultPlayerButtonSlots,
  miniButtonOrder,
  playerButtonOrder,
} from "./playerButtons";
import type { ThemeName } from "./themes";

export type Density = "compact" | "comfortable" | "spacious";
export type CoverStyle = "square" | "soft" | "rounded";
export type AutoWaveSource = "playlist" | "personal";

export type LyricsSource = "auto" | "lrclib" | "genius" | "yandex";

export type LyricsFont = "sans" | "serif" | "mono" | "custom";
export type LyricsAlign = "left" | "center" | "right";
export type LyricsBackdrop = "cover" | "gradient" | "solid";
export type LyricsHighlight = "white" | "accent" | "karaoke";
export type LyricsAnnotationMark = "off" | "underline" | "dot" | "tint";
export type LyricsTranslateMode = "under" | "replace";
export type AiTrackAction = "none" | "skip" | "dislike";

export type TopbarLinkId = "liked" | "playlists" | "stats"
  | "settings" | "wave" | "library" | "search" | "concerts";

export type NavItemId = "home" | "search" | "wave"
  | "liked" | "playlists" | "library" | "stats" | "concerts";

export type HomeSectionId = | "playlists" | "waves" | "picks"
  | "releases" | "neuro" | "recent" | "concerts";

export interface NavItemConfig {
  id: NavItemId;
  label?: string;
  icon?: string;
}

export const defaultTopbarLinks: TopbarLinkId[] = [
  "liked",
  "playlists",
  "concerts",
  "stats",
  "settings",
];

export const defaultSidebarItems: NavItemId[] = [
  "home",
  "search",
  "wave",
  "liked",
  "playlists",
  "concerts",
  "library",
  "stats",
];

export const defaultHomeSections: HomeSectionId[] = [
  "playlists",
  "waves",
  "picks",
  "releases",
  "concerts",
  "neuro",
  "recent",
];

export const ALL_NAV_ITEM_IDS: readonly NavItemId[] = [
  "home", "search", "wave", "liked", "playlists", "concerts", "library", "stats",
] as const;

export const ALL_TOPBAR_LINK_IDS: readonly TopbarLinkId[] = [
  "liked", "playlists", "concerts", "stats", "settings", "wave", "library", "search",
] as const;

export const ALL_HOME_SECTION_IDS: readonly HomeSectionId[] = [
  "playlists", "waves", "picks", "releases", "concerts", "neuro", "recent",
] as const;

export const DEFAULT_DISCORD_CLIENT_ID = "1532382113821753354";

export interface InterfaceSettings {
  theme: ThemeName;
  accent: string;
  customBackground: string;
  customSurface: string;
  customSurface2: string;
  customText: string;
  radius: number;
  density: Density;
  sidebarWidth: number;
  searchWidth: number;
  pagePadding: number;
  cardSize: number;
  textScale: number;
  coverStyle: CoverStyle;
  glass: boolean;
  glassBlur: number;
  animations: boolean;
  thinScrollbar: boolean;
  showPlaylistCovers: boolean;
  showPlayerArtwork: boolean;
  playerButtons: PlayerButtonSlots;
  miniButtons: MiniButtonSlots;
  playerOrder: PlayerButtonId[];
  miniOrder: MiniButtonId[];
  playerHeight: number;
  playerCoverSize: number;
  playerIconSize: number;
  playerGap: number;
  playerSidePadding: number;
  playerProgressWidth: number;
  playerProgressThickness: number;
  playerShowTimes: boolean;
  playerEditMode: boolean;
  playerMetaWidth: number;
  miniShowTime: boolean;
  miniVisualizer: boolean;
  miniOpacity: number;
  miniCoverSize: number;
  miniIconSize: number;
  miniGap: number;
  miniPadding: number;
  miniVolumeSlider: boolean;
  miniVolumeHeight: number;
  miniWidth: number;
  miniHeight: number;
  playerVisualizer: boolean;
  lyricsFontSize: number;
  lyricsLineHeight: number;
  lyricsWeight: number;
  lyricsFont: LyricsFont;
  lyricsFontCustom: string;
  lyricsBackgroundBlur: number;
  lyricsBackgroundOpacity: number;
  lyricsLineBlur: number;
  lyricsInactive: number;
  lyricsAlign: LyricsAlign;
  lyricsBackdrop: LyricsBackdrop;
  lyricsHighlight: LyricsHighlight;
  lyricsKaraokeWord: boolean;
  lyricsGlow: boolean;
  lyricsShowArtwork: boolean;
  lyricsMotion: boolean;
  lyricsVisualizer: boolean;
  lyricsShowCredits: boolean;
  lyricsShowOrigin: boolean;
  lyricsAnnotations: boolean;
  lyricsAnnotationMark: LyricsAnnotationMark;
  lyricsSource: LyricsSource;
  lyricsTranslate: boolean;
  lyricsTranslateTarget: string;
  lyricsTranslateMode: LyricsTranslateMode;
  togetherShowDock: boolean;
  discordEnabled: boolean;
  discordClientId: string;
  discordDetails: string;
  discordState: string;
  discordButtonLabel: string;
  discordShowArtwork: boolean;
  discordShowTime: boolean;
  cacheEnabled: boolean;
  downloadDir: string;
  autoSkipDisliked: boolean;
  preferLocalFiles: boolean;
  crossfadeEnabled: boolean;
  crossfadeSeconds: number;
  gaplessEnabled: boolean;
  normalizeVolume: boolean;
  trimSilence: boolean;
  autoWaveOnQueueEnd: boolean;
  autoWaveSource: AutoWaveSource;
  repeatPlaylistAlways: boolean;
  censorBypass: boolean;
  censorBadge: boolean;
  minimizeToTray: boolean;
  aiTrackAction: AiTrackAction;
  resumeLastSession: boolean;
  resumeAutoplay: boolean;
  topbarLinks: TopbarLinkId[];
  sidebarItems: NavItemId[];
  homeSections: HomeSectionId[];
  sidebarLabels: Partial<Record<NavItemId, string>>;
  sidebarIcons: Partial<Record<NavItemId, string>>;
  topbarLabels: Partial<Record<TopbarLinkId, string>>;
  topbarIcons: Partial<Record<TopbarLinkId, string>>;
  homeLabels: Partial<Record<HomeSectionId, string>>;
}

export const defaultInterfaceSettings: InterfaceSettings = {
  theme: "black",
  accent: "#fa2d48",
  customBackground: "#09090b",
  customSurface: "#151518",
  customSurface2: "#1c1c20",
  customText: "#f5f5f7",
  radius: 12,
  density: "comfortable",
  sidebarWidth: 236,
  searchWidth: 360,
  pagePadding: 40,
  cardSize: 150,
  textScale: 100,
  coverStyle: "soft",
  glass: true,
  glassBlur: 24,
  animations: true,
  thinScrollbar: false,
  showPlaylistCovers: true,
  showPlayerArtwork: true,
  playerButtons: { ...defaultPlayerButtonSlots },
  miniButtons: { ...defaultMiniButtons },
  playerOrder: [...playerButtonOrder],
  miniOrder: [...miniButtonOrder],
  playerHeight: 78,
  playerCoverSize: 48,
  playerIconSize: 18,
  playerGap: 6,
  playerSidePadding: 16,
  playerProgressWidth: 100,
  playerProgressThickness: 4,
  playerShowTimes: true,
  playerEditMode: false,
  playerMetaWidth: 260,
  miniShowTime: true,
  miniVisualizer: true,
  miniOpacity: 100,
  miniCoverSize: 38,
  miniIconSize: 15,
  miniGap: 6,
  miniPadding: 10,
  miniVolumeSlider: true,
  miniVolumeHeight: 40,
  miniWidth: 396,
  miniHeight: 152,
  playerVisualizer: true,
  lyricsFontSize: 36,
  lyricsLineHeight: 1.18,
  lyricsWeight: 700,
  lyricsFont: "sans",
  lyricsFontCustom: "",
  lyricsBackgroundBlur: 38,
  lyricsBackgroundOpacity: 48,
  lyricsLineBlur: 2.5,
  lyricsInactive: 32,
  lyricsAlign: "left",
  lyricsBackdrop: "cover",
  lyricsHighlight: "white",
  lyricsKaraokeWord: true,
  lyricsGlow: true,
  lyricsShowArtwork: true,
  lyricsMotion: true,
  lyricsVisualizer: true,
  lyricsShowCredits: true,
  lyricsShowOrigin: true,
  lyricsAnnotations: true,
  lyricsAnnotationMark: "underline",
  lyricsSource: "auto",
  lyricsTranslate: false,
  lyricsTranslateTarget: "ru",
  lyricsTranslateMode: "under",
  togetherShowDock: true,
  discordEnabled: true,
  discordClientId: DEFAULT_DISCORD_CLIENT_ID,
  discordDetails: "{title}",
  discordState: "{artist}",
  discordButtonLabel: "Слушать в Яндекс Музыке",
  discordShowArtwork: true,
  discordShowTime: true,
  cacheEnabled: true,
  downloadDir: "",
  autoSkipDisliked: true,
  preferLocalFiles: true,
  crossfadeEnabled: true,
  crossfadeSeconds: 4,
  gaplessEnabled: false,
  normalizeVolume: false,
  trimSilence: false,
  autoWaveOnQueueEnd: true,
  autoWaveSource: "playlist",
  repeatPlaylistAlways: false,
  censorBypass: true,
  censorBadge: true,
  minimizeToTray: true,
  aiTrackAction: "none",
  resumeLastSession: true,
  resumeAutoplay: true,
  topbarLinks: [...defaultTopbarLinks],
  sidebarItems: [...defaultSidebarItems],
  homeSections: [...defaultHomeSections],
  sidebarLabels: {},
  sidebarIcons: {},
  topbarLabels: {},
  topbarIcons: {},
  homeLabels: {},
};
