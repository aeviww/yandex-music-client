<template>
  <q-page class="h-[calc(100vh-52px-var(--player-height,78px))] !min-h-0 !overflow-hidden">
    <q-scroll-area class="home-scroll">
      <div class="min-w-0 pb-[44px]">
        <header
          class="relative flex min-h-[196px] items-end overflow-hidden px-[var(--page-padding,40px)] pt-[64px] pb-[22px] -mt-[52px]"
        >
          <div
            class="pointer-events-none absolute inset-y-0 right-0 w-[70%] [mask-image:linear-gradient(to_right,transparent,#000_45%)] [-webkit-mask-image:linear-gradient(to_right,transparent,#000_45%)]"
            aria-hidden="true"
          >
            <div
              class="h-full w-full [mask-image:linear-gradient(to_bottom,#000_65%,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,#000_65%,transparent)]"
            >
              <div class="relative h-full w-full">
                <img
                  src="/banner.png"
                  alt=""
                  class="h-full w-full object-cover object-center opacity-90 grayscale contrast-[1.25] brightness-[0.8]"
                />
                <div
                  class="absolute inset-0 opacity-[0.9] mix-blend-overlay"
                  :style="{ backgroundImage: noise }"
                />
                <div
                  class="absolute inset-0 opacity-[0.12]"
                  :style="{ backgroundImage: noise }"
                />
              </div>
            </div>
          </div>
          <div
            class="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(9,9,11,0.72)_0%,rgba(9,9,11,0.28)_56px,rgba(9,9,11,0)_150px),linear-gradient(0deg,rgba(9,9,11,0.92)_0%,rgba(9,9,11,0)_140px)]"
          />

          <div class="relative z-[1]">
            <div
              class="font-semibold leading-[1.05] tracking-[-0.04em]"
              :class="userName ? 'text-[34px]' : 'text-[60px]'"
            >
              {{ greeting }}<span v-if="userName">,</span>
            </div>
            <div
              v-if="userName"
              class="mt-[2px] text-[64px] font-bold leading-[1.02] tracking-[-0.05em]"
            >
              {{ userName }}
            </div>
            <div class="mt-[22px] flex flex-wrap items-center gap-[10px]">
              <button
                :class="quickPrimary"
                type="button"
                @click="openWave"
              >
                <Icon name="mingcute:wave-line" :size="17" class="flex-none" />
                <span>Моя волна</span>
              </button>

              <button
                :class="quickGhost"
                type="button"
                @click="router.push('/playlists')"
              >
                <Icon name="mingcute:book-2-line" :size="16" class="flex-none" />
                <span>Коллекция</span>
              </button>

              <button
                :class="quickGhost"
                type="button"
                @click="router.push('/search')"
              >
                <Icon name="mingcute:search-2-line" :size="16" class="flex-none" />
                <span>Поиск</span>
              </button>
            </div>
          </div>
        </header>

        <div class="px-[var(--page-padding,40px)]">
                    <template v-if="visiblePlaylists.length">
            <div
              class="mb-[14px] mt-[32px] flex items-center justify-between gap-[12px]"
            >
              <div
                class="text-[20px] font-semibold leading-[1.2] tracking-[-0.03em]"
              >
                для тебя
              </div>
              <button
                class="more-link"
                type="button"
                @click="router.push('/playlists')"
              >
                <span>смотреть всё</span>
                <Icon name="mingcute:arrow-right-line" :size="14" />
              </button>
            </div>

            <div :class="[strip, colsLg]">
              <div
                v-for="pl in visiblePlaylists"
                :key="pl.kind"
                class="card group relative min-w-0"
                @click="router.push(`/playlists/${pl.kind}`)"
              >
                <div class="cover relative w-full aspect-[1.08/1]">
                  <img
                    v-if="pl.cover_url"
                    loading="lazy"
                    decoding="async"
                    :src="pl.cover_url"
                  />
                  <Icon
                    v-else
                    name="mingcute:playlist-2-line"
                    :size="26"
                    class="faint"
                  />

                  <button
                    :class="fab"
                    type="button"
                    title="Слушать"
                    @click.stop="playPlaylist(pl)"
                  >
                    <Icon name="mingcute:play-fill" :size="16" />
                  </button>

                  <span
                    v-if="library.isPinned(pl.kind)"
                    class="absolute left-[8px] top-[8px] flex h-[22px] w-[22px] items-center justify-center rounded-full bg-black/55 text-[color:var(--fg)]"
                    title="Закреплён в боковой панели"
                  >
                    <Icon name="mingcute:pin-2-line" :size="11" />
                  </span>
                </div>

                <div
                  class="mt-[8px] text-[15px] font-semibold tracking-[-0.02em] ellipsis"
                >
                  {{ pl.title }}
                </div>
                <div class="faint t-11 ellipsis">
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

                    <div
            class="mb-[14px] mt-[32px] flex items-center justify-between gap-[12px]"
          >
            <div
              class="text-[20px] font-semibold leading-[1.2] tracking-[-0.03em]"
            >
              недавно прослушанные
            </div>
          </div>

          <div :class="[strip, colsMd]">
            <template v-if="recent.length">
              <div
                v-for="r in recent"
                :key="r.id"
                class="card group relative min-w-0"
                @click="openRecent(r)"
              >
                <div class="cover relative w-full aspect-square">
                  <img
                    v-if="r.cover_url"
                    loading="lazy"
                    decoding="async"
                    :src="r.cover_url"
                  />
                  <Icon
                    v-else
                    name="mingcute:album-line"
                    :size="24"
                    class="faint"
                  />

                  <button
                    :class="fab"
                    type="button"
                    title="Слушать"
                    @click.stop="playRecent(r)"
                  >
                    <Icon name="mingcute:play-fill" :size="16" />
                  </button>
                </div>
                <div
                  class="mt-[8px] text-[15px] font-semibold tracking-[-0.02em] ellipsis"
                >
                  {{ r.title }}
                </div>
                <div class="faint t-11 ellipsis">{{ r.subtitle }}</div>
              </div>
            </template>

                        <template v-else>
              <div class="col-span-full py-[26px] text-[14px] text-white/45">
                тут появится то, что послушаешь
              </div>
            </template>
          </div>

                    <div
            class="mb-[14px] mt-[32px] flex items-center justify-between gap-[12px]"
          >
            <div
              class="text-[20px] font-semibold leading-[1.2] tracking-[-0.03em]"
            >
              новые релизы
            </div>
          </div>

          <div :class="[strip, colsSm]">
            <template v-if="releases.length">
              <div
                v-for="a in releases"
                :key="a.id"
                class="card group relative min-w-0"
                @click="router.push(`/album/${a.id}`)"
              >
                <div class="cover relative w-full aspect-square">
                  <img
                    v-if="a.cover_url"
                    loading="lazy"
                    decoding="async"
                    :src="a.cover_url"
                  />
                  <Icon
                    v-else
                    name="mingcute:album-line"
                    :size="24"
                    class="faint"
                  />

                  <button
                    :class="fab"
                    type="button"
                    title="Слушать"
                    @click.stop="playAlbum(a.id)"
                  >
                    <Icon name="mingcute:play-fill" :size="16" />
                  </button>
                </div>
                <div
                  class="mt-[8px] text-[15px] font-semibold tracking-[-0.02em] ellipsis"
                >
                  {{ a.title }}
                </div>
                <div class="faint t-11 ellipsis">
                  {{ a.artist || a.year || "" }}
                </div>
              </div>
            </template>

            <template v-else>
              <div v-for="n in 12" :key="n" class="min-w-0">
                <div
                  class="relative aspect-square w-full overflow-hidden rounded-[10px] bg-white/5"
                >
                  <div
                    class="absolute inset-0 opacity-[0.25] mix-blend-overlay"
                    :style="{ backgroundImage: noise }"
                  />
                </div>
                <div
                  class="mt-[10px] h-[12px] w-[70%] rounded-[4px] bg-white/5"
                />
                <div class="mt-[6px] h-[10px] w-[45%] rounded-[4px] bg-white/5" />
              </div>
            </template>
          </div>

                    <template v-if="picks.length">
            <div
              class="mb-[14px] mt-[32px] flex items-center justify-between gap-[12px]"
            >
              <div
                class="text-[20px] font-semibold leading-[1.2] tracking-[-0.03em]"
              >
                новое для тебя
              </div>
            </div>

            <div :class="[strip, colsSm]">
              <div
                v-for="p in picks"
                :key="`${p.kind}-${p.id}`"
                class="card group relative min-w-0"
                @click="openPick(p)"
              >
                <div
                  class="cover home-card-art relative w-full aspect-square"
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
                    :size="24"
                    class="faint"
                  />

                  <button
                    :class="fab"
                    type="button"
                    title="Слушать"
                    @click.stop="playPick(p)"
                  >
                    <Icon name="mingcute:play-fill" :size="16" />
                  </button>
                </div>

                <div class="t-13 w-500 ellipsis q-mt-sm">{{ p.name }}</div>
                <div class="faint t-11 ellipsis">
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
            <div
              class="mb-[14px] mt-[32px] flex items-center justify-between gap-[12px]"
            >
              <div
                class="text-[20px] font-semibold leading-[1.2] tracking-[-0.03em]"
              >
                миксы для тебя
              </div>
              <button
                class="more-link"
                type="button"
                @click="router.push('/wave')"
              >
                <span>смотреть всё</span>
                <Icon name="mingcute:arrow-right-line" :size="14" />
              </button>
            </div>

            <div :class="[strip, colsMd]">
              <div
                v-for="w in waves"
                :key="w.id"
                class="card group relative min-w-0"
                @click="playWave(w)"
              >
                <div
                  class="cover round relative w-full aspect-square"
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
                    :size="22"
                    class="faint"
                  />

                  <span :class="fab" title="Запустить">
                    <Icon name="mingcute:play-fill" :size="16" />
                  </span>
                </div>

                <div class="t-13 w-500 clamp-2 q-mt-sm">{{ w.name }}</div>
                <div class="faint t-11 ellipsis">{{ w.description }}</div>

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
            <div class="mb-[3px] mt-[32px] flex items-center justify-between gap-[12px]">
              <div class="text-[20px] font-semibold leading-[1.2] tracking-[-0.03em]">
                нейромузыка
              </div>
            </div>
            <div class="text-[13px] text-[color:var(--fg-faint)] tracking-[-0.01em]">
              Отвлечёт от шума и сфокусирует на важном
            </div>

            <div :class="[strip, colsMd]" class="mt-[16px]">
              <button
                v-for="n in neuroItems"
                :key="n.id"
                type="button"
                class="group relative mt-0 aspect-square w-full min-w-0 overflow-hidden rounded-[12px] border-0 p-0 cursor-pointer text-left"
                :style="n.color ? { background: n.color } : {}"
                @click="playNeuro(n)"
              >
                <img
                  v-if="n.cover_url"
                  loading="lazy"
                  decoding="async"
                  :src="n.cover_url"
                  class="absolute inset-0 h-full w-full object-cover opacity-80 transition-[opacity,transform] duration-200 group-hover:scale-[1.03] group-hover:opacity-100"
                />
                <div
                  class="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.52)_100%)]"
                />

                <div
                  class="absolute left-[12px] right-[12px] bottom-[10px] text-[14px] font-semibold tracking-[-0.01em]"
                  :style="{ color: n.text_color || '#ffffff' }"
                >
                  {{ n.title }}
                </div>

                <div
                  class="absolute right-[8px] top-[8px] flex h-[30px] w-[30px] items-center justify-center rounded-full bg-black/45 text-white transition-opacity duration-150"
                  :class="
                    neuro.item?.id === n.id
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-100'
                  "
                >
                  <Icon
                    :name="
                      neuro.item?.id === n.id && neuro.playing
                        ? 'mingcute:sound-fill'
                        : 'mingcute:play-fill'
                    "
                    :size="15"
                  />
                </div>
              </button>
            </div>
          </template>

          <div v-if="loading" class="q-mt-xl">
            <q-spinner size="24px" color="primary" />
          </div>

          <footer
            class="mt-[36px] flex flex-wrap items-center gap-x-[16px] gap-y-[6px] border-t border-[var(--line)] pt-[16px] pb-[28px] text-[12px] leading-[1.6] text-[color:var(--fg-faint)]"
          >
            <span
              class="font-semibold text-[color:var(--fg-dim)]"
              :title="commitTitle"
              >Mashiro{{ commit ? ` · ${commit}` : "" }}</span
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

const noise =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n' x='0' y='0' width='100%25' height='100%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch' result='t'/%3E%3CfeColorMatrix in='t' type='matrix' values='0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 0 1'/%3E%3CfeComponentTransfer%3E%3CfeFuncR type='linear' slope='2.4' intercept='-0.7'/%3E%3CfeFuncG type='linear' slope='2.4' intercept='-0.7'/%3E%3CfeFuncB type='linear' slope='2.4' intercept='-0.7'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const strip =
  "grid grid-rows-[auto] auto-rows-[0px] gap-x-[18px] gap-y-0 overflow-hidden";
const colsLg = "grid-cols-[repeat(auto-fill,minmax(200px,1fr))]";
const colsMd = "grid-cols-[repeat(auto-fill,minmax(150px,1fr))]";
const colsSm = "grid-cols-[repeat(auto-fill,minmax(132px,1fr))]";
const quickPrimary =
  "flex min-h-[42px] flex-nowrap items-center gap-[9px] rounded-[11px] border-0 bg-white px-[20px] py-[10px] text-[14px] font-semibold text-black transition-colors hover:bg-[#e4e4e4] active:bg-[#d6d6d6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";
const quickGhost =
  "flex min-h-[42px] flex-nowrap items-center gap-[9px] rounded-[11px] border-0 bg-white/[0.07] px-[16px] py-[10px] text-[14px] font-medium text-white/80 transition-colors hover:bg-white/[0.12] active:bg-white/[0.2] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

const fab =
  "absolute right-[8px] bottom-[8px] flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full border-0 bg-[var(--accent)] p-0 text-white opacity-0 translate-y-[6px] transition-[opacity,transform] duration-[140ms] ease-[ease] group-hover:opacity-100 group-hover:translate-y-0";

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
