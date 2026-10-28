<template>
  <q-page class="flex flex-col h-[calc(100vh_-_52px_-_var(--player-height,_78px))] !min-h-0 !p-0 !overflow-hidden">
    <q-scroll-area class="flex-auto min-h-0">
      <div class="pt-[var(--page-top-gap)] px-[32px] pb-[46px]">
        <div class="flex items-end justify-between mt-[34px] mx-0 mb-[12px] gap-[12px]">
          <div>
            <button class="inline-flex items-center p-0 border-0 bg-transparent text-[color:var(--fg-faint)] cursor-pointer text-[12px] gap-[4px] whitespace-nowrap appearance-none transition-colors hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.6]" type="button" @click="back">
              <Icon name="mingcute:left-line" :size="14" />
              <span>{{ name || "Артист" }}</span>
            </button>
            <div class="q-mt-sm text-[calc(30px*var(--text-scale,1))] font-semibold tracking-[-0.03em] leading-[1.15]">Все треки</div>
            <div class="q-mt-xs text-[color:var(--fg-faint)] text-[calc(12px*var(--text-scale,1))]">
              {{ plural(tracks.length, "трек", "трека", "треков") }}
            </div>
          </div>

          <div class="flex items-center gap-[8px] flex-wrap mt-[22px] select-none max-[1180px]:gap-[7px] max-[1180px]:mt-[16px] max-[1024px]:mt-[14px] max-[760px]:[&_.btn_span]:hidden max-[760px]:[&_.btn-solid_span]:hidden max-[760px]:[&_.btn]:px-[12px] max-[760px]:[&_.btn-solid]:px-[12px] [&_.btn]:whitespace-nowrap [&_.btn-solid]:whitespace-nowrap">
            <button
              class="inline-flex items-center justify-center gap-[7px] h-[34px] px-[18px] py-0 border-0 rounded-[8px] bg-[var(--accent)] text-white text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer transition-opacity duration-[120ms] hover:opacity-[0.85] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
              type="button"
              :disabled="!tracks.length"
              @click="playFrom(0)"
            >
              <Icon name="mingcute:play-fill" :size="15" />
              <span>Слушать</span>
            </button>

            <button
              class="inline-flex items-center justify-center gap-[7px] h-[32px] px-[14px] py-0 border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer transition-[background,border-color,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
              type="button"
              :disabled="!tracks.length"
              @click="shufflePlay"
            >
              <Icon name="mingcute:shuffle-line" :size="15" />
              <span>Перемешать</span>
            </button>

            <button
              class="inline-flex items-center justify-center gap-[7px] h-[32px] px-[14px] py-0 border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer transition-[background,border-color,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
              type="button"
              :disabled="!tracks.length"
              @click="enqueueAll"
            >
              <Icon name="mingcute:add-circle-line" :size="15" />
              <span>В очередь</span>
            </button>
          </div>
        </div>

        <div v-if="loading" class="flex flex-center" style="height: 260px">
          <q-spinner size="26px" color="primary" />
        </div>

        <div v-else-if="error" class="text-[color:var(--fg-dim)] text-[calc(13px*var(--text-scale,1))]">{{ error }}</div>

        <template v-else>
          <div class="flex items-center gap-[14px] h-[32px] px-[12px] py-0 text-[11px] font-semibold tracking-[0.06em] uppercase text-[color:var(--fg-faint)] border-b border-[var(--line)]">
            <div style="width: 20px; text-align: center">#</div>
            <div style="width: 38px" />
            <div class="col">Название</div>
            <div class="gt-sm" style="width: 190px">Альбом</div>
            <div style="width: 84px" />
            <div style="width: 40px; text-align: right">Время</div>
          </div>

          <LazyTracks v-slot="{ item, index }" :items="tracks">
            <TrackRow
              :track="item"
              :index="index"
              :show-album="true"
              @play="playFrom(index)"
            />
          </LazyTracks>
        </template>
      </div>
    </q-scroll-area>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Notify } from "quasar";
import { api } from "@/api/client";
import type { ArtistPage, Track } from "@/api/types";
import LazyTracks from "@/components/common/LazyTracks.vue";
import TrackRow from "@/components/common/TrackRow.vue";
import { plural } from "@/lib/format";
import { readCache, swr } from "@/lib/cache";
import { usePlayerStore } from "@/stores/player/index";

const props = defineProps<{ id: string }>();
const router = useRouter();
const player = usePlayerStore();
const tracks = ref<Track[]>([]);
const name = ref("");
const loading = ref(false);
const error = ref("");

function back() {
  void router.push(`/artist/${props.id}`);
}

function playFrom(index: number) {
  if (tracks.value.length) void player.playQueue(tracks.value, index);
}

function shufflePlay() {
  if (!tracks.value.length) return;
  void player.playQueue(tracks.value, 0).then(() => {
    if (!player.shuffle) player.toggleShuffle();
  });
}

function enqueueAll() {
  if (!tracks.value.length) return;
  tracks.value.forEach((track) => player.enqueue(track));
  Notify.create({ message: `В очередь добавлено: ${tracks.value.length}` });
}

async function load() {
  error.value = "";
  name.value = readCache<ArtistPage>(`artist.${props.id}`)?.name ?? "";
  const key = `artist.tracks.${props.id}`;
  const cached = readCache<Track[]>(key) ?? [];
  tracks.value = cached;
  loading.value = !cached.length;

  await swr<Track[]>(key, () => api.artistTracks(props.id), {
    onData: (list) => {
      tracks.value = list;
      if (!list.length) error.value = "У артиста не нашлось доступных треков";
    },
    onSettled: () => {
      loading.value = false;
    },
  });
}

watch(() => props.id, load);
onMounted(load);
</script>
