<template>
  <div
    class="pe-panel absolute bottom-[calc(100%_+_10px)] left-1/2 z-30 w-[min(940px,calc(100vw_-_32px))] px-[14px] pt-[12px] pb-[14px] border border-[color:var(--line)] rounded-[14px] bg-[var(--surface-2)] shadow-[var(--shadow-strong,0_22px_60px_rgba(0,0,0,0.5))] -translate-x-1/2"
    @contextmenu.stop.prevent
    @pointerdown.stop
  >
    <div
      class="flex items-center justify-between gap-[14px] pb-[10px] border-b border-[color:var(--line)]"
    >
      <h2
        class="m-0 text-[color:var(--fg)] text-[13px] font-[620] leading-[1.2]"
      >
        Редактор плеера
      </h2>
      <div class="flex flex-[0_0_auto] gap-[6px]">
        <button
          type="button"
          class="px-[11px] py-[5px] border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg)] text-[11.5px] cursor-pointer transition-[background] duration-[140ms] ease-[ease] hover:bg-[var(--hover)]"
          @click="ui.resetPlayerLayout()"
        >
          Сбросить
        </button>
        <button
          type="button"
          class="px-[11px] py-[5px] border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg)] text-[11.5px] cursor-pointer transition-[background] duration-[140ms] ease-[ease] hover:bg-[var(--hover)]"
          @click="ui.cancelEdit()"
        >
          Отмена
        </button>
        <button
          type="button"
          class="!border-[color:var(--accent)] !bg-[var(--accent)] !text-[color:#fff] px-[11px] py-[5px] border rounded-[8px] text-[11.5px] cursor-pointer transition-[background] duration-[140ms] ease-[ease] hover:bg-[var(--hover)]"
          @click="ui.finishEdit()"
        >
          Готово
        </button>
      </div>
    </div>

    <div
      class="grid grid-cols-[repeat(4,minmax(0,1fr))] gap-x-[20px] gap-y-[10px] pt-[12px] max-[1100px]:grid-cols-[repeat(2,minmax(0,1fr))]"
    >
      <div class="[&>label]:mb-[9px]">
        <div
          class="mb-[8px] text-[color:var(--fg-faint)] text-[10px] font-[620] tracking-[0.08em] uppercase"
        >
          Размеры
        </div>
        <EditRange
          label="Высота плеера"
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

      <div class="[&>label]:mb-[9px]">
        <div
          class="mb-[8px] text-[color:var(--fg-faint)] text-[10px] font-[620] tracking-[0.08em] uppercase"
        >
          Геометрия
        </div>
        <EditRange
          label="Поля по краям"
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

      <div>
        <div
          class="mb-[8px] text-[color:var(--fg-faint)] text-[10px] font-[620] tracking-[0.08em] uppercase"
        >
          На плеере
        </div>
        <EditSwitch
          label="Время трека"
          :model-value="s.playerShowTimes"
          @update:model-value="ui.set('playerShowTimes', $event)"
        />
        <EditSwitch
          label="Обложка трека"
          :model-value="s.showPlayerArtwork"
          @update:model-value="ui.set('showPlayerArtwork', $event)"
        />
        <EditSwitch
          label="Визуализатор"
          :model-value="s.playerVisualizer"
          @update:model-value="ui.set('playerVisualizer', $event)"
        />
      </div>

      <div>
        <div
          class="mb-[8px] text-[color:var(--fg-faint)] text-[10px] font-[620] tracking-[0.08em] uppercase"
        >
          Скрытые кнопки
        </div>
        <div
          class="flex items-start flex-wrap gap-[5px] min-h-[74px] p-[8px] border border-dashed border-[color:color-mix(in_srgb,var(--accent)_40%,transparent)] rounded-[10px] transition-[background] duration-[140ms] ease-[ease]"
          :class="{
            'bg-[color-mix(in_srgb,var(--accent)_12%,transparent)]': trayOver,
          }"
          @dragover.prevent="trayOver = true"
          @dragleave="trayOver = false"
          @drop.prevent="onDropHide"
        >
          <span
            v-for="id in hidden"
            :key="id"
            class="inline-flex items-center gap-[5px] px-[9px] py-[4px] border border-[color:var(--line)] rounded-full bg-[var(--surface)] text-[color:var(--fg-dim)] text-[11px] cursor-grab hover:text-[color:var(--fg)]"
            draggable="true"
            @dragstart="onDragStart(id, $event)"
          >
            <Icon :name="iconOf(id)" :size="13" />
            {{ labelOf(id) }}
          </span>
          <span
            v-if="!hidden.length"
            class="text-[color:var(--fg-faint)] text-[11px] leading-[1.4]"
          >
            Перетащи сюда кнопку с плеера, чтобы убрать её
          </span>
        </div>
      </div>
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
