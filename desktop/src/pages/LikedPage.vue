<template>
  <q-page class="flex flex-col h-[calc(100vh_-_52px_-_var(--player-height,_78px))] pt-[var(--page-top-gap)] px-[32px] pb-0 !min-h-0 !overflow-hidden">
    <div class="flex-none pb-[14px]">
      <div class="row items-end no-wrap" style="gap: 26px">
        <div
          class="cover rounded-[10px] overflow-hidden bg-[var(--surface-2)] flex items-center justify-center flex-none [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block"
          style="
            width: 132px;
            height: 132px;
            border-radius: 16px;
            background: var(--surface-2);
          "
        >
          <Icon name="mingcute:heart-fill" :size="40" />
        </div>
        <div class="col">
          <div
            class="text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))]"
            style="letter-spacing: 0.08em; text-transform: uppercase"
          >
            Плейлист
          </div>
          <div class="text-[calc(30px*var(--text-scale,1))] font-semibold tracking-[-0.03em] leading-[1.15] q-mt-xs">Мне нравится</div>
          <div class="text-[color:var(--fg-faint)] text-[calc(13px*var(--text-scale,1))] q-mt-sm">
            {{ plural(tracks.length, "трек", "трека", "треков") }}
          </div>

          <div class="row items-center q-mt-md" style="gap: 10px">
            <div class="inline-flex h-[34px] items-center justify-center px-[18px] py-0 border-0 rounded-[8px] !bg-[var(--accent)] text-[color:#fff] cursor-pointer text-[calc(12px*var(--text-scale,1))] font-medium gap-[7px] select-none transition-opacity duration-[120ms] ease-[ease] hover:opacity-[0.85] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none" @click="playFrom(0)">
              <Icon name="mingcute:play-fill" :size="15" />
              <span>Слушать</span>
            </div>
            <div class="inline-flex h-[32px] items-center justify-center px-[14px] py-0 border border-solid border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] cursor-pointer text-[calc(12px*var(--text-scale,1))] font-medium gap-[7px] select-none transition-[background,border-color,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none" @click="shufflePlay">
              <Icon name="mingcute:shuffle-line" :size="15" />
              <span>Перемешать</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center flex-auto">
      <q-spinner size="24px" color="primary" />
    </div>

    <div v-else class="flex flex-auto flex-col min-h-0 overflow-hidden overscroll-contain">
      <div class="flex-none flex items-center gap-[14px] h-[32px] px-[12px] py-0 text-[11px] font-semibold tracking-[0.06em] uppercase text-[color:var(--fg-faint)] border-b border-[var(--line)]">
        <div style="width: 20px; text-align: center">#</div>
        <div style="width: 38px" />
        <div class="col">Название</div>
        <div class="gt-sm" style="width: 190px">Альбом</div>
        <div style="width: 40px; text-align: right">Время</div>
      </div>

      <q-virtual-scroll
        v-if="tracks.length"
        v-slot="{ item, index }"
        class="flex-auto min-h-0 overflow-x-hidden overflow-y-auto pb-[18px] overscroll-contain [&_.q-virtual-scroll__content]:min-w-0"
        :items="tracks"
        :virtual-scroll-item-size="52"
        :virtual-scroll-slice-size="20"
      >
        <TrackRow
          :key="`${item.id}-${index}`"
          :track="item"
          :index="index"
          @play="playFrom(index)"
        />
      </q-virtual-scroll>

      <div v-else class="text-[color:var(--fg-dim)] text-[calc(13px*var(--text-scale,1))] q-py-xl">Здесь пока ничего нет</div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import TrackRow from "@/components/common/TrackRow.vue";
import { api } from "@/api/client";
import type { Track } from "@/api/types";
import { plural } from "@/lib/format";
import { readCache, swr } from "@/lib/cache";
import { usePlayerStore } from "@/stores/player/index";

const player = usePlayerStore();
const tracks = ref<Track[]>([]);
const loading = ref(false);

function playFrom(i: number) {
  if (tracks.value.length) void player.playQueue(tracks.value, i);
}

function shufflePlay() {
  if (!tracks.value.length) return;
  const start = Math.floor(Math.random() * tracks.value.length);
  void player.playQueue(tracks.value, start).then(() => {
    if (!player.shuffle) player.toggleShuffle();
  });
}

onMounted(() => {
  tracks.value = readCache<Track[]>("liked.tracks") ?? [];
  loading.value = !tracks.value.length;

  void swr<Track[]>("liked.tracks", () => api.likedTracks(), {
    onData: (data) => {
      tracks.value = data;
    },
    onSettled: () => {
      loading.value = false;
    },
  });
});
</script>
