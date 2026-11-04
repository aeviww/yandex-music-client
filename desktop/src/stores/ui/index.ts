import { defineStore } from "pinia";
import { applyInterfaceSettings } from "./apply";
import type {
  HomeSectionId,
  InterfaceSettings,
  NavItemId,
  TopbarLinkId,
} from "./defaults";
import {
  ALL_HOME_SECTION_IDS,
  ALL_NAV_ITEM_IDS,
  ALL_TOPBAR_LINK_IDS,
  DEFAULT_DISCORD_CLIENT_ID,
  defaultHomeSections,
  defaultInterfaceSettings,
  defaultSidebarItems,
  defaultTopbarLinks,
} from "./defaults";
import { retiredThemeMap, themePalettes } from "./themes";
import type {
  MiniButtonId,
  MiniButtonSlots,
  PlayerButtonId,
  PlayerButtonSlots,
  PlayerZone,
} from "./playerButtons";
import {
  defaultMiniButtons,
  defaultPlayerButtonSlots,
  miniButtonOrder,
  playerButtonOrder,
} from "./playerButtons";

export type {
  MiniButtonId,
  MiniButtonSlots,
  PlayerButtonId,
  PlayerButtonSlots,
  PlayerZone,
} from "./playerButtons";
export {
  defaultMiniButtons,
  defaultPlayerButtonSlots,
  miniButtonCatalog,
  miniButtonOrder,
  playerButtonCatalog,
  playerButtonOrder,
} from "./playerButtons";

export type {
  AppFont,
  CoverStyle,
  Density,
  HomeSectionId,
  InterfaceSettings,
  NavItemConfig,
  NavItemId,
  TopbarLinkId,
} from "./defaults";
export {
  ALL_HOME_SECTION_IDS,
  ALL_NAV_ITEM_IDS,
  ALL_TOPBAR_LINK_IDS,
  DEFAULT_DISCORD_CLIENT_ID,
  defaultHomeSections,
  defaultInterfaceSettings,
  defaultSidebarItems,
  defaultTopbarLinks,
} from "./defaults";
export type { Palette, ThemeName } from "./themes";
export { accentColors, themeNames, themePalettes } from "./themes";

const STORAGE_KEY = "mashiro.interface";
const FONT_MIGRATED_KEY = "mashiro.interface.font-onest.v1";

const lockedMiniButtons = new Set<MiniButtonId>(["prev", "play", "next"]);

const validAppFonts = new Set<string>([
  "onest",
  "golos",
  "manrope",
  "system",
  "serif",
  "mono",
  "minecraft",
  "jetbrains",
  "custom",
]);

function sanitizeOrder<T extends string>(
  saved: unknown,
  canonical: readonly T[],
): T[] {
  const known = new Set<string>(canonical);
  const seen = new Set<string>();
  const out: T[] = [];

  if (Array.isArray(saved)) {
    for (const id of saved) {
      if (typeof id === "string" && known.has(id) && !seen.has(id)) {
        seen.add(id);
        out.push(id as T);
      }
    }
  }
  for (const id of canonical) {
    if (!seen.has(id)) out.push(id);
  }
  return out;
}

function sanitizeArray<T extends string>(
  saved: unknown,
  allowed: readonly T[],
  fallback: readonly T[],
): T[] {
  if (!Array.isArray(saved)) return [...fallback];
  const allowedSet = new Set<string>(allowed);
  const out: T[] = [];
  for (const item of saved) {
    if (
      typeof item === "string" &&
      allowedSet.has(item) &&
      !out.includes(item as T)
    ) {
      out.push(item as T);
    }
  }
  return out.length ? out : [...fallback];
}

function sanitizeRecord<K extends string>(
  saved: unknown,
  allowed: readonly K[],
): Partial<Record<K, string>> {
  if (!saved || typeof saved !== "object") return {};
  const allowedSet = new Set<string>(allowed);
  const out: Partial<Record<K, string>> = {};
  for (const [k, v] of Object.entries(saved as Record<string, unknown>)) {
    if (allowedSet.has(k) && typeof v === "string" && v.trim().length > 0) {
      out[k as K] = v.trim();
    }
  }
  return out;
}

function load(): InterfaceSettings {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "{}",
    ) as Partial<InterfaceSettings>;
    const merged: InterfaceSettings = { ...defaultInterfaceSettings, ...saved };
    const themeKey = merged.theme as string;
    if (themeKey !== "custom" && !Object.hasOwn(themePalettes, themeKey)) {
      merged.theme = retiredThemeMap[themeKey] ?? defaultInterfaceSettings.theme;
    }
    merged.playerButtons = {
      ...defaultPlayerButtonSlots,
      ...(saved.playerButtons || {}),
    } as PlayerButtonSlots;
    merged.miniButtons = {
      ...defaultMiniButtons,
      ...(saved.miniButtons || {}),
    } as MiniButtonSlots;
    merged.playerOrder = sanitizeOrder(saved.playerOrder, playerButtonOrder);
    merged.miniOrder = sanitizeOrder(saved.miniOrder, miniButtonOrder);

    merged.topbarLinks = sanitizeArray(
      saved.topbarLinks,
      ALL_TOPBAR_LINK_IDS,
      defaultTopbarLinks);

    merged.sidebarItems = sanitizeArray(
      saved.sidebarItems,
      ALL_NAV_ITEM_IDS,
      defaultSidebarItems);

    merged.homeSections = sanitizeArray(
      saved.homeSections,
      ALL_HOME_SECTION_IDS,
      defaultHomeSections);

    merged.sidebarLabels = sanitizeRecord(saved.sidebarLabels, ALL_NAV_ITEM_IDS);
    merged.sidebarIcons = sanitizeRecord(saved.sidebarIcons, ALL_NAV_ITEM_IDS);
    merged.topbarLabels = sanitizeRecord(saved.topbarLabels, ALL_TOPBAR_LINK_IDS);
    merged.topbarIcons = sanitizeRecord(saved.topbarIcons, ALL_TOPBAR_LINK_IDS);
    merged.homeLabels = sanitizeRecord(saved.homeLabels, ALL_HOME_SECTION_IDS);

    if (!merged.sidebarItems.includes("home")) {
      merged.sidebarItems.unshift("home");
    }
    if (!merged.topbarLinks.includes("settings")) {
      merged.topbarLinks.push("settings");
    }

    if (
      typeof merged.appFont !== "string" ||
      !validAppFonts.has(merged.appFont)
    ) {
      merged.appFont = "onest";
    }
    try {
      if (!localStorage.getItem(FONT_MIGRATED_KEY)) {
        if (!saved.appFont || saved.appFont === "manrope") {
          merged.appFont = "onest";
        }
        localStorage.setItem(FONT_MIGRATED_KEY, "1");
      }
    } catch {}

    merged.playerEditMode = false;
    merged.sidebarEditMode = false;
    merged.topbarEditMode = false;
    merged.homeEditMode = false;
    merged.playerButtons.play = "center";
    merged.miniButtons.play = true;
    merged.miniButtons.prev = true;
    merged.miniButtons.next = true;
    if (!merged.discordClientId.trim()) {
      merged.discordClientId = DEFAULT_DISCORD_CLIENT_ID;
    }
    return merged;
  } catch {
    return { ...defaultInterfaceSettings };
  }
}

export const useUiStore = defineStore("ui", {
  state: () => ({
    settings: load(),
    snapshot: null as InterfaceSettings | null,
    playerEditReturnPath: null as string | null,
    chromeEditReturnPath: null as string | null,
  }),

  actions: {
    apply() {
      applyInterfaceSettings(this.settings);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      } catch {}
    },

    set<K extends keyof InterfaceSettings>(
      key: K,
      value: InterfaceSettings[K],
    ) {
      this.settings[key] = value;
      this.apply();
    },

    beginEdit() {
      this.snapshot = JSON.parse(
        JSON.stringify(this.settings),
      ) as InterfaceSettings;
    },

    finishEdit() {
      this.snapshot = null;
      this.settings.playerEditMode = false;
      this.settings.sidebarEditMode = false;
      this.settings.topbarEditMode = false;
      this.settings.homeEditMode = false;
      this.apply();
    },

    cancelEdit() {
      if (this.snapshot) this.settings = { ...this.snapshot };
      this.snapshot = null;
      this.settings.playerEditMode = false;
      this.settings.sidebarEditMode = false;
      this.settings.topbarEditMode = false;
      this.settings.homeEditMode = false;
      this.apply();
    },

    togglePlayerEdit(on?: boolean) {
      const next = on ?? !this.settings.playerEditMode;
      if (!next) {
        this.finishEdit();
        return;
      }
      if (!this.snapshot) this.beginEdit();
      this.settings.playerEditMode = true;
      this.settings.sidebarEditMode = false;
      this.settings.topbarEditMode = false;
      this.settings.homeEditMode = false;
      this.apply();
    },

    toggleSidebarEdit(on?: boolean) {
      const next = on ?? !this.settings.sidebarEditMode;
      if (!next) {
        this.finishEdit();
        return;
      }
      if (!this.snapshot) this.beginEdit();
      this.settings.sidebarEditMode = true;
      this.settings.playerEditMode = false;
      this.settings.topbarEditMode = false;
      this.settings.homeEditMode = false;
      this.apply();
    },

    toggleTopbarEdit(on?: boolean) {
      const next = on ?? !this.settings.topbarEditMode;
      if (!next) {
        this.finishEdit();
        return;
      }
      if (!this.snapshot) this.beginEdit();
      this.settings.topbarEditMode = true;
      this.settings.playerEditMode = false;
      this.settings.sidebarEditMode = false;
      this.settings.homeEditMode = false;
      this.apply();
    },

    toggleHomeEdit(on?: boolean) {
      const next = on ?? !this.settings.homeEditMode;
      if (!next) {
        this.finishEdit();
        return;
      }
      if (!this.snapshot) this.beginEdit();
      this.settings.homeEditMode = true;
      this.settings.playerEditMode = false;
      this.settings.sidebarEditMode = false;
      this.settings.topbarEditMode = false;
      this.apply();
    },

    moveSidebarItem(id: NavItemId, delta: number) {
      const order = [...this.settings.sidebarItems];
      const from = order.indexOf(id);
      if (from < 0) return;
      const to = Math.max(0, Math.min(order.length - 1, from + delta));
      if (to === from) return;
      order.splice(from, 1);
      order.splice(to, 0, id);
      this.settings.sidebarItems = order;
      this.apply();
    },

    moveSidebarItemAround(id: NavItemId, targetId: NavItemId, after: boolean) {
      if (id === targetId) return;
      const order = [...this.settings.sidebarItems];
      const from = order.indexOf(id);
      if (from < 0) return;
      order.splice(from, 1);
      const target = order.indexOf(targetId);
      if (target < 0) {
        order.splice(from, 0, id);
        return;
      }
      order.splice(after ? target + 1 : target, 0, id);
      this.settings.sidebarItems = order;
      this.apply();
    },

    moveTopbarLinkAround(
      id: TopbarLinkId,
      targetId: TopbarLinkId,
      after: boolean,
    ) {
      if (id === targetId) return;
      const order = [...this.settings.topbarLinks];
      const from = order.indexOf(id);
      if (from < 0) return;
      order.splice(from, 1);
      const target = order.indexOf(targetId);
      if (target < 0) {
        order.splice(from, 0, id);
        return;
      }
      order.splice(after ? target + 1 : target, 0, id);
      this.settings.topbarLinks = order;
      this.apply();
    },

    moveHomeSectionAround(
      id: HomeSectionId,
      targetId: HomeSectionId,
      after: boolean,
    ) {
      if (id === targetId) return;
      const order = [...this.settings.homeSections];
      const from = order.indexOf(id);
      if (from < 0) return;
      order.splice(from, 1);
      const target = order.indexOf(targetId);
      if (target < 0) {
        order.splice(from, 0, id);
        return;
      }
      order.splice(after ? target + 1 : target, 0, id);
      this.settings.homeSections = order;
      this.apply();
    },

    toggleSidebarItem(id: NavItemId) {
      if (id === "home") return;
      const list = this.settings.sidebarItems;
      this.settings.sidebarItems = list.includes(id)
        ? list.filter((x) => x !== id)
        : [...list, id];
      this.apply();
    },

    toggleTopbarLink(id: TopbarLinkId) {
      if (id === "settings") return;
      const list = this.settings.topbarLinks;
      this.settings.topbarLinks = list.includes(id)
        ? list.filter((x) => x !== id)
        : [...list, id];
      this.apply();
    },

    toggleHomeSection(id: HomeSectionId) {
      const list = this.settings.homeSections;
      this.settings.homeSections = list.includes(id)
        ? list.filter((x) => x !== id)
        : [...list, id];
      this.apply();
    },

    playerZone(id: PlayerButtonId): PlayerZone {
      if (id === "play") return "center";
      return this.settings.playerButtons[id] ?? "off";
    },

    playerZoneButtons(zone: PlayerZone): PlayerButtonId[] {
      return this.playerOrderList().filter(
        (id) => this.playerZone(id) === zone,
      );
    },

    playerOrderList(): PlayerButtonId[] {
      return sanitizeOrder(this.settings.playerOrder, playerButtonOrder);
    },

    miniOrderList(): MiniButtonId[] {
      return sanitizeOrder(this.settings.miniOrder, miniButtonOrder);
    },

    movePlayerButton(id: PlayerButtonId, zone: PlayerZone, index: number) {
      if (id === "play" && zone !== "center") return;

      const wasIn = this.playerZone(id);
      const order = this.playerOrderList().filter((x) => x !== id);

      const inZone = order.filter((x) => this.playerZone(x) === zone);
      const raw = Number.isFinite(index) ? Math.round(index) : inZone.length;
      const clamped = Math.max(0, Math.min(raw, inZone.length));

      let at: number;
      if (!inZone.length) {
        at = order.length;
      } else if (clamped < inZone.length) {
        at = order.indexOf(inZone[clamped]);
      } else {
        at = order.indexOf(inZone[inZone.length - 1]) + 1;
      }

      order.splice(at, 0, id);

      if (wasIn !== zone) {
        this.settings.playerButtons = {
          ...this.settings.playerButtons,
          [id]: zone,
        };
      }

      this.settings.playerOrder = order;
      this.apply();
    },

    moveMiniButton(id: MiniButtonId, index: number) {
      const order = this.miniOrderList().filter((x) => x !== id);
      const raw = Number.isFinite(index) ? Math.round(index) : order.length;
      const clamped = Math.max(0, Math.min(raw, order.length));
      order.splice(clamped, 0, id);
      this.settings.miniOrder = order;
      this.apply();
    },

    setPlayerZone(id: PlayerButtonId, zone: PlayerZone) {
      if (id === "play") return;
      this.settings.playerButtons = {
        ...this.settings.playerButtons,
        [id]: zone,
      };
      this.apply();
    },

    activeMiniButtons(): MiniButtonId[] {
      return this.miniOrderList().filter(
        (id) => lockedMiniButtons.has(id) || this.settings.miniButtons[id],
      );
    },

    setMiniButton(id: MiniButtonId, on: boolean) {
      if (lockedMiniButtons.has(id)) return;
      this.settings.miniButtons = { ...this.settings.miniButtons, [id]: on };
      this.apply();
    },

    resetPlayerButtons() {
      const d = defaultInterfaceSettings;
      this.settings.playerButtons = { ...defaultPlayerButtonSlots };
      this.settings.miniButtons = { ...defaultMiniButtons };
      this.settings.playerOrder = [...playerButtonOrder];
      this.settings.miniOrder = [...miniButtonOrder];
      this.settings.miniShowTime = d.miniShowTime;
      this.apply();
    },

    resetPlayerLayout() {
      const d = defaultInterfaceSettings;
      this.settings.playerHeight = d.playerHeight;
      this.settings.playerCoverSize = d.playerCoverSize;
      this.settings.playerIconSize = d.playerIconSize;
      this.settings.playerGap = d.playerGap;
      this.settings.playerSidePadding = d.playerSidePadding;
      this.settings.playerProgressWidth = d.playerProgressWidth;
      this.settings.playerProgressThickness = d.playerProgressThickness;
      this.settings.playerShowTimes = d.playerShowTimes;
      this.settings.playerMetaWidth = d.playerMetaWidth;
      this.apply();
    },

    resetMiniLayout() {
      const d = defaultInterfaceSettings;
      this.settings.miniOpacity = d.miniOpacity;
      this.settings.miniCoverSize = d.miniCoverSize;
      this.settings.miniIconSize = d.miniIconSize;
      this.settings.miniGap = d.miniGap;
      this.settings.miniPadding = d.miniPadding;
      this.settings.miniVolumeSlider = d.miniVolumeSlider;
      this.settings.miniVolumeHeight = d.miniVolumeHeight;
      this.settings.miniShowTime = d.miniShowTime;
      this.settings.miniVisualizer = d.miniVisualizer;
      this.settings.miniWidth = d.miniWidth;
      this.settings.miniHeight = d.miniHeight;
      this.apply();
    },

    useCustomTheme() {
      this.settings.theme = "custom";
      this.apply();
    },

    reset() {
      this.settings = { ...defaultInterfaceSettings };
      this.apply();
    },

    resetLyrics() {
      const d = defaultInterfaceSettings;
      this.settings.lyricsFontSize = d.lyricsFontSize;
      this.settings.lyricsLineHeight = d.lyricsLineHeight;
      this.settings.lyricsWeight = d.lyricsWeight;
      this.settings.lyricsFont = d.lyricsFont;
      this.settings.lyricsBackgroundBlur = d.lyricsBackgroundBlur;
      this.settings.lyricsBackgroundOpacity = d.lyricsBackgroundOpacity;
      this.settings.lyricsLineBlur = d.lyricsLineBlur;
      this.settings.lyricsInactive = d.lyricsInactive;
      this.settings.lyricsAlign = d.lyricsAlign;
      this.settings.lyricsBackdrop = d.lyricsBackdrop;
      this.settings.lyricsHighlight = d.lyricsHighlight;
      this.settings.lyricsKaraokeWord = d.lyricsKaraokeWord;
      this.settings.lyricsGlow = d.lyricsGlow;
      this.settings.lyricsShowArtwork = d.lyricsShowArtwork;
      this.settings.lyricsMotion = d.lyricsMotion;
      this.settings.lyricsVisualizer = d.lyricsVisualizer;
      this.settings.lyricsShowCredits = d.lyricsShowCredits;
      this.settings.lyricsShowOrigin = d.lyricsShowOrigin;
      this.settings.lyricsAnnotations = d.lyricsAnnotations;
      this.settings.lyricsAnnotationMark = d.lyricsAnnotationMark;
      this.settings.lyricsSource = d.lyricsSource;
      this.settings.lyricsTranslate = d.lyricsTranslate;
      this.settings.lyricsTranslateTarget = d.lyricsTranslateTarget;
      this.settings.lyricsTranslateMode = d.lyricsTranslateMode;
      this.apply();
    },

    setSidebarItemLabel(id: NavItemId, label?: string) {
      const next = { ...this.settings.sidebarLabels };
      if (!label || !label.trim()) {
        delete next[id];
      } else {
        next[id] = label.trim();
      }
      this.settings.sidebarLabels = next;
      this.apply();
    },

    setSidebarItemIcon(id: NavItemId, icon?: string) {
      const next = { ...this.settings.sidebarIcons };
      if (!icon || !icon.trim()) {
        delete next[id];
      } else {
        next[id] = icon.trim();
      }
      this.settings.sidebarIcons = next;
      this.apply();
    },

    setTopbarLinkLabel(id: TopbarLinkId, label?: string) {
      const next = { ...this.settings.topbarLabels };
      if (!label || !label.trim()) {
        delete next[id];
      } else {
        next[id] = label.trim();
      }
      this.settings.topbarLabels = next;
      this.apply();
    },

    setTopbarLinkIcon(id: TopbarLinkId, icon?: string) {
      const next = { ...this.settings.topbarIcons };
      if (!icon || !icon.trim()) {
        delete next[id];
      } else {
        next[id] = icon.trim();
      }
      this.settings.topbarIcons = next;
      this.apply();
    },

    setHomeSectionLabel(id: HomeSectionId, label?: string) {
      const next = { ...this.settings.homeLabels };
      if (!label || !label.trim()) {
        delete next[id];
      } else {
        next[id] = label.trim();
      }
      this.settings.homeLabels = next;
      this.apply();
    },

    resetSidebarOrder() {
      this.settings.sidebarItems = [...defaultSidebarItems];
      this.apply();
    },

    resetSidebarAppearance() {
      this.settings.sidebarLabels = {};
      this.settings.sidebarIcons = {};
      this.apply();
    },

    resetSidebarCustomizations() {
      const d = defaultInterfaceSettings;
      this.settings.sidebarItems = [...defaultSidebarItems];
      this.settings.sidebarLabels = {};
      this.settings.sidebarIcons = {};
      this.settings.sidebarWidth = d.sidebarWidth;
      this.apply();
    },

    resetTopbarOrder() {
      this.settings.topbarLinks = [...defaultTopbarLinks];
      this.apply();
    },

    resetTopbarAppearance() {
      this.settings.topbarLabels = {};
      this.settings.topbarIcons = {};
      this.apply();
    },

    resetTopbarCustomizations() {
      const d = defaultInterfaceSettings;
      this.settings.topbarLinks = [...defaultTopbarLinks];
      this.settings.topbarLabels = {};
      this.settings.topbarIcons = {};
      this.settings.topbarVisible = d.topbarVisible;
      this.settings.topbarHeight = d.topbarHeight;
      this.settings.topbarShowLogo = d.topbarShowLogo;
      this.settings.topbarLogoText = d.topbarLogoText;
      this.settings.topbarLogoSize = d.topbarLogoSize;
      this.settings.topbarShowSearch = d.topbarShowSearch;
      this.settings.searchWidth = d.searchWidth;
      this.settings.topbarShowAccount = d.topbarShowAccount;
      this.settings.topbarAccountName = d.topbarAccountName;
      this.settings.topbarAccountAvatarSize = d.topbarAccountAvatarSize;
      this.settings.topbarShowWindowControls = d.topbarShowWindowControls;
      this.settings.windowShowMinimize = d.windowShowMinimize;
      this.settings.windowShowMaximize = d.windowShowMaximize;
      this.settings.windowShowClose = d.windowShowClose;
      this.settings.windowButtonWidth = d.windowButtonWidth;
      this.apply();
    },

    resetHomeSectionsOrder() {
      this.settings.homeSections = [...defaultHomeSections];
      this.apply();
    },

    resetHomeAppearance() {
      this.settings.homeLabels = {};
      this.apply();
    },

    resetHomeSectionCustomizations() {
      this.settings.homeSections = [...defaultHomeSections];
      this.settings.homeLabels = {};
      this.apply();
    },
  },
});
