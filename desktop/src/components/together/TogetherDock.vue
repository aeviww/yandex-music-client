<template>
  <div
    v-if="together.active && ui.settings.togetherShowDock"
    ref="root"
    class="fixed z-[2800] overflow-hidden border border-[color:var(--line)] bg-[var(--surface)] select-none"
    :class="{
      'bottom-[8px] left-[8px] w-auto rounded-[10px]': panels.mini,
      'bottom-[96px] left-[16px] rounded-[var(--radius)]': !panels.mini,
      'w-[320px]': open && !panels.mini,
      'w-[268px]': !open && !panels.mini,
      'max-w-[224px]': panels.mini && open,
      'max-w-[172px]': panels.mini && !open,
      'shadow-[0_24px_60px_var(--shadow-strong)] opacity-[0.96]': dragging,
      'shadow-[0_18px_40px_var(--shadow-soft)]': !dragging,
    }"
    :style="style"
  >
    <div
      class="flex w-full items-center text-[color:var(--fg)] touch-none hover:bg-[var(--hover)]"
      :class="[
        panels.mini
          ? 'gap-[6px] px-[8px] py-[5px] text-[11px]'
          : 'gap-[8px] px-[12px] py-[10px] text-[13px]',
        dragging ? 'cursor-grabbing' : 'cursor-grab',
      ]"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onCancel"
    >
      <Icon
        :class="panels.mini ? 'hidden' : 'flex-none text-[color:var(--fg-faint)]'"
        name="mingcute:dots-line"
        :size="12"
      />

      <span
        class="flex-none rounded-full"
        :class="[
          panels.mini ? 'w-[6px] h-[6px]' : 'w-[8px] h-[8px]',
          waiting ? 'bg-[var(--accent)]' : 'bg-[#3ecf6b]',
        ]"
      />

      <span class="flex-auto text-left truncate">
        {{ together.isHost ? "Хостите" : `Слушаете: ${together.hostNick}` }}
      </span>

      <span
        class="rounded-full bg-[var(--surface-2)] text-[color:var(--fg-dim)]"
        :class="
          panels.mini
            ? 'px-[5px] py-0 text-[10px]'
            : 'px-[7px] py-[1px] text-[11px]'
        "
        >{{ together.peers.length }}</span
      >
      <Icon :name="open ? 'mingcute:minimize-line' : 'mingcute:fullscreen-line'" :size="12" />
    </div>

    <div
      v-if="open"
      class="flex flex-col gap-[10px] px-[12px] pt-[4px] pb-[12px] border-t border-[color:var(--line)]"
    >
      <div v-if="showCode" class="flex items-center gap-[8px] pt-[8px] text-[12px]">
        <span class="flex-none text-[color:var(--fg-faint)]">{{ codeLabel }}</span>

        <code
          class="flex-auto overflow-hidden text-[color:var(--fg)] truncate cursor-pointer hover:text-[color:var(--accent)]"
          :title="
            visible ? 'Нажмите, чтобы скопировать' : 'Наведите, чтобы увидеть'
          "
          @mouseenter="hover = true"
          @mouseleave="hover = false"
          @click="copyInvite"
          >{{ visible ? invite : mask }}</code
        >

        <button
          class="inline-flex p-[3px] border-0 rounded-[6px] text-[color:var(--fg-dim)] cursor-pointer hover:bg-[var(--hover)] hover:text-[color:var(--fg)]"
          type="button"
          :title="shown ? 'Скрыть' : 'Показать'"
          @click="shown = !shown"
        >
          <Icon :name="shown ? 'mingcute:eye-close-line' : 'mingcute:eye-2-line'" :size="12" />
        </button>

        <button
          class="inline-flex p-[3px] border-0 rounded-[6px] text-[color:var(--fg-dim)] cursor-pointer hover:bg-[var(--hover)] hover:text-[color:var(--fg)]"
          type="button"
          title="Скопировать"
          @click="copyInvite"
        >
          <Icon name="mingcute:copy-2-line" :size="12" />
        </button>
      </div>

      <div v-if="together.isRelay" class="flex items-center gap-[8px] pt-[8px] text-[12px]">
        <span class="flex-none text-[color:var(--fg-faint)]">Пинг</span>
        <span class="flex-auto overflow-hidden text-[color:var(--fg-dim)] truncate">{{ pingLabel }}</span>
      </div>

      <div class="flex items-center gap-[8px] pt-[8px] text-[12px]">
        <span class="flex-none text-[color:var(--fg-faint)]">Сейчас</span>
        <span class="flex-auto overflow-hidden text-[color:var(--fg-dim)] truncate">{{ nowPlaying }}</span>
      </div>

      <TogetherPeers
        :peers="together.peers"
        :waiting="together.waiting"
        :manage="together.isHost"
        :host-id="together.hostId"
        @handoff="together.handoff"
      />

      <p
        v-if="together.waitingNicks.length"
        class="m-0 text-[color:var(--accent)] text-[12px]"
      >
        Ждём загрузку: {{ together.waitingNicks.join(", ") }}
      </p>

      <p
        v-else-if="!together.isHost"
        class="m-0 text-[color:var(--fg-faint)] text-[12px]"
      >
        Хостит {{ together.hostNick }}, плеер повторяет за ним
      </p>

      <div class="flex gap-[8px]">
        <button
          class="flex-1 px-[8px] py-[7px] border border-[color:var(--line)] rounded-[calc(var(--radius)*0.7)] bg-[var(--surface-2)] text-[color:var(--fg)] text-[12px] cursor-pointer hover:bg-[var(--hover)]"
          type="button"
          @click="openSettings"
        >
          Настройки
        </button>
        <button
          type="button"
          class="flex-1 px-[8px] py-[7px] border border-[color:var(--line)] rounded-[calc(var(--radius)*0.7)] bg-[var(--surface-2)] text-[color:var(--accent)] text-[12px] cursor-pointer hover:bg-[var(--hover)]"
          :disabled="together.busy"
          @click="together.leave()"
        >
          {{ together.isHost ? "Закрыть" : "Выйти" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import TogetherPeers from "@/components/together/TogetherPeers.vue";
import { copyText } from "@/lib/clipboard";
import { clampPlace, loadPlace, savePlace } from "@/lib/dock-place";
import { usePanelsStore } from "@/stores/panels";
import { usePlayerStore } from "@/stores/player/index";
import { useTogetherStore } from "@/stores/together/index";
import { useUiStore } from "@/stores/ui/index";
import { DOCK_KEY, DOCK_POS_KEY } from "@/stores/together/protocol";

const router = useRouter();
const together = useTogetherStore();
const player = usePlayerStore();
const panels = usePanelsStore();
const ui = useUiStore();

const root = ref<HTMLElement | null>(null);
const open = ref(false);
const shown = ref(false);
const hover = ref(false);
const dragging = ref(false);
const place = ref(loadPlace(DOCK_POS_KEY));

let from = { x: 0, y: 0, left: 0, top: 0 };
let moved = false;

const mask = "\u2022".repeat(12);
const waiting = computed(() => together.waiting.length > 0);
const visible = computed(() => shown.value || hover.value);
const showCode = computed(() => together.isRelay || together.isHost);
const codeLabel = computed(() => (together.isRelay ? "Код" : "Адрес"));
const invite = computed(
  () => together.invite || (together.isRelay ? "" : `ваш-ip:${together.port}`),
);
const pingLabel = computed(() =>
  together.ping > 0 ? `${together.ping} мс` : "измеряем...",
);

const nowPlaying = computed(() =>
  player.current ? player.current.title : "ничего не играет",
);

const style = computed(() =>
  place.value
    ? {
        left: `${place.value.x}px`,
        top: `${place.value.y}px`,
        right: "auto",
        bottom: "auto",
      }
    : undefined,
);

onMounted(() => {
  void together.init();
  try {
    open.value = localStorage.getItem(DOCK_KEY) === "1";
  } catch {}
  window.addEventListener("resize", keepInside);
});

onBeforeUnmount(() => window.removeEventListener("resize", keepInside));

function toggle() {
  open.value = !open.value;
  try {
    localStorage.setItem(DOCK_KEY, open.value ? "1" : "0");
  } catch {}
}

function onDown(event: PointerEvent) {
  if (event.button !== 0) return;
  const box = root.value?.getBoundingClientRect();
  if (!box) return;

  dragging.value = true;
  moved = false;
  from = { x: event.clientX, y: event.clientY, left: box.left, top: box.top };
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
}

function onMove(event: PointerEvent) {
  if (!dragging.value) return;

  const dx = event.clientX - from.x;
  const dy = event.clientY - from.y;
  if (!moved && Math.abs(dx) + Math.abs(dy) < 4) return;

  moved = true;
  place.value = clampPlace({ x: from.left + dx, y: from.top + dy }, root.value);
}

function onUp(event: PointerEvent) {
  if (!dragging.value) return;

  dragging.value = false;
  (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);

  if (!moved) {
    toggle();
    return;
  }
  savePlace(DOCK_POS_KEY, place.value);
}

function onCancel() {
  dragging.value = false;
}

function keepInside() {
  if (!place.value) return;
  place.value = clampPlace(place.value, root.value);
  savePlace(DOCK_POS_KEY, place.value);
}

function copyInvite() {
  void copyText(together.invite, "Скопировано", "Пока нечего копировать");
}

function openSettings() {
  void router.push({ path: "/settings", query: { section: "together" } });
}
</script>

