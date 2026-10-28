<template>
  <div class="grid w-full grid-cols-[minmax(280px,1fr)_minmax(260px,1fr)] gap-[18px] items-start max-[980px]:grid-cols-1">
    <div class="sticky top-0 flex flex-col gap-[10px] p-[14px] border border-[var(--line)] rounded-[calc(var(--radius)*0.9)] bg-[var(--surface)]">
      <div class="flex items-baseline justify-between gap-[10px]">
        <span class="text-[12.5px] font-[640]">Предпросмотр</span>
        <span class="text-[color:var(--fg-faint)] text-[11.5px] tabular-nums">
          {{ s.miniWidth }} × {{ s.miniHeight }} px
          <template v-if="scale < 0.999">
            · масштаб {{ Math.round(scale * 100) }}%
          </template>
        </span>
      </div>

      <div ref="stageWrap" class="flex justify-center w-full p-[14px] rounded-[calc(var(--radius)*0.8)] bg-[repeating-conic-gradient(color-mix(in_srgb,var(--fg)_5%,transparent)_0%_25%,transparent_0%_50%)] bg-[length:18px_18px] bg-center">
        <div class="relative overflow-hidden transition-[width,height] duration-[120ms] ease-[ease]" :style="stageStyle">
          <div class="absolute top-0 left-0 rounded-[14px]" :style="frameStyle">
            <MiniPlayer preview />
          </div>
        </div>
      </div>

      <p class="m-0 text-[color:var(--fg-faint)] text-[11.5px] leading-[1.45]">
        Это настоящий мини-плеер с текущим треком — кнопки в предпросмотре не
        нажимаются, чтобы ничего не задеть случайно.
      </p>

      <div class="flex flex-wrap gap-[8px]">
        <button class="inline-flex h-[32px] items-center justify-center px-[14px] py-0 border rounded-[8px] cursor-pointer text-[calc(12px*var(--text-scale,1))] font-medium gap-[7px] transition-[background,border-color,color] duration-[120ms] ease-[ease] select-none !border-[color:var(--accent)] !bg-[var(--accent)] !text-[color:#fff] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none" type="button" @click="openMini">
          <Icon name="mingcute:miniplayer-fill" :size="15" />
          {{ panels.mini ? "Мини-плеер открыт" : "Открыть мини-плеер" }}
        </button>
        <button class="inline-flex items-center justify-center gap-[6px] h-[30px] px-[12px] py-0 border border-[var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] whitespace-nowrap cursor-pointer transition-[background,color,border-color] duration-[140ms] ease-[ease] hover:bg-[var(--hover)] hover:border-[color:color-mix(in_srgb,var(--fg)_14%,transparent)] hover:text-[color:var(--fg)]" type="button" @click="reset">
          Сбросить вид
        </button>
      </div>
    </div>

    <div class="flex flex-col gap-[16px] min-w-0">
      <div class="flex flex-col gap-[10px] p-[14px] border border-[var(--line)] rounded-[calc(var(--radius)*0.9)] bg-[var(--surface)]">
        <div class="flex items-baseline justify-between gap-[8px] text-[color:var(--fg-faint)] text-[10px] font-[650] tracking-[0.08em] uppercase">Размер окна</div>
        <div class="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-x-[18px] gap-y-[12px]">
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
        </div>
      </div>

      <div class="flex flex-col gap-[10px] p-[14px] border border-[var(--line)] rounded-[calc(var(--radius)*0.9)] bg-[var(--surface)]">
        <div class="flex items-baseline justify-between gap-[8px] text-[color:var(--fg-faint)] text-[10px] font-[650] tracking-[0.08em] uppercase">Размеры и отступы</div>
        <div class="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-x-[18px] gap-y-[12px]">
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
            label="Поля"
            suffix=" px"
            :min="2"
            :max="26"
            :model-value="s.miniPadding"
            @update:model-value="ui.set('miniPadding', $event)"
          />
          <EditRange
            label="Непрозрачность"
            suffix="%"
            :min="40"
            :max="100"
            :model-value="s.miniOpacity"
            @update:model-value="ui.set('miniOpacity', $event)"
          />
          <EditRange
            v-if="s.miniVolumeSlider"
            label="Дорожка громкости"
            suffix=" px"
            :min="24"
            :max="96"
            :model-value="s.miniVolumeHeight"
            @update:model-value="ui.set('miniVolumeHeight', $event)"
          />
        </div>
      </div>

      <div class="flex flex-col gap-[10px] p-[14px] border border-[var(--line)] rounded-[calc(var(--radius)*0.9)] bg-[var(--surface)]">
        <div class="flex items-baseline justify-between gap-[8px] text-[color:var(--fg-faint)] text-[10px] font-[650] tracking-[0.08em] uppercase">Показывать</div>
        <div class="flex flex-col gap-[2px]">
          <EditSwitch
            label="Время трека"
            :model-value="s.miniShowTime"
            @update:model-value="ui.set('miniShowTime', $event)"
          />
          <EditSwitch
            label="Визуализатор"
            :model-value="s.miniVisualizer"
            @update:model-value="ui.set('miniVisualizer', $event)"
          />
          <EditSwitch
            label="Ползунок громкости"
            :model-value="s.miniVolumeSlider"
            @update:model-value="ui.set('miniVolumeSlider', $event)"
          />
        </div>
      </div>

      <div class="flex flex-col gap-[10px] p-[14px] border border-[var(--line)] rounded-[calc(var(--radius)*0.9)] bg-[var(--surface)]">
        <div class="flex items-baseline justify-between gap-[8px] text-[color:var(--fg-faint)] text-[10px] font-[650] tracking-[0.08em] uppercase">
          Кнопки
          <span class="font-medium tracking-normal normal-case">перетаскивай, чтобы менять порядок</span>
        </div>

        <div
          ref="listRoot"
          class="flex flex-col gap-[4px] min-h-[40px]"
          @dragover.prevent="onListOver"
          @dragleave="onListLeave"
          @drop.prevent="onListDrop"
        >
          <template v-for="(id, index) in order" :key="id">
            <i v-if="caretAt(index)" class="h-[2px] flex-[0_0_2px] rounded-[2px] bg-[var(--accent)] pointer-events-none" />
            <div
              class="mpe-item flex items-center gap-[9px] px-[10px] py-[8px] border border-transparent rounded-[10px] bg-[var(--surface-2)] text-[12.5px] cursor-grab transition-[border-color,opacity] duration-[140ms] ease-[ease] hover:border-[color:var(--line)]"
              :class="{ 'opacity-45': !visible(id) && dragId !== id, 'opacity-30': dragId === id }"
              draggable="true"
              @dragstart="onDragStart(id, $event)"
              @dragend="endDrag"
            >
              <Icon name="mingcute:dots-line" :size="13" class="text-[color:var(--fg-faint)] cursor-grab" />
              <Icon :name="iconOf(id)" :size="15" />
              <span class="flex-1 min-w-0 truncate">{{ labelOf(id) }}</span>
              <span v-if="locked.has(id)" class="text-[color:var(--fg-faint)] text-[10.5px]">всегда</span>
              <button
                v-else
                type="button"
                class="inline-flex w-[24px] h-[24px] flex-none items-center justify-center border-0 rounded-[7px] text-[color:var(--fg-dim)] cursor-pointer transition-[background,color] duration-[140ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]"
                :class="{ 'text-[color:var(--accent)] hover:!text-[color:var(--accent)]': visible(id) }"
                :title="visible(id) ? 'Скрыть кнопку' : 'Показать кнопку'"
                @click.stop="toggle(id)"
              >
                <Icon :name="visible(id) ? 'mingcute:check-line' : 'mingcute:close-line'" :size="13" />
              </button>
            </div>
          </template>
          <i v-if="caretAt(order.length)" class="h-[2px] flex-[0_0_2px] rounded-[2px] bg-[var(--accent)] pointer-events-none" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import MiniPlayer from "@/components/player/MiniPlayer.vue";
import EditRange from "@/components/player/EditRange.vue";
import EditSwitch from "@/components/player/EditSwitch.vue";
import { api } from "@/api/client";
import { usePanelsStore } from "@/stores/panels";
import { miniButtonCatalog } from "@/stores/ui/playerButtons";
import type { MiniButtonId } from "@/stores/ui/playerButtons";
import { useUiStore } from "@/stores/ui/index";

const ui = useUiStore();
const panels = usePanelsStore();
const s = computed(() => ui.settings);

const locked = new Set<MiniButtonId>(["prev", "play", "next"]);
const order = computed(() => ui.miniOrderList());

const stageWrap = ref<HTMLElement | null>(null);
const wrapWidth = ref(0);
let observer: ResizeObserver | null = null;

const scale = computed(() => {
  if (!wrapWidth.value) return 1;
  return Math.min(1, wrapWidth.value / s.value.miniWidth);
});

const stageStyle = computed(() => ({
  width: `${Math.round(s.value.miniWidth * scale.value)}px`,
  height: `${Math.round(s.value.miniHeight * scale.value)}px`,
}));

const frameStyle = computed(() => ({
  width: `${s.value.miniWidth}px`,
  height: `${s.value.miniHeight}px`,
  transform: `scale(${scale.value})`,
  transformOrigin: "top left",
}));

onMounted(() => {
  const el = stageWrap.value;
  if (!el) return;
  wrapWidth.value = el.clientWidth;
  observer = new ResizeObserver((entries) => {
    wrapWidth.value = entries[0]?.contentRect.width ?? el.clientWidth;
  });
  observer.observe(el);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
});

function applySize() {
  if (!panels.mini) return;
  void api.resizeMiniPlayer(ui.settings.miniWidth, ui.settings.miniHeight);
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

async function openMini() {
  if (panels.mini) return;
  await panels.enterMini();
}

function labelOf(id: MiniButtonId): string {
  return miniButtonCatalog.find((item) => item.id === id)?.label ?? id;
}

function iconOf(id: MiniButtonId): string {
  return miniButtonCatalog.find((item) => item.id === id)?.icon ?? "mingcute:dots-line";
}

function visible(id: MiniButtonId): boolean {
  return locked.has(id) || ui.settings.miniButtons[id];
}

function toggle(id: MiniButtonId) {
  if (locked.has(id)) return;
  ui.setMiniButton(id, !ui.settings.miniButtons[id]);
}

const listRoot = ref<HTMLElement | null>(null);
const dragId = ref<MiniButtonId | null>(null);
const overIndex = ref(-1);

function caretAt(index: number): boolean {
  return dragId.value !== null && overIndex.value === index;
}

function slotAt(clientY: number): number {
  const root = listRoot.value;
  if (!root) return order.value.length;
  const items = Array.from(root.querySelectorAll<HTMLElement>(".mpe-item"));
  let slot = 0;
  for (const el of items) {
    const box = el.getBoundingClientRect();
    if (clientY >= box.top + box.height / 2) slot += 1;
  }
  return slot;
}

function onDragStart(id: MiniButtonId, event: DragEvent) {
  dragId.value = id;
  event.dataTransfer?.setData("text/plain", id);
  if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
}

function endDrag() {
  dragId.value = null;
  overIndex.value = -1;
}

function onListOver(event: DragEvent) {
  if (!dragId.value) return;
  if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
  overIndex.value = slotAt(event.clientY);
}

function onListLeave(event: DragEvent) {
  const root = listRoot.value;
  const to = event.relatedTarget as Node | null;
  if (root && to && root.contains(to)) return;
  overIndex.value = -1;
}

function onListDrop(event: DragEvent) {
  const dropped = event.dataTransfer?.getData("text/plain") as
    | MiniButtonId
    | undefined;
  const id = dragId.value ?? (dropped || null);
  const slot = slotAt(event.clientY);
  endDrag();
  if (!id) return;

  const from = order.value.indexOf(id);
  ui.moveMiniButton(id, from >= 0 && from < slot ? slot - 1 : slot);
}
</script>
