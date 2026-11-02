<template>
  <div
    class="pe-panel absolute bottom-[calc(100%_+_8px)] left-1/2 z-30 w-[min(880px,calc(100vw_-_32px))] -translate-x-1/2 rounded-[16px] border border-[color:var(--line)] bg-[color-mix(in_srgb,var(--surface-2)_94%,transparent)] px-[13px] pt-[10px] pb-[11px] shadow-[0_24px_60px_-26px_var(--shadow-strong,rgba(0,0,0,0.75))] backdrop-blur-[18px]"
    @contextmenu.stop.prevent
    @pointerdown.stop
  >
    <div class="flex items-center justify-between gap-[12px] pb-[9px]">
      <span
        class="text-[color:var(--fg-faint)] text-[10px] font-[620] tracking-[0.14em] uppercase"
      >
        Плеер
      </span>
      <div class="flex items-center gap-[2px]">
        <button
          type="button"
          class="h-[24px] px-[8px] border-0 rounded-[7px] bg-transparent text-[color:var(--fg-faint)] text-[11px] cursor-pointer transition-[background,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]"
          @click="ui.resetPlayerLayout()"
        >
          Сбросить
        </button>
        <button
          type="button"
          class="h-[24px] px-[8px] border-0 rounded-[7px] bg-transparent text-[color:var(--fg-dim)] text-[11px] cursor-pointer transition-[background,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]"
          @click="ui.cancelEdit()"
        >
          Отмена
        </button>
        <button
          type="button"
          class="h-[24px] px-[11px] border-0 rounded-[7px] bg-[var(--accent)] text-[color:#fff] text-[11px] font-[620] cursor-pointer transition-[filter] duration-[120ms] hover:brightness-110"
          @click="ui.finishEdit()"
        >
          Готово
        </button>
      </div>
    </div>

    <div
      class="grid grid-cols-[1fr_1fr_minmax(150px,auto)] gap-x-[20px] gap-y-[8px] max-[900px]:grid-cols-[1fr_1fr]"
    >
      <div class="[&>label]:mb-[6px]">
        <EditRange
          label="Высота"
          suffix=" px"
          :min="60"
          :max="140"
          :model-value="s.playerHeight"
          @update:model-value="ui.set('playerHeight', $event)"
        />
        <EditRange
          label="Обложка"
          suffix=" px"
          :min="28"
          :max="80"
          :model-value="s.playerCoverSize"
          @update:model-value="ui.set('playerCoverSize', $event)"
        />
        <EditRange
          label="Иконки"
          suffix=" px"
          :min="12"
          :max="28"
          :model-value="s.playerIconSize"
          @update:model-value="ui.set('playerIconSize', $event)"
        />
        <EditRange
          label="Промежутки"
          suffix=" px"
          :min="0"
          :max="20"
          :model-value="s.playerGap"
          @update:model-value="ui.set('playerGap', $event)"
        />
      </div>

      <div class="[&>label]:mb-[6px]">
        <EditRange
          label="Поля"
          suffix=" px"
          :min="0"
          :max="48"
          :model-value="s.playerSidePadding"
          @update:model-value="ui.set('playerSidePadding', $event)"
        />
        <EditRange
          label="Блок с треком"
          suffix=" px"
          :min="150"
          :max="460"
          :model-value="s.playerMetaWidth"
          @update:model-value="ui.set('playerMetaWidth', $event)"
        />
        <EditRange
          label="Ширина прогресса"
          suffix="%"
          :min="40"
          :max="100"
          :model-value="s.playerProgressWidth"
          @update:model-value="ui.set('playerProgressWidth', $event)"
        />
        <EditRange
          label="Толщина прогресса"
          suffix=" px"
          :min="2"
          :max="10"
          :model-value="s.playerProgressThickness"
          @update:model-value="ui.set('playerProgressThickness', $event)"
        />
      </div>

      <div
        class="flex flex-col justify-center gap-[1px] max-[900px]:col-span-2 max-[900px]:flex-row max-[900px]:flex-wrap"
      >
        <EditSwitch
          label="Время"
          :model-value="s.playerShowTimes"
          @update:model-value="ui.set('playerShowTimes', $event)"
        />
        <EditSwitch
          label="Обложка"
          :model-value="s.showPlayerArtwork"
          @update:model-value="ui.set('showPlayerArtwork', $event)"
        />
        <EditSwitch
          label="Визуализатор"
          :model-value="s.playerVisualizer"
          @update:model-value="ui.set('playerVisualizer', $event)"
        />
      </div>
    </div>

    <div
      class="mt-[9px] flex min-h-[32px] items-center gap-[5px] rounded-[9px] border border-dashed border-[color:var(--line)] px-[6px] py-[4px] transition-[background,border-color] duration-[140ms]"
      :class="{
        'border-[color:color-mix(in_srgb,var(--accent)_45%,transparent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]':
          trayOver,
      }"
      @dragover.prevent="trayOver = true"
      @dragleave="trayOver = false"
      @drop.prevent="onDropHide"
    >
      <Icon
        v-if="!hidden.length"
        name="mingcute:eye-close-line"
        :size="14"
        class="ml-[2px] text-[color:var(--fg-faint)] opacity-[0.7]"
      />
      <span
        v-for="id in hidden"
        :key="id"
        class="inline-flex items-center gap-[4px] px-[7px] py-[3px] rounded-[6px] bg-[var(--surface)] text-[color:var(--fg-dim)] text-[10.5px] cursor-grab hover:text-[color:var(--fg)]"
        draggable="true"
        @dragstart="onDragStart(id, $event)"
      >
        <Icon :name="iconOf(id)" :size="12" />
        {{ labelOf(id) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import EditRange from "@/components/player/EditRange.vue";
import EditSwitch from "@/components/player/EditSwitch.vue";
import { playerButtonCatalog } from "@/stores/ui/playerButtons";
import type { PlayerButtonId } from "@/stores/ui/playerButtons";
import { useUiStore } from "@/stores/ui/index";

const ui = useUiStore();
const s = computed(() => ui.settings);
const trayOver = ref(false);

const hidden = computed(() =>
  ui.playerOrderList().filter((id) => ui.playerZone(id) === "off"),
);

function labelOf(id: PlayerButtonId): string {
  return playerButtonCatalog.find((item) => item.id === id)?.label ?? id;
}

function iconOf(id: PlayerButtonId): string {
  return (
    playerButtonCatalog.find((item) => item.id === id)?.icon ??
    "mingcute:dots-line"
  );
}

function onDragStart(id: PlayerButtonId, event: DragEvent) {
  event.dataTransfer?.setData("text/plain", id);
  if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
}

function onDropHide(event: DragEvent) {
  trayOver.value = false;
  const id = event.dataTransfer?.getData("text/plain") as PlayerButtonId | "";
  if (!id) return;
  ui.movePlayerButton(id, "off", 0);
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== "Escape" || !ui.settings.playerEditMode) return;
  event.preventDefault();
  event.stopPropagation();
  ui.cancelEdit();
}

onMounted(() => window.addEventListener("keydown", onKeydown, true));
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown, true));
</script>

<style scoped>
.pe-panel {
  animation: pe-panel-in 0.16s ease;
}

@keyframes pe-panel-in {
  from {
    opacity: 0;
    transform: translate(-50%, 8px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}
</style>
