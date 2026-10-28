<template>
  <Transition name="fs" :duration="{ enter: 280, leave: 320 }">
    <div
      v-if="player.fullscreen && player.current"
      class="fixed inset-0 z-[2600] flex flex-col overflow-hidden isolate bg-[#080808] text-[color:#fff]"
    >
      <div
        v-if="coverUrl"
        class="absolute inset-[-12%] opacity-[0.55] bg-center bg-cover [filter:blur(70px)_saturate(150%)] [transform:scale(1.1)]"
        :style="{ backgroundImage: `url(${coverUrl})` }"
      />
      <div class="absolute inset-0 [background:radial-gradient(circle_at_50%_20%,rgba(0,0,0,0.15),rgba(0,0,0,0.8)),rgba(8,8,8,0.45)]" />

      <div class="relative z-[4] flex items-center justify-end gap-[12px] px-[14px] py-[10px]">
        <div class="self-stretch flex-1 min-h-[36px] [-webkit-app-region:drag]" @mousedown="onDrag" @dblclick="toggleNative" />
        <div class="flex items-center gap-[6px]">
          <button class="flex w-[30px] h-[30px] items-center justify-center rounded-full text-[color:var(--fg-faint)] cursor-pointer select-none transition-[background,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] p-0 border-0 appearance-none" @click="openLyrics">
            <Icon name="maki:karaoke" :size="18" />
            <q-tooltip>Текст трека</q-tooltip>
          </button>
          <button
            class="flex w-[30px] h-[30px] items-center justify-center rounded-full text-[color:var(--fg-faint)] cursor-pointer select-none transition-[background,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] p-0 border-0 appearance-none"
            :class="{ 'text-[color:var(--accent)]': showQueue }"
            @click="showQueue = !showQueue"
          >
            <Icon name="mingcute:playlist-2-line" :size="18" />
            <q-tooltip>Очередь</q-tooltip>
          </button>
          <button class="flex w-[30px] h-[30px] items-center justify-center rounded-full text-[color:var(--fg-faint)] cursor-pointer select-none transition-[background,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] p-0 border-0 appearance-none" @click="toggleNative">
            <Icon
              :name="native ? 'mingcute:restore-line' : 'mingcute:square-line'"
              :size="16"
            />
            <q-tooltip>
              {{ native ? "Оконный режим" : "Весь экран" }}
            </q-tooltip>
          </button>
          <button class="flex w-[30px] h-[30px] items-center justify-center rounded-full text-[color:var(--fg-faint)] cursor-pointer select-none transition-[background,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] p-0 border-0 appearance-none" @click="close">
            <Icon name="mingcute:close-line" :size="19" />
            <q-tooltip>Закрыть (Esc)</q-tooltip>
          </button>
        </div>
      </div>

      <div class="relative z-[2] flex min-h-0 flex-1">
        <div
          class="flex min-w-0 flex-1 flex-col items-center justify-center gap-[22px] pt-[10px] px-[32px] pb-[44px] transition-[padding] duration-[260ms] ease-[cubic-bezier(0.22,0.65,0.28,1)]"
          :class="{ 'pr-[380px] max-[1000px]:pr-[32px]': showQueue }"
        >
          <div class="cover group relative flex w-[min(52vh,460px)] h-[min(52vh,460px)] items-center justify-center overflow-hidden rounded-[18px] bg-[rgba(255,255,255,0.05)] shadow-[0_30px_80px_rgba(0,0,0,0.55)] [&_img]:w-full [&_img]:h-full [&_img]:cursor-pointer [&_img]:object-cover">
            <Transition name="fs-swap">
              <img
                v-if="coverUrl"
                :key="coverUrl"
                :src="coverUrl"
                decoding="async"
                alt=""
                @click="openLyrics"
              />
              <Icon
                v-else
                name="mingcute:music-line"
                :size="72"
                class="text-[color:var(--fg-faint)]"
              />
            </Transition>

            <div class="absolute inset-0 flex flex-col items-center justify-center gap-[14px] bg-[rgba(0,0,0,0.5)] opacity-0 transition-opacity duration-[160ms] ease-[ease] group-hover:opacity-100">
              <div class="flex items-center gap-[14px]">
                <button
                  class="flex w-[44px] h-[44px] items-center justify-center border-0 rounded-full bg-[rgba(255,255,255,0.12)] text-[color:#fff] cursor-pointer transition-[background,transform] duration-[140ms] ease-[ease] hover:bg-[rgba(255,255,255,0.22)] hover:scale-105 disabled:cursor-default disabled:opacity-35"
                  :disabled="!player.hasPrev"
                  @click.stop="player.prev()"
                >
                  <Icon name="mingcute:skip-previous-fill" :size="22" />
                  <q-tooltip>Предыдущий</q-tooltip>
                </button>
                <button
                  class="flex w-[62px] h-[62px] items-center justify-center border-0 rounded-full bg-[#fff] text-[color:#111] cursor-pointer transition-[background,transform] duration-[140ms] ease-[ease] hover:bg-[#fff] hover:scale-105 disabled:cursor-default disabled:opacity-35"
                  @click.stop="player.toggle()"
                >
                  <Icon
                    :name="
                      player.isPlaying
                        ? 'mingcute:pause-fill'
                        : 'mingcute:play-fill'
                    "
                    :size="28"
                  />
                  <q-tooltip>
                    {{ player.isPlaying ? "Пауза" : "Играть" }}
                  </q-tooltip>
                </button>
                <button
                  class="flex w-[44px] h-[44px] items-center justify-center border-0 rounded-full bg-[rgba(255,255,255,0.12)] text-[color:#fff] cursor-pointer transition-[background,transform] duration-[140ms] ease-[ease] hover:bg-[rgba(255,255,255,0.22)] hover:scale-105 disabled:cursor-default disabled:opacity-35"
                  :disabled="!player.hasNext"
                  @click.stop="player.next()"
                >
                  <Icon name="mingcute:fast-forward-fill" :size="22" />
                  <q-tooltip>Следующий</q-tooltip>
                </button>
              </div>
              <div class="flex items-center gap-[14px] [&>button]:w-[36px] [&>button]:h-[36px]">
                <button
                  class="flex w-[44px] h-[44px] items-center justify-center border-0 rounded-full bg-[rgba(255,255,255,0.12)] text-[color:#fff] cursor-pointer transition-[background,transform] duration-[140ms] ease-[ease] hover:bg-[rgba(255,255,255,0.22)] hover:scale-105 disabled:cursor-default disabled:opacity-35"
                  :class="{ 'text-[color:var(--accent)]': liked }"
                  @click.stop="like"
                >
                  <Icon
                    :name="
                      liked ? 'mingcute:heart-fill' : 'mingcute:heart-line'
                    "
                    :size="19"
                  />
                  <q-tooltip>
                    {{ liked ? "Убрать лайк" : "Мне нравится" }}
                  </q-tooltip>
                </button>
                <button
                  class="flex w-[44px] h-[44px] items-center justify-center border-0 rounded-full bg-[rgba(255,255,255,0.12)] text-[color:#fff] cursor-pointer transition-[background,transform] duration-[140ms] ease-[ease] hover:bg-[rgba(255,255,255,0.22)] hover:scale-105 disabled:cursor-default disabled:opacity-35"
                  :class="{ 'text-[color:var(--accent)]': showQueue }"
                  @click.stop="showQueue = !showQueue"
                >
                  <Icon name="mingcute:playlist-2-line" :size="19" />
                  <q-tooltip>Очередь</q-tooltip>
                </button>
                <button ref="dotsButton" class="flex w-[44px] h-[44px] items-center justify-center border-0 rounded-full bg-[rgba(255,255,255,0.12)] text-[color:#fff] cursor-pointer transition-[background,transform] duration-[140ms] ease-[ease] hover:bg-[rgba(255,255,255,0.22)] hover:scale-105 disabled:cursor-default disabled:opacity-35" @click.stop>
                  <Icon name="mingcute:more-2-fill" :size="19" />
                  <TrackMenu :track="player.current" />
                </button>
              </div>
            </div>
          </div>

          <Transition name="fs-swap" mode="out-in">
            <div :key="player.current.id" class="max-w-[min(90vw,620px)] text-center">
              <div class="truncate text-[26px] font-[650] tracking-[-0.01em]">{{ player.current.title }}</div>
              <div class="truncate mt-[6px] text-[14px] text-[color:rgba(255,255,255,0.62)]">
                <ArtistsLine :artists="player.current.artists" :limit="3" />
              </div>
            </div>
          </Transition>

          <div class="flex w-[min(80vw,560px)] items-center gap-[10px] [&_.q-slider]:flex-1">
            <span class="text-[calc(11px*var(--text-scale,1))] text-[color:var(--fg-faint)]">{{
              formatDuration(seekValue * 1000)
            }}</span>
            <q-slider
              dense
              color="red"
              :model-value="seekValue"
              :min="0"
              :max="Math.max(player.duration, 1)"
              :step="1"
              @update:model-value="onSeekInput"
              @change="onSeekCommit"
            />
            <span class="text-[calc(11px*var(--text-scale,1))] text-[color:var(--fg-faint)]">{{
              formatDuration(player.duration * 1000)
            }}</span>
          </div>
        </div>

        <Transition name="fs-q">
          <div v-if="showQueue" class="absolute top-[4px] right-[16px] bottom-[18px] z-[3] flex w-[344px] flex-col overflow-hidden border border-[color:rgba(255,255,255,0.07)] rounded-[20px] [background:linear-gradient(180deg,rgba(24,24,28,0.58),rgba(10,10,12,0.78))] shadow-[0_30px_70px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-[34px] backdrop-saturate-[160%]">
            <div class="flex items-center justify-between pt-[14px] pr-[10px] pb-[12px] pl-[18px] text-[11px] font-semibold tracking-[0.09em] uppercase text-[color:rgba(255,255,255,0.5)]">
              <span>Очередь</span>
              <button class="flex w-[30px] h-[30px] items-center justify-center rounded-full text-[color:var(--fg-faint)] cursor-pointer select-none transition-[background,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] p-0 border-0 appearance-none" @click="showQueue = false">
                <Icon name="mingcute:close-line" :size="16" />
              </button>
            </div>
            <q-scroll-area class="flex-1 min-h-0 pt-0 px-[8px] pb-[10px]">
              <div
                v-for="item in queueWindow"
                :key="`${item.index}-${item.track.id}`"
                class="flex items-center gap-[10px] px-[10px] py-[7px] rounded-[12px] cursor-pointer transition-[background,color] duration-[140ms] ease-[ease] hover:bg-[rgba(255,255,255,0.07)]"
                :class="{ 'bg-[rgba(255,255,255,0.1)] text-[color:var(--accent)]': item.index === player.index }"
                @click="jumpTo(item.index)"
              >
                <div class="cover w-[34px] h-[34px] flex-none overflow-hidden rounded-[8px] bg-[var(--surface-2)] flex items-center justify-center [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block">
                  <img
                    v-if="item.track.cover_url"
                    :src="item.track.cover_url"
                    loading="lazy"
                    decoding="async"
                    alt=""
                  />
                  <Icon
                    v-else
                    name="mingcute:music-line"
                    :size="14"
                    class="text-[color:var(--fg-faint)]"
                  />
                </div>
                <div class="col" style="min-width: 0">
                  <div class="truncate text-[calc(13px*var(--text-scale,1))]">{{ item.track.title }}</div>
                  <div class="text-[color:var(--fg-faint)] text-[calc(11px*var(--text-scale,1))] truncate">
                    <ArtistsLine :artists="item.track.artists" :limit="2" />
                  </div>
                </div>
                <Icon
                  v-if="item.index === player.index"
                  :name="
                    player.isPlaying
                      ? 'mingcute:pause-fill'
                      : 'mingcute:play-fill'
                  "
                  :size="13"
                />
              </div>
              <div v-if="!queueWindow.length" class="text-[color:var(--fg-faint)] text-[calc(12px*var(--text-scale,1))] q-pa-md">
                Очередь пуста
              </div>
            </q-scroll-area>
          </div>
        </Transition>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import ArtistsLine from "@/components/common/ArtistsLine.vue";
import TrackMenu from "@/components/common/TrackMenu.vue";
import { formatDuration } from "@/lib/format";
import {
  isNativeFullscreen,
  setNativeFullscreen,
  startWindowDrag,
} from "@/lib/window";
import { useLibraryStore } from "@/stores/library";
import { usePlayerStore } from "@/stores/player/index";

const player = usePlayerStore();
const library = useLibraryStore();
const route = useRoute();

const showQueue = ref(false);
const native = ref(false);
const dotsButton = ref<HTMLElement | null>(null);

const coverUrl = computed(() => {
  const track = player.current;
  const url = track?.cover_url_large || track?.cover_url || "";
  return url.replace(/\/\d+x\d+(?=$|\?)/, "/1000x1000");
});

const scrubbing = ref<number | null>(null);
const seekValue = computed(() => scrubbing.value ?? player.progress);

function onSeekInput(value: number | null) {
  scrubbing.value = Number(value ?? 0);
}

function onSeekCommit(value: number | null) {
  const target = Number(value ?? 0);
  scrubbing.value = null;
  player.seek(target);
}
const liked = computed(() =>
  player.current ? library.liked(player.current.id) : false,
);

const HISTORY = 5;
const VISIBLE = 60;

const queueWindow = computed(() => {
  const queue = player.queue ?? [];
  const start = Math.max(0, player.index - HISTORY);
  const end = Math.min(queue.length, player.index + 1 + VISIBLE);
  const out: Array<{ track: (typeof queue)[number]; index: number }> = [];
  for (let i = start; i < end; i++) {
    const track = queue[i];
    if (track) out.push({ track, index: i });
  }
  return out;
});

function jumpTo(index: number) {
  player.index = index;
  void player.loadCurrent();
}

function onDrag(event: MouseEvent) {
  if (event.button !== 0 || native.value) return;
  void startWindowDrag(event);
}

function like() {
  if (player.current) void library.toggleLike(player.current);
}

function openLyrics() {
  void player.openLyricsFullscreen();
}

async function toggleNative() {
  const value = !native.value;
  const ok = await setNativeFullscreen(value);
  native.value = ok ? value : await isNativeFullscreen();
}

function close() {
  const wasNative = native.value;
  showQueue.value = false;
  player.closeFullscreen();
  if (!wasNative) return;
  native.value = false;
  window.setTimeout(() => {
    void setNativeFullscreen(false);
  }, 340);
}

function onKey(event: KeyboardEvent) {
  if (!player.fullscreen) return;
  if (event.key === "Escape") close();
}

watch(
  () => player.fullscreen,
  (open) => {
    if (open) {
      void isNativeFullscreen().then((value) => {
        native.value = value;
      });
      return;
    }
    showQueue.value = false;
    if (native.value) {
      native.value = false;
      void setNativeFullscreen(false);
    }
  },
);

watch(
  () => route.fullPath,
  () => {
    if (player.fullscreen) close();
  },
);

onMounted(() => {
  window.addEventListener("keydown", onKey);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKey);
});
</script>
