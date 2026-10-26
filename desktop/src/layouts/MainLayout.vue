<template>
  <q-layout
    view="hHh lpR fFf"
    class="app-shell"
    :class="{ 'queue-open': rightPanel }"
  >
    <q-header
      v-if="!panels.hidden && !panels.mini"
      class="topbar relative z-[1] !border-b-0 !shadow-none transition-[background] duration-300"
      :class="!homeMode ? 'backdrop-blur-[18px] backdrop-saturate-[1.2]' : ''"
      :style="{
        background: homeMode
          ? 'transparent'
          : 'linear-gradient(180deg, rgba(9,9,11,0.82) 0%, rgba(9,9,11,0.45) 60%, rgba(9,9,11,0) 100%)',
      }"
    >
      <div
        class="titlebar relative flex h-[46px] select-none items-center pl-[14px]"
        @mousedown="startWindowDrag"
        @dblclick="toggleWindowMaximize"
      >
        <div
          class="brand flex items-center gap-2.5 text-[16px] font-extrabold tracking-[-0.03em] whitespace-nowrap"
        >
          <img
            src="/icons/favicon-128x128.png"
            alt=""
            draggable="false"
            class="h-6 w-6 select-none rounded-[6px]"
          />
          <span>Mashiro</span>
        </div>

        <div
          class="topbar-search-wrap absolute inset-0 flex items-center justify-center pointer-events-none"
          data-no-drag
        >
          <div
            class="searchbar pointer-events-auto flex h-[38px] w-[min(460px,100%)] items-center gap-2.5 !max-w-none !rounded-[10px] border !border-[color-mix(in_srgb,var(--fg)_7%,transparent)] !bg-[color-mix(in_srgb,var(--fg)_6%,transparent)] !px-[14px] transition-[background,border-color] duration-150 hover:!bg-[color-mix(in_srgb,var(--fg)_9%,transparent)] hover:!border-[color-mix(in_srgb,var(--fg)_11%,transparent)] focus-within:!bg-[color-mix(in_srgb,var(--fg)_9%,transparent)] focus-within:!border-[color-mix(in_srgb,var(--fg)_20%,transparent)]"
          >
            <Icon
              name="mingcute:search-2-line"
              :size="15"
              class="text-[color:var(--fg-faint)]"
            />
            <input
              v-model="query"
              placeholder="Найти трек, артиста или альбом"
              class="!text-[13.5px]"
              @keyup.enter="submitSearch"
            />
            <div v-if="query" class="icon-btn xs round" @click="query = ''">
              <Icon name="mingcute:close-line" :size="13" />
            </div>
          </div>
        </div>
        <div class="self-stretch min-w-0 flex-1" />

        <div
          class="icon-btn sm round flex h-[38px] w-[38px] items-center justify-center !rounded-[10px] border !border-[color-mix(in_srgb,var(--fg)_7%,transparent)] !bg-[color-mix(in_srgb,var(--fg)_6%,transparent)] transition-[background,border-color] duration-150 hover:!bg-[color-mix(in_srgb,var(--fg)_11%,transparent)] hover:!border-[color-mix(in_srgb,var(--fg)_12%,transparent)]"
          :class="[
            rightPanel
              ? '!bg-[color-mix(in_srgb,var(--fg)_11%,transparent)] !border-[color-mix(in_srgb,var(--fg)_12%,transparent)]'
              : '',
            panels.queueLocked ? '!opacity-40' : '',
          ]"
          @click="panels.toggleQueue()"
        >
          <Icon name="mingcute:playlist-2-line" :size="17" />
          <q-tooltip>Очередь</q-tooltip>
        </div>

        <div
          class="account flex h-[38px] cursor-pointer items-center gap-2 rounded-[10px] pl-1 pr-3 transition-[background] duration-150 hover:bg-[color-mix(in_srgb,var(--fg)_7%,transparent)]"
        >
          <div class="account-avatar h-[30px] w-[30px] !rounded-full">
            <img
              v-if="avatarUrl"
              :src="avatarUrl"
              loading="lazy"
              decoding="async"
              referrerpolicy="no-referrer"
              @error="avatarError = true"
            />
            <span v-else class="avatar-monogram">{{ accountInitial }}</span>
          </div>
          <span class="account-name ellipsis !text-[13px] font-semibold">{{
            accountName
          }}</span>
          <Icon name="mingcute:down-line" :size="13" class="account-chevron" />
          <q-menu class="menu" anchor="bottom right" self="top right">
            <div class="menu-body profile-menu">
              <div class="profile-head">
                <div class="profile-menu-avatar">
                  <img
                    v-if="avatarUrl"
                    :src="avatarUrl"
                    loading="lazy"
                    decoding="async"
                    referrerpolicy="no-referrer"
                    @error="avatarError = true"
                  />
                  <span v-else class="avatar-monogram">{{
                    accountInitial
                  }}</span>
                </div>
                <div class="profile-menu-id">
                  <div class="profile-menu-name ellipsis">
                    {{ accountName }}
                  </div>
                  <div class="profile-menu-sub ellipsis">{{ accountSub }}</div>
                </div>
              </div>

              <div class="menu-sep" />

              <div
                v-for="link in profileLinks"
                :key="link.to"
                class="menu-item"
                v-close-popup
                @click="router.push(link.to)"
              >
                <Icon :name="link.icon" :size="17" />
                <span>{{ link.label }}</span>
              </div>

              <div class="menu-sep" />

              <div class="menu-item danger" v-close-popup @click="doLogout">
                <Icon name="mingcute:exit-line" :size="17" />
                <span>Выйти из аккаунта</span>
              </div>
            </div>
          </q-menu>
        </div>

        <WindowControls />
      </div>
    </q-header>

    <q-drawer
      v-if="!panels.hidden && !panels.mini"
      :model-value="true"
      show-if-above
      side="left"
      :width="ui.settings.sidebarWidth"
      :breakpoint="0"
      class="sidebar !bg-[color-mix(in_srgb,var(--bg)_88%,var(--surface))] !border-r-0"
      content-class="overflow-x-hidden pt-[14px]"
    >
      <div class="column full-height">
        <div class="pt-0.5 pb-1.5">
          <div
            v-for="item in nav"
            :key="item.to"
            class="nav flex h-[34px] cursor-pointer items-center mx-3 my-0.5 gap-3 rounded-[10px] px-3 text-[13.5px] font-medium text-[color:var(--fg-dim)] transition-[background,color] duration-150 hover:bg-[color-mix(in_srgb,var(--fg)_7%,transparent)] hover:text-[color:var(--fg)]"
            :class="
              route.path === item.to
                ? 'bg-[color-mix(in_srgb,var(--fg)_8%,transparent)] font-semibold text-[color:var(--fg)]'
                : ''
            "
            @click="router.push(item.to)"
          >
            <Icon :name="item.icon" :size="18" />
            <span>{{ item.label }}</span>
          </div>
        </div>

        <div
          class="mx-3 mt-1.5 mb-1 h-px bg-[color-mix(in_srgb,var(--fg)_6%,transparent)]"
        />

        <div
          class="flex items-center gap-2 px-5 pt-3 pb-2 text-[12px] font-semibold tracking-[-0.01em] text-[color:var(--fg-faint)]"
        >
          <span class="flex-1 min-w-0">Плейлисты</span>
          <span class="text-[color:var(--fg-faint)] text-[11px]">{{
            library.visiblePlaylists.length || ""
          }}</span>
        </div>

        <q-scroll-area class="min-h-0 flex-1">
          <div
            v-for="pl in sidebarPlaylists"
            :key="pl.kind"
            class="side-item flex min-w-0 flex-none cursor-pointer items-center gap-2.5 mx-2 my-px rounded-[10px] px-3 py-[5px] transition-[background] duration-150 hover:bg-[color-mix(in_srgb,var(--fg)_7%,transparent)]"
            :class="
              route.path === `/playlists/${pl.kind}`
                ? 'bg-[color-mix(in_srgb,var(--fg)_8%,transparent)]'
                : ''
            "
            @click="router.push(`/playlists/${pl.kind}`)"
          >
            <div
              class="cover"
              style="width: 30px; height: 30px; border-radius: 7px"
            >
              <img
                loading="lazy"
                decoding="async"
                v-if="pl.cover_url"
                :src="pl.cover_url"
              />
              <Icon
                v-else
                name="mingcute:playlist-2-line"
                :size="14"
                class="faint"
              />
            </div>
            <div class="col" style="min-width: 0">
              <div class="ellipsis t-13">{{ pl.title }}</div>
            </div>
            <Icon
              v-if="library.isPinned(pl.kind)"
              name="mingcute:pin-2-line"
              :size="13"
              class="faint"
            />
            <span v-else class="faint t-11">{{ pl.track_count }}</span>

            <q-menu context-menu touch-position class="menu">
              <div class="menu-body" style="min-width: 196px">
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
                <div
                  class="menu-item"
                  v-close-popup
                  @click="router.push(`/playlists/${pl.kind}`)"
                >
                  <Icon name="mingcute:playlist-2-line" :size="17" />
                  <span>Открыть плейлист</span>
                </div>
                <div class="menu-sep" />
                <div
                  class="menu-item"
                  v-close-popup
                  @click="library.toggleHidden(pl.kind)"
                >
                  <Icon
                    :name="
                      library.isHidden(pl.kind)
                        ? 'mingcute:eye-2-line'
                        : 'mingcute:eye-close-line'
                    "
                    :size="17"
                  />
                  <span>{{
                    library.isHidden(pl.kind)
                      ? "Вернуть в коллекцию"
                      : "Скрыть плейлист"
                  }}</span>
                </div>
              </div>
            </q-menu>
          </div>

          <template v-if="library.hiddenPlaylists.length">
            <button
              type="button"
              class="flex w-[calc(100%-16px)] cursor-pointer flex-none items-center mx-2 mt-2.5 mb-0.5 gap-[9px] border-0 bg-transparent rounded-[9px] px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[color:var(--fg-faint)] transition-[background,color] duration-150 hover:bg-[var(--hover)] hover:text-[color:var(--fg-dim)]"
              :class="{ open: showHidden }"
              @click="showHidden = !showHidden"
            >
              <span
                class="inline-flex items-center flex-none transition-transform duration-150"
                :class="{ 'rotate-90': showHidden }"
              >
                <Icon name="mingcute:right-line" :size="12" />
              </span>
              <span class="flex-1">Скрытые</span>
              <span
                class="flex-none rounded-[7px] bg-[var(--surface-2)] px-1.5 text-[10px] font-semibold text-[color:var(--fg-dim)]"
                >{{ library.hiddenPlaylists.length }}</span
              >
            </button>

            <div
              v-for="pl in showHidden ? library.hiddenPlaylists : []"
              :key="`hidden-${pl.kind}`"
              class="side-item opacity-60 flex min-w-0 flex-none cursor-pointer items-center gap-2.5 mx-2 my-px rounded-[10px] px-3 py-[5px] transition-[background,opacity] duration-150 hover:bg-[color-mix(in_srgb,var(--fg)_7%,transparent)] hover:opacity-100"
              :class="
                route.path === `/playlists/${pl.kind}`
                  ? 'bg-[color-mix(in_srgb,var(--fg)_8%,transparent)]'
                  : ''
              "
              @click="router.push(`/playlists/${pl.kind}`)"
            >
              <div
                class="cover"
                style="width: 30px; height: 30px; border-radius: 7px"
              >
                <img
                  loading="lazy"
                  decoding="async"
                  v-if="pl.cover_url"
                  :src="pl.cover_url"
                />
                <Icon
                  v-else
                  name="mingcute:playlist-2-line"
                  :size="14"
                  class="faint"
                />
              </div>
              <div class="col" style="min-width: 0">
                <div class="ellipsis t-13">{{ pl.title }}</div>
              </div>
              <button
                type="button"
                class="icon-btn xs"
                title="Вернуть в коллекцию"
                @click.stop="library.toggleHidden(pl.kind)"
              >
                <Icon name="mingcute:eye-2-line" :size="14" />
              </button>
            </div>
          </template>

          <div
            v-if="!library.playlists.length"
            class="faint t-12 q-px-lg q-py-sm"
          >
            Пусто
          </div>
        </q-scroll-area>
      </div>
    </q-drawer>

    <q-drawer
      v-if="!panels.hidden && !panels.mini"
      v-model="rightPanel"
      side="right"
      :width="300"
      :breakpoint="0"
      class="rightbar !bg-[var(--bg)] border-l border-[var(--line)]"
      content-class="overflow-x-hidden"
    >
      <div class="column full-height" style="overflow: hidden">
        <div
          class="flex-none px-4 pt-3.5 pb-1.5 text-[12px] font-semibold tracking-[-0.01em] text-[color:var(--fg-faint)]"
        >
          Сейчас играет
        </div>

        <div
          v-if="player.current"
          class="now-block min-w-0 flex-none px-4 pt-0.5 pb-2.5"
        >
          <div
            class="cover"
            style="width: 100%; height: 268px; border-radius: 12px"
          >
            <img
              loading="lazy"
              decoding="async"
              v-if="player.current.cover_url"
              :src="player.current.cover_url"
            />
            <Icon v-else name="mingcute:music-line" :size="30" class="faint" />
          </div>
          <div class="q-mt-md t-15 w-600 ellipsis">
            {{ player.current.title }}
          </div>
          <div class="dim t-13 clamp-2">
            <ArtistsLine :artists="player.current.artists" :limit="2" />
          </div>
        </div>
        <div
          v-else
          class="flex-none px-4 pt-0.5 pb-2.5 text-[color:var(--fg-faint)] text-[12px]"
        >
          Очередь пуста
        </div>

        <div
          class="queue-head flex-none flex items-center gap-2 px-4 pt-3 pb-1.5 text-[12px] font-semibold tracking-[-0.01em] text-[color:var(--fg-faint)]"
        >
          <span class="flex-1 min-w-0">Очередь</span>
          <span
            v-if="queueItems.length"
            class="flex-none text-[color:var(--fg-faint)] text-[11px] tabular-nums"
          >
            {{ player.index + 1 }} / {{ queueItems.length }}
          </span>
          <button
            v-if="queueItems.length"
            type="button"
            class="queue-locate"
            :class="{ off: followCurrent }"
            title="Пролистать к текущему треку"
            @click="locateCurrent"
          >
            <Icon name="mingcute:playlist-2-line" :size="13" />
          </button>
        </div>

        <q-scroll-area
          ref="queueScroll"
          class="queue-scroll min-h-0 flex-1 pb-2"
          @scroll="onQueueScroll"
        >
          <div
            v-for="item in queueItems"
            :key="`${item.track.id}-${item.index}`"
            class="side-item flex min-w-0 flex-none cursor-pointer items-center gap-2.5 mx-2 my-px rounded-[10px] px-2 py-1.5 transition-[background,opacity] duration-150 hover:bg-[color-mix(in_srgb,var(--fg)_7%,transparent)]"
            :class="{
              'is-current bg-[var(--surface-2)]': item.index === player.index,
              'opacity-50': item.index < player.index,
            }"
            :data-queue-current="item.index === player.index ? '1' : null"
            @click="jumpTo(item.index)"
          >
            <div
              class="cover"
              style="width: 30px; height: 30px; border-radius: 7px"
            >
              <img
                loading="lazy"
                decoding="async"
                v-if="item.track.cover_url"
                :src="item.track.cover_url"
              />
              <Icon
                v-else
                name="mingcute:music-line"
                :size="14"
                class="faint"
              />
            </div>
            <div class="flex-1 min-w-0">
              <div
                class="ellipsis t-13"
                :class="
                  item.index === player.index
                    ? 'font-semibold text-[color:var(--accent)]'
                    : ''
                "
              >
                {{ item.track.title }}
              </div>
              <div class="faint t-11 ellipsis">
                <ArtistsLine :artists="item.track.artists" :limit="2" />
              </div>
            </div>
            <Icon
              v-if="item.index === player.index"
              :name="
                player.isPlaying ? 'mingcute:pause-fill' : 'mingcute:play-fill'
              "
              :size="13"
              class="text-[color:var(--accent)] flex-none"
            />
            <TrackMenu :context-menu="true" :track="item.track" />
          </div>

          <div v-if="!queueItems.length" class="faint t-12 q-px-md q-py-sm">
            Очередь пуста
          </div>
        </q-scroll-area>
      </div>
    </q-drawer>

    <q-page-container
      v-if="!panels.hidden && !panels.mini"
      style="position: relative"
    >
      <router-view v-slot="{ Component, route: current }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="current.fullPath" />
        </Transition>
      </router-view>
      <LyricsPanel
        v-if="lyricsVisible"
        :style="player.lyricsFullscreen ? undefined : lyricsBox"
      />
    </q-page-container>

    <div v-if="panels.hidden" class="tray-idle">Играет в фоновом режиме</div>

    <q-footer
      v-if="!panels.hidden && !panels.mini"
      style="background: var(--bg); border-top: 1px solid var(--line)"
    >
      <PlayerBar />
    </q-footer>

    <MiniPlayer v-if="panels.mini && !panels.hidden" />

    <NeuroPlayer />

    <TogetherDock />
    <FullscreenPlayer />
    <TrackLyricsDialog />
    <AppDialog />
  </q-layout>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import ArtistsLine from "@/components/common/ArtistsLine.vue";
import TrackMenu from "@/components/common/TrackMenu.vue";
import FullscreenPlayer from "@/components/player/FullscreenPlayer.vue";
import LyricsPanel from "@/components/player/LyricsPanel.vue";
import MiniPlayer from "@/components/player/MiniPlayer.vue";
import NeuroPlayer from "@/components/player/NeuroPlayer.vue";
import PlayerBar from "@/components/player/PlayerBar.vue";
import TogetherDock from "@/components/together/TogetherDock.vue";
import TrackLyricsDialog from "@/components/player/TrackLyricsDialog.vue";
import AppDialog from "@/components/common/AppDialog.vue";
import WindowControls from "@/components/window/WindowControls.vue";
import { trackLyricsDialog } from "@/lib/dialogs";
import {
  bindGlobalHotkeyEvents,
  bindLocalHotkeys,
  unbindGlobalHotkeyEvents,
  unbindLocalHotkeys,
} from "@/lib/hotkeys/runtime";
import { bindTrayEvents, setCloseToTray } from "@/lib/tray";
import {
  releaseStuckPointer,
  startWindowDrag,
  toggleWindowMaximize,
} from "@/lib/window";
import { useAuthStore } from "@/stores/auth";
import { useLibraryStore } from "@/stores/library";
import { useHotkeysStore } from "@/stores/hotkeys";
import { usePanelsStore } from "@/stores/panels";
import { usePlayerStore } from "@/stores/player/index";
import { useUiStore } from "@/stores/ui/index";

const route = useRoute();
const router = useRouter();
const homeMode = computed(() => route.path === "/");
const auth = useAuthStore();
const player = usePlayerStore();
const library = useLibraryStore();
const ui = useUiStore();
const panels = usePanelsStore();
const hotkeys = useHotkeysStore();

const avatarError = ref(false);
watch(
  () => auth.profile?.avatar_url,
  () => {
    avatarError.value = false;
  },
);
const avatarUrl = computed(() =>
  avatarError.value ? null : auth.profile?.avatar_url || null,
);
const accountName = computed(
  () => auth.profile?.display_name || auth.profile?.login || "Профиль",
);
const accountInitial = computed(() => {
  const src = (auth.profile?.display_name || auth.profile?.login || "").trim();
  return src ? src.charAt(0).toUpperCase() : "☺";
});
const accountLogin = computed(() => {
  const login = auth.profile?.login;
  if (!login || login === auth.profile?.display_name) return "";
  return "@" + login;
});
const accountSub = computed(() =>
  auth.profile?.has_plus
    ? "Яндекс Плюс"
    : accountLogin.value || "Яндекс Музыка",
);

const profileLinks = [
  { to: "/liked", label: "Любимое", icon: "mingcute:heart-line" },
  { to: "/playlists", label: "Коллекция", icon: "mingcute:book-2-line" },
  { to: "/stats", label: "Статистика", icon: "mingcute:chart-bar-line" },
  { to: "/settings", label: "Настройки", icon: "mingcute:settings-5-line" },
];

const showHidden = ref(false);
const sidebarPlaylists = computed(() => library.visiblePlaylists);

const query = ref("");
const rightPanel = computed({
  get: () => panels.queueOpen,
  set: (value: boolean) => {
    panels.queueOpen = value;
  },
});

const queueRestore = ref(false);
let queueAuto = false;

watch(
  () => route.path,
  (to, from) => {
    const onSettings = to.startsWith("/settings");
    const wasSettings = (from ?? "").startsWith("/settings");
    if (onSettings === wasSettings) return;
    queueAuto = true;
    panels.queueLocked = onSettings;
    if (onSettings) {
      queueRestore.value = panels.queueOpen;
      panels.queueOpen = false;
    } else {
      panels.queueOpen = queueRestore.value;
    }
    void nextTick(() => {
      queueAuto = false;
    });
  },
  { immediate: true },
);

watch(
  () => panels.queueOpen,
  (value) => {
    if (queueAuto) return;
    if (route.path.startsWith("/settings")) queueRestore.value = value;
  },
);

watch(
  () => ui.settings.playerEditMode,
  (editing) => {
    if (editing) return;
    const path = ui.playerEditReturnPath;
    if (!path) return;
    ui.playerEditReturnPath = null;
    if (!route.path.startsWith("/settings")) void router.push(path);
  },
);

const lyricsVisible = computed(() => player.showLyrics && !!player.current);

const lyricsBox = computed(() => ({
  top: "46px",
  bottom: "var(--player-height, 78px)",
  left: `${ui.settings.sidebarWidth}px`,
  right: rightPanel.value ? "300px" : "0px",
}));

const nav = [
  { to: "/", label: "Главное", icon: "mingcute:home-3-line" },
  { to: "/search", label: "Поиск", icon: "mingcute:search-2-line" },
  { to: "/wave", label: "Моя волна", icon: "mingcute:wave-line" },
  { to: "/liked", label: "Мне нравится", icon: "mingcute:heart-line" },
  { to: "/playlists", label: "Коллекция", icon: "mingcute:book-2-line" },
  { to: "/library", label: "Поиск в библиотеке", icon: "mingcute:filter-line" },
  { to: "/stats", label: "Статистика", icon: "mingcute:chart-bar-line" },
];

type ScrollAreaRef = {
  getScrollTarget: () => HTMLElement;
  setScrollPosition: (
    axis: "vertical" | "horizontal",
    offset: number,
    duration?: number,
  ) => void;
} | null;

const queueScroll = ref<ScrollAreaRef>(null);
const followCurrent = ref(true);
let autoScrolling = false;

const queueItems = computed(() =>
  (player.queue ?? []).map((track, index) => ({ track, index })),
);

function currentEl(): { target: HTMLElement; el: HTMLElement } | null {
  const area = queueScroll.value;
  if (!area?.getScrollTarget) return null;
  const target = area.getScrollTarget();
  const el = target?.querySelector<HTMLElement>('[data-queue-current="1"]');
  return target && el ? { target, el } : null;
}

async function scrollToCurrent(duration = 0) {
  await nextTick();
  const found = currentEl();
  const area = queueScroll.value;
  if (!found || !area) return;

  const { target, el } = found;
  const offset = el.offsetTop - target.clientHeight / 2 + el.clientHeight / 2;

  autoScrolling = true;
  area.setScrollPosition("vertical", Math.max(0, offset), duration);
  window.setTimeout(() => {
    autoScrolling = false;
  }, duration + 60);
}

function isCurrentVisible(): boolean {
  const found = currentEl();
  if (!found) return false;
  const { target, el } = found;
  const top = el.offsetTop - target.scrollTop;
  return top > -el.clientHeight && top < target.clientHeight;
}

function onQueueScroll() {
  if (autoScrolling) return;
  followCurrent.value = isCurrentVisible();
}

function locateCurrent() {
  followCurrent.value = true;
  void scrollToCurrent(220);
}

watch(
  () => panels.queueOpen,
  (open) => {
    if (!open) return;
    followCurrent.value = true;
    void scrollToCurrent(0);
  },
);

watch(
  () => player.index,
  () => {
    if (!panels.queueOpen || !followCurrent.value) return;
    void scrollToCurrent(260);
  },
);

function jumpTo(index: number) {
  player.index = index;
  followCurrent.value = true;
  void player.loadCurrent();
}

function submitSearch() {
  if (!query.value.trim()) return;
  void router.push({ name: "search", query: { q: query.value.trim() } });
}

async function doLogout() {
  await auth.logout();
  void router.replace("/login");
}

const hotkeyHandlers = {
  toggle: () => player.toggle(),
  mute: () => player.toggleMute(),
  seekForward: () =>
    player.seek(Math.min(player.duration || 0, player.progress + 5)),
  seekBackward: () => player.seek(Math.max(0, player.progress - 5)),
  volumeUp: () =>
    player.setVolume(Math.round(Math.min(1, player.volume + 0.05) * 100) / 100),
  volumeDown: () =>
    player.setVolume(Math.round(Math.max(0, player.volume - 0.05) * 100) / 100),
  like: () => {
    void player.like();
  },
  dislike: () => {
    void player.dislike();
  },
  repeat: () => player.cycleRepeat(),
  shuffle: () => player.toggleShuffle(),
  next: () => {
    void player.next(false);
  },
  prev: () => {
    void player.prev();
  },
  lyrics: () => player.toggleLyrics(),
  queue: () => panels.toggleQueue(),
};

onMounted(() => {
  hotkeys.load();
  bindLocalHotkeys((signature) => hotkeys.resolve(signature), hotkeyHandlers);
  void bindGlobalHotkeyEvents(hotkeyHandlers);
  void hotkeys.applyGlobal();
  void library.init();
  void setCloseToTray(ui.settings.minimizeToTray);
  if (ui.settings.resumeLastSession) {
    void player.restoreSession(ui.settings.resumeAutoplay);
  }
  void bindTrayEvents({
    onToggle: () => player.toggle(),
    onNext: () => {
      void player.next(false);
    },
    onPrev: () => {
      void player.prev();
    },
    onLike: () => {
      void player.like();
    },
    onHidden: () => {
      panels.queueOpen = false;
      panels.hidden = true;
      player.releaseMemory();
    },
    onShown: () => {
      panels.hidden = false;
    },
  });
});

watch(
  () => ui.settings,
  () => {
    ui.apply();
    void player.syncPresence();
    void setCloseToTray(ui.settings.minimizeToTray);
  },
  { deep: true, immediate: true },
);

function onWindowFocus() {
  releaseStuckPointer();
}

watch(
  () => route.fullPath,
  () => {
    player.closeLyrics();
    trackLyricsDialog.open = false;
    document.documentElement.dataset.route = route.path.startsWith("/settings")
      ? "settings"
      : route.path.replace(/^\//, "").split("/")[0] || "home";
  },
  { immediate: true },
);

window.addEventListener("focus", onWindowFocus);

onBeforeUnmount(() => {
  window.removeEventListener("focus", onWindowFocus);
  unbindLocalHotkeys();
  unbindGlobalHotkeyEvents();
});
</script>

<style scoped>
.queue-locate {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--accent, #fa2d48);
  cursor: pointer;
  transition:
    background 0.14s ease,
    color 0.14s ease,
    opacity 0.14s ease;
}
.queue-locate:hover {
  background: var(--hover);
}
.queue-locate.off {
  color: var(--fg-dim);
  opacity: 0.5;
}
</style>
