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
            class="rounded-xl border p-2 text-left transition duration-150"
            :class="
              ui.settings.theme === theme.value
                ? 'border-[color-mix(in_srgb,var(--accent)_60%,var(--line))] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--fg)]'
                : 'border-transparent bg-[color-mix(in_srgb,var(--fg)_3%,transparent)] text-[var(--fg)] hover:border-[var(--line)] hover:bg-[var(--hover)]'
            "
            @click="ui.set('theme', theme.value)"
          >
            <span
              class="mb-2 flex h-11 items-end gap-1 rounded-lg border border-white/10 p-1.5"
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
            class="rounded-xl border p-2 text-left transition duration-150"
            :class="
              ui.settings.theme === 'custom'
                ? 'border-[color-mix(in_srgb,var(--accent)_60%,var(--line))] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--fg)]'
                : 'border-transparent bg-[color-mix(in_srgb,var(--fg)_3%,transparent)] text-[var(--fg)] hover:border-[var(--line)] hover:bg-[var(--hover)]'
            "
            @click="ui.useCustomTheme()"
          >
            <span
              class="mb-2 flex h-11 items-end gap-1 rounded-lg border border-white/10 p-1.5"
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
            class="grid h-8 w-8 place-items-center rounded-lg border-2 text-white transition duration-150"
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
import ColorField from "@/components/settings/ColorField.vue";
import SettingsCard from "@/components/settings/SettingsCard.vue";
import SettingsRow from "@/components/settings/SettingsRow.vue";
import SettingsSection from "@/components/settings/SettingsSection.vue";
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
