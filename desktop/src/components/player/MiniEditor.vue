<template>
  <div
    class="absolute z-40 inset-0 flex flex-col bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] backdrop-blur-[20px]"
    @contextmenu.stop.prevent
    @mousedown.stop
  >
    <div
      class="flex items-center justify-end flex-none gap-[2px] px-[8px] py-[6px]"
    >
      <button
        type="button"
        class="px-[8px] py-[3px] rounded-[7px] text-[color:var(--fg-dim)] text-[10.5px] cursor-pointer hover:bg-[var(--hover)] hover:text-[color:var(--fg)]"
        @click="reset"
      >
        Сброс
      </button>
      <button
        type="button"
        class="px-[8px] py-[3px] rounded-[7px] text-[color:var(--fg-dim)] text-[10.5px] cursor-pointer hover:bg-[var(--hover)] hover:text-[color:var(--fg)]"
        @click="cancel"
      >
        Отмена
      </button>
      <button
        type="button"
        class="ml-[4px] px-[10px] py-[3px] rounded-[7px] bg-[var(--accent)] text-[color:#fff] text-[10.5px] cursor-pointer hover:opacity-90"
        @click="ui.finishEdit()"
      >
        Готово
      </button>
    </div>

    <div
      class="flex-1 overflow-x-hidden overflow-y-auto px-[10px] pt-[2px] pb-[12px] [&>label]:mb-[8px] [&>hr]:my-[8px] [&>hr]:border-0 [&>hr]:border-t [&>hr]:border-[var(--line)]"
    >
      <EditRange
        label="Ширина"
        suffix=" px"
        :min="300"
        :max="720"
        :model-value="s.miniWidth"
        @update:model-value="setWidth"
      />
      <EditRange
        label="Высота"
        suffix=" px"
        :min="120"
        :max="420"
        :model-value="s.miniHeight"
        @update:model-value="setHeight"
      />

      <hr />
      <EditRange
        label="Обложка"
        suffix=" px"
        :min="24"
        :max="72"
        :model-value="s.miniCoverSize"
        @update:model-value="ui.set('miniCoverSize', $event)"
      />
      <EditRange
        label="Иконки"
        suffix=" px"
        :min="11"
        :max="24"
        :model-value="s.miniIconSize"
        @update:model-value="ui.set('miniIconSize', $event)"
      />
      <EditRange
        label="Промежутки"
        suffix=" px"
        :min="0"
        :max="18"
        :model-value="s.miniGap"
        @update:model-value="ui.set('miniGap', $event)"
      />
      <EditRange
        label="Отступы"
        suffix=" px"
        :min="2"
        :max="26"
        :model-value="s.miniPadding"
        @update:model-value="ui.set('miniPadding', $event)"
      />
      <EditRange
        label="Прозрачность"
        suffix="%"
        :min="40"
        :max="100"
        :model-value="s.miniOpacity"
        @update:model-value="ui.set('miniOpacity', $event)"
      />
      <EditRange
        v-if="s.miniVolumeSlider"
        label="Громкость"
        suffix=" px"
        :min="24"
        :max="96"
        :model-value="s.miniVolumeHeight"
        @update:model-value="ui.set('miniVolumeHeight', $event)"
      />

      <hr />
      <EditSwitch
        label="Время"
        :model-value="s.miniShowTime"
        @update:model-value="ui.set('miniShowTime', $event)"
      />
      <EditSwitch
        label="Визуализатор"
        :model-value="s.miniVisualizer"
        @update:model-value="ui.set('miniVisualizer', $event)"
      />
      <EditSwitch
        label="Громкость"
        :model-value="s.miniVolumeSlider"
        @update:model-value="ui.set('miniVolumeSlider', $event)"
      />

      <hr />
      <div class="flex flex-col gap-[2px]">
        <div
          v-for="(id, index) in order"
          :key="id"
          class="flex items-center gap-[6px] px-[6px] py-[4px] rounded-[8px] text-[11px] cursor-grab hover:bg-[var(--surface-2)]"
          :class="{
            'opacity-45': !visible(id) && dragId !== id,
            'opacity-35': dragId === id,
          }"
          draggable="true"
          @dragstart="onDragStart(id, $event)"
          @dragend="dragId = null"
          @dragover.prevent
          @drop.prevent="onDrop(index)"
        >
          <Icon
            name="mingcute:dots-line"
            :size="11"
            class="text-[color:var(--fg-faint)]"
          />
          <Icon :name="iconOf(id)" :size="13" />
          <span class="flex-1 min-w-0 truncate">{{ labelOf(id) }}</span>
          <button
            type="button"
            class="inline-flex items-center justify-center w-[20px] h-[20px] flex-none border-0 rounded-[6px] text-[color:var(--fg-dim)] cursor-pointer enabled:hover:bg-[var(--hover)] enabled:hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-35"
            :disabled="locked.has(id)"
            @click.stop="toggle(id)"
          >
            <Icon
              :name="
                visible(id) ? 'mingcute:check-line' : 'mingcute:close-line'
              "
              :size="12"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import EditRange from "@/components/player/EditRange.vue";
import EditSwitch from "@/components/player/EditSwitch.vue";
import { setWindowSize } from "@/lib/window";
import { miniButtonCatalog } from "@/stores/ui/playerButtons";
import type { MiniButtonId } from "@/stores/ui/playerButtons";
import { useUiStore } from "@/stores/ui/index";

const ui = useUiStore();
const s = computed(() => ui.settings);
const dragId = ref<MiniButtonId | null>(null);
const locked = new Set<MiniButtonId>(["prev", "play", "next"]);

const order = computed(() => ui.miniOrderList());

function labelOf(id: MiniButtonId): string {
  return miniButtonCatalog.find((item) => item.id === id)?.label ?? id;
}

function iconOf(id: MiniButtonId): string {
  return (
    miniButtonCatalog.find((item) => item.id === id)?.icon ??
    "mingcute:dots-line"
  );
}

function visible(id: MiniButtonId): boolean {
  return locked.has(id) || ui.settings.miniButtons[id];
}

function toggle(id: MiniButtonId) {
  if (locked.has(id)) return;
  ui.setMiniButton(id, !ui.settings.miniButtons[id]);
}

function onDragStart(id: MiniButtonId, event: DragEvent) {
  dragId.value = id;
  event.dataTransfer?.setData("text/plain", id);
  if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
}

function onDrop(index: number) {
  const id = dragId.value;
  dragId.value = null;
  if (id) ui.moveMiniButton(id, index);
}

function applySize() {
  void setWindowSize(ui.settings.miniWidth, ui.settings.miniHeight);
}

function setWidth(value: number) {
  ui.set("miniWidth", value);
  applySize();
}

function setHeight(value: number) {
  ui.set("miniHeight", value);
  applySize();
}

function reset() {
  ui.resetMiniLayout();
  applySize();
}

function cancel() {
  ui.cancelEdit();
  applySize();
}
</script>
