<template>
  <q-page class="flex flex-col h-[calc(100vh_-_52px_-_var(--player-height,_78px))] !min-h-0 !p-0 !overflow-hidden">
    <q-scroll-area class="flex-auto min-h-0">
      <div class="pt-[var(--page-top-gap)] px-[32px] pb-[46px]">
        <div class="text-[calc(30px*var(--text-scale,1))] font-semibold tracking-[-0.03em] leading-[1.15]">Поиск</div>

        <div class="relative w-full max-w-[460px] q-mt-lg">
          <div class="flex items-center gap-[8px] h-[36px] px-[12px] py-0 rounded-[10px] bg-[var(--surface)] border border-transparent transition-[border-color,background] duration-[140ms] ease-[ease] focus-within:border-[color:rgba(255,255,255,0.16)] focus-within:bg-[var(--surface-2)] [&_input]:flex-1 [&_input]:min-w-0 [&_input]:bg-transparent [&_input]:outline-none [&_input]:text-[color:var(--fg)] [&_input]:text-[13px] [&_input]:border-0 [&_input]:font-[inherit] [&_input::placeholder]:text-[color:var(--fg-faint)] [&_select]:w-full [&_select]:border-0 [&_select]:bg-transparent [&_select]:outline-none [&_select]:text-[color:var(--fg)] [&_select]:text-[13px] [&_select]:cursor-pointer">
            <Icon name="mingcute:search-2-line" :size="16" class="text-[color:var(--fg-faint)]" />
            <input
              v-model="text"
              type="text"
              spellcheck="false"
              placeholder="Треки, артисты, альбомы"
              @keyup.enter="submit"
              @keydown.esc="closeSuggest"
              @focus="suggestOpen = true"
              @blur="closeSuggestSoon"
            />
            <button
              v-if="text"
              class="flex w-[22px] h-[22px] flex-none items-center justify-center rounded-[6px] text-[color:var(--fg-faint)] cursor-pointer select-none transition-[background,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] p-0 border-0 appearance-none"
              type="button"
              title="Очистить"
              @click="clearQuery"
            >
              <Icon name="mingcute:close-line" :size="13" />
            </button>
          </div>

          <div
            v-if="suggestOpen && suggestions.length"
            class="absolute z-[20] top-[calc(100%_+_6px)] right-0 left-0 overflow-hidden p-[6px] border border-[color:var(--line)] rounded-[var(--radius)] bg-[var(--surface-2)] shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
          >
            <button
              v-for="hint in suggestions"
              :key="hint"
              class="flex w-full items-center px-[10px] py-[8px] border-0 rounded-[8px] text-[color:var(--fg-dim)] cursor-pointer text-[13px] gap-[9px] text-left font-[inherit] transition-[background,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]"
              type="button"
              @mousedown.prevent="pick(hint)"
            >
              <Icon name="mingcute:search-2-line" :size="14" class="text-[color:var(--fg-faint)]" />
              <span class="truncate">{{ hint }}</span>
            </button>
          </div>
        </div>

        <div v-if="loading" class="q-mt-xl">
          <q-spinner size="24px" color="primary" />
        </div>

        <template v-else-if="result">
          <template v-if="result.artists.length">
            <div class="text-[calc(17px*var(--text-scale,1))] font-semibold tracking-[-0.02em] q-mt-xl q-mb-md">Артисты</div>
            <div class="row q-col-gutter-md">
              <div v-for="a in result.artists" :key="a.id" class="col-auto">
                <div
                  class="text-center rounded-[14px] p-[10px] cursor-pointer transition-[background] duration-[160ms] ease-[ease] hover:bg-[var(--surface)]"
                  style="width: 132px"
                  @click="router.push(`/artist/${a.id}`)"
                >
                  <div class="cover cover-round rounded-full overflow-hidden bg-[var(--surface-2)] flex items-center justify-center flex-none [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block" style="width: 100%; aspect-ratio: 1">
                    <img
                      v-if="avatarOf(a)"
                      loading="lazy"
                      decoding="async"
                      :src="avatarOf(a) ?? undefined"
                    />
                    <Icon v-else name="mingcute:user-2-line" :size="24" class="text-[color:var(--fg-faint)]" />
                  </div>
                  <div class="text-[calc(13px*var(--text-scale,1))] font-medium truncate q-mt-sm">{{ a.name }}</div>
                </div>
              </div>
            </div>
          </template>

          <template v-if="genius.ready && genius.people.length">
            <div class="text-[calc(17px*var(--text-scale,1))] font-semibold tracking-[-0.02em] q-mt-xl q-mb-md">Авторы и продюсеры</div>
            <div class="row q-col-gutter-md">
              <div v-for="p in genius.people" :key="p.id" class="col-auto">
                <div
                  class="text-center rounded-[14px] p-[10px] cursor-pointer transition-[background] duration-[160ms] ease-[ease] hover:bg-[var(--surface)]"
                  style="width: 132px"
                  @click="openPerson(p.id)"
                >
                  <div class="cover cover-round rounded-full overflow-hidden bg-[var(--surface-2)] flex items-center justify-center flex-none [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block" style="width: 100%; aspect-ratio: 1">
                    <img
                      v-if="p.image"
                      loading="lazy"
                      decoding="async"
                      :src="p.image"
                    />
                    <Icon v-else name="mingcute:user-2-line" :size="24" class="text-[color:var(--fg-faint)]" />
                  </div>
                  <div class="text-[calc(13px*var(--text-scale,1))] font-medium truncate q-mt-sm">{{ p.name }}</div>
                  <div class="text-[color:var(--fg-faint)] text-[calc(11px*var(--text-scale,1))]">
                    {{ p.verified ? "genius · ✓" : "genius" }}
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template v-if="result.albums.length">
            <div class="text-[calc(17px*var(--text-scale,1))] font-semibold tracking-[-0.02em] q-mt-xl q-mb-md">Альбомы</div>
            <div class="row q-col-gutter-md">
              <div v-for="al in result.albums" :key="al.id" class="col-auto">
                <div
                  class="rounded-[14px] p-[10px] cursor-pointer transition-[background] duration-[160ms] ease-[ease] hover:bg-[var(--surface)]"
                  style="width: 150px"
                  @click="router.push(`/album/${al.id}`)"
                >
                  <div class="cover rounded-[10px] overflow-hidden bg-[var(--surface-2)] flex items-center justify-center flex-none [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block" style="width: 100%; aspect-ratio: 1">
                    <img
                      loading="lazy"
                      decoding="async"
                      v-if="al.cover_url"
                      :src="al.cover_url"
                    />
                    <Icon v-else name="mingcute:album-line" :size="24" class="text-[color:var(--fg-faint)]" />
                  </div>
                  <div class="text-[calc(13px*var(--text-scale,1))] font-medium truncate q-mt-sm">{{ al.title }}</div>
                  <div class="text-[color:var(--fg-faint)] text-[calc(11px*var(--text-scale,1))]">{{ al.year || "" }}</div>
                </div>
              </div>
            </div>
          </template>

          <template v-if="result.tracks.length">
            <div class="text-[calc(17px*var(--text-scale,1))] font-semibold tracking-[-0.02em] q-mt-xl q-mb-sm">Треки</div>
            <LazyTracks v-slot="{ item, index }" :items="result.tracks">
              <TrackRow :track="item" :index="index" @play="playFrom(index)" />
            </LazyTracks>
          </template>

          <div
            v-if="
              !result.tracks.length &&
              !result.artists.length &&
              !result.albums.length
            "
            class="text-[color:var(--fg-dim)] text-[calc(13px*var(--text-scale,1))] q-mt-xl"
          >
            Ничего не нашлось
          </div>
        </template>
      </div>
    </q-scroll-area>
  </q-page>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import LazyTracks from "@/components/common/LazyTracks.vue";
import TrackRow from "@/components/common/TrackRow.vue";
import { api } from "@/api/client";
import type { Artist, SearchResult } from "@/api/types";
import { cachedAvatar, fetchAvatars } from "@/lib/artistAvatar";
import { usePlayerStore } from "@/stores/player/index";
import { useGeniusStore } from "@/stores/genius";

const route = useRoute();
const router = useRouter();
const player = usePlayerStore();
const genius = useGeniusStore();

const text = ref("");
const result = ref<SearchResult | null>(null);
const loading = ref(false);
const avatars = ref<Record<string, string | null>>({});

function avatarOf(artist: Artist): string | null {
  return artist.cover_url || avatars.value[artist.id] || null;
}

async function loadAvatars(artists: Artist[]) {
  const missing = artists.filter((a) => !a.cover_url);
  if (!missing.length) return;
  const next: Record<string, string | null> = { ...avatars.value };
  for (const artist of missing) {
    const cached = cachedAvatar(artist.id);
    if (cached) next[artist.id] = cached;
  }
  avatars.value = next;
  const loaded = await fetchAvatars(missing.map((a) => a.id));
  avatars.value = { ...avatars.value, ...loaded };
}

function playFrom(i: number) {
  const tracks = result.value?.tracks || [];
  if (tracks.length) void player.playQueue(tracks, i);
}

const suggestions = ref<string[]>([]);
const suggestOpen = ref(false);
let suggestTimer: ReturnType<typeof setTimeout> | undefined;
let blurTimer: ReturnType<typeof setTimeout> | undefined;

function closeSuggest() {
  suggestOpen.value = false;
}

function closeSuggestSoon() {
  blurTimer = setTimeout(closeSuggest, 120);
}

function clearQuery() {
  text.value = "";
  suggestions.value = [];
  result.value = null;
}

function pick(hint: string) {
  clearTimeout(blurTimer);
  text.value = hint;
  suggestions.value = [];
  suggestOpen.value = false;
  void run();
}

function submit() {
  suggestions.value = [];
  suggestOpen.value = false;
  void run();
}

watch(text, (value) => {
  clearTimeout(suggestTimer);
  const q = value.trim();
  if (q.length < 2) {
    suggestions.value = [];
    return;
  }
  suggestTimer = setTimeout(() => {
    void api
      .searchSuggest(q)
      .then((list) => {
        suggestions.value = list.filter(
          (hint) => hint.toLowerCase() !== q.toLowerCase(),
        );
      })
      .catch(() => {
        suggestions.value = [];
      });
  }, 220);
});

async function run() {
  const q = text.value.trim();
  if (!q) return;
  loading.value = true;
  if (genius.ready) void genius.searchPeople(q);
  result.value = await api
    .search(q)
    .catch(() => ({ tracks: [], artists: [], albums: [] }));
  loading.value = false;
  void loadAvatars(result.value?.artists ?? []);
}

function openPerson(id: number) {
  void router.push({ name: "genius-artist", params: { id: String(id) } });
}

watch(
  () => route.query.q,
  (q) => {
    if (typeof q === "string" && q) {
      text.value = q;
      void run();
    }
  },
);

onMounted(() => {
  const q = route.query.q;
  if (typeof q === "string" && q) {
    text.value = q;
    void run();
  }
});
onBeforeUnmount(() => {
  clearTimeout(suggestTimer);
  clearTimeout(blurTimer);
});
</script>
