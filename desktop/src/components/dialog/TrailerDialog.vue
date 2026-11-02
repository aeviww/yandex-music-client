<template>
  <q-dialog v-model="open">
    <div
      class="flex flex-col w-[min(600px,92vw)] max-h-[82vh] border border-[color:var(--line)] rounded-[calc(var(--radius)+6px)] bg-[var(--surface)] overflow-hidden"
    >
      <div class="flex items-center gap-[14px] pt-[18px] pr-[18px] pb-[14px] pl-[20px]">
        <div
          class="relative flex-none w-[62px] h-[62px] rounded-[12px] bg-[var(--surface-2)]"
        >
          <img
            v-if="trailerDialog.cover"
            :src="trailerDialog.cover"
            class="block w-full h-full object-cover rounded-[12px]"
            alt=""
          />
          <Icon
            v-else
            name="mingcute:music-2-line"
            :size="26"
            class="absolute inset-0 m-auto text-[color:var(--fg-faint)]"
          />
          <div
            class="absolute -right-[7px] -bottom-[7px] flex h-[24px] w-[24px] items-center justify-center rounded-full border border-[color:var(--line)] bg-[var(--surface-2)] text-[color:var(--fg-dim)]"
          >
            <Icon name="mingcute:volume-line" :size="14" />
          </div>
        </div>

        <div class="flex-1 min-w-0">
          <div class="text-[19px] font-bold leading-[1.15] truncate">
            {{ trailerDialog.heading }}
          </div>
          <div
            v-if="trailerDialog.subtitle"
            class="mt-[3px] text-[13.5px] text-[color:var(--fg-dim)] truncate"
          >
            {{ trailerDialog.subtitle }}
          </div>
        </div>

        <button
          class="flex h-[32px] w-[32px] flex-none items-center justify-center rounded-full border-0 bg-[var(--surface-2)] text-[color:var(--fg-dim)] cursor-pointer transition-[background,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]"
          type="button"
          title="Закрыть"
          @click="open = false"
        >
          <Icon name="mingcute:close-line" :size="17" />
        </button>
      </div>

      <div class="flex-auto min-h-0 overflow-y-auto px-[12px] pb-[4px]">
        <div v-if="loading" class="flex items-center justify-center py-[46px]">
          <q-spinner size="24px" color="primary" />
        </div>

        <div
          v-else-if="error"
          class="px-[8px] py-[34px] text-center text-[13px] leading-[1.5] text-[color:var(--fg-dim)]"
        >
          {{ error }}
        </div>

        <div v-else class="flex flex-col">
          <div
            v-for="(track, index) in trailers"
            :key="track.id"
            class="group flex items-center gap-[12px] rounded-[9px] px-[8px] py-[6px] cursor-pointer select-none transition-[background] duration-[100ms] ease-[ease] hover:bg-[var(--hover)]"
            :class="{ 'bg-[var(--hover)]': isCurrent(index) }"
            @click="playAt(index)"
          >
            <div
              class="relative flex-none w-[44px] h-[44px] rounded-[6px] overflow-hidden bg-[var(--surface-2)]"
            >
              <img
                v-if="track.cover_url"
                :src="track.cover_url"
                class="block h-full w-full object-cover"
                loading="lazy"
                alt=""
              />
              <Icon
                v-else
                name="mingcute:music-2-line"
                :size="18"
                class="absolute inset-0 m-auto text-[color:var(--fg-faint)]"
              />
              <div
                class="absolute inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.45)] transition-opacity duration-[100ms] ease-[ease]"
                :class="
                  isCurrent(index)
                    ? 'opacity-[1]'
                    : 'opacity-[0] group-hover:opacity-[1]'
                "
              >
                <Icon
                  :name="
                    isCurrent(index) && player.isPlaying
                      ? 'mingcute:pause-fill'
                      : 'mingcute:play-fill'
                  "
                  :size="18"
                  class="text-white"
                />
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <div class="text-[13.5px] font-medium leading-[1.25] truncate">
                {{ track.title }}
              </div>
              <div
                class="mt-[1px] text-[12px] leading-[1.25] text-[color:var(--fg-dim)] truncate"
              >
                {{ artistNames(track.artists) }}
              </div>
            </div>

            <button
              class="flex h-[28px] w-[28px] flex-none items-center justify-center rounded-full border-0 bg-transparent cursor-pointer text-[color:var(--fg-faint)] transition-[background,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]"
              :class="{ '!text-[color:var(--accent)]': liked(track.id) }"
              type="button"
              :title="liked(track.id) ? 'Убрать из «Мне нравится»' : 'Нравится'"
              @click.stop="library.toggleLike(track)"
            >
              <Icon
                :name="liked(track.id) ? 'mingcute:heart-fill' : 'mingcute:heart-line'"
                :size="17"
              />
            </button>

            <div
              class="w-[42px] flex-none text-right text-[12px] text-[color:var(--fg-faint)] tabular-nums"
            >
              {{ formatDuration(track.preview_duration_ms ?? track.duration_ms) }}
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center px-[20px] pt-[12px] pb-[16px]">
        <button
          class="inline-flex h-[36px] items-center justify-center gap-[8px] rounded-[10px] border-0 bg-[var(--accent)] px-[18px] text-[calc(12.5px*var(--text-scale,1))] font-medium text-white cursor-pointer select-none transition-opacity duration-[120ms] ease-[ease] hover:opacity-[0.85] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
          type="button"
          :disabled="!trailerDialog.playFull || !trailers.length"
          @click="playFull"
        >
          <Icon name="mingcute:play-fill" :size="15" />
          <span>Слушать полностью</span>
        </button>
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { api } from "@/api/client";
import type { Trailer } from "@/api/types";
import { trailerDialog } from "@/lib/dialogs";
import { artistNames, formatDuration } from "@/lib/format";
import { useLibraryStore } from "@/stores/library";
import { usePlayerStore } from "@/stores/player/index";

const open = computed({
  get: () => trailerDialog.open,
  set: (value: boolean) => {
    if (!value && trailerDialog.open) player.stopPreview();
    trailerDialog.open = value;
  },
});

const player = usePlayerStore();
const library = useLibraryStore();

const trailer = ref<Trailer | null>(null);
const loading = ref(false);
const error = ref("");
let seq = 0;

const trailers = computed(() => trailer.value?.tracks ?? []);

async function load() {
  const ticket = ++seq;
  trailer.value = null;
  error.value = "";
  loading.value = true;
  try {
    const found = await api.trailer(
      trailerDialog.kind,
      trailerDialog.id,
      trailerDialog.uid,
    );
    if (ticket !== seq) return;
    if (!found.tracks.length) {
      error.value = "Трейлер не найден";
      return;
    }
    trailer.value = found;
    if (!trailerDialog.open) return;
    await start(0);
  } catch (e) {
    if (ticket !== seq) return;
    error.value =
      e instanceof Error ? e.message : "Не удалось получить трейлер";
  } finally {
    if (ticket === seq) loading.value = false;
  }
}

watch(
  () => [trailerDialog.open, trailerDialog.id] as const,
  ([isOpen]) => {
    if (isOpen) void load();
  },
);

function liked(id: string): boolean {
  return library.liked(id);
}

function isCurrent(index: number): boolean {
  return (
    player.previewMode &&
    Boolean(player.current) &&
    player.current?.id === trailers.value[index]?.id
  );
}

async function start(index: number) {
  if (!trailer.value) return;
  if (isCurrent(index)) {
    await player.toggle();
    return;
  }
  await player.playQueue(trailer.value.tracks, index, { preview: true });
}

function playAt(index: number) {
  void start(index).catch(() => undefined);
}

function playFull() {
  const action = trailerDialog.playFull;
  player.stopPreview();
  trailerDialog.open = false;
  if (action) void action();
}
</script>
