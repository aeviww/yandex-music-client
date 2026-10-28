<template>
  <q-page class="!overflow-hidden">
    <div class="w-full h-full overscroll-contain overflow-x-hidden overflow-y-auto">
      <div class="flex max-w-[860px] flex-col mx-auto my-0 gap-[26px] pt-[var(--page-top-gap)] px-[var(--page-padding)] pb-[56px] max-[1024px]:pt-[18px]">
        <header class="flex items-center gap-[18px] min-w-0 max-[720px]:items-start max-[720px]:gap-[14px] [&_h1]:overflow-hidden [&_h1]:mt-[6px] [&_h1]:mx-0 [&_h1]:mb-0 [&_h1]:text-[30px] [&_h1]:font-bold [&_h1]:tracking-[-0.03em] [&_h1]:leading-[1.1] [&_h1]:text-ellipsis [&_h1]:whitespace-nowrap max-[720px]:[&_h1]:text-[23px]">
          <div class="cover relative grid overflow-hidden w-[132px] h-[132px] flex-none rounded-[16px] bg-[var(--surface-2)] place-items-center [&_img]:w-full [&_img]:h-full [&_img]:object-cover max-[720px]:w-[96px] max-[720px]:h-[96px]">
            <img
              v-if="coverUrl"
              :src="coverUrl"
              alt=""
              loading="lazy"
              decoding="async"
            />
            <Icon v-else name="mingcute:wave-line" :size="26" class="text-[color:var(--fg-faint)]" />
            <TrackMenu
              v-if="player.current"
              :context-menu="true"
              :track="player.current"
            />
          </div>

          <div class="flex min-w-0 flex-col">
            <span class="text-[color:var(--fg-faint)] text-[11px] font-[620] tracking-[0.08em] uppercase">{{ stationTitle }}</span>
            <h1>{{ hasCurrent ? currentTitle : "Моя волна" }}</h1>
            <p v-if="hasCurrent" class="overflow-hidden mt-[6px] mx-0 mb-0 text-[color:var(--fg-dim)] text-[13px] text-ellipsis whitespace-nowrap [&_.link]:text-inherit [&_.link:hover]:text-[color:var(--fg)]">
              <ArtistsLine
                :artists="player.current?.artists ?? []"
                :limit="3"
              />
            </p>
            <p v-else class="overflow-hidden mt-[6px] mx-0 mb-0 text-[color:var(--fg-dim)] text-[13px] text-ellipsis whitespace-nowrap [&_.link]:text-inherit [&_.link:hover]:text-[color:var(--fg)]">{{ heroSubtitle }}</p>

            <div class="flex items-center mt-[16px] gap-[8px]">
              <button type="button" class="inline-flex h-[38px] items-center pt-0 pr-[18px] pb-0 pl-[15px] border-0 rounded-full bg-[var(--fg)] text-[color:var(--bg)] cursor-pointer text-[13px] font-[640] gap-[8px] transition-[transform,opacity] duration-[140ms] ease-[ease] hover:scale-[1.02] active:scale-[0.98]" @click="onPrimary">
                <q-spinner v-if="player.loading" size="15px" />
                <Icon v-else :name="primaryIcon" :size="16" />
                <span>{{ primaryLabel }}</span>
              </button>

              <template v-if="hasCurrent">
                <button
                  type="button"
                  class="grid w-[36px] h-[36px] border border-[color:var(--line)] rounded-full text-[color:var(--fg-dim)] cursor-pointer place-items-center transition-[background,color,border-color] duration-[140ms] ease-[ease] hover:border-transparent hover:bg-[var(--surface-2)] hover:text-[color:var(--fg)]"
                  title="Нравится"
                  @click="player.like()"
                >
                  <Icon name="mingcute:heart-line" :size="16" />
                </button>
                <button
                  type="button"
                  class="grid w-[36px] h-[36px] border border-[color:var(--line)] rounded-full text-[color:var(--fg-dim)] cursor-pointer place-items-center transition-[background,color,border-color] duration-[140ms] ease-[ease] hover:border-transparent hover:bg-[var(--surface-2)] hover:text-[color:var(--fg)]"
                  title="Не нравится"
                  @click="player.dislike()"
                >
                  <Icon name="mingcute:heart-crack-line" :size="16" />
                </button>
                <button
                  type="button"
                  class="grid w-[36px] h-[36px] border border-[color:var(--line)] rounded-full text-[color:var(--fg-dim)] cursor-pointer place-items-center transition-[background,color,border-color] duration-[140ms] ease-[ease] hover:border-transparent hover:bg-[var(--surface-2)] hover:text-[color:var(--fg)]"
                  title="Следующий"
                  @click="player.next(false)"
                >
                  <Icon name="mingcute:fast-forward-fill" :size="16" />
                </button>
              </template>
            </div>
          </div>
        </header>

        <p v-if="errorText" class="flex items-center justify-between m-0 px-[14px] py-[11px] rounded-[12px] bg-[var(--surface)] text-[color:var(--fg-dim)] text-[12.5px] gap-[12px] [&_button]:border-0 [&_button]:text-[color:var(--fg)] [&_button]:cursor-pointer [&_button]:text-[12.5px] [&_button]:font-semibold [&_button]:underline [&_button]:underline-offset-[3px] [&_button]:bg-transparent">
          {{ errorText }}
          <button type="button" @click="refresh">Обновить</button>
        </p>

        <div class="relative flex items-center min-w-0">
          <button
            v-show="canScrollLeft"
            type="button"
            class="absolute left-[0] z-[2] top-[50%] grid w-[26px] h-[26px] border border-[color:var(--line)] rounded-full bg-[var(--bg)] text-[color:var(--fg)] cursor-pointer place-items-center [transform:translateY(-50%)] transition-[background,border-color] duration-[140ms] ease-[ease] hover:border-transparent hover:bg-[var(--surface-2)]"
            aria-label="Прокрутить влево"
            @click="scrollStations(-1)"
          >
            <Icon name="mingcute:left-line" :size="15" />
          </button>

          <nav
            ref="chipsEl"
            class="flex flex-1 overflow-x-auto pb-[2px] gap-[7px] touch-pan-y select-none [scrollbar-width:none] [overscroll-behavior-x:contain] [-webkit-user-select:none] [&::-webkit-scrollbar]:hidden"
            :class="[
              dragging
                ? 'cursor-grabbing [scroll-snap-type:none] [&>button]:pointer-events-none'
                : 'cursor-grab [scroll-snap-type:x_proximity]',
              canScrollLeft && canScrollRight
                ? '[mask-image:linear-gradient(to_right,transparent_0,#000_26px,#000_calc(100%_-_26px),transparent_100%)]'
                : canScrollLeft
                  ? '[mask-image:linear-gradient(to_right,transparent_0,#000_26px)]'
                  : canScrollRight
                    ? '[mask-image:linear-gradient(to_right,#000_calc(100%_-_26px),transparent_100%)]'
                    : '',
            ]"
            @pointerdown="onDragStart"
            @wheel="onChipsWheel"
            @scroll="updateEdges"
          >
            <button
              v-for="item in stations"
              :key="item.id"
              type="button"
              class="h-[32px] flex-none px-[14px] py-0 border border-[color:var(--line)] rounded-full text-[color:var(--fg-dim)] cursor-pointer text-[12.5px] font-[560] whitespace-nowrap [scroll-snap-align:start] transition-[background,color,border-color] duration-[140ms] ease-[ease] hover:border-transparent hover:bg-[var(--surface-2)] hover:text-[color:var(--fg)]"
              :class="{ '!border-transparent !bg-[var(--fg)] !text-[color:var(--bg)]': isActiveStation(item) }"
              @click="onChipClick(item)"
            >
              {{ item.name }}
            </button>
          </nav>

          <button
            v-show="canScrollRight"
            type="button"
            class="absolute right-[0] z-[2] top-[50%] grid w-[26px] h-[26px] border border-[color:var(--line)] rounded-full bg-[var(--bg)] text-[color:var(--fg)] cursor-pointer place-items-center [transform:translateY(-50%)] transition-[background,border-color] duration-[140ms] ease-[ease] hover:border-transparent hover:bg-[var(--surface-2)]"
            aria-label="Прокрутить вправо"
            @click="scrollStations(1)"
          >
            <Icon name="mingcute:right-line" :size="15" />
          </button>
        </div>

        <section v-if="settingsGroups.length" class="flex flex-col px-0 py-[4px] gap-[2px] border-t border-b border-[var(--line)]">
          <div
            v-for="group in settingsGroups"
            :key="group.key"
            class="flex min-h-[42px] items-center justify-between gap-[16px]"
          >
            <span class="text-[color:var(--fg-dim)] text-[12.5px]">{{ group.label }}</span>
            <div class="flex flex-none gap-[2px] p-[3px] border border-[color:var(--line)] rounded-[9px] bg-[color-mix(in_srgb,var(--fg)_5%,transparent)]">
              <button
                v-for="option in group.options"
                :key="option.value"
                type="button"
                class="min-h-[26px] px-[11px] py-[4px] border-0 rounded-[6px] bg-transparent text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] whitespace-nowrap cursor-pointer transition-[background,color] duration-[140ms] ease-[ease] hover:text-[color:var(--fg)] disabled:opacity-[0.45] disabled:pointer-events-none"
                :class="{ 'bg-[var(--hover)] text-[color:var(--fg)] font-semibold': group.current === option.value }"
                :disabled="applying"
                @click="applySetting(group.key, option.value)"
              >
                {{ option.name }}
              </button>
            </div>
          </div>
        </section>

        <section v-if="queueWindow.length" class="[&_h3]:mt-0 [&_h3]:mx-0 [&_h3]:mb-[10px] [&_h3]:text-[color:var(--fg-faint)] [&_h3]:text-[11px] [&_h3]:font-[620] [&_h3]:tracking-[0.08em] [&_h3]:uppercase">
          <h3>Очередь</h3>
          <div
            v-for="item in queueWindow"
            :key="`${item.track.id}-${item.index}`"
            class="flex items-center px-[8px] py-[6px] rounded-[10px] cursor-pointer gap-[11px] transition-[background] duration-[120ms] ease-[ease] hover:bg-[var(--surface)]"
            :class="{
              'bg-[var(--surface)]': item.index === player.index,
              'opacity-[0.45]': item.index < player.index,
            }"
            @click="jumpTo(item.index)"
          >
            <span class="cover grid overflow-hidden w-[38px] h-[38px] flex-none rounded-[7px] bg-[var(--surface-2)] place-items-center [&_img]:w-full [&_img]:h-full [&_img]:object-cover">
              <img
                v-if="item.track.cover_url"
                :src="item.track.cover_url"
                alt=""
                loading="lazy"
                decoding="async"
              />
              <Icon v-else name="mingcute:music-line" :size="14" class="text-[color:var(--fg-faint)]" />
            </span>
            <span class="flex min-w-0 flex-1 flex-col gap-[2px]">
              <span
                class="overflow-hidden text-[13px] font-[540] text-ellipsis whitespace-nowrap"
                :class="item.index === player.index ? '!text-[color:var(--accent)] font-[640]' : 'text-[color:var(--fg)]'"
              >{{ item.track.title }}</span>
              <span class="overflow-hidden text-[color:var(--fg-faint)] text-[11.5px] text-ellipsis whitespace-nowrap">
                <ArtistsLine :artists="item.track.artists" :limit="2" />
              </span>
            </span>
            <Icon
              v-if="item.index === player.index"
              :name="player.isPlaying ? 'mingcute:pause-fill' : 'mingcute:play-fill'"
              :size="13"
              class="flex-none text-[color:var(--accent)]"
            />
            <TrackMenu :context-menu="true" :track="item.track" />
          </div>
        </section>

        <p v-else-if="!hasCurrent" class="m-0 text-[color:var(--fg-faint)] text-[13px]">
          Запусти волну - подберём музыку под твоё настроение.
        </p>
      </div>
    </div>
  </q-page>
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
import { api } from "@/api/client";
import { Notify } from "quasar";
import type { StationInfo, Track, WheelItem } from "@/api/types";
import ArtistsLine from "@/components/common/ArtistsLine.vue";
import TrackMenu from "@/components/common/TrackMenu.vue";
import { readCache, swr } from "@/lib/cache";
import { usePlayerStore } from "@/stores/player/index";

const DEFAULT_STATION = "user:onyourwave";

function station(id: string, name: string): WheelItem {
  return {
    id,
    kind: "wave",
    name,
    description: null,
    cover_url: null,
    color: null,
    station: id,
    artists: [],
  };
}

const FALLBACK_STATIONS: WheelItem[] = [
  station(DEFAULT_STATION, "Моя волна"),
  station("personal:collection", "Коллекция"),
  station("mood:all", "По настроению"),
  station("genre:all", "По жанру"),
  station("activity:all", "Под занятие"),
];

const player = usePlayerStore();

const items = ref<WheelItem[]>([]);
const loadError = ref<string | null>(null);
const info = ref<StationInfo | null>(null);
const applying = ref(false);

type SettingKey = "moodEnergy" | "diversity" | "language";

function withOption(
  options: Array<{ value: string; name: string }>,
  extra: { value: string; name: string },
) {
  if (options.some((o) => o.value === extra.value)) return options;
  return [...options, extra];
}

const settingsGroups = computed(() => {
  const data = info.value;
  if (!data) return [];
  const groups: Array<{
    key: SettingKey;
    label: string;
    current: string | null;
    options: Array<{ value: string; name: string }>;
  }> = [
    {
      key: "moodEnergy",
      label: "Настроение",
      current: data.mood_energy,
      options: data.moods,
    },
    {
      key: "diversity",
      label: "Разнообразие",
      current: data.diversity,
      options: data.diversities,
    },
    {
      key: "language",
      label: "Язык",
      current: data.language,
      options: withOption(data.languages, {
        value: "without-words",
        name: "Без слов",
      }),
    },
  ];
  return groups.filter((group) => group.options.length > 1);
});

async function loadInfo() {
  try {
    info.value = await api.stationInfo(player.stationId ?? DEFAULT_STATION);
  } catch {
    info.value = null;
  }
}

async function applySetting(key: SettingKey, value: string) {
  if (applying.value) return;
  applying.value = true;
  try {
    await api.setStationSettings({
      station: player.stationId ?? DEFAULT_STATION,
      [key]: value,
    });
    await loadInfo();
    await player.startWave(
      player.stationId ?? DEFAULT_STATION,
      player.stationName || undefined,
    );
  } catch {
    Notify.create({ message: "Не удалось обновить настройки волны" });
  } finally {
    applying.value = false;
  }
}

const stations = computed(() => {
  const wheel = items.value.filter((item) => item?.kind === "wave");
  const list = wheel.length ? wheel : FALLBACK_STATIONS;
  const base = list.some((item) => stationIdOf(item) === DEFAULT_STATION)
    ? list
    : [FALLBACK_STATIONS[0] as WheelItem, ...list];

  const currentSt = player.stationId;
  if (
    currentSt &&
    currentSt !== DEFAULT_STATION &&
    !base.some((item) => stationIdOf(item) === currentSt)
  ) {
    const contextualChip: WheelItem = {
      id: currentSt,
      kind: "wave",
      name: player.stationName || "Контекстная волна",
      description: null,
      cover_url: null,
      color: null,
      station: currentSt,
      artists: [],
    };
    return [contextualChip, ...base];
  }

  return base;
});

const hasCurrent = computed(() => Boolean(player.current));
const stationTitle = computed(() => player.stationName || "Моя волна");
const errorText = computed(() => player.waveError || loadError.value);

const currentTitle = computed(() => player.current?.title ?? "");
const coverUrl = computed(() => player.current?.cover_url ?? null);

const heroSubtitle = computed(() =>
  hasCurrent.value
    ? "Бесконечный поток, который подстраивается под тебя"
    : "Выбери станцию или просто нажми «Запустить»",
);

const primaryIcon = computed(() =>
  hasCurrent.value && player.isPlaying ? "mingcute:pause-fill" : "mingcute:play-fill",
);

const primaryLabel = computed(() => {
  if (!hasCurrent.value) return "Запустить";
  return player.isPlaying ? "Пауза" : "Продолжить";
});

const queueWindow = computed(() => {
  const queue = player.queue ?? [];
  const idx = player.index;
  const start = Math.max(0, idx - 10);
  const end = Math.min(queue.length, idx + 13);
  const out: Array<{ track: Track; index: number }> = [];
  for (let i = start; i < end; i++) {
    const track = queue[i];
    if (track) out.push({ track, index: i });
  }
  return out;
});

function stationIdOf(item: WheelItem | undefined): string {
  if (!item) return DEFAULT_STATION;
  return item.station || item.id || DEFAULT_STATION;
}

function isActiveStation(item: WheelItem): boolean {
  return stationIdOf(item) === (player.stationId ?? DEFAULT_STATION);
}

function onPrimary() {
  if (!hasCurrent.value) void player.startWave();
  else player.toggle();
}

function playStation(item: WheelItem) {
  void player.startWave(stationIdOf(item), item.name);
}

const chipsEl = ref<HTMLElement | null>(null);
const dragging = ref(false);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

let activePointer: number | null = null;
let startX = 0;
let startScroll = 0;
let travelled = 0;
let lastX = 0;
let lastAt = 0;
let velocity = 0;
let glideFrame = 0;

function updateEdges() {
  const el = chipsEl.value;
  if (!el) return;
  const max = el.scrollWidth - el.clientWidth;
  canScrollLeft.value = el.scrollLeft > 4;
  canScrollRight.value = max > 4 && el.scrollLeft < max - 4;
}

function stopGlide() {
  if (glideFrame) cancelAnimationFrame(glideFrame);
  glideFrame = 0;
}

function glide() {
  const el = chipsEl.value;
  if (!el) return stopGlide();
  velocity *= 0.93;
  if (Math.abs(velocity) < 0.2) return stopGlide();
  el.scrollLeft -= velocity;
  updateEdges();
  glideFrame = requestAnimationFrame(glide);
}

function onDragMove(event: PointerEvent) {
  const el = chipsEl.value;
  if (!el || event.pointerId !== activePointer) return;
  const shift = event.clientX - startX;
  if (!dragging.value && Math.abs(shift) > 4) dragging.value = true;
  if (!dragging.value) return;
  travelled = Math.abs(shift);
  el.scrollLeft = startScroll - shift;
  const elapsed = event.timeStamp - lastAt;
  if (elapsed > 0) velocity = ((event.clientX - lastX) / elapsed) * 16;
  lastX = event.clientX;
  lastAt = event.timeStamp;
  updateEdges();
}

function onDragEnd(event: PointerEvent) {
  if (activePointer !== null && event.pointerId !== activePointer) return;
  window.removeEventListener("pointermove", onDragMove);
  window.removeEventListener("pointerup", onDragEnd);
  window.removeEventListener("pointercancel", onDragEnd);
  activePointer = null;
  if (dragging.value && Math.abs(velocity) > 0.6) glide();
  window.setTimeout(() => {
    dragging.value = false;
    travelled = 0;
  }, 0);
  updateEdges();
}

function onDragStart(event: PointerEvent) {
  const el = chipsEl.value;
  if (!el || event.button !== 0) return;
  if (el.scrollWidth <= el.clientWidth) return;
  stopGlide();
  activePointer = event.pointerId;
  startX = event.clientX;
  lastX = event.clientX;
  lastAt = event.timeStamp;
  startScroll = el.scrollLeft;
  travelled = 0;
  velocity = 0;
  window.addEventListener("pointermove", onDragMove);
  window.addEventListener("pointerup", onDragEnd);
  window.addEventListener("pointercancel", onDragEnd);
}

function onChipClick(item: WheelItem) {
  if (travelled > 6) return;
  playStation(item);
}

function onChipsWheel(event: WheelEvent) {
  const el = chipsEl.value;
  if (!el || el.scrollWidth <= el.clientWidth) return;
  const shift =
    Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.deltaY;
  if (!shift) return;
  event.preventDefault();
  stopGlide();
  el.scrollLeft += shift;
  updateEdges();
}

function scrollStations(direction: number) {
  const el = chipsEl.value;
  if (!el) return;
  stopGlide();
  el.scrollBy({
    left: direction * Math.max(180, el.clientWidth * 0.8),
    behavior: "smooth",
  });
  window.setTimeout(updateEdges, 340);
}

function jumpTo(index: number) {
  const queue = player.queue ?? [];
  if (index < 0 || index >= queue.length) return;
  player.index = index;
  void player.loadCurrent();
}

async function load() {
  const cached = readCache<WheelItem[]>("wave.wheel");
  if (cached?.length) items.value = cached;
  await swr<WheelItem[]>("wave.wheel", () => api.wheel(), {
    onData: (data) => {
      if (Array.isArray(data)) items.value = data;
      loadError.value = null;
    },
    onError: () => {
      if (!items.value.length) {
        loadError.value = "Не удалось загрузить список станций";
      }
    },
  });
}

function refresh() {
  loadError.value = null;
  void load();
}

let chipsResize: ResizeObserver | null = null;

watch(stations, () => {
  void nextTick(updateEdges);
});

onMounted(() => {
  void loadInfo();
  void load();

  void nextTick(() => {
    updateEdges();
    const el = chipsEl.value;
    if (el && typeof ResizeObserver !== "undefined") {
      chipsResize = new ResizeObserver(updateEdges);
      chipsResize.observe(el);
    }
  });
  window.addEventListener("resize", updateEdges);
});

onBeforeUnmount(() => {
  stopGlide();
  chipsResize?.disconnect();
  chipsResize = null;
  window.removeEventListener("resize", updateEdges);
  window.removeEventListener("pointermove", onDragMove);
  window.removeEventListener("pointerup", onDragEnd);
  window.removeEventListener("pointercancel", onDragEnd);
});
</script>
