<template>
  <div class="flex h-[calc(100vh_-_52px_-_var(--player-height,_78px))] flex-col px-[var(--page-padding)] py-0 !min-h-0 !overflow-hidden">
    <div class="flex items-end justify-between gap-[16px] min-w-0 pt-[var(--page-top-gap)] px-0 pb-[14px] max-[1024px]:flex-col max-[1024px]:items-start max-[1024px]:gap-[14px]">
      <div>
        <div class="text-[calc(30px*var(--text-scale,1))] font-semibold tracking-[-0.03em] leading-[1.15]">Поиск по библиотеке</div>
        <p class="mt-[6px] mx-0 mb-0 text-[color:var(--fg-faint)] text-[calc(13px*var(--text-scale,1))]">
          {{ index.length }} уникальных треков из
          {{ sources.length }} источников
          <span v-if="loading"> - загружаю {{ done }}/{{ total }}…</span>
        </p>
      </div>
      <button class="inline-flex items-center justify-center gap-[7px] h-[32px] px-[14px] py-0 border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer transition-[background,border-color,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none" :disabled="loading" @click="reload(true)">
        Обновить
      </button>
    </div>

    <div class="flex flex-auto flex-col min-h-0 overflow-hidden">
      <div
        ref="toolsRef"
        class="flex-none min-h-0 will-change-transform"
        :style="toolsStyle"
      >
        <div class="flex flex-col gap-[10px] pb-[10px]">
          <input
            v-model="query"
            class="w-full !h-[38px] flex items-center gap-[8px] px-[12px] py-0 rounded-[10px] bg-[var(--surface)] border border-transparent transition-[border-color,background] duration-[140ms] focus-within:border-[color:color-mix(in_srgb,var(--fg)_22%,transparent)] focus-within:bg-[var(--surface-2)] [&_input]:flex-1 [&_input]:min-w-0 [&_input]:border-0 [&_input]:bg-transparent [&_input]:outline-none [&_input]:text-[color:var(--fg)] [&_input]:text-[13px] [&_input::placeholder]:text-[color:var(--fg-faint)] [&_select]:w-full [&_select]:border-0 [&_select]:bg-transparent [&_select]:outline-none [&_select]:text-[color:var(--fg)] [&_select]:text-[13px] [&_select]:cursor-pointer"
            placeholder="Название, исполнитель или альбом…"
          />

          <div class="flex flex-wrap items-center gap-[8px]">
            <select
              v-model="source"
              class="!h-[32px] min-w-[150px] max-w-[220px] flex items-center gap-[8px] px-[12px] py-0 rounded-[10px] bg-[var(--surface)] border border-transparent transition-[border-color,background] duration-[140ms] focus-within:border-[color:color-mix(in_srgb,var(--fg)_22%,transparent)] focus-within:bg-[var(--surface-2)] [&_input]:flex-1 [&_input]:min-w-0 [&_input]:border-0 [&_input]:bg-transparent [&_input]:outline-none [&_input]:text-[color:var(--fg)] [&_input]:text-[13px] [&_input::placeholder]:text-[color:var(--fg-faint)] [&_select]:w-full [&_select]:border-0 [&_select]:bg-transparent [&_select]:outline-none [&_select]:text-[color:var(--fg)] [&_select]:text-[13px] [&_select]:cursor-pointer"
            >
              <option value="">Все источники</option>
              <option v-for="s in sources" :key="s" :value="s">{{ s }}</option>
            </select>

            <select
              v-model="artist"
              class="!h-[32px] min-w-[150px] max-w-[220px] flex items-center gap-[8px] px-[12px] py-0 rounded-[10px] bg-[var(--surface)] border border-transparent transition-[border-color,background] duration-[140ms] focus-within:border-[color:color-mix(in_srgb,var(--fg)_22%,transparent)] focus-within:bg-[var(--surface-2)] [&_input]:flex-1 [&_input]:min-w-0 [&_input]:border-0 [&_input]:bg-transparent [&_input]:outline-none [&_input]:text-[color:var(--fg)] [&_input]:text-[13px] [&_input::placeholder]:text-[color:var(--fg-faint)] [&_select]:w-full [&_select]:border-0 [&_select]:bg-transparent [&_select]:outline-none [&_select]:text-[color:var(--fg)] [&_select]:text-[13px] [&_select]:cursor-pointer"
            >
              <option value="">Все исполнители</option>
              <option v-for="a in artists" :key="a" :value="a">{{ a }}</option>
            </select>

            <select
              v-model="sort"
              class="!h-[32px] min-w-[150px] max-w-[220px] flex items-center gap-[8px] px-[12px] py-0 rounded-[10px] bg-[var(--surface)] border border-transparent transition-[border-color,background] duration-[140ms] focus-within:border-[color:color-mix(in_srgb,var(--fg)_22%,transparent)] focus-within:bg-[var(--surface-2)] [&_input]:flex-1 [&_input]:min-w-0 [&_input]:border-0 [&_input]:bg-transparent [&_input]:outline-none [&_input]:text-[color:var(--fg)] [&_input]:text-[13px] [&_input::placeholder]:text-[color:var(--fg-faint)] [&_select]:w-full [&_select]:border-0 [&_select]:bg-transparent [&_select]:outline-none [&_select]:text-[color:var(--fg)] [&_select]:text-[13px] [&_select]:cursor-pointer"
            >
              <option value="title">По названию</option>
              <option value="artist">По исполнителю</option>
              <option value="shortest">Сначала короткие</option>
              <option value="longest">Сначала длинные</option>
            </select>

            <label class="flex flex-col gap-[2px] min-w-[190px]">
              <span class="text-[color:var(--fg-faint)] text-[calc(12px*var(--text-scale,1))]">
                Длительность: {{ minMinutes }}-{{ maxMinutes }} мин
              </span>
              <q-range
                v-model="duration"
                :min="0"
                :max="20"
                :step="1"
                dense
                color="primary"
              />
            </label>

            <button
              class="inline-flex items-center justify-center gap-[7px] h-[32px] px-[14px] py-0 border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer transition-[background,border-color,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
              :class="
                onlyLiked
                  ? 'border-[color:var(--accent)] text-[color:var(--fg)]'
                  : ''
              "
              @click="onlyLiked = !onlyLiked"
            >
              Только любимые
            </button>
            <button class="inline-flex items-center justify-center gap-[7px] h-[32px] px-[14px] py-0 border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer transition-[background,border-color,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none" @click="resetFilters">Сбросить</button>
          </div>
        </div>

        <div class="flex items-center gap-[10px] pb-[8px]">
          <span class="text-[color:var(--fg-faint)] text-[calc(12px*var(--text-scale,1))]">Найдено треков: {{ results.length }}</span>
          <button
            class="inline-flex items-center justify-center gap-[7px] h-[34px] px-[18px] py-0 border-0 rounded-[8px] bg-[var(--accent)] text-white text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer transition-opacity duration-[120ms] hover:opacity-[0.85] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
            :disabled="!results.length"
            @click="playAll(0)"
          >
            Слушать найденное
          </button>
        </div>
      </div>

    <div
      class="flex-auto min-h-0 overflow-y-auto overscroll-contain pb-[20px]"
      @scroll="onListScroll"
    >
      <div v-if="loading && !index.length" class="row justify-center q-py-xl">
        <q-spinner size="24px" color="grey-6" />
      </div>

      <div v-else-if="!results.length" class="q-pa-md text-[color:var(--fg-faint)] text-[calc(13px*var(--text-scale,1))]">
        Ничего не нашлось. Попробуй другой запрос или сбрось фильтры.
      </div>

      <LazyTracks v-else :items="resultTracks" :initial="50" :step="50">
        <template #default="{ item, index: i }">
          <div
            class="flex items-center gap-[10px] px-[8px] py-[5px] rounded-[9px] cursor-pointer hover:bg-[var(--hover)]"
            :class="
              player.current?.id === item.id
                ? 'text-[color:var(--accent)]'
                : ''
            "
            @dblclick="playAll(i)"
          >
            <div class="cover w-[36px] h-[36px] rounded-[8px] flex-none overflow-hidden bg-[var(--surface-2)] flex items-center justify-center [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block" @click="playAll(i)">
              <img v-if="item.cover_url" :src="item.cover_url" loading="lazy" />
              <Icon v-else name="mingcute:music-line" :size="15" class="text-[color:var(--fg-faint)]" />
            </div>
            <div class="col" style="min-width: 0" @click="playAll(i)">
              <div class="truncate text-[calc(13px*var(--text-scale,1))]">{{ item.title }}</div>
              <div class="text-[color:var(--fg-faint)] text-[calc(11px*var(--text-scale,1))] truncate">
                <ArtistsLine :artists="item.artists" :limit="2" />
              </div>
            </div>
            <span
              v-if="sourceMap.get(item.id)?.length"
              class="text-[color:var(--fg-faint)] text-[calc(11px*var(--text-scale,1))] truncate cursor-pointer hover:text-[color:var(--fg)] hover:underline"
              :title="sourceTitle(item.id)"
              @click.stop
            >
              {{ sourceOf(item.id) }}
              <q-menu class="bg-[color-mix(in_srgb,var(--surface-2)_90%,transparent)] border border-[rgba(255,255,255,0.09)] rounded-[var(--radius)] overflow-x-hidden max-w-[268px] shadow-[0_16px_40px_rgba(0,0,0,0.55)] backdrop-blur-[var(--glass-blur,24px)]" anchor="bottom middle" self="top middle">
                <div class="p-[4px] min-w-[178px] max-w-[260px] overflow-x-hidden" style="min-width: 220px">
                  <div
                    v-for="src in sourceMap.get(item.id)"
                    :key="src"
                    class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:w-[15px] [&_svg]:h-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                    v-close-popup
                    @click="openSource(src, item.id)"
                  >
                    <Icon name="mingcute:playlist-2-line" :size="16" />
                    <span class="truncate">Открыть: {{ src }}</span>
                  </div>
                </div>
              </q-menu>
            </span>
            <span v-else class="max-w-[170px] flex-none text-[color:var(--fg-faint)] text-[calc(11px*var(--text-scale,1))] truncate" />
            <span class="text-[color:var(--fg-faint)] text-[calc(12px*var(--text-scale,1))]">
              {{ formatDuration(item.duration_ms || 0) }}
            </span>
            <div class="flex items-center justify-center text-[color:var(--fg-faint)] cursor-pointer p-0 border-0 appearance-none transition-[background,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] w-[30px] h-[30px] rounded-[8px]">
              <Icon name="mingcute:more-2-fill" :size="17" />
              <TrackMenu :track="item" />
            </div>
          </div>
        </template>
      </LazyTracks>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { Notify } from "quasar";
import { useRouter } from "vue-router";
import ArtistsLine from "@/components/common/ArtistsLine.vue";
import LazyTracks from "@/components/common/LazyTracks.vue";
import TrackMenu from "@/components/common/TrackMenu.vue";
import { api } from "@/api/client";
import type { Track } from "@/api/types";
import { readCache, writeCache } from "@/lib/cache";
import { artistNames, formatDuration } from "@/lib/format";
import { useLibraryStore } from "@/stores/library";
import { usePlayerStore } from "@/stores/player/index";

interface Entry {
  track: Track;
  sources: string[];
  search: string;
}

const library = useLibraryStore();
const player = usePlayerStore();
const router = useRouter();

const index = ref<Entry[]>([]);
const loading = ref(false);
const done = ref(0);
const total = ref(0);

const query = ref("");
const source = ref("");
const artist = ref("");
const sort = ref("title");
const onlyLiked = ref(false);
const duration = ref({ min: 0, max: 20 });
const toolsRef = ref<HTMLElement | null>(null);
const toolsOffset = ref(0);

const toolsStyle = computed(() => {
  const offset = toolsOffset.value;
  if (!offset) return undefined;
  return {
    transform: `translateY(-${offset}px)`,
    marginBottom: `-${offset}px`,
  };
});

function onListScroll(event: Event) {
  const target = event.target as HTMLElement | null;
  if (!target) return;
  const height = toolsRef.value?.offsetHeight ?? 0;
  toolsOffset.value = Math.min(Math.max(target.scrollTop, 0), height);
}

const minMinutes = computed(() => duration.value.min);
const maxMinutes = computed(() =>
  duration.value.max >= 20 ? "∞" : duration.value.max,
);

const sources = computed(() =>
  [...new Set(index.value.flatMap((entry) => entry.sources))].sort((a, b) =>
    a.localeCompare(b, "ru"),
  ),
);

const artists = computed(() =>
  [
    ...new Set(
      index.value.flatMap((entry) =>
        entry.track.artists.map((a) => a.name).filter(Boolean),
      ),
    ),
  ]
    .sort((a, b) => a.localeCompare(b, "ru"))
    .slice(0, 400),
);

const results = computed(() => {
  const text = query.value.trim().toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const min = duration.value.min * 60000;
  const max = duration.value.max >= 20 ? Infinity : duration.value.max * 60000;

  const rows = index.value.filter((entry) => {
    if (source.value && !entry.sources.includes(source.value)) return false;
    if (
      artist.value &&
      !entry.track.artists.some((a) => a.name === artist.value)
    )
      return false;
    if (onlyLiked.value && !library.liked(entry.track.id)) return false;
    const ms = entry.track.duration_ms ?? 0;
    if (ms && (ms < min || ms > max)) return false;
    return words.every((w) => entry.search.includes(w));
  });

  const sorted = [...rows];
  if (sort.value === "title")
    sorted.sort((a, b) => a.track.title.localeCompare(b.track.title, "ru"));
  else if (sort.value === "artist")
    sorted.sort((a, b) =>
      artistNames(a.track.artists).localeCompare(
        artistNames(b.track.artists),
        "ru",
      ),
    );
  else if (sort.value === "shortest")
    sorted.sort(
      (a, b) => (a.track.duration_ms ?? 0) - (b.track.duration_ms ?? 0),
    );
  else
    sorted.sort(
      (a, b) => (b.track.duration_ms ?? 0) - (a.track.duration_ms ?? 0),
    );

  return sorted;
});

const resultTracks = computed(() => results.value.map((entry) => entry.track));

const sourceMap = computed(() => {
  const map = new Map<string, string[]>();
  for (const entry of results.value) map.set(entry.track.id, entry.sources);
  return map;
});

function sourceOf(id: string): string {
  const list = sourceMap.value.get(id);
  if (!list?.length) return "";
  if (list.length === 1) return list[0]!;
  return `${list[0]!} +${list.length - 1}`;
}

function sourceTitle(id: string): string {
  return sourceMap.value.get(id)?.join(", ") ?? "";
}

const sourceKinds = computed(() => {
  const map = new Map<string, number>();
  for (const pl of library.playlists) map.set(pl.title, pl.kind);
  return map;
});

function openSource(src: string, trackId: string) {
  if (src === "Мне нравится") {
    void router.push("/liked");
    return;
  }
  const kind = sourceKinds.value.get(src);
  if (kind == null) return;
  void router.push({ path: `/playlists/${kind}`, query: { track: trackId } });
}

function resetFilters() {
  query.value = "";
  source.value = "";
  artist.value = "";
  onlyLiked.value = false;
  duration.value = { min: 0, max: 20 };
}

function playAll(startIndex: number) {
  if (!resultTracks.value.length) return;
  void player.playQueue(resultTracks.value, startIndex);
}

function toEntry(track: Track, source: string): Entry {
  return {
    track,
    sources: [source],
    search: `${track.title} ${artistNames(track.artists)} ${
      track.album_title ?? ""
    }`.toLowerCase(),
  };
}

function mergeEntries(target: Map<string, Entry>, rows: Entry[]): void {
  for (const row of rows) {
    const found = target.get(row.track.id);
    if (!found) {
      target.set(row.track.id, row);
      continue;
    }
    for (const name of row.sources) {
      if (!found.sources.includes(name)) found.sources.push(name);
    }
  }
}

async function loadSource(
  kind: number | "liked",
  title: string,
  force: boolean,
): Promise<Entry[]> {
  const key = kind === "liked" ? "liked.tracks" : `playlist.${kind}`;
  if (!force) {
    const cached = readCache<Track[]>(key);
    if (cached && Array.isArray(cached) && cached.length)
      return cached.map((track) => toEntry(track, title));
  }
  try {
    const tracks =
      kind === "liked"
        ? await api.likedTracks()
        : await api.playlistTracks(kind);
    writeCache(key, tracks);
    return tracks.map((track) => toEntry(track, title));
  } catch {
    return [];
  }
}

async function reload(force = false) {
  if (loading.value) return;
  loading.value = true;
  done.value = 0;

  if (!library.playlists.length) await library.init();

  const jobs: Array<{ kind: number | "liked"; title: string }> = [
    { kind: "liked", title: "Мне нравится" },
    ...library.playlists.map((pl) => ({ kind: pl.kind, title: pl.title })),
  ];
  total.value = jobs.length;

  const collected = new Map<string, Entry>();
  const queue = [...jobs];

  async function worker() {
    for (;;) {
      const job = queue.shift();
      if (!job) return;
      const rows = await loadSource(job.kind, job.title, force);
      mergeEntries(collected, rows);
      done.value += 1;
      index.value = [...collected.values()];
    }
  }

  await Promise.all([worker(), worker(), worker()]);

  loading.value = false;
  if (force) Notify.create({ message: "Библиотека обновлена" });
}

onMounted(() => {
  void reload(false);
});
</script>
