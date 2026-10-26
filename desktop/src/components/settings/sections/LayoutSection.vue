<template>
  <SettingsSection
    id="settings-layout"
    title="Интерфейс"
    description="Размеры применяются ко всему приложению, включая меню и панели."
    icon="mingcute:layout-left-line"
  >
    <SettingsCard>
      <SettingSlider
        v-for="item in sliders"
        :key="item.key"
        :label="item.label"
        :description="item.description"
        :model-value="ui.settings[item.key]"
        :min="item.min"
        :max="item.max"
        :step="item.step"
        :suffix="item.suffix"
        @update:model-value="ui.set(item.key, $event)"
      />

      <SettingsRow
        label="Плотность списков"
        description="Высота строк с треками."
      >
        <SettingsChoice
          :model-value="ui.settings.density"
          :options="densities"
          @update:model-value="ui.set('density', $event)"
        />
      </SettingsRow>

      <SettingsRow
        label="Форма обложек"
        description="Отдельно от общего скругления интерфейса."
      >
        <SettingsChoice
          :model-value="ui.settings.coverStyle"
          :options="coverStyles"
          @update:model-value="ui.set('coverStyle', $event)"
        />
      </SettingsRow>
    </SettingsCard>
  </SettingsSection>
</template>

<script setup lang="ts">
import SettingSlider from "@/components/settings/SettingSlider.vue";
import SettingsCard from "@/components/settings/SettingsCard.vue";
import SettingsChoice from "@/components/settings/SettingsChoice.vue";
import SettingsRow from "@/components/settings/SettingsRow.vue";
import SettingsSection from "@/components/settings/SettingsSection.vue";
import type { CoverStyle, Density } from "@/stores/ui/index";
import { useUiStore } from "@/stores/ui/index";

const ui = useUiStore();

type SliderKey =
  | "textScale"
  | "radius"
  | "pagePadding"
  | "cardSize"
  | "sidebarWidth"
  | "searchWidth";

const sliders: Array<{
  key: SliderKey;
  label: string;
  description: string;
  min: number;
  max: number;
  step: number;
  suffix: string;
}> = [
  {
    key: "textScale",
    label: "Масштаб текста",
    description: "Текст в навигации, меню, плеере и на страницах.",
    min: 85,
    max: 125,
    step: 1,
    suffix: "%",
  },
  {
    key: "radius",
    label: "Скругление",
    description: "Карточки, меню, кнопки, поля и переключатели.",
    min: 0,
    max: 24,
    step: 1,
    suffix: " px",
  },
  {
    key: "pagePadding",
    label: "Отступы страниц",
    description: "Расстояние между содержимым и краями окна.",
    min: 16,
    max: 64,
    step: 2,
    suffix: " px",
  },
  {
    key: "cardSize",
    label: "Размер карточек",
    description: "Обложки на главной странице и в подборках.",
    min: 120,
    max: 210,
    step: 2,
    suffix: " px",
  },
  {
    key: "sidebarWidth",
    label: "Ширина боковой панели",
    description: "Навигация и список плейлистов.",
    min: 200,
    max: 320,
    step: 2,
    suffix: " px",
  },
  {
    key: "searchWidth",
    label: "Ширина поиска",
    description: "Поисковая строка в верхней панели.",
    min: 240,
    max: 540,
    step: 10,
    suffix: " px",
  },
];

const densities: Array<{ value: Density; label: string }> = [
  { value: "compact", label: "Плотно" },
  { value: "comfortable", label: "Обычно" },
  { value: "spacious", label: "Свободно" },
];

const coverStyles: Array<{ value: CoverStyle; label: string }> = [
  { value: "square", label: "Строго" },
  { value: "soft", label: "Мягко" },
  { value: "rounded", label: "Круглее" },
];
</script>
