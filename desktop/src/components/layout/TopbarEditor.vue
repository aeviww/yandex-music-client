<template>
  <div
    class="fixed right-[12px] z-[2600] flex w-[344px] flex-col overflow-hidden rounded-[calc(var(--radius)*1.3333)] border border-[color:var(--line)] bg-[var(--editor-bg)] shadow-[var(--elev-2)] "
    :style="panelStyle"
    @contextmenu.stop.prevent
    @pointerdown.stop
  >
    <div class="flex items-center justify-between gap-[10px] px-[13px] pt-[10px] pb-[9px]">
      <span
        class="text-[color:var(--fg-faint)] text-[11px] font-semibold tracking-[0.02em]"
      >
        Верхнее меню
      </span>
      <div class="flex items-center gap-[2px]">
        <button
          type="button"
          class="h-[24px] px-[7px] border-0 rounded-[calc(var(--radius)*0.5833)] bg-transparent text-[color:var(--fg-faint)] text-[11px] cursor-pointer transition-[background,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]"
          @click="ui.resetTopbarCustomizations()"
        >
          Сбросить
        </button>
        <button
          type="button"
          class="h-[24px] px-[7px] border-0 rounded-[calc(var(--radius)*0.5833)] bg-transparent text-[color:var(--fg-dim)] text-[11px] cursor-pointer transition-[background,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]"
          @click="ui.cancelEdit()"
        >
          Отмена
        </button>
        <button
          type="button"
          class="h-[24px] px-[10px] border-0 rounded-[calc(var(--radius)*0.5833)] bg-[var(--accent)] text-[color:#fff] text-[11px] font-[620] cursor-pointer transition-[filter] duration-[120ms] hover:brightness-110"
          @click="ui.finishEdit()"
        >
          Готово
        </button>
      </div>
    </div>

    <div class="min-h-0 flex-1 space-y-[10px] overflow-y-auto px-[13px] pb-[11px]">
      <div class="space-y-[2px]">
        <p class="m-0 mb-[3px] px-[6px] text-[10.5px] font-semibold tracking-[0.01em] text-[color:var(--fg-faint)]">
          Панель
        </p>
        <EditSwitch
          label="Показывать верхнюю панель"
          :model-value="ui.settings.topbarVisible"
          @update:model-value="ui.set('topbarVisible', $event)"
        />
        <EditRange
          label="Высота панели"
          suffix=" px"
          :min="38"
          :max="64"
          :step="1"
          :model-value="ui.settings.topbarHeight"
          @update:model-value="ui.set('topbarHeight', $event)"
        />
      </div>

      <div class="space-y-[2px]">
        <p class="m-0 mb-[3px] px-[6px] text-[10.5px] font-semibold tracking-[0.01em] text-[color:var(--fg-faint)]">
          Логотип
        </p>
        <EditSwitch
          label="Показывать логотип"
          :model-value="ui.settings.topbarShowLogo"
          @update:model-value="ui.set('topbarShowLogo', $event)"
        />
        <EditSwitch
          label="Название приложения"
          :model-value="ui.settings.topbarLogoText"
          @update:model-value="ui.set('topbarLogoText', $event)"
        />
        <EditRange
          label="Размер логотипа"
          suffix=" px"
          :min="16"
          :max="36"
          :step="1"
          :model-value="ui.settings.topbarLogoSize"
          @update:model-value="ui.set('topbarLogoSize', $event)"
        />
      </div>

      <div class="space-y-[2px]">
        <p class="m-0 mb-[3px] px-[6px] text-[10.5px] font-semibold tracking-[0.01em] text-[color:var(--fg-faint)]">
          Поиск
        </p>
        <EditSwitch
          label="Показывать поиск"
          :model-value="ui.settings.topbarShowSearch"
          @update:model-value="ui.set('topbarShowSearch', $event)"
        />
        <EditRange
          label="Ширина поиска"
          suffix=" px"
          :min="240"
          :max="540"
          :step="10"
          :model-value="ui.settings.searchWidth"
          @update:model-value="ui.set('searchWidth', $event)"
        />
      </div>

      <div class="space-y-[2px]">
        <p class="m-0 mb-[3px] px-[6px] text-[10.5px] font-semibold tracking-[0.01em] text-[color:var(--fg-faint)]">
          Аккаунт
        </p>
        <EditSwitch
          label="Показывать аккаунт"
          :model-value="ui.settings.topbarShowAccount"
          @update:model-value="ui.set('topbarShowAccount', $event)"
        />
        <EditSwitch
          label="Показывать имя аккаунта"
          :model-value="ui.settings.topbarAccountName"
          @update:model-value="ui.set('topbarAccountName', $event)"
        />
        <EditRange
          label="Размер аватара"
          suffix=" px"
          :min="22"
          :max="40"
          :step="1"
          :model-value="ui.settings.topbarAccountAvatarSize"
          @update:model-value="ui.set('topbarAccountAvatarSize', $event)"
        />
      </div>

      <div class="space-y-[2px]">
        <p class="m-0 mb-[3px] px-[6px] text-[10.5px] font-semibold tracking-[0.01em] text-[color:var(--fg-faint)]">
          Кнопки окна
        </p>
        <EditSwitch
          label="Показывать кнопки окна"
          :model-value="ui.settings.topbarShowWindowControls"
          @update:model-value="ui.set('topbarShowWindowControls', $event)"
        />
        <EditSwitch
          label="Свернуть"
          :model-value="ui.settings.windowShowMinimize"
          @update:model-value="ui.set('windowShowMinimize', $event)"
        />
        <EditSwitch
          label="Развернуть"
          :model-value="ui.settings.windowShowMaximize"
          @update:model-value="ui.set('windowShowMaximize', $event)"
        />
        <EditSwitch
          label="Закрыть"
          :model-value="ui.settings.windowShowClose"
          @update:model-value="ui.set('windowShowClose', $event)"
        />
        <EditRange
          label="Ширина кнопок окна"
          suffix=" px"
          :min="28"
          :max="64"
          :step="1"
          :model-value="ui.settings.windowButtonWidth"
          @update:model-value="ui.set('windowButtonWidth', $event)"
        />
      </div>

      <div>
        <p class="m-0 mb-[7px] px-[6px] text-[10.5px] font-semibold tracking-[0.01em] text-[color:var(--fg-faint)]">
          Ссылки профиля
        </p>
        <p
          class="mb-[9px] mt-0 text-[color:var(--fg-faint)] text-[10.5px] leading-[1.45]"
        >
          Ссылки можно перетаскивать прямо в меню аккаунта: у каждой есть кнопки
          редактирования и скрытия. Вернуть скрытые можно здесь:
        </p>

        <SortableNavList
          :items="ui.settings.topbarLinks"
          :default-items="defaultTopbarLinks"
          :catalog="topbarCatalog"
          :custom-labels="ui.settings.topbarLabels"
          :custom-icons="ui.settings.topbarIcons"
          :can-edit-icon="true"
          :can-edit-label="true"
          active-title="Ссылки меню"
          hidden-title="Скрытые ссылки"
          @update:items="updateItems"
          @update-label="ui.setTopbarLinkLabel"
          @update-icon="ui.setTopbarLinkIcon"
          @reset-order="ui.resetTopbarOrder()"
          @reset-appearance="ui.resetTopbarAppearance()"
          @reset-all="ui.resetTopbarCustomizations()"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import EditRange from "@/components/player/EditRange.vue";
import EditSwitch from "@/components/player/EditSwitch.vue";
import SortableNavList from "@/components/settings/SortableNavList.vue";
import type { NavCatalogEntry } from "@/components/settings/SortableNavList.vue";
import { topbarLinkCatalog } from "@/constants/navigation";
import { defaultTopbarLinks, useUiStore } from "@/stores/ui/index";
import type { TopbarLinkId } from "@/stores/ui/index";

const ui = useUiStore();

const panelStyle = computed(() => ({
  top: "calc(var(--topbar-height, 46px) + 12px)",
  maxHeight: "calc(100vh - var(--topbar-height, 46px) - var(--player-height, 78px) - 26px)",
}));

const topbarCatalog = topbarLinkCatalog as NavCatalogEntry<TopbarLinkId>[];

function updateItems(items: TopbarLinkId[]) {
  const next = [...items];
  if (!next.includes("settings")) next.push("settings");
  ui.set("topbarLinks", next);
}
</script>
