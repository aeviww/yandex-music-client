<template>
  <div
    class="fixed z-[2600] flex w-[336px] flex-col overflow-hidden rounded-[calc(var(--radius)*1.3333)] border border-[color:var(--line)] bg-[var(--editor-bg)] shadow-[var(--elev-2)] "
    :style="panelStyle"
    @contextmenu.stop.prevent
    @pointerdown.stop
  >
    <div class="flex items-center justify-between gap-[10px] px-[13px] pt-[10px] pb-[9px]">
      <span
        class="text-[color:var(--fg-faint)] text-[11px] font-semibold tracking-[0.02em]"
      >
        Боковая панель
      </span>
      <div class="flex items-center gap-[2px]">
        <button
          type="button"
          class="h-[24px] px-[7px] border-0 rounded-[calc(var(--radius)*0.5833)] bg-transparent text-[color:var(--fg-faint)] text-[11px] cursor-pointer transition-[background,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]"
          @click="ui.resetSidebarCustomizations()"
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

    <div class="min-h-0 flex-1 overflow-y-auto px-[13px] pb-[11px]">
      <EditRange
        label="Ширина панели"
        suffix=" px"
        :min="200"
        :max="320"
        :step="2"
        :model-value="ui.settings.sidebarWidth"
        @update:model-value="ui.set('sidebarWidth', $event)"
      />

      <p
        class="mb-[9px] mt-[7px] text-[color:var(--fg-faint)] text-[10.5px] leading-[1.45]"
      >
        Пункты можно перетаскивать прямо в панели: у каждого есть кнопки
        редактирования и скрытия. Вернуть скрытые можно здесь:
      </p>

      <SortableNavList
        :items="ui.settings.sidebarItems"
        :default-items="defaultSidebarItems"
        :catalog="sidebarCatalog"
        :custom-labels="ui.settings.sidebarLabels"
        :custom-icons="ui.settings.sidebarIcons"
        :can-edit-icon="true"
        :can-edit-label="true"
        active-title="Пункты меню"
        hidden-title="Скрытые пункты"
        @update:items="updateItems"
        @update-label="ui.setSidebarItemLabel"
        @update-icon="ui.setSidebarItemIcon"
        @reset-order="ui.resetSidebarOrder()"
        @reset-appearance="ui.resetSidebarAppearance()"
        @reset-all="ui.resetSidebarCustomizations()"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import EditRange from "@/components/player/EditRange.vue";
import SortableNavList from "@/components/settings/SortableNavList.vue";
import type { NavCatalogEntry } from "@/components/settings/SortableNavList.vue";
import { navItemCatalog } from "@/constants/navigation";
import { defaultSidebarItems, useUiStore } from "@/stores/ui/index";
import type { NavItemId } from "@/stores/ui/index";

const ui = useUiStore();

const panelStyle = computed(() => ({
  top: "58px",
  left: "calc(var(--sidebar-width, 236px) + 12px)",
  maxHeight:
    "calc(100vh - var(--player-height, 78px) - 74px)",
}));

const sidebarCatalog = navItemCatalog as NavCatalogEntry<NavItemId>[];

function updateItems(items: NavItemId[]) {
  const next = [...items];
  if (!next.includes("home")) next.unshift("home");
  ui.set("sidebarItems", next);
}
</script>
