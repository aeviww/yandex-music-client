<template>
  <SettingsSection
    id="settings-theme"
    title="Оформление"
    description="Готовая палитра или полностью свои цвета."
    icon="mingcute:computer-line"
  >
    <SettingsCard>
      <SettingsRow
        column
        label="Шрифт приложения"
        description="Меняет шрифт во всём интерфейсе: меню, списки, плеер и настройки."
      >
        <div class="flex w-full flex-col gap-2">
          <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <button
              v-for="font in fonts"
              :key="font.value"
              type="button"
              :title="font.title"
              class="flex min-w-0 items-center justify-between gap-2 rounded-[var(--radius)] border px-3 py-2.5 text-left transition duration-150"
              :class="
                ui.settings.appFont === font.value
                  ? 'border-[color-mix(in_srgb,var(--accent)_60%,var(--line))] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--fg)]'
                  : 'border-transparent bg-[color-mix(in_srgb,var(--fg)_3%,transparent)] text-[var(--fg)] hover:border-[var(--line)] hover:bg-[var(--hover)]'
              "
              @click="selectFont(font.value)"
            >
              <span
                class="w-full truncate text-[14px] font-medium leading-tight"
                :style="{ fontFamily: stackOf(font.value) }"
              >
                {{ font.label }}
              </span>
              <span
                v-if="ui.settings.appFont === font.value"
                class="flex-none text-[10px] font-medium text-[var(--accent)]"
              >
                ●
              </span>
            </button>
          </div>

          <div v-if="ui.settings.appFont === 'custom'" class="relative w-full">
            <input
              :class="INPUT"
              type="text"
              autocomplete="off"
              spellcheck="false"
              placeholder="Начните вводить название шрифта"
              :value="fontQuery"
              @focus="openFontList"
              @input="onCustomInput"
              @keydown.enter.prevent="applyCustomFont"
              @keydown.esc="fontMenuOpen = false"
              @change="applyCustomFont"
              @blur="closeFontListSoon"
            />

            <div
              v-if="fontMenuOpen"
              class="absolute left-0 right-0 top-[calc(100%+6px)] z-[80] max-h-[230px] overflow-y-auto rounded-[calc(var(--radius)*0.8)] border border-[var(--line)] bg-[var(--surface-2)] p-1 shadow-[var(--elev-1)]"
            >
              <button
                v-for="font in filteredSystemFonts"
                :key="font"
                type="button"
                class="flex w-full items-center justify-between gap-3 rounded-[calc(var(--radius)*0.55)] px-2.5 py-1.5 text-left text-[12.5px] text-[var(--fg)] transition-colors hover:bg-[var(--hover)]"
                @mousedown.prevent="pickFont(font)"
              >
                <span
                  class="truncate"
                  :style="{ fontFamily: `'${font}', sans-serif` }"
                >
                  {{ font }}
                </span>
                <span
                  v-if="ui.settings.appFontCustom.trim() === font"
                  class="flex-none text-[10px] text-[var(--accent)]"
                >
                  выбран
                </span>
              </button>

              <div
                v-if="fontListState === 'loading'"
                class="px-2.5 py-2 text-[11px] text-[color:var(--fg-faint)]"
              >
                Ищу установленные шрифты…
              </div>
              <div
                v-else-if="!filteredSystemFonts.length"
                class="px-2.5 py-2 text-[11px] text-[color:var(--fg-faint)]"
              >
                Ничего не найдено
              </div>
              <div
                v-if="fontListState === 'fallback'"
                class="px-2.5 py-1.5 text-[10.5px] leading-snug text-[color:var(--fg-faint)]"
              >
                Список установленных шрифтов недоступен — показаны распространённые
                системные.
              </div>
            </div>
          </div>

          <div
            class="rounded-[calc(var(--radius)*0.6667)] border border-[var(--line)] bg-[color-mix(in_srgb,var(--fg)_3%,transparent)] px-3 py-2 leading-snug text-[var(--fg)]"
            :style="{ fontFamily: fontPreview, fontSize: previewSize }"
          >
            Съешь ещё этих мягких французских булок, да выпей чаю
            <span class="text-[color:var(--fg-dim)]"> — Aa Bb 0123</span>
          </div>
        </div>
      </SettingsRow>

      <SettingsRow
        column
        label="Тема"
        description="Цвета фона, панелей и текста."
      >
        <div
          class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6"
        >
          <button
            v-for="theme in themes"
            :key="theme.value"
            type="button"
            class="rounded-[var(--radius)] border p-2 text-left transition duration-150"
            :class="
              ui.settings.theme === theme.value
                ? 'border-[color-mix(in_srgb,var(--accent)_60%,var(--line))] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--fg)]'
                : 'border-transparent bg-[color-mix(in_srgb,var(--fg)_3%,transparent)] text-[var(--fg)] hover:border-[var(--line)] hover:bg-[var(--hover)]'
            "
            @click="ui.set('theme', theme.value)"
          >
            <span
              class="mb-2 flex h-11 items-end gap-1 rounded-[calc(var(--radius)*0.6667)] border border-white/10 p-1.5"
              :style="{ background: theme.background }"
            >
              <i
                class="block h-[58%] w-[34%] rounded"
                :style="{ background: theme.surface }"
              />
              <i
                class="block h-full w-[66%] rounded"
                :style="{ background: theme.surface2 }"
              />
            </span>
            <span class="flex items-center justify-between gap-1">
              <span class="block truncate text-[10.5px] font-medium">{{
                theme.label
              }}</span>
              <Icon
                v-if="ui.settings.theme === theme.value"
                name="mingcute:check-fill"
                :size="12"
                class="flex-none text-[var(--accent)]"
              />
            </span>
          </button>

          <button
            type="button"
            class="rounded-[var(--radius)] border p-2 text-left transition duration-150"
            :class="
              ui.settings.theme === 'custom'
                ? 'border-[color-mix(in_srgb,var(--accent)_60%,var(--line))] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--fg)]'
                : 'border-transparent bg-[color-mix(in_srgb,var(--fg)_3%,transparent)] text-[var(--fg)] hover:border-[var(--line)] hover:bg-[var(--hover)]'
            "
            @click="ui.useCustomTheme()"
          >
            <span
              class="mb-2 flex h-11 items-end gap-1 rounded-[calc(var(--radius)*0.6667)] border border-white/10 p-1.5"
              :style="{ background: ui.settings.customBackground }"
            >
              <i
                class="block h-[58%] w-[34%] rounded"
                :style="{ background: ui.settings.customSurface }"
              />
              <i
                class="block h-full w-[66%] rounded"
                :style="{ background: ui.settings.customSurface2 }"
              />
            </span>
            <span class="flex items-center justify-between gap-1">
              <span class="block truncate text-[10.5px] font-medium">Своя</span>
              <Icon
                v-if="ui.settings.theme === 'custom'"
                name="mingcute:check-fill"
                :size="12"
                class="flex-none text-[var(--accent)]"
              />
            </span>
          </button>
        </div>
      </SettingsRow>

      <SettingsRow
        v-if="ui.settings.theme === 'custom'"
        column
        label="Своя палитра"
        description="Настрой каждый основной цвет отдельно."
      >
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <ColorField
            label="Фон"
            :value="ui.settings.customBackground"
            @change="setColor('customBackground', $event)"
          />
          <ColorField
            label="Панели"
            :value="ui.settings.customSurface"
            @change="setColor('customSurface', $event)"
          />
          <ColorField
            label="Активные панели"
            :value="ui.settings.customSurface2"
            @change="setColor('customSurface2', $event)"
          />
          <ColorField
            label="Текст"
            :value="ui.settings.customText"
            @change="setColor('customText', $event)"
          />
        </div>
      </SettingsRow>

      <SettingsRow
        column
        label="Акцент"
        description="Кнопки, активные пункты и индикаторы."
      >
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="color in accents"
            :key="color.value"
            type="button"
            class="grid h-8 w-8 place-items-center rounded-[calc(var(--radius)*0.6667)] border-2 text-white transition duration-150"
            :class="
              ui.settings.accent === color.value
                ? 'border-white'
                : 'border-transparent'
            "
            :title="color.label"
            :style="{ background: color.value }"
            @click="ui.set('accent', color.value)"
          >
            <Icon
              v-if="ui.settings.accent === color.value"
              name="mingcute:check-line"
              :size="14"
            />
          </button>
          <ColorField
            label="Свой"
            :value="ui.settings.accent"
            @change="setColor('accent', $event)"
          />
        </div>
      </SettingsRow>
    </SettingsCard>
  </SettingsSection>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { invoke } from "@tauri-apps/api/core";
import ColorField from "@/components/settings/ColorField.vue";
import SettingsCard from "@/components/settings/SettingsCard.vue";
import SettingsRow from "@/components/settings/SettingsRow.vue";
import SettingsSection from "@/components/settings/SettingsSection.vue";
import { INPUT } from "@/components/settings/classes";
import type { AppFont } from "@/stores/ui/index";
import {
  accentColors,
  themeNames,
  themePalettes,
  useUiStore,
} from "@/stores/ui/index";

const ui = useUiStore();
const accents = accentColors;
const themes = themeNames.map((theme) => ({
  ...theme,
  ...themePalettes[theme.value],
}));

const FONT_STACKS: Record<AppFont, string> = {
  onest: '"Onest", "Segoe UI", system-ui, sans-serif',
  golos: '"Golos Text", "Segoe UI", system-ui, sans-serif',
  manrope: '"Manrope", "Segoe UI", system-ui, sans-serif',
  system: '"Segoe UI Variable Text", "Segoe UI", system-ui, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  mono: '"Cascadia Code", Consolas, monospace',
  minecraft: '"Pixelify Sans", "Segoe UI", system-ui, sans-serif',
  jetbrains: '"JetBrains Mono", "Cascadia Code", Consolas, monospace',
  custom: '"Onest", "Segoe UI", system-ui, sans-serif',
};

const fonts: Array<{ value: AppFont; label: string; title: string }> = [
  {
    value: "onest",
    label: "Onest",
    title: "Onest — геометрический гротеск, близкий к шрифту Spotify",
  },
  {
    value: "golos",
    label: "Golos Text",
    title: "Golos Text — нейтральный шрифт с отличной кириллицей",
  },
  {
    value: "manrope",
    label: "Manrope",
    title: "Manrope — современный геометрический гротеск",
  },
  {
    value: "minecraft",
    label: "Minecraft",
    title: "Pixelify Sans — пиксельный шрифт в духе Minecraft",
  },
  {
    value: "jetbrains",
    label: "JetBrains Mono",
    title: "JetBrains Mono — моноширинный шрифт с поддержкой кириллицы",
  },
  {
    value: "system",
    label: "Системный",
    title: "Системный шрифт Windows",
  },
  {
    value: "serif",
    label: "Антиква",
    title: "Классическая антиква",
  },
  {
    value: "mono",
    label: "Моно",
    title: "Системный моноширинный шрифт",
  },
  {
    value: "custom",
    label: "Свой шрифт",
    title: "Указать имя любого установленного шрифта",
  },
];

const FALLBACK_FONTS = [
  "Arial",
  "Arial Black",
  "Bahnschrift",
  "Calibri",
  "Cambria",
  "Candara",
  "Cascadia Code",
  "Cascadia Mono",
  "Comic Sans MS",
  "Consolas",
  "Constantia",
  "Corbel",
  "Courier New",
  "Ebrima",
  "Franklin Gothic Medium",
  "Gabriola",
  "Gadugi",
  "Georgia",
  "Impact",
  "Ink Free",
  "Leelawadee UI",
  "Lucida Console",
  "Lucida Sans Unicode",
  "Malgun Gothic",
  "Microsoft Sans Serif",
  "Microsoft YaHei UI",
  "Nirmala UI",
  "Palatino Linotype",
  "Segoe Print",
  "Segoe Script",
  "Segoe UI",
  "Sitka Text",
  "Sylfaen",
  "Tahoma",
  "Times New Roman",
  "Trebuchet MS",
  "Verdana",
  "Yu Gothic UI",
];

type FontListState = "idle" | "loading" | "system" | "fallback";

const systemFonts = ref<string[]>([]);
const fontListState = ref<FontListState>("idle");
const fontMenuOpen = ref(false);
const fontQuery = ref(
  ui.settings.appFont === "custom" ? ui.settings.appFontCustom : "",
);

const filteredSystemFonts = computed(() => {
  const query = fontQuery.value.trim().toLocaleLowerCase("ru");
  const list = query
    ? systemFonts.value.filter((name) =>
        name.toLocaleLowerCase("ru").includes(query),
      )
    : systemFonts.value;
  return list.slice(0, 80);
});

type LocalFontData = { family?: string };
type WindowWithLocalFonts = Window & {
  queryLocalFonts?: () => Promise<LocalFontData[]>;
};

async function loadSystemFonts() {
  if (fontListState.value === "loading" || fontListState.value === "system") {
    return;
  }

  fontListState.value = "loading";

  try {
    const fromCore = await invoke<string[]>("list_system_fonts");
    const names = new Set<string>();
    for (const family of fromCore ?? []) {
      if (typeof family === "string" && family.trim()) names.add(family.trim());
    }
    if (names.size) {
      systemFonts.value = [...names].sort((a, b) => a.localeCompare(b, "ru"));
      fontListState.value = "system";
      return;
    }
  } catch {}

  const query = (window as WindowWithLocalFonts).queryLocalFonts;
  if (typeof query !== "function") {
    systemFonts.value = FALLBACK_FONTS;
    fontListState.value = "fallback";
    return;
  }

  try {
    const list = await query();
    const names = new Set<string>();
    for (const font of list) {
      const family = (font.family || "").trim();
      if (family) names.add(family);
    }
    if (names.size) {
      systemFonts.value = [...names].sort((a, b) =>
        a.localeCompare(b, "ru"),
      );
      fontListState.value = "system";
    } else {
      systemFonts.value = FALLBACK_FONTS;
      fontListState.value = "fallback";
    }
  } catch {
    systemFonts.value = FALLBACK_FONTS;
    fontListState.value = "fallback";
  }
}

function selectFont(value: AppFont) {
  ui.set("appFont", value);
  if (value === "custom") {
    fontQuery.value = ui.settings.appFontCustom;
    fontMenuOpen.value = true;
    void loadSystemFonts();
  }
}

function openFontList() {
  fontMenuOpen.value = true;
  void loadSystemFonts();
}

function closeFontListSoon() {
  window.setTimeout(() => {
    fontMenuOpen.value = false;
  }, 130);
}

function onCustomInput(event: Event) {
  fontQuery.value = (event.target as HTMLInputElement).value;
  fontMenuOpen.value = true;
}

function applyCustomFont() {
  ui.set("appFontCustom", fontQuery.value.trim());
  fontMenuOpen.value = false;
}

function pickFont(name: string) {
  fontQuery.value = name;
  ui.set("appFontCustom", name);
  ui.set("appFont", "custom");
  fontMenuOpen.value = false;
}

function stackOf(value: AppFont): string {
  return FONT_STACKS[value] ?? FONT_STACKS.onest;
}

const fontPreview = computed(() => {
  if (ui.settings.appFont === "custom") {
    return ui.settings.appFontCustom.trim() || FONT_STACKS.onest;
  }
  return stackOf(ui.settings.appFont);
});

const previewSize = computed(() => {
  if (ui.settings.appFont === "minecraft") return "13px";
  return "15px";
});

type ColorKey =
  | "accent"
  | "customBackground"
  | "customSurface"
  | "customSurface2"
  | "customText";

function setColor(key: ColorKey, value: string) {
  ui.settings[key] = value;
  if (key !== "accent") ui.settings.theme = "custom";
  ui.apply();
}
</script>
