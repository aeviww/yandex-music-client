<template>
  <div
    class="fixed inset-0 z-[900] flex flex-col justify-between gap-[12px] px-[calc(var(--mini-pad,_10px)_+_2px)] py-[var(--mini-pad,_10px)] border border-[color:var(--line)] rounded-[16px] bg-[var(--bg)] opacity-[var(--mini-opacity,_1)] overflow-hidden select-none"
    :class="preview ? '!absolute !z-[1] !rounded-[14px] pointer-events-none w-full max-w-[320px]' : ''"
    :style="rootStyle"
    @mousedown="onRootMouseDown"
    @contextmenu="onContext"
  >
    <canvas
      v-if="ui.settings.miniVisualizer"
      ref="vizCanvas"
      class="absolute inset-0 w-full h-full z-[0] pointer-events-none opacity-[0.6]"
    />

    <div class="relative z-[1] flex items-center gap-[11px]" @dblclick="leaveMini()">
      <div class="cover relative flex items-center justify-center flex-none w-[var(--mini-cover,_38px)] h-[var(--mini-cover,_38px)] overflow-hidden rounded-[10px] bg-[var(--surface-2)] [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block">
        <Transition name="pb-cover">
          <img
            v-if="player.current?.cover_url"
            :key="player.current.cover_url"
            :src="player.current.cover_url"
            decoding="async"
          />
          <Icon v-else name="mingcute:music-line" :size="18" class="text-[color:var(--fg-faint)]" />
        </Transition>
      </div>

      <div data-mini-meta class="flex min-w-0 flex-auto flex-col gap-[2px]">
        <Transition name="pb-swap" mode="out-in">
          <div :key="displayTitle" class="text-[color:var(--fg)] text-[calc(13px*var(--text-scale,1))] font-semibold leading-[1.25] truncate">
            {{ displayTitle }}<AiTag :show="isAiCurrent" />
          </div>
        </Transition>
        <div class="text-[color:var(--fg-dim)] text-[calc(11.5px*var(--text-scale,1))] leading-[1.25] truncate" data-no-drag>
          <Transition name="pb-swap" mode="out-in">
            <ArtistsLine
              v-if="player.current"
              :key="player.current.id"
              :artists="player.current.artists"
              :limit="2"
            />
            <span v-else>mashiro</span>
          </Transition>
        </div>
        <TrackMenu
          v-if="player.current"
          :context-menu="true"
          :track="player.current"
        />
      </div>

      <button
        v-if="!preview"
        type="button"
        :class="miniRestoreClass"
        data-no-drag
        aria-label="Вернуться в обычный вид"
        @click.stop="leaveMini()"
      >
        <Icon name="mingcute:restore-line" :size="15" />
        <q-tooltip>Обычное окно (Esc)</q-tooltip>
      </button>
    </div>

    <div class="relative z-[1] flex max-w-full flex-wrap items-center justify-center gap-x-[var(--mini-gap,_4px)] gap-y-[2px]">
      <template v-for="id in miniButtons" :key="id">
        <button
          v-if="id === 'play'"
          type="button"
          :class="miniPlayClass"
          data-no-drag
          :aria-label="player.isPlaying ? 'Пауза' : 'Играть'"
          @click.stop="player.toggle()"
        >
          <Transition name="ic-pop" mode="out-in">
            <q-spinner
              v-if="player.loading"
              key="load"
              size="15px"
              color="white"
            />
            <Icon
              v-else
              :key="player.isPlaying ? 'pause' : 'play'"
              :name="
                player.isPlaying ? 'mingcute:pause-fill' : 'mingcute:play-fill'
              "
              :size="16"
            />
          </Transition>
        </button>

        <button
          v-else-if="id === 'prev'"
          type="button"
          :class="[miniBtnClass, !player.hasPrev ? miniDimClass : '']"
          data-no-drag
          aria-label="Предыдущий трек"
          @click.stop="player.prev()"
        >
          <Icon name="mingcute:skip-previous-fill" :size="16" />
          <q-tooltip>Предыдущий трек</q-tooltip>
        </button>

        <button
          v-else-if="id === 'next'"
          type="button"
          :class="miniBtnClass"
          data-no-drag
          aria-label="Следующий трек"
          @click.stop="player.next(false)"
        >
          <Icon name="mingcute:fast-forward-fill" :size="16" />
          <q-tooltip>Следующий трек</q-tooltip>
        </button>

        <button
          v-else-if="id === 'shuffle'"
          type="button"
          :class="[miniBtnClass, player.shuffle ? miniOnClass : '']"
          data-no-drag
          aria-label="Перемешать"
          @click.stop="player.toggleShuffle()"
        >
          <Icon name="mingcute:shuffle-line" :size="15" />
          <q-tooltip>Перемешать</q-tooltip>
        </button>

        <button
          v-else-if="id === 'repeat'"
          type="button"
          :class="[miniBtnClass, player.repeat !== 'off' ? miniOnClass : '']"
          data-no-drag
          aria-label="Повтор"
          @click.stop="player.cycleRepeat()"
        >
          <Icon
            :name="
              player.repeat === 'one'
                ? 'mingcute:repeat-one-line'
                : 'mingcute:repeat-line'
            "
            :size="15"
          />
          <q-tooltip>Повтор</q-tooltip>
        </button>

        <button
          v-else-if="id === 'like'"
          type="button"
          :class="[miniBtnClass, isLiked ? miniOnClass : '', !player.current ? miniDimClass : '']"
          data-no-drag
          aria-label="Нравится"
          @click.stop="player.current && player.like()"
        >
          <Icon
            :name="isLiked ? 'mingcute:heart-fill' : 'mingcute:heart-line'"
            :size="15"
          />
          <q-tooltip>Нравится</q-tooltip>
        </button>

        <button
          v-else-if="id === 'dislike'"
          type="button"
          :class="[miniBtnClass, !player.current ? miniDimClass : '']"
          data-no-drag
          aria-label="Не нравится"
          @click.stop="player.current && player.dislike()"
        >
          <Icon name="mingcute:heart-crack-line" :size="15" />
          <q-tooltip>Не нравится</q-tooltip>
        </button>

        <button
          v-else-if="id === 'lyrics'"
          type="button"
          :class="[miniBtnClass, player.showLyrics ? miniOnClass : '', !player.current ? miniDimClass : '']"
          data-no-drag
          aria-label="Текст песни"
          @click.stop="player.current && player.toggleLyrics()"
        >
          <Icon name="maki:karaoke" :size="15" />
          <q-tooltip>Текст песни</q-tooltip>
        </button>

        <div
          v-else-if="id === 'volume'"
          class="relative inline-flex items-center justify-center"
          data-no-drag
          @mouseenter="onVolEnter"
          @mouseleave="onVolLeave"
        >
          <Transition name="mini-vol-pop">
            <div
              v-if="volumeOpen"
              class="absolute bottom-[calc(100%_+_6px)] left-[50%] z-[30] flex max-h-[calc(var(--mini-h,_100vh)_-_96px)] flex-col items-center justify-center w-[26px] px-0 py-[7px] border border-[color:rgba(255,255,255,0.09)] rounded-full bg-[#141414] -translate-x-1/2 shadow-[0_10px_26px_rgba(0,0,0,0.55)]"
              data-no-drag
              @wheel.prevent.stop="onVolWheel"
            >
              <div
                ref="volTrack"
                class="group relative w-[4px] flex-initial h-[min(var(--mini-volume-height,_40px),var(--mini-h,_100vh)_-_110px)] min-h-[24px] rounded-full bg-[color-mix(in_srgb,var(--fg)_16%,transparent)] cursor-grab touch-none transition-[width] duration-[120ms] ease-[ease] hover:w-[6px] active:cursor-grabbing before:absolute before:z-[1] before:inset-[-8px_-11px] before:content-['']"
                @pointerdown.stop="onVolPointerDown"
              >
                <div
                  class="absolute bottom-0 left-0 w-full pointer-events-none rounded-full bg-[linear-gradient(to_top,color-mix(in_srgb,var(--accent)_70%,transparent),var(--accent))]"
                  :style="{ height: `${volumePercent}%` }"
                >
                  <span class="absolute top-0 left-1/2 w-[10px] h-[10px] pointer-events-none rounded-full bg-[var(--fg)] -translate-x-1/2 -translate-y-1/2 shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_32%,transparent)] transition-[box-shadow] duration-[140ms] ease-[ease] group-hover:shadow-[0_0_0_5px_color-mix(in_srgb,var(--accent)_38%,transparent)]" />
                </div>
              </div>
            </div>
          </Transition>

          <button
            type="button"
            :class="[miniBtnClass, volumeOpen ? miniOnClass : '']"
            data-no-drag
            aria-label="Громкость"
            @click.stop="onVolClick"
            @wheel.prevent.stop="onVolWheel"
          >
            <Icon :name="volumeIcon" :size="15" />
            <q-tooltip v-if="!volumeOpen">
              Громкость: {{ volumePercent }}%
            </q-tooltip>
          </button>
        </div>
      </template>
    </div>

    <div class="relative z-[1] flex items-center gap-[8px]">
      <span v-if="ui.settings.miniShowTime" class="flex-none text-[color:var(--fg-faint)] text-[calc(10.5px*var(--text-scale,1))] tabular-nums">
        {{ formatDuration(player.progress * 1000) }}
      </span>

      <div class="group relative h-[5px] flex-auto rounded-full bg-[var(--surface-2)] cursor-pointer" data-no-drag @click.stop="seekAt">
        <div class="relative h-full rounded-full bg-[var(--accent)]" :style="{ width: `${percent}%` }">
          <span class="absolute top-1/2 -right-[4px] w-[9px] h-[9px] rounded-full bg-[#fff] opacity-0 -translate-y-1/2 transition-opacity duration-[140ms] ease-[ease] group-hover:opacity-100" />
        </div>
      </div>

      <span v-if="ui.settings.miniShowTime" class="flex-none text-[color:var(--fg-faint)] text-[calc(10.5px*var(--text-scale,1))] tabular-nums">
        {{ formatDuration(player.duration * 1000) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import AiTag from "@/components/common/AiTag.vue";
import ArtistsLine from "@/components/common/ArtistsLine.vue";
import TrackMenu from "@/components/common/TrackMenu.vue";
import { useVisualizer } from "@/composables/useVisualizer";
import { formatDuration } from "@/lib/format";
import { ensureAiArtists, isAiArtist } from "@/lib/aiTag";
import { startWindowDrag } from "@/lib/window";
import { api } from "@/api/client";
import { useLibraryStore } from "@/stores/library";
import { usePanelsStore } from "@/stores/panels";
import { usePlayerStore } from "@/stores/player/index";
import { useUiStore } from "@/stores/ui/index";

const props = withDefaults(defineProps<{ preview?: boolean }>(), {
  preview: false,
});

const player = usePlayerStore();
const panels = usePanelsStore();
const library = useLibraryStore();
const ui = useUiStore();
const router = useRouter();

const miniButtons = computed(() => ui.activeMiniButtons());

const miniBtnBase =
  "inline-flex items-center justify-center p-0 border-0 text-[color:var(--fg-dim)] cursor-pointer [&_svg]:flex-none";
const miniBtnSkin =
  "transition-[background,color,opacity] duration-[140ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] active:scale-[0.88]";
const miniBtnClass = `${miniBtnBase} ${miniBtnSkin} w-[calc(var(--mini-icon,_15px)_*_2)] h-[calc(var(--mini-icon,_15px)_*_2)] flex-[0_0_calc(var(--mini-icon,15px)*2)] rounded-full bg-transparent`;
const miniRestoreClass = `${miniBtnBase} ${miniBtnSkin} w-[28px] h-[28px] flex-[0_0_28px] rounded-[9px] bg-[color-mix(in_srgb,var(--surface-2)_75%,transparent)]`;
const miniPlayClass = `${miniBtnBase} rounded-full w-[calc(var(--mini-icon,_15px)_*_2.5)] h-[calc(var(--mini-icon,_15px)_*_2.5)] flex-[0_0_calc(var(--mini-icon,15px)*2.5)] mx-[4px] my-0 bg-[var(--accent)] !text-[color:#fff] [transition:transform_0.18s_ease,background_0.15s_ease] hover:!bg-[color-mix(in_srgb,var(--accent)_88%,white)] hover:!text-[color:#fff] active:!scale-[0.9]`;
const miniOnClass = "!text-[color:var(--accent)]";
const miniDimClass = "opacity-[0.4]";

function onRootMouseDown(event: MouseEvent) {
  if (props.preview) return;
  startWindowDrag(event);
}

async function leaveMini() {
  if (props.preview) return;
  await panels.exitMini();
}

async function onContext(event: MouseEvent) {
  if (props.preview) return;
  const target = event.target as HTMLElement | null;
  if (target?.closest("[data-mini-meta]")) return;
  event.preventDefault();
  await panels.exitMini();
  await router.push({ path: "/settings", query: { section: "mini" } });
}

const primaryArtistId = computed(
  () => player.current?.artists?.[0]?.id ?? null,
);
const isAiCurrent = computed(() => isAiArtist(primaryArtistId.value));
const displayTitle = computed(
  () => player.current?.title || "Ничего не играет",
);

watch(
  () => player.current?.id,
  (id) => {
    if (!id) return;
    if (primaryArtistId.value) ensureAiArtists([primaryArtistId.value]);
  },
  { immediate: true },
);

const percent = computed(() =>
  player.duration > 0
    ? Math.min(100, (player.progress / player.duration) * 100)
    : 0,
);

const isLiked = computed(() =>
  player.current ? library.liked(player.current.id) : false,
);

function seekAt(event: MouseEvent) {
  const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
  if (!box.width || !player.duration) return;
  const ratio = Math.min(
    1,
    Math.max(0, (event.clientX - box.left) / box.width),
  );
  player.seek(ratio * player.duration);
}

const volumeOpen = ref(false);
const volTrack = ref<HTMLElement | null>(null);
let volCloseTimer = 0;
let volDragging = false;

const volumePercent = computed(() =>
  Math.round((player.muted ? 0 : player.volume) * 100),
);

const volumeIcon = computed(() =>
  player.muted || player.volume <= 0.001
    ? "mingcute:volume-off-line"
    : "mingcute:volume-line",
);

function openVolume() {
  if (!ui.settings.miniVolumeSlider) return;
  window.clearTimeout(volCloseTimer);
  volumeOpen.value = true;
}

function scheduleVolumeClose(delay = 320) {
  window.clearTimeout(volCloseTimer);
  volCloseTimer = window.setTimeout(() => {
    if (!volDragging) volumeOpen.value = false;
  }, delay);
}

function onVolEnter() {
  openVolume();
}

function onVolLeave() {
  scheduleVolumeClose();
}

function onVolClick() {
  player.toggleMute();
}

function applyVolume(value: number) {
  const next = Math.min(1, Math.max(0, value));
  player.setVolume(next);
  if (next > 0 && player.muted) player.toggleMute();
}

function onVolWheel(event: WheelEvent) {
  openVolume();
  applyVolume((player.muted ? 0 : player.volume) - event.deltaY / 2000);
  scheduleVolumeClose(900);
}

function volumeFromEvent(event: PointerEvent) {
  const box = volTrack.value?.getBoundingClientRect();
  if (!box?.height) return;
  applyVolume((box.bottom - event.clientY) / box.height);
}

function onVolPointerMove(event: PointerEvent) {
  if (!volDragging) return;
  volumeFromEvent(event);
}

function onVolPointerUp() {
  volDragging = false;
  window.removeEventListener("pointermove", onVolPointerMove);
  window.removeEventListener("pointerup", onVolPointerUp);
  window.removeEventListener("pointercancel", onVolPointerUp);
  scheduleVolumeClose();
}

function onVolPointerDown(event: PointerEvent) {
  event.preventDefault();
  volDragging = true;
  openVolume();
  try {
    (event.currentTarget as HTMLElement | null)?.setPointerCapture(
      event.pointerId,
    );
  } catch {}
  volumeFromEvent(event);
  window.addEventListener("pointermove", onVolPointerMove);
  window.addEventListener("pointerup", onVolPointerUp);
  window.addEventListener("pointercancel", onVolPointerUp);
}

const vizCanvas = ref<HTMLCanvasElement | null>(null);
useVisualizer(vizCanvas, () => ui.settings.miniVisualizer, { bars: 56 });

const rootStyle = computed(() => ({
  "--mini-h": props.preview ? `${ui.settings.miniHeight}px` : "100vh",
}));

watch(
  () => [props.preview, ui.settings.miniVolumeSlider] as const,
  ([isPreview, sliderOn]) => {
    if (isPreview) volumeOpen.value = !!sliderOn;
  },
  { immediate: true },
);

function onKey(event: KeyboardEvent) {
  if (event.key !== "Escape") return;
  event.preventDefault();
  void panels.exitMini();
}

onMounted(() => {
  if (props.preview) return;
  window.addEventListener("keydown", onKey);
  document.documentElement.dataset.mini = "1";
  void api.resizeMiniPlayer(ui.settings.miniWidth, ui.settings.miniHeight);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKey);
  window.removeEventListener("pointermove", onVolPointerMove);
  window.removeEventListener("pointerup", onVolPointerUp);
  window.clearTimeout(volCloseTimer);
  if (!props.preview) delete document.documentElement.dataset.mini;
});
</script>
