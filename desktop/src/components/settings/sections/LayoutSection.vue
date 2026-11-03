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
        <div class="px-5 pb-2 pt-4">
          <div
            class="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[color:var(--fg-faint)]"
          >
            Боковая панель (навигация)
          </div>
          <p class="mb-0 mt-1 text-[11.5px] text-[color:var(--fg-faint)]">
            Перетаскивайте пункты для изменения порядка, нажимайте ✏️ для переименования и смены иконки.
          </p>
        </div>

        <div class="px-4 pb-4 pt-1">
          <SortableNavList
            :items="ui.settings.sidebarItems"
            :default-items="defaultSidebarItems"
            :catalog="sidebarCatalog"
            :custom-labels="ui.settings.sidebarLabels"
            :custom-icons="ui.settings.sidebarIcons"
            :can-edit-icon="true"
            :can-edit-label="true"
            active-title="Активные пункты меню"
            hidden-title="Скрытые пункты меню"
            @update:items="updateSidebarItems"
            @update-label="updateSidebarLabel"
            @update-icon="updateSidebarIcon"
            @reset-order="resetSidebarOrder"
            @reset-appearance="resetSidebarAppearance"
            @reset-all="resetSidebarAll"
          />
        </div>
      </SettingsCard>

      <SettingsCard>
        <div class="px-5 pb-2 pt-4">
          <div
            class="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[color:var(--fg-faint)]"
          >
            Верхнее меню (профиль)
          </div>
          <p class="mb-0 mt-1 text-[11.5px] text-[color:var(--fg-faint)]">
            Пункты быстрого перехода в выпадающем меню аккаунта в верхнем правом углу.
          </p>
        </div>

        <div class="px-4 pb-4 pt-1">
          <SortableNavList
            :items="ui.settings.topbarLinks"
            :default-items="defaultTopbarLinks"
            :catalog="topbarCatalog"
            :custom-labels="ui.settings.topbarLabels"
            :custom-icons="ui.settings.topbarIcons"
            :can-edit-icon="true"
            :can-edit-label="true"
            active-title="Активные ссылки"
            hidden-title="Скрытые ссылки"
            @update:items="updateTopbarLinks"
            @update-label="updateTopbarLabel"
            @update-icon="updateTopbarIcon"
            @reset-order="resetTopbarOrder"
            @reset-appearance="resetTopbarAppearance"
            @reset-all="resetTopbarAll"
          />
        </div>
      </SettingsCard>

      <SettingsCard>
        <div class="px-5 pb-2 pt-4">
          <div
            class="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[color:var(--fg-faint)]"
          >
            Раздел «Главное»
          </div>
          <p class="mb-0 mt-1 text-[11.5px] text-[color:var(--fg-faint)]">
            Настройте порядок и отображение контентных блоков на главной странице приложения.
          </p>
        </div>

        <div class="px-4 pb-4 pt-1">
          <SortableNavList
            :items="ui.settings.homeSections"
            :default-items="defaultHomeSections"
            :catalog="homeSectionCatalog"
            :custom-labels="ui.settings.homeLabels"
            :can-edit-icon="false"
            :can-edit-label="true"
            active-title="Активные секции"
            hidden-title="Скрытые секции"
            @update:items="updateHomeSections"
            @update-label="updateHomeLabel"
            @reset-order="resetHomeSectionsOrder"
            @reset-appearance="resetHomeSectionsAppearance"
            @reset-all="resetHomeSectionsAll"
          />
        </div>
      </SettingsCard>
    </div>
  </SettingsSection>
</template>

<script setup lang="ts">
import SettingSlider from "@/components/settings/SettingSlider.vue";
import SettingsCard from "@/components/settings/SettingsCard.vue";
import SettingsChoice from "@/components/settings/SettingsChoice.vue";
import SettingsRow from "@/components/settings/SettingsRow.vue";
import SettingsSection from "@/components/settings/SettingsSection.vue";
import SortableNavList from "@/components/settings/SortableNavList.vue";
import type { NavCatalogEntry } from "@/components/settings/SortableNavList.vue";
import type {
  CoverStyle,
  Density,
  HomeSectionId,
  NavItemId,
  TopbarLinkId,
} from "@/stores/ui/index";
import {
  defaultHomeSections,
  defaultSidebarItems,
  defaultTopbarLinks,
  useUiStore,
} from "@/stores/ui/index";
import {
  navItemCatalog,
  topbarLinkCatalog,
  homeSectionCatalogList,
} from "@/constants/navigation";

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

const sidebarCatalog = navItemCatalog as NavCatalogEntry<NavItemId>[];
const topbarCatalog = topbarLinkCatalog as NavCatalogEntry<TopbarLinkId>[];
const homeSectionCatalog = homeSectionCatalogList.map((s) => ({
  id: s.id,
  label: s.editorLabel,
  icon: s.icon,
  description: s.description,
})) as NavCatalogEntry<HomeSectionId>[];

function updateSidebarItems(items: NavItemId[]) {
  if (!items.includes("home")) items.unshift("home");
  ui.set("sidebarItems", items);
}

function updateSidebarLabel(id: NavItemId, label?: string) {
  ui.setSidebarItemLabel(id, label);
}

function updateSidebarIcon(id: NavItemId, icon?: string) {
  ui.setSidebarItemIcon(id, icon);
}

function resetSidebarOrder() {
  ui.resetSidebarOrder();
}

function resetSidebarAppearance() {
  ui.resetSidebarAppearance();
}

function resetSidebarAll() {
  ui.resetSidebarCustomizations();
}

function updateTopbarLinks(links: TopbarLinkId[]) {
  if (!links.includes("settings")) links.push("settings");
  ui.set("topbarLinks", links);
}

function updateTopbarLabel(id: TopbarLinkId, label?: string) {
  ui.setTopbarLinkLabel(id, label);
}

function updateTopbarIcon(id: TopbarLinkId, icon?: string) {
  ui.setTopbarLinkIcon(id, icon);
}

function resetTopbarOrder() {
  ui.resetTopbarOrder();
}

function resetTopbarAppearance() {
  ui.resetTopbarAppearance();
}

function resetTopbarAll() {
  ui.resetTopbarCustomizations();
}

function updateHomeSections(sections: HomeSectionId[]) {
  ui.set("homeSections", sections);
}

function updateHomeLabel(id: HomeSectionId, label?: string) {
  ui.setHomeSectionLabel(id, label);
}

function resetHomeSectionsOrder() {
  ui.resetHomeSectionsOrder();
}

function resetHomeSectionsAppearance() {
  ui.resetHomeAppearance();
}

function resetHomeSectionsAll() {
  ui.resetHomeSectionCustomizations();
}
</script>
