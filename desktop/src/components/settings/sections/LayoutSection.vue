<template>
  <SettingsSection
    id="settings-layout"
    title="Интерфейс"
    description="Размеры, навигация, боковая панель и секции главной страницы."
    icon="mingcute:layout-left-line"
  >
    <div class="space-y-4">
      <SettingsCard>
        <div class="px-5 pb-2 pt-4">
          <div
            class="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[color:var(--fg-faint)]"
          >
            Размеры и отображение
          </div>
        </div>

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

      <SettingsCard>
        <SettingsRow
          column
          label="Боковая панель"
          description="Навигация настраивается прямо на самой панели: порядок, названия, иконки и скрытые пункты."
        >
          <ul class="m-0 flex list-none flex-col gap-2 p-0">
            <li
              v-for="step in sidebarSteps"
              :key="step.icon"
              class="flex items-center gap-2.5 text-[12.5px] leading-snug text-[color:var(--fg-dim)]"
            >
              <Icon
                :name="step.icon"
                :size="14"
                class="flex-none text-[var(--accent)]"
              />
              <span>{{ step.text }}</span>
            </li>
          </ul>

          <div class="mt-2 flex flex-wrap items-center gap-3">
            <button
              :class="BUTTON_ACCENT_OUTLINE"
              type="button"
              @click="startEdit('sidebar')"
            >
              <Icon name="mingcute:layout-left-line" :size="15" />
              Редактировать на панели
            </button>
            <button :class="BUTTON" type="button" @click="resetSidebar">
              Сбросить
            </button>
          </div>
        </SettingsRow>
      </SettingsCard>

      <SettingsCard>
        <SettingsRow
          column
          label="Верхнее меню"
          description="Верхняя панель настраивается целиком: логотип, поиск, аккаунт, кнопки окна и ссылки профиля."
        >
          <ul class="m-0 flex list-none flex-col gap-2 p-0">
            <li
              v-for="step in topbarSteps"
              :key="step.icon"
              class="flex items-center gap-2.5 text-[12.5px] leading-snug text-[color:var(--fg-dim)]"
            >
              <Icon
                :name="step.icon"
                :size="14"
                class="flex-none text-[var(--accent)]"
              />
              <span>{{ step.text }}</span>
            </li>
          </ul>

          <div class="mt-2 flex flex-wrap items-center gap-3">
            <button
              :class="BUTTON_ACCENT_OUTLINE"
              type="button"
              @click="startEdit('topbar')"
            >
              <Icon name="mingcute:layout-top-line" :size="15" />
              Редактировать верхнее меню
            </button>
            <button :class="BUTTON" type="button" @click="resetTopbar">
              Сбросить
            </button>
          </div>
        </SettingsRow>
      </SettingsCard>

      <SettingsCard>
        <SettingsRow
          column
          label="Раздел «Главное»"
          description="Секции главной страницы настраиваются прямо на ней: порядок, названия и видимость."
        >
          <ul class="m-0 flex list-none flex-col gap-2 p-0">
            <li
              v-for="step in homeSteps"
              :key="step.icon"
              class="flex items-center gap-2.5 text-[12.5px] leading-snug text-[color:var(--fg-dim)]"
            >
              <Icon
                :name="step.icon"
                :size="14"
                class="flex-none text-[var(--accent)]"
              />
              <span>{{ step.text }}</span>
            </li>
          </ul>

          <div class="mt-2 flex flex-wrap items-center gap-3">
            <button
              :class="BUTTON_ACCENT_OUTLINE"
              type="button"
              @click="startEdit('home')"
            >
              <Icon name="mingcute:home-3-line" :size="15" />
              Редактировать на главной
            </button>
            <button :class="BUTTON" type="button" @click="resetHome">
              Сбросить
            </button>
          </div>
        </SettingsRow>
      </SettingsCard>
    </div>
  </SettingsSection>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import SettingSlider from "@/components/settings/SettingSlider.vue";
import SettingsCard from "@/components/settings/SettingsCard.vue";
import SettingsChoice from "@/components/settings/SettingsChoice.vue";
import SettingsRow from "@/components/settings/SettingsRow.vue";
import SettingsSection from "@/components/settings/SettingsSection.vue";
import {
  BUTTON,
  BUTTON_ACCENT_OUTLINE,
} from "@/components/settings/classes";
import type { CoverStyle, Density } from "@/stores/ui/index";
import { useUiStore } from "@/stores/ui/index";

const ui = useUiStore();
const route = useRoute();
const router = useRouter();

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

const sidebarSteps = [
  {
    icon: "mingcute:dots-line",
    text: "Тяни пункты прямо в панели, чтобы поменять порядок",
  },
  {
    icon: "mingcute:edit-2-line",
    text: "Карандаш у пункта меняет название и иконку",
  },
  {
    icon: "mingcute:eye-close-line",
    text: "Глаз скрывает пункт, вернуть его можно там же",
  },
  {
    icon: "mingcute:resize-line",
    text: "Правый край панели тянет её ширину",
  },
];

const topbarSteps = [
  {
    icon: "mingcute:user-3-line",
    text: "Меню аккаунта откроется само — правь его на месте",
  },
  {
    icon: "mingcute:dots-line",
    text: "Тяни ссылки, чтобы поменять их порядок",
  },
  {
    icon: "mingcute:edit-2-line",
    text: "Карандаш меняет название и иконку ссылки",
  },
  {
    icon: "mingcute:eye-close-line",
    text: "Глаз скрывает ссылку, ниже её можно вернуть",
  },
];

const homeSteps = [
  {
    icon: "mingcute:home-3-line",
    text: "Редактор откроет главную страницу с блоками",
  },
  {
    icon: "mingcute:dots-line",
    text: "Тяни секции за значок, чтобы поменять порядок",
  },
  {
    icon: "mingcute:edit-2-line",
    text: "Карандаш меняет заголовок секции",
  },
  {
    icon: "mingcute:eye-close-line",
    text: "Глаз скрывает секцию, вернуть можно в панели справа",
  },
];

function startEdit(kind: "sidebar" | "topbar" | "home") {
  ui.chromeEditReturnPath = router.resolve({
    path: "/settings",
    query: { ...route.query, section: "layout" },
  }).fullPath;

  if (kind === "home") {
    ui.toggleHomeEdit(true);
    void router.push("/");
    return;
  }

  if (kind === "sidebar") ui.toggleSidebarEdit(true);
  else ui.toggleTopbarEdit(true);
  closeSettings();
}

function closeSettings() {
  const back = window.history.state?.back;
  if (typeof back === "string" && back && !back.startsWith("/settings")) {
    router.back();
  } else {
    void router.replace("/");
  }
}

function resetSidebar() {
  ui.resetSidebarCustomizations();
}

function resetTopbar() {
  ui.resetTopbarCustomizations();
}

function resetHome() {
  ui.resetHomeSectionCustomizations();
}
</script>
