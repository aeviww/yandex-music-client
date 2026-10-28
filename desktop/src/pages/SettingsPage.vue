<template>
  <div
    class="fixed inset-0 z-[5000] flex flex-nowrap flex-col overflow-hidden bg-[var(--bg)] text-[var(--fg)] [&_button:not(:disabled)]:cursor-pointer [&.page-enter-active]:!transition-opacity [&.page-enter-active]:!duration-150 [&.page-leave-active]:!transition-opacity [&.page-leave-active]:!duration-150 [&.page-enter-from]:opacity-0 [&.page-enter-from]:!transform-none [&.page-leave-to]:opacity-0 [&.page-leave-to]:!transform-none"
  >
      <header
        class="relative flex h-[64px] flex-none flex-nowrap items-center gap-4 border-b border-[var(--line)] bg-[var(--bg)] px-5"
      >
        <div class="flex flex-none items-center gap-3">
          <span
            class="grid h-9 w-9 place-items-center rounded-lg border border-[var(--line)] bg-transparent text-[color:var(--fg-dim)]"
          >
            <Icon name="mingcute:settings-5-line" :size="18" />
          </span>
          <h1
            class="m-0 text-[calc(15px*var(--text-scale,1))] font-bold leading-tight tracking-[-0.02em] text-[var(--fg)]"
          >
            Настройки
          </h1>
        </div>

        <div class="mx-auto w-full max-w-[440px]">
          <label
            class="flex h-9 items-center gap-2 rounded-lg border border-[var(--line)] bg-transparent px-3 transition duration-150 focus-within:border-[color-mix(in_srgb,var(--accent)_45%,var(--line))]"
          >
            <Icon
              name="mingcute:search-2-line"
              :size="14"
              class="text-[color:var(--fg-faint)]"
            />
            <input
              v-model="query"
              type="text"
              placeholder="Найти настройку"
              spellcheck="false"
              class="min-w-0 flex-1 border-0 bg-transparent text-[calc(12.5px*var(--text-scale,1))] text-[var(--fg)] outline-none placeholder:text-[color:var(--fg-faint)]"
            />
            <button
              v-if="query"
              class="grid h-5 w-5 flex-none place-items-center rounded-md border-0 text-[color:var(--fg-faint)] transition hover:bg-[var(--hover)] hover:text-[var(--fg)]"
              type="button"
              title="Очистить"
              @click="query = ''"
            >
              <Icon name="mingcute:close-line" :size="12" />
            </button>
          </label>
        </div>

        <button
          type="button"
          class="grid h-9 w-9 flex-none place-items-center rounded-lg border border-[var(--line)] text-[color:var(--fg-dim)] transition duration-150 hover:bg-[var(--hover)] hover:text-[var(--fg)]"
          title="Закрыть настройки (Esc)"
          aria-label="Закрыть настройки"
          @click="close"
        >
          <Icon name="mingcute:close-line" :size="19" />
        </button>
      </header>

      <div class="relative flex flex-nowrap min-h-0 flex-1">
        <aside
          class="flex flex-nowrap min-h-0 w-[276px] flex-none flex-col border-r border-[var(--line)] bg-[var(--bg)] px-3 py-4"
        >
          <nav class="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain pr-1">
            <div v-for="group in groups" :key="group.title">
              <div
                class="px-3 pb-1.5 text-[calc(10px*var(--text-scale,1))] font-semibold uppercase tracking-[0.09em] text-[color:var(--fg-faint)]"
              >
                {{ group.title }}
              </div>

              <button
                v-for="section in group.items"
                :key="section.id"
                type="button"
                class="group flex h-10 w-full items-center gap-3 rounded-lg border-0 px-3 text-left text-[calc(13px*var(--text-scale,1))] transition duration-150"
                :class="
                  active === section.id
                    ? 'bg-[color-mix(in_srgb,var(--fg)_7%,transparent)] font-semibold text-[var(--fg)]'
                    : 'text-[color:var(--fg-dim)] hover:bg-[var(--hover)] hover:text-[var(--fg)]'
                "
                @click="select(section.id)"
              >
                <Icon
                  :name="section.icon"
                  :size="16"
                  class="flex-none transition-colors"
                  :class="
                    active === section.id
                      ? 'text-[var(--accent)]'
                      : 'opacity-70 group-hover:opacity-100'
                  "
                />
                <span class="min-w-0 flex-1 truncate">{{
                  section.label
                }}</span>
                <span
                  v-if="section.hits.length"
                  class="flex-none rounded-full bg-[color-mix(in_srgb,var(--fg)_8%,transparent)] px-1.5 text-[calc(10px*var(--text-scale,1))] font-semibold tabular-nums text-[color:var(--fg-faint)]"
                  :title="section.hits.join(' · ')"
                >
                  {{ section.hits.length }}
                </span>
              </button>
            </div>

            <p
              v-if="!groups.length"
              class="mb-0 px-3 py-4 text-[calc(12px*var(--text-scale,1))] text-[color:var(--fg-faint)]"
            >
              Ничего не нашлось
            </p>
          </nav>

          <div class="mt-3 flex-none border-t border-[var(--line)] pt-3">
            <button
              type="button"
              class="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-[color-mix(in_srgb,#ff5d5d_35%,var(--line))] text-[calc(12px*var(--text-scale,1))] font-medium text-[#ff8080] transition duration-150 hover:bg-[color-mix(in_srgb,#ff5d5d_10%,transparent)] hover:text-[#ff5d5d]"
              @click="reset"
            >
              <Icon name="mingcute:delete-2-line" :size="15" />
              Сбросить всё
            </button>
          </div>
        </aside>

        <main
          ref="scrollRoot"
          class="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain"
        >
          <div class="mx-auto w-full max-w-[880px] px-8 py-8 pb-24">
            <component :is="activeComponent" :key="active" />
          </div>
        </main>
      </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Notify } from "quasar";
import { askConfirm } from "@/lib/dialogs";
import AppearanceSection from "@/components/settings/sections/AppearanceSection.vue";
import AboutSection from "@/components/settings/sections/AboutSection.vue";
import BehaviorSection from "@/components/settings/sections/BehaviorSection.vue";
import CacheSection from "@/components/settings/sections/CacheSection.vue";
import DiscordSection from "@/components/settings/sections/DiscordSection.vue";
import DownloadsSection from "@/components/settings/sections/DownloadsSection.vue";
import EqualizerSection from "@/components/settings/sections/EqualizerSection.vue";
import GeniusSection from "@/components/settings/sections/GeniusSection.vue";
import HotkeysSection from "@/components/settings/sections/HotkeysSection.vue";
import LayoutSection from "@/components/settings/sections/LayoutSection.vue";
import LyricsSection from "@/components/settings/sections/LyricsSection.vue";
import MiniPlayerSection from "@/components/settings/sections/MiniPlayerSection.vue";
import PlayerSection from "@/components/settings/sections/PlayerSection.vue";
import PlaylistToolsSection from "@/components/settings/sections/PlaylistToolsSection.vue";
import TogetherSection from "@/components/settings/sections/TogetherSection.vue";
import { matchItems } from "@/lib/settings-catalog";
import { useEqualizerStore } from "@/stores/equalizer";
import { usePlayerStore } from "@/stores/player/index";
import { useUiStore } from "@/stores/ui/index";

const ui = useUiStore();
const equalizer = useEqualizerStore();
const player = usePlayerStore();
const route = useRoute();
const router = useRouter();

const scrollRoot = ref<HTMLElement | null>(null);
const query = ref("");

const GROUPS = ["Основное", "Плеер", "Библиотека", "Сеть", "Система"];

const sections = [
  {
    id: "theme",
    label: "Оформление",
    icon: "mingcute:computer-line",
    group: "Основное",
    hint: "тема цвет акцент шрифт фон",
    component: AppearanceSection,
  },
  {
    id: "layout",
    label: "Интерфейс",
    icon: "mingcute:layout-left-line",
    group: "Основное",
    hint: "макет сайдбар панели очередь",
    component: LayoutSection,
  },
  {
    id: "behavior",
    label: "Поведение",
    icon: "mingcute:settings-5-line",
    group: "Основное",
    hint: "трей запуск закрытие окно",
    component: BehaviorSection,
  },
  {
    id: "player",
    label: "Плеер",
    icon: "mingcute:play-fill",
    group: "Плеер",
    hint: "качество громкость воспроизведение",
    component: PlayerSection,
  },
  {
    id: "mini",
    label: "Мини-плеер",
    icon: "mingcute:miniplayer-fill",
    group: "Плеер",
    hint: "маленькое окно поверх всех",
    component: MiniPlayerSection,
  },
  {
    id: "equalizer",
    label: "Эквалайзер",
    icon: "mingcute:wave-line",
    group: "Плеер",
    hint: "звук басы частоты",
    component: EqualizerSection,
  },
  {
    id: "lyrics",
    label: "Текст песни",
    icon: "mingcute:subtitle-line",
    group: "Плеер",
    hint: "слова караоке строки",
    component: LyricsSection,
  },
  {
    id: "playlists",
    label: "Плейлисты",
    icon: "mingcute:book-2-line",
    group: "Библиотека",
    hint: "скрытые сортировка главное",
    component: PlaylistToolsSection,
  },
  {
    id: "downloads",
    label: "Загрузки",
    icon: "mingcute:download-2-line",
    group: "Библиотека",
    hint: "скачивание папка файлы",
    component: DownloadsSection,
  },
  {
    id: "cache",
    label: "Кеш",
    icon: "mingcute:delete-2-line",
    group: "Библиотека",
    hint: "очистка место обложки",
    component: CacheSection,
  },
  {
    id: "together",
    label: "Слушать вместе",
    icon: "mingcute:user-2-line",
    group: "Сеть",
    hint: "комната радмин локалка синхрон",
    component: TogetherSection,
  },
  {
    id: "genius",
    label: "Genius",
    icon: "mingcute:music-line",
    group: "Сеть",
    hint: "genius тексты токен",
    component: GeniusSection,
  },
  {
    id: "discord",
    label: "Discord",
    icon: "simple-icons:discord",
    group: "Сеть",
    hint: "discord дискорд статус rpc",
    component: DiscordSection,
  },
  {
    id: "hotkeys",
    label: "Горячие клавиши",
    icon: "mingcute:key-2-line",
    group: "Система",
    hint: "кнопки сочетания глобальные",
    component: HotkeysSection,
  },
  {
    id: "about",
    label: "О проекте",
    icon: "mingcute:information-line",
    group: "Система",
    hint: "версия github автор",
    component: AboutSection,
  },
];

const groups = computed(() => {
  const needle = query.value.trim().toLowerCase();

  return GROUPS.map((title) => ({
    title,
    items: sections
      .filter((section) => section.group === title)
      .map((section) => ({
        ...section,
        hits: matchItems(section.id, needle).slice(0, 2),
      }))
      .filter(
        (section) =>
          !needle ||
          section.label.toLowerCase().includes(needle) ||
          section.hint.includes(needle) ||
          section.hits.length > 0,
      ),
  })).filter((group) => group.items.length > 0);
});

function sectionFromQuery(): string | null {
  const raw = route.query.section;
  const id = Array.isArray(raw) ? raw[0] : raw;
  if (typeof id !== "string") return null;
  return sections.some((s) => s.id === id) ? id : null;
}

const active = ref(sectionFromQuery() ?? sections[0]!.id);

watch(
  () => route.query.section,
  () => {
    const id = sectionFromQuery();
    if (id && id !== active.value) select(id);
  },
);

const activeComponent = computed(
  () => sections.find((s) => s.id === active.value)?.component ?? null,
);

function select(id: string) {
  active.value = id;
  scrollRoot.value?.scrollTo({ top: 0, behavior: "auto" });
}

function close() {
  const back = window.history.state?.back;
  if (typeof back === "string" && back && !back.startsWith("/settings")) {
    router.back();
  } else {
    void router.replace("/");
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== "Escape" || event.defaultPrevented) return;
  event.preventDefault();
  close();
}

onMounted(() => window.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));

async function reset() {
  const ok = await askConfirm({
    title: "Сбросить все настройки?",
    message:
      "Оформление, интерфейс, текст песни, эквалайзер и Discord вернутся к значениям по умолчанию. Авторизация и кеш останутся на месте.",
    okLabel: "Сбросить",
    danger: true,
  });
  if (!ok) return;
  ui.reset();
  equalizer.reset();
  equalizer.toggle(false);
  void player.syncPresence(true);
  select(sections[0]!.id);
  Notify.create({ message: "Настройки сброшены" });
}
</script>
