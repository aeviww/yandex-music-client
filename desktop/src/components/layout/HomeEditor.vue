<template>
  <div
    class="fixed right-[12px] z-[2600] flex w-[336px] flex-col overflow-hidden rounded-[calc(var(--radius)*1.3333)] border border-[color:var(--line)] bg-[var(--editor-bg)] shadow-[0_24px_60px_-26px_var(--shadow-strong,rgba(0,0,0,0.75))] backdrop-blur-[18px]"
    :style="panelStyle"
    @contextmenu.stop.prevent
    @pointerdown.stop
  >
    <div class="flex items-center justify-between gap-[10px] px-[13px] pt-[10px] pb-[9px]">
      <span
        class="text-[color:var(--fg-faint)] text-[10px] font-[620] tracking-[0.14em] uppercase"
      >
        Главное
      </span>
      <div class="flex items-center gap-[2px]">
        <button
          type="button"
          class="h-[24px] px-[7px] border-0 rounded-[calc(var(--radius)*0.5833)] bg-transparent text-[color:var(--fg-faint)] text-[11px] cursor-pointer transition-[background,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]"
          @click="ui.resetHomeSectionCustomizations()"
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
      <p
        class="mb-[9px] mt-0 text-[color:var(--fg-faint)] text-[10.5px] leading-[1.45]"
      >
        Секции можно тянуть прямо на странице, у каждой есть карандаш и глаз.
        Вернуть скрытые можно здесь:
      </p>

      <SortableNavList
        :items="ui.settings.homeSections"
        :default-items="defaultHomeSections"
        :catalog="homeSectionCatalog"
        :custom-labels="ui.settings.homeLabels"
        :can-edit-icon="false"
        :can-edit-label="true"
        active-title="Секции"
        hidden-title="Скрытые секции"
        @update:items="ui.set('homeSections', $event)"
        @update-label="ui.setHomeSectionLabel"
        @reset-order="ui.resetHomeSectionsOrder()"
        @reset-appearance="ui.resetHomeAppearance()"
        @reset-all="ui.resetHomeSectionCustomizations()"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import SortableNavList from "@/components/settings/SortableNavList.vue";
import type { NavCatalogEntry } from "@/components/settings/SortableNavList.vue";
import { homeSectionCatalogList } from "@/constants/navigation";
import { defaultHomeSections, useUiStore } from "@/stores/ui/index";
import type { HomeSectionId } from "@/stores/ui/index";

const ui = useUiStore();

const panelStyle = computed(() => ({
  bottom: "calc(var(--player-height, 78px) + 12px)",
  maxHeight: "calc(100vh - var(--player-height, 78px) - 74px)",
}));

const homeSectionCatalog = homeSectionCatalogList.map((section) => ({
  id: section.id,
  label: section.editorLabel,
  icon: section.icon,
  description: section.description,
})) as NavCatalogEntry<HomeSectionId>[];
</script>
