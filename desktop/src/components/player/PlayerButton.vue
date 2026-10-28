<template>
  <div v-if="id === 'play'" :class="playClass" @click="onPlayToggle">
    <Transition name="ic-pop" mode="out-in">
      <q-spinner
        v-if="neuroWait || player.loading"
        key="load"
        size="14px"
        color="dark"
      />
      <Icon v-else :key="playIcon" :name="playIcon" :size="18" />
    </Transition>
  </div>

  <div
    v-else-if="id === 'shuffle'"
    :class="[iconBtnClass, player.shuffle ? onClass : '', neuro.item ? offClass : '']"
    @click="guard(() => player.toggleShuffle())"
  >
    <Icon name="mingcute:shuffle-line" :size="18" />
    <q-tooltip>Перемешать</q-tooltip>
  </div>

  <div
    v-else-if="id === 'prev'"
    :class="[iconBtnClass, !player.hasPrev || neuro.item ? offClass : '']"
    @click="guard(() => player.prev())"
  >
    <Icon name="mingcute:skip-previous-fill" :size="19" />
    <q-tooltip>Предыдущий</q-tooltip>
  </div>

  <div
    v-else-if="id === 'next'"
    :class="[iconBtnClass, neuro.item ? offClass : '']"
    @click="guard(() => player.next(false))"
  >
    <Icon name="mingcute:fast-forward-fill" :size="19" />
    <q-tooltip>Следующий</q-tooltip>
  </div>

  <div
    v-else-if="id === 'repeat'"
    :class="[iconBtnClass, player.repeat !== 'off' ? onClass : '', neuro.item ? offClass : '']"
    @click="guard(() => player.cycleRepeat())"
  >
    <Icon
      :name="
        player.repeat === 'one'
          ? 'mingcute:repeat-one-line'
          : 'mingcute:repeat-line'
      "
      :size="18"
    />
    <q-tooltip>{{ repeatLabel }}</q-tooltip>
  </div>

  <div
    v-else-if="id === 'like'"
    :class="[iconBtnClass, isLiked ? onClass : '', !player.current || neuro.item ? offClass : '']"
    @click="guard(() => player.like())"
  >
    <Icon
      :name="isLiked ? 'mingcute:heart-fill' : 'mingcute:heart-line'"
      :size="18"
    />
    <q-tooltip>
      {{ isLiked ? "Убрать из «Мне нравится»" : "Нравится" }}
    </q-tooltip>
  </div>

  <div
    v-else-if="id === 'dislike'"
    :class="[iconBtnClass, !player.current || neuro.item ? offClass : '']"
    @click="guard(() => player.dislike())"
  >
    <Icon name="mingcute:heart-crack-line" :size="18" />
    <q-tooltip>Не нравится</q-tooltip>
  </div>

  <div
    v-else-if="id === 'lyrics'"
    :class="[iconBtnClass, player.showLyrics ? onClass : '', !player.current || neuro.item ? offClass : '']"
    @click="guard(() => player.toggleLyrics())"
  >
    <Icon name="maki:karaoke" :size="18" />
    <q-tooltip>Текст песни</q-tooltip>
  </div>

  <div
    v-else-if="id === 'queue'"
    :class="[iconBtnClass, panels.queueOpen ? onClass : '', panels.queueLocked ? offClass : '']"
    @click="panels.toggleQueue()"
  >
    <Icon name="mingcute:playlist-2-line" :size="18" />
    <q-tooltip>Очередь треков</q-tooltip>
  </div>

  <div v-else-if="id === 'mini'" :class="iconBtnClass" @click="panels.enterMini()">
    <Icon name="mingcute:miniplayer-fill" :size="18" />
    <q-tooltip>Мини-плеер поверх окон</q-tooltip>
  </div>

  <div
    v-else-if="id === 'sleep'"
    :class="[iconBtnClass, sleep.active ? onClass : '']"
  >
    <Icon name="mingcute:time-line" :size="18" />
    <q-tooltip>Таймер сна: {{ sleep.label }}</q-tooltip>
    <q-menu :class="menuClass" anchor="top middle" self="bottom middle">
      <div class="p-[4px] min-w-[178px] max-w-[260px] overflow-x-hidden" style="min-width: 178px">
        <div class="pt-[6px] px-[10px] pb-[2px] text-[11px] uppercase tracking-[0.05em] text-[color:var(--fg-faint)]">Таймер сна</div>
        <div
          v-for="m in sleepPresets"
          :key="m"
          :class="optClass"
          v-close-popup
          @click="sleep.start(m)"
        >
          <span>Через {{ m }} мин</span>
        </div>
        <div :class="optClass" v-close-popup @click="sleep.startUntilTrackEnd()">
          <span>До конца трека</span>
        </div>
        <div
          v-if="sleep.active"
          :class="optClass"
          v-close-popup
          @click="sleep.cancel()"
        >
          <span>Выключить ({{ sleep.label }})</span>
        </div>
      </div>
    </q-menu>
  </div>

  <div
    v-else-if="id === 'speed'"
    :class="[iconBtnClass, player.playbackRate !== 1 ? onClass : '']"
  >
    <Icon name="mingcute:dashboard-line" :size="18" />
    <q-tooltip>Скорость</q-tooltip>
    <q-menu :class="menuClass" anchor="top middle" self="bottom middle">
      <div class="p-[4px] min-w-[178px] max-w-[260px] overflow-x-hidden" style="min-width: 132px">
        <div
          v-for="r in rates"
          :key="r"
          :class="[optClass, player.playbackRate === r ? optOnClass : '']"
          v-close-popup
          @click="player.setPlaybackRate(r)"
        >
          <span>{{ r }}x</span>
          <Icon
            v-if="player.playbackRate === r"
            name="mingcute:check-line"
            :size="15"
          />
        </div>
      </div>
    </q-menu>
  </div>

  <div v-else-if="id === 'quality'" :class="iconBtnClass">
    <Icon name="mingcute:barcode-line" :size="18" />
    <q-tooltip>{{ player.qualityLabel || "Качество" }}</q-tooltip>
    <q-menu :class="menuClass" anchor="top middle" self="bottom middle">
      <div class="p-[4px] min-w-[178px] max-w-[260px] overflow-x-hidden" style="min-width: 172px">
        <div
          v-for="q in qualities"
          :key="q.value"
          :class="[optClass, player.quality === q.value ? optOnClass : '']"
          v-close-popup
          @click="player.setQuality(q.value)"
        >
          <span>{{ q.label }}</span>
          <Icon
            v-if="player.quality === q.value"
            name="mingcute:check-line"
            :size="15"
          />
        </div>
      </div>
    </q-menu>
  </div>

  <div v-else-if="id === 'volume'" class="flex items-center gap-[4px]">
    <div :class="iconBtnClass" @click="onMuteClick">
      <Icon
        :name="
          player.muted ? 'mingcute:volume-off-line' : 'mingcute:volume-line'
        "
        :size="18"
      />
      <q-tooltip>{{
        player.muted ? "Включить звук" : "Выключить звук"
      }}</q-tooltip>
    </div>
    <q-slider
      class="w-[74px] flex-none max-[1120px]:w-[54px]"
      :model-value="player.muted ? 0 : player.volume"
      :min="0"
      :max="1"
      :step="0.01"
      dense
      color="primary"
      @update:model-value="(v) => onVolumeInput(Number(v ?? 0))"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Quality } from "@/api/types";
import {
  neuro,
  pauseNeuro,
  resumeNeuro,
  setNeuroVolume,
  startNeuro,
} from "@/lib/neuro";
import { useLibraryStore } from "@/stores/library";
import { usePanelsStore } from "@/stores/panels";
import { usePlayerStore } from "@/stores/player/index";
import { useSleepStore } from "@/stores/sleep";
import type { PlayerButtonId } from "@/stores/ui/index";

defineProps<{ id: PlayerButtonId }>();

const player = usePlayerStore();
const library = useLibraryStore();
const panels = usePanelsStore();
const sleep = useSleepStore();

const playClass =
  "flex w-[32px] h-[32px] flex-none items-center justify-center rounded-full bg-[var(--accent)] text-[color:#fff] cursor-pointer [transition:opacity_0.12s_ease,box-shadow_0.2s_ease,transform_0.32s_cubic-bezier(0.34,1.56,0.64,1)] hover:opacity-[0.9] hover:scale-[1.06] active:scale-[0.84] active:duration-[90ms] active:ease-out";
const iconBtnClass =
  "flex w-[30px] h-[30px] items-center justify-center rounded-[8px] text-[color:var(--fg-faint)] cursor-pointer transition-[background,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]";
const onClass = "!text-[color:var(--accent)]";
const offClass = "opacity-[0.25] pointer-events-none";
const menuClass =
  "!rounded-[var(--radius)] overflow-x-hidden max-w-[268px] border border-[color:rgba(255,255,255,0.09)] bg-[color-mix(in_srgb,var(--surface-2)_90%,transparent)] shadow-[0_16px_40px_rgba(0,0,0,0.55)] backdrop-blur-[var(--glass-blur,24px)] backdrop-saturate-[1.35]";
const optClass =
  "flex items-center justify-between gap-[12px] px-[9px] py-[7px] rounded-[7px] text-[13px] cursor-pointer transition-[background] duration-[120ms] ease-[ease] hover:bg-[var(--hover)]";
const optOnClass = "bg-[var(--hover)] !text-[color:var(--accent)]";

const neuroWait = computed(() => Boolean(neuro.item && !neuro.stream));

const playIcon = computed(() => {
  if (neuro.item) {
    return neuro.playing
      ? "mingcute:pause-fill"
      : "mingcute:play-fill";
  }
  return player.isPlaying ? "mingcute:pause-fill" : "mingcute:play-fill";
});

function onPlayToggle() {
  if (!neuro.item) {
    player.toggle();
    return;
  }
  if (!neuro.playing && !neuro.built) {
    void startNeuro(neuro.item);
    return;
  }
  if (neuro.playing) pauseNeuro();
  else resumeNeuro();
}

function guard(run: () => void) {
  if (neuro.item) return;
  run();
}

function onVolumeInput(v: number) {
  player.setVolume(v);
  if (neuro.item) setNeuroVolume(v);
}

function onMuteClick() {
  const willMute = !player.muted;
  player.toggleMute();
  if (neuro.item) setNeuroVolume(willMute ? 0 : player.volume);
}

const sleepPresets = [15, 30, 45, 60];
const rates = [0.75, 1, 1.25, 1.5, 1.75, 2];

const qualities: Array<{ value: Quality; label: string }> = [
  { value: "low", label: "Экономное" },
  { value: "normal", label: "Стандартное" },
  { value: "high", label: "Высокое" },
  { value: "lossless", label: "Максимальное" },
];

const isLiked = computed(() =>
  player.current ? library.liked(player.current.id) : false,
);

const repeatLabel = computed(() => {
  if (player.repeat === "one") return "Повтор трека";
  if (player.repeat === "all") return "Повтор плейлиста";
  return "Повтор выключен";
});
</script>
