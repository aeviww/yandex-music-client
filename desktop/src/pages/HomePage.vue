<template>
  <q-page class="h-[calc(100vh-52px-var(--player-height,78px))] !min-h-0 !overflow-hidden">
    <q-scroll-area class="home-scroll">
      <div class="min-w-0 pb-[56px]">
        <div
          class="mx-auto w-full max-w-[1240px] px-[var(--page-padding,40px)]"
        >
          <header class="home-header">
            <div class="home-intro">
              <h1 class="home-greeting">
                {{ greeting
                }}<template v-if="userName">, {{ userName }}</template>
              </h1>
              <p class="home-subtitle">ваша музыка на сегодня</p>
            </div>

            <div class="home-actions">
              <button :class="quickPrimary" type="button" @click="openWave">
                <Icon name="mingcute:wave-line" :size="16" class="flex-none" />
                <span>Моя волна</span>
              </button>
              <button
                :class="quickGhost"
                type="button"
                @click="router.push('/playlists')"
              >
                <Icon name="mingcute:book-2-line" :size="15" class="flex-none" />
                <span>Коллекция</span>
              </button>
              <button
                :class="quickGhost"
                type="button"
                @click="router.push('/search')"
              >
                <Icon
                  name="mingcute:search-2-line"
                  :size="15"
                  class="flex-none"
                />
                <span>Поиск</span>
              </button>
            </div>
          </header>

          <template v-if="visiblePlaylists.length">
            <div class="section-head home-section-head">
              <h2 class="home-section-title">для тебя</h2>
              <button
                class="more-link"
                type="button"
                @click="router.push('/playlists')"
              >
                <span>смотреть всё</span>
                <Icon name="mingcute:arrow-right-line" :size="13" />
              </button>
            </div>

            <div :class="[strip, colsLg]">
              <div
                v-for="pl in visiblePlaylists"
                :key="pl.kind"
                class="card home-card group relative min-w-0"
                @click="router.push(`/playlists/${pl.kind}`)"
              >
                <div class="cover relative aspect-square w-full">
                  <img
                    v-if="pl.cover_url"
                    loading="lazy"
                    decoding="async"
                    :src="pl.cover_url"
                  />
                  <Icon
                    v-else
                    name="mingcute:playlist-2-line"
                    :size="24"
                    class="faint"
                  />

                  <button
                    :class="fab"
                    type="button"
                    title="Слушать"
                    @click.stop="playPlaylist(pl)"
                  >
                    <Icon name="mingcute:play-fill" :size="15" />
                  </button>

                  <span
                    v-if="library.isPinned(pl.kind)"
                    class="absolute left-[10px] top-[10px] flex h-[24px] w-[24px] items-center justify-center rounded-full bg-black/55 text-[color:var(--fg)]"
                    title="Закреплён в боковой панели"
                  >
                    <Icon name="mingcute:pin-2-line" :size="11" />
                  </span>
                </div>

                <div class="home-card-title ellipsis">{{ pl.title }}</div>
                <div class="home-card-meta ellipsis">
                  {{ plural(pl.track_count, "трек", "трека", "треков") }}
                </div>

                <q-menu context-menu touch-position class="menu">
                  <div class="menu-body" style="min-width: 216px">
                    <div
                      class="menu-item"
                      v-close-popup
                      @click="playPlaylist(pl)"
                    >
                      <Icon name="mingcute:play-fill" :size="17" />
                      <span>Слушать</span>
                    </div>
                    <div
                      class="menu-item"
                      v-close-popup
                      @click="router.push(`/playlists/${pl.kind}`)"
                    >
                      <Icon name="mingcute:playlist-2-line" :size="17" />
                      <span>Открыть плейлист</span>
                    </div>
                    <div
                      class="menu-item"
                      v-close-popup
                      @click="library.togglePin(pl.kind)"
                    >
                      <Icon
                        :name="
                          library.isPinned(pl.kind)
                            ? 'gravity-ui:pin-slash'
                            : 'mingcute:pin-2-line'
                        "
                        :size="17"
                      />
                      <span>{{
                        library.isPinned(pl.kind) ? "Открепить" : "Закрепить"
                      }}</span>
                    </div>

                    <div class="menu-sep" />

                    <div class="menu-item" v-close-popup @click="rename(pl)">
                      <Icon name="mingcute:pencil-line" :size="17" />
                      <span>Переименовать</span>
                    </div>
                    <div
                      class="menu-item"
                      v-close-popup
                      @click="library.setPlaylistPublic(pl.kind, true)"
                    >
                      <Icon name="mingcute:share-2-line" :size="17" />
                      <span>Сделать публичным</span>
                    </div>
                    <div
                      class="menu-item"
                      v-close-popup
                      @click="library.setPlaylistPublic(pl.kind, false)"
                    >
                      <Icon name="mingcute:user-2-line" :size="17" />
                      <span>Сделать личным</span>
                    </div>

                    <div class="menu-sep" />

                    <div
                      class="menu-item danger"
                      v-close-popup
                      @click="removePlaylist(pl)"
                    >
                      <Icon name="mingcute:delete-2-line" :size="17" />
                      <span>Удалить плейлист</span>
                    </div>
                  </div>
                </q-menu>
              </div>
            </div>
          </template>

          <div class="section-head home-section-head">
            <h2 class="home-section-title">
              недавно прослушанные
            </h2>
          </div>

          <div :class="[strip, colsMd]">
            <template v-if="recent.length">
              <div
                v-for="r in recent"
                :key="r.id"
                class="card home-card group relative min-w-0"
                @click="openRecent(r)"
              >
                <div class="cover relative aspect-square w-full">
                  <img
                    v-if="r.cover_url"
                    loading="lazy"
                    decoding="async"
                    :src="r.cover_url"
                  />
                  <Icon
                    v-else
                    name="mingcute:album-line"
                    :size="22"
                    class="faint"
                  />

                  <button
                    :class="fab"
                    type="button"
                    title="Слушать"
                    @click.stop="playRecent(r)"
                  >
                    <Icon name="mingcute:play-fill" :size="15" />
                  </button>
                </div>
                <div
                  class="home-card-title ellipsis"
                >
                  {{ r.title }}
                </div>
                <div class="home-card-meta ellipsis">{{ r.subtitle }}</div>
              </div>
            </template>

            <template v-else>
              <div
                class="col-span-full py-[28px] text-[13.5px] text-[color:var(--fg-faint)]"
              >
                тут появится то, что послушаешь
              </div>
            </template>
          </div>

          <div class="section-head home-section-head">
            <h2 class="home-section-title">
              новые релизы
            </h2>
          </div>

          <div :class="[strip, colsSm]">
            <template v-if="releases.length">
              <div
                v-for="a in releases"
                :key="a.id"
                class="card home-card group relative min-w-0"
                @click="router.push(`/album/${a.id}`)"
              >
                <div class="cover relative aspect-square w-full">
                  <img
                    v-if="a.cover_url"
                    loading="lazy"
                    decoding="async"
                    :src="a.cover_url"
                  />
                  <Icon
                    v-else
                    name="mingcute:album-line"
                    :size="22"
                    class="faint"
                  />

                  <button
                    :class="fab"
                    type="button"
                    title="Слушать"
                    @click.stop="playAlbum(a.id)"
                  >
                    <Icon name="mingcute:play-fill" :size="15" />
                  </button>
                </div>
                <div
                  class="home-card-title ellipsis"
                >
                  {{ a.title }}
                </div>
                <div class="home-card-meta ellipsis">
                  {{ a.artist || a.year || "" }}
                </div>
              </div>
            </template>

            <template v-else>
              <div v-for="n in 12" :key="n" class="min-w-0">
                <div
                  class="relative aspect-square w-full overflow-hidden rounded-[10px] bg-[var(--surface)]"
                />
                <div
                  class="mt-[10px] h-[11px] w-[70%] rounded bg-[var(--surface)]"
                />
                <div
                  class="mt-[6px] h-[9px] w-[45%] rounded bg-[var(--surface)]"
                />
              </div>
            </template>
          </div>

          <template v-if="picks.length">
            <div class="section-head home-section-head">
              <h2 class="home-section-title">
                новое для тебя
              </h2>
            </div>

            <div :class="[strip, colsSm]">
              <div
                v-for="p in picks"
                :key="`${p.kind}-${p.id}`"
                class="card home-card group relative min-w-0"
                @click="openPick(p)"
              >
                <div
                  class="cover home-card-art relative aspect-square w-full"
                  :class="{ round: p.kind === 'artist' }"
                  :style="p.color ? { background: p.color } : {}"
                >
                  <img
                    v-if="p.cover_url"
                    loading="lazy"
                    decoding="async"
                    :src="p.cover_url"
                  />
                  <Icon
                    v-else
                    :name="
                      p.kind === 'artist'
                        ? 'mingcute:user-2-line'
                        : 'mingcute:album-line'
                    "
                    :size="22"
                    class="faint"
                  />

                  <button
                    :class="fab"
                    type="button"
                    title="Слушать"
                    @click.stop="playPick(p)"
                  >
                    <Icon name="mingcute:play-fill" :size="15" />
                  </button>
                </div>

                <div
                  class="home-card-title ellipsis"
                >
                  {{ p.name }}
                </div>
                <div class="home-card-meta ellipsis">
                  {{
                    p.artists.length ? artistNames(p.artists) : p.description
                  }}
                </div>

                <q-menu context-menu touch-position class="menu">
                  <div class="menu-body" style="min-width: 212px">
                    <div class="menu-item" v-close-popup @click="playPick(p)">
                      <Icon name="mingcute:play-fill" :size="17" />
                      <span>Слушать</span>
                    </div>
                    <div class="menu-item" v-close-popup @click="openPick(p)">
                      <Icon
                        :name="
                          p.kind === 'artist'
                            ? 'mingcute:mic-line'
                            : 'mingcute:album-line'
                        "
                        :size="17"
                      />
                      <span>{{
                        p.kind === "artist"
                          ? "Открыть артиста"
                          : "Открыть альбом"
                      }}</span>
                    </div>
                    <div class="menu-item" v-close-popup @click="waveFrom(p)">
                      <Icon name="mingcute:wave-line" :size="17" />
                      <span>Волна по этому</span>
                    </div>
                  </div>
                </q-menu>
              </div>
            </div>
          </template>

          <template v-if="waves.length">
            <div class="section-head home-section-head">
              <h2 class="home-section-title">
                миксы для тебя
              </h2>
              <button
                class="more-link"
                type="button"
                @click="router.push('/wave')"
              >
                <span>смотреть всё</span>
                <Icon name="mingcute:arrow-right-line" :size="13" />
              </button>
            </div>

            <div :class="[strip, colsMd]">
              <div
                v-for="w in waves"
                :key="w.id"
                class="card home-card group relative min-w-0"
                @click="playWave(w)"
              >
                <div
                  class="cover round relative aspect-square w-full"
                  :style="w.color ? { background: w.color } : {}"
                >
                  <img
                    v-if="w.cover_url"
                    loading="lazy"
                    decoding="async"
                    :src="w.cover_url"
                  />
                  <Icon
                    v-else
                    name="mingcute:wave-line"
                    :size="20"
                    class="faint"
                  />

                  <span :class="fab" title="Запустить">
                    <Icon name="mingcute:play-fill" :size="15" />
                  </span>
                </div>

                <div
                  class="home-card-title clamp-2"
                >
                  {{ w.name }}
                </div>
                <div class="home-card-meta ellipsis">{{ w.description }}</div>

                <q-menu context-menu touch-position class="menu">
                  <div class="menu-body" style="min-width: 200px">
                    <div class="menu-item" v-close-popup @click="playWave(w)">
                      <Icon name="mingcute:play-fill" :size="17" />
                      <span>Запустить волну</span>
                    </div>
                    <div
                      class="menu-item"
                      v-close-popup
                      @click="router.push('/wave')"
                    >
                      <Icon name="mingcute:wave-line" :size="17" />
                      <span>Открыть страницу волны</span>
                    </div>
                  </div>
                </q-menu>
              </div>
            </div>
          </template>

          <template v-if="neuroItems.length">
            <div class="section-head home-section-head">
              <h2 class="home-section-title">
                нейромузыка
              </h2>
            </div>
            <p
              class="mb-0 mt-[-6px] text-[12px] text-[color:var(--fg-faint)]"
            >
              отвлечёт от шума и сфокусирует на важном
            </p>

            <div :class="[strip, colsMd]" class="mt-[16px]">
              <div
                v-for="n in neuroItems"
                :key="n.id"
                class="card home-card group relative min-w-0"
                @click="playNeuro(n)"
              >
                <div
                  class="cover relative aspect-square w-full"
                  :style="n.color ? { background: n.color } : {}"
                >
                  <img
                    v-if="n.cover_url"
                    loading="lazy"
                    decoding="async"
                    :src="n.cover_url"
                  />
                  <Icon
                    v-else
                    name="mingcute:wave-line"
                    :size="20"
                    class="faint"
                  />

                  <span :class="fab" title="Слушать">
                    <Icon
                      :name="
                        neuro.item?.id === n.id && neuro.playing
                          ? 'mingcute:sound-fill'
                          : 'mingcute:play-fill'
                      "
                      :size="15"
                    />
                  </span>
                </div>
                <div
                  class="home-card-title ellipsis"
                >
                  {{ n.title }}
                </div>
                <div class="home-card-meta ellipsis">нейромузыка</div>
              </div>
            </div>
          </template>

          <div v-if="loading" class="mt-8">
            <q-spinner size="20px" color="primary" />
          </div>

          <footer
            class="mt-9 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-[var(--line)] pb-7 pt-4 text-[11.5px] leading-relaxed text-[color:var(--fg-faint)]"
          >
            <span
              class="font-semibold text-[color:var(--fg-dim)]"
              :title="commitTitle"
              >mashiro{{ commit ? ` · ${commit}` : "" }}</span
            >
            <span>неофициальный десктоп-клиент Я.Музыки</span>
            <a
              class="cursor-pointer transition-colors hover:text-[color:var(--fg-dim)]"
              title="Открыть GitHub автора"
              @click.prevent="openAboutLink(AUTHOR_URL)"
              >автор: aeviww</a
            >
            <a
              class="cursor-pointer transition-colors hover:text-[color:var(--fg-dim)]"
              title="Лицензия проекта"
              @click.prevent="openAboutLink(LICENSE_URL)"
              >GPL-3.0</a
            >
            <span
              class="text-[color:color-mix(in_srgb,var(--fg-faint)_70%,transparent)]"
              >ООО «Яндекс» к проекту отношения не имеет</span
            >
          </footer>
        </div>
      </div>
    </q-scroll-area>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Notify } from "quasar";
import { api } from "@/api/client";
import type {
  AlbumBrief,
  NeuroItem,
  Playlist,
  Track,
  WheelItem,
} from "@/api/types";
import { artistNames, plural } from "@/lib/format";
import { askConfirm, askText } from "@/lib/dialogs";
import { readCache, swr, writeCache } from "@/lib/cache";
import { neuro, startNeuro } from "@/lib/neuro";
import { useLibraryStore } from "@/stores/library";
import { usePlayerStore } from "@/stores/player/index";
import { useStatsStore } from "@/stores/stats";

interface RecentItem {
  id: string;
  title: string;
  subtitle: string;
  cover_url?: string | null;
  albumId: string | null;
  artistId: string;
}

const router = useRouter();
const player = usePlayerStore();
const library = useLibraryStore();
const stats = useStatsStore();
const playlists = ref<Playlist[]>([]);
const wheel = ref<WheelItem[]>([]);
const releases = ref<AlbumBrief[]>([]);
const neuroItems = ref<NeuroItem[]>([]);
const loading = ref(false);

const userName = ref("");

const recent = computed<RecentItem[]>(() => {
  const seen = new Set<string>();
  const out: RecentItem[] = [];
  for (let i = stats.events.length - 1; i >= 0 && out.length < 14; i--) {
    const e = stats.events[i];
    if (e.seconds < 20 || seen.has(e.id)) continue;
    seen.add(e.id);
    out.push({
      id: e.id,
      title: e.title,
      subtitle: e.artist,
      cover_url: e.cover,
      albumId: e.albumId ?? null,
      artistId: e.artistId,
    });
  }
  return out;
});

async function openRecent(item: RecentItem) {
  const to = item.albumId
    ? `/album/${item.albumId}`
    : item.artistId
      ? `/artist/${item.artistId}`
      : "";
  if (to) void router.push(to);
}

async function playRecent(item: RecentItem) {
  try {
    const track = await api.track(item.id);
    await player.playQueue([track], 0);
  } catch {
    Notify.create({ message: "Не удалось загрузить трек" });
  }
}

const hiddenWaves = ["встряхнуть", "назад к привычному"];

const strip =
  "grid grid-rows-[auto] auto-rows-[0px] gap-x-[18px] gap-y-0 overflow-hidden";
const colsLg = "grid-cols-[repeat(auto-fill,minmax(190px,1fr))]";
const colsMd = "grid-cols-[repeat(auto-fill,minmax(160px,1fr))]";
const colsSm = "grid-cols-[repeat(auto-fill,minmax(144px,1fr))]";
const quickPrimary =
  "flex h-10 flex-nowrap items-center gap-[9px] rounded-[10px] border-0 bg-[var(--accent)] px-4 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";
const quickGhost =
  "flex h-10 flex-nowrap items-center gap-[9px] rounded-[10px] border border-[var(--line)] bg-transparent px-4 text-[13px] font-medium text-[color:var(--fg-dim)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fg)]";

const fab =
  "absolute bottom-[10px] right-[10px] flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full border-0 bg-[var(--accent)] p-0 text-white opacity-0 translate-y-[6px] transition-[opacity,transform] duration-[140ms] ease-[ease] group-hover:opacity-100 group-hover:translate-y-0";

const visiblePlaylists = computed(() =>
  playlists.value.filter((pl) => !library.isHidden(pl.kind)),
);

const waves = computed(() =>
  wheel.value.filter((item) => {
    if (item.kind !== "wave") return false;
    const name = (item.name ?? "").toLowerCase();
    return !hiddenWaves.some((h) => name.includes(h));
  }),
);
const picks = computed(() =>
  wheel.value.filter((item) => item.kind !== "wave"),
);

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 6) return "доброй ночи";
  if (hour < 12) return "доброе утро";
  if (hour < 18) return "добрый день";
  return "добрый вечер";
});

async function playPlaylist(pl: Playlist) {
  try {
    const tracks =
      readCache<Track[]>(`playlist.${pl.kind}`) ??
      (await api.playlistTracks(pl.kind));
    if (!tracks.length) {
      Notify.create({ message: "Плейлист пуст" });
      return;
    }
    await player.playQueue(tracks, 0);
  } catch {
    Notify.create({ message: "Не удалось загрузить плейлист" });
  }
}

async function playPick(item: WheelItem) {
  if (item.kind === "album") {
    try {
      const album = await api.album(item.id);
      if (!album.tracks.length) {
        Notify.create({ message: "В альбоме нет доступных треков" });
        return;
      }
      await player.playQueue(album.tracks, 0);
    } catch {
      Notify.create({ message: "Не удалось загрузить альбом" });
    }
    return;
  }
  waveFrom(item);
}

function openWave() {
  void player.startWave(undefined, "Моя волна");
  void router.push("/wave");
}

function waveFrom(item: WheelItem) {
  const station =
    item.kind === "artist" ? `artist:${item.id}` : `album:${item.id}`;
  void player.startWave(station, item.name);
  void router.push("/wave");
}

function playWave(item: WheelItem) {
  void player.startWave(item.station || item.id, item.name);
  void router.push("/wave");
}

function openPick(item: WheelItem) {
  if (item.kind === "album") void router.push(`/album/${item.id}`);
  else if (item.kind === "artist") void router.push(`/artist/${item.id}`);
}

function syncCache() {
  writeCache("home.playlists", playlists.value);
}

async function rename(pl: Playlist) {
  const next = await askText({
    title: "Переименовать плейлист",
    value: pl.title,
    placeholder: "Название плейлиста",
  });
  if (!next || next === pl.title) return;
  if (await library.renamePlaylist(pl.kind, next)) {
    pl.title = next;
    syncCache();
  }
}

async function removePlaylist(pl: Playlist) {
  const ok = await askConfirm({
    title: "Удалить плейлист?",
    message: `«${pl.title}» исчезнет из Яндекс Музыки.`,
    okLabel: "Удалить",
    danger: true,
  });
  if (!ok) return;
  if (await library.deletePlaylist(pl.kind)) {
    playlists.value = playlists.value.filter((item) => item.kind !== pl.kind);
    syncCache();
  }
}

onMounted(() => {
  playlists.value = readCache<Playlist[]>("home.playlists") ?? [];
  wheel.value = readCache<WheelItem[]>("home.wheel") ?? [];
  releases.value = readCache<AlbumBrief[]>("home.newReleases.v2") ?? [];
  loading.value = !playlists.value.length && !wheel.value.length;

  void swr<Playlist[]>("home.playlists", () => api.playlists(), {
    onData: (data) => {
      playlists.value = data;
    },
    onSettled: () => {
      loading.value = false;
    },
  });

  void swr<WheelItem[]>("home.wheel", () => api.wheel(), {
    onData: (data) => {
      wheel.value = data;
    },
    onSettled: () => {
      loading.value = false;
    },
  });

  void swr<AlbumBrief[]>("home.newReleases.v2", () => api.newReleases(), {
    onData: (data) => {
      releases.value = data;
    },
  });

  neuroItems.value = readCache<NeuroItem[]>("home.neuro") ?? [];
  void swr<NeuroItem[]>("home.neuro", () => api.neuroItems(), {
    onData: (data) => {
      neuroItems.value = data;
    },
  });
});

function playNeuro(item: NeuroItem) {
  if (neuro.item?.id === item.id && neuro.playing) {
    Notify.create({ message: "Уже играет: " + item.title });
    return;
  }
  void startNeuro(item);
}

const AUTHOR_URL = "https://github.com/aeviww";
const LICENSE_URL = "https://www.gnu.org/licenses/gpl-3.0.html";

const commit =
  typeof __APP_COMMIT__ === "string" ? __APP_COMMIT__ : "local";
const commitTitle = `сборка от коммита ${__APP_COMMIT__} · ${__APP_COMMIT_DATE__}`;

function openAboutLink(url: string) {
  void api.openExternal(url);
}

async function playAlbum(id: string) {
  try {
    const album = await api.album(id);
    if (!album.tracks.length) {
      Notify.create({ message: "В альбоме нет доступных треков" });
      return;
    }
    await player.playQueue(album.tracks, 0);
  } catch {
    Notify.create({ message: "Не удалось загрузить альбом" });
  }
}
</script>

<style scoped>
.home-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px 36px;
  padding: 34px 0 28px;
  border-bottom: 1px solid var(--line);
}

.home-intro {
  min-width: 0;
}

.home-greeting {
  margin: 0;
  font-size: clamp(32px, 3.8vw, 48px);
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: -0.05em;
}

.home-subtitle {
  margin: 10px 0 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--fg-dim);
}

.home-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding-bottom: 3px;
}

.home-section-head {
  align-items: baseline;
  margin: 38px 0 14px;
}

.home-section-title {
  margin: 0;
  font-size: clamp(18px, 1.6vw, 21px);
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.03em;
}

.home-section-head .more-link {
  font-size: 13px;
  color: var(--fg-dim);
}

.home-card {
  padding: 8px;
}

.home-card .cover {
  border-radius: 12px;
}

.home-card-title {
  margin-top: 9px;
  font-size: 14.5px;
  font-weight: 600;
  line-height: 1.35;
  letter-spacing: -0.015em;
}

.home-card-meta {
  margin-top: 3px;
  font-size: 12px;
  line-height: 1.45;
  color: var(--fg-faint);
}

@media (max-width: 720px) {
  .home-header {
    align-items: flex-start;
    padding: 28px 0 24px;
  }

  .home-greeting {
    font-size: clamp(30px, 7vw, 40px);
  }

  .home-actions {
    padding-bottom: 0;
  }

  .home-section-head {
    margin-top: 34px;
  }
}
</style>
