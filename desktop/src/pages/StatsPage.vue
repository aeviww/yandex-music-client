<template>
  <div class="flex h-[calc(100vh_-_52px_-_var(--player-height,_78px))] flex-col p-0 !min-h-0 !overflow-hidden">
    <div class="min-h-0 flex-auto overflow-y-auto overscroll-contain">
      <div class="flex flex-col gap-[20px] pt-[var(--page-top-gap)] px-[var(--page-padding)] pb-[40px]">
        <div class="flex items-end justify-between gap-[20px] flex-wrap">
          <div>
            <div class="text-[calc(30px*var(--text-scale,1))] font-semibold tracking-[-0.03em] leading-[1.15]">Статистика</div>
            <p class="text-[color:var(--fg-faint)] text-[calc(13px*var(--text-scale,1))] mt-[6px] mx-0 mb-0">
              {{ periodLabel.toLowerCase() }} · история хранится только на этом
              компьютере
            </p>
          </div>

          <div class="flex items-center gap-[10px] flex-wrap">
            <div class="flex flex-none gap-[2px] p-[3px] border border-[color:var(--line)] rounded-[9px] bg-[color-mix(in_srgb,var(--fg)_5%,transparent)]">
              <button
                v-for="p in periods"
                :key="p.days"
                class="min-h-[26px] px-[11px] py-[4px] border-0 rounded-[6px] bg-transparent text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] whitespace-nowrap cursor-pointer transition-[background,color] duration-[140ms] ease-[ease] hover:text-[color:var(--fg)]"
                :class="{ 'bg-[var(--hover)] text-[color:var(--fg)] font-semibold': days === p.days }"
                @click="days = p.days"
              >
                {{ p.label }}
              </button>
            </div>
            <button class="inline-flex h-[32px] items-center justify-center px-[14px] py-0 border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] cursor-pointer text-[calc(12px*var(--text-scale,1))] font-medium gap-[6px] transition-[background,border-color,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none" type="button" @click="clear">
              <Icon name="mingcute:delete-2-line" :size="14" />
              <span>Очистить</span>
            </button>
          </div>
        </div>

        <div class="grid gap-0 border border-[color:var(--line)] rounded-[var(--radius)] bg-[var(--surface)] overflow-hidden [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))] max-[900px]:[grid-template-columns:repeat(2,minmax(0,1fr))] [&>*:first-child]:border-l-0 max-[900px]:[&>*:nth-child(odd)]:border-l-0 max-[900px]:[&>*:nth-child(n+3)]:border-t max-[900px]:[&>*:nth-child(n+3)]:border-[color:var(--line)]">
          <div
            v-for="card in cards"
            :key="card.label"
            class="flex flex-col gap-[4px] pt-[14px] px-[18px] pb-[15px] border-l border-[var(--line)]"
          >
            <span class="text-[color:var(--fg-faint)] text-[11px] font-semibold tracking-[0.05em] uppercase">{{ card.label }}</span>
            <div class="text-[22px] font-semibold tracking-[-0.025em] leading-[1.1] tabular-nums [&_small]:ml-[2px] [&_small]:text-[color:var(--fg-dim)] [&_small]:text-[12px] [&_small]:font-medium">
              {{ card.value
              }}<small v-if="card.suffix">{{ card.suffix }}</small>
            </div>
            <span class="text-[color:var(--fg-faint)] text-[calc(11px*var(--text-scale,1))]">{{ card.hint }}</span>
          </div>
        </div>

        <section class="flex flex-col gap-[12px]">
          <div class="flex items-baseline justify-between gap-[12px] [&_h2]:m-0 [&_h2]:text-[calc(15px*var(--text-scale,1))] [&_h2]:font-semibold [&_h2]:tracking-[-0.015em] [&_h2]:leading-[1.2] [&_h2]:font-[inherit]">
            <h2>Минуты по дням</h2>
            <span class="text-[color:var(--fg-faint)] text-[calc(12px*var(--text-scale,1))]">
              пик {{ peakMinutes }} мин · в среднем {{ avgPerDay }} мин
            </span>
          </div>

          <div class="rounded-[14px] px-[18px] py-[16px] cursor-default transition-[background] duration-[160ms] ease-[ease] hover:bg-[var(--surface)] p-[10px]">
            <div v-if="hasChartData" class="flex flex-col gap-[10px]">
              <div class="flex h-[168px] gap-[12px]">
                <div class="flex w-[32px] flex-none flex-col justify-between text-[color:var(--fg-faint)] text-[11px] text-right">
                  <span>{{ peakMinutes }}</span>
                  <span>{{ Math.round(peakMinutes / 2) }}</span>
                  <span>0</span>
                </div>

                <div class="relative min-w-0 flex-auto">
                  <svg
                    class="block w-full h-full"
                    :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient
                        id="statsAreaFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stop-color="var(--accent)"
                          stop-opacity="0.36"
                        />
                        <stop
                          offset="100%"
                          stop-color="var(--accent)"
                          stop-opacity="0"
                        />
                      </linearGradient>
                    </defs>

                    <line
                      v-for="line in gridLines"
                      :key="line"
                      class="stroke-[var(--line)] [stroke-width:1] [html[data-mode=light]_&]:stroke-[rgba(0,0,0,0.09)]"
                      x1="0"
                      :y1="line"
                      :x2="WIDTH"
                      :y2="line"
                      vector-effect="non-scaling-stroke"
                    />

                    <path
                      :d="areaPath"
                      fill="url(#statsAreaFill)"
                    />
                    <path
                      class="fill-none stroke-[var(--accent)] [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:2]"
                      :d="linePath"
                      vector-effect="non-scaling-stroke"
                    />
                  </svg>

                  <div class="absolute inset-0">
                    <div
                      v-for="point in points"
                      :key="point.day"
                      class="group absolute top-0 bottom-0 w-[26px] [transform:translateX(-50%)]"
                      :style="{ left: `${point.x}%` }"
                    >
                      <span
                        class="absolute left-[50%] w-[9px] h-[9px] rounded-full opacity-[0] shadow-[0_0_0_3px_var(--surface)] [transform:translate(-50%,-50%)_scale(0.6)] transition-[opacity,transform] duration-[120ms] ease-[ease] group-hover:opacity-[1] group-hover:[transform:translate(-50%,-50%)_scale(1)]"
                        :class="point.seconds ? 'bg-[var(--accent)]' : 'bg-[var(--fg-faint)]'"
                        :style="{ top: `${point.top}%` }"
                      />
                      <q-tooltip anchor="top middle" self="bottom middle">
                        {{ point.label }} - {{ point.minutes }} мин
                      </q-tooltip>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex justify-between pl-[44px] text-[color:var(--fg-faint)] text-[11px]">
                <span v-for="tick in axisTicks" :key="tick.day">
                  {{ tick.label }}
                </span>
              </div>
            </div>

            <div v-else class="flex min-h-[96px] flex-col items-center justify-center gap-[8px] text-center">
              <Icon name="mingcute:chart-bar-line" :size="22" class="text-[color:var(--fg-faint)]" />
              <span class="text-[color:var(--fg-faint)] text-[calc(13px*var(--text-scale,1))]"
                >Пока нечего показать за этот период.</span
              >
            </div>
          </div>
        </section>

        <div class="grid gap-[20px] [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
          <section class="flex flex-col gap-[12px]">
            <div class="flex items-baseline justify-between gap-[12px] [&_h2]:m-0 [&_h2]:text-[calc(15px*var(--text-scale,1))] [&_h2]:font-semibold [&_h2]:tracking-[-0.015em] [&_h2]:leading-[1.2] [&_h2]:font-[inherit]">
              <h2>Топ треков</h2>
              <div class="flex p-[2px] border border-[color:var(--line)] rounded-[9px] bg-[var(--surface)] gap-[2px]">
                <button
                  v-for="option in rankSorts"
                  :key="option.id"
                  class="px-[9px] py-[4px] border-0 rounded-[7px] bg-transparent text-[color:var(--fg-dim)] cursor-pointer text-[11px] transition-[background,color] duration-[140ms] ease-[ease] hover:text-[color:var(--fg)]"
                  :class="{ 'bg-[var(--hover)] text-[color:var(--fg)]': rankSort === option.id }"
                  type="button"
                  @click="rankSort = option.id"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <div class="flex flex-col gap-[2px] p-[10px] cursor-default transition-[background] duration-[160ms] ease-[ease] hover:bg-[var(--surface)] rounded-[14px]">
              <div v-if="!topTracks.length" class="flex min-h-[96px] flex-col items-center justify-center gap-[8px] text-center">
                <Icon name="mingcute:music-line" :size="20" class="text-[color:var(--fg-faint)]" />
                <span class="text-[color:var(--fg-faint)] text-[calc(13px*var(--text-scale,1))]"
                  >Пока пусто - послушай что-нибудь.</span
                >
              </div>

              <div
                v-for="(row, i) in topTracks"
                :key="row.key"
                class="flex items-center gap-[11px] px-[9px] py-[7px] rounded-[calc(var(--radius)*0.7)] transition-[background] duration-[120ms] ease-[ease] hover:bg-[var(--hover)]"
              >
                <span class="w-[20px] flex-none text-[color:var(--fg-faint)] text-[12px] tabular-nums text-right" :class="{ 'text-[color:var(--accent)] font-bold': i < 3 }">
                  {{ i + 1 }}
                </span>
                <div class="cover w-[36px] h-[36px] flex-none rounded-[8px] overflow-hidden bg-[var(--surface-2)] flex items-center justify-center [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block">
                  <img v-if="row.cover" :src="row.cover" decoding="async" />
                  <Icon v-else name="mingcute:music-line" :size="14" class="text-[color:var(--fg-faint)]" />
                </div>
                <div class="flex min-w-0 flex-auto flex-col gap-[4px]">
                  <div class="truncate text-[calc(13px*var(--text-scale,1))]">{{ row.label }}</div>
                  <div class="text-[color:var(--fg-faint)] text-[calc(11px*var(--text-scale,1))] truncate">{{ row.sub }}</div>
                </div>
                <span class="flex-none px-[9px] py-[3px] rounded-full bg-[var(--surface-2)] text-[color:var(--fg-dim)] text-[11px] tabular-nums whitespace-nowrap">{{ rankValue(row) }}</span>
              </div>
            </div>
          </section>

          <section class="flex flex-col gap-[12px]">
            <div class="flex items-baseline justify-between gap-[12px] [&_h2]:m-0 [&_h2]:text-[calc(15px*var(--text-scale,1))] [&_h2]:font-semibold [&_h2]:tracking-[-0.015em] [&_h2]:leading-[1.2] [&_h2]:font-[inherit]">
              <h2>Топ исполнителей</h2>
              <div class="flex p-[2px] border border-[color:var(--line)] rounded-[9px] bg-[var(--surface)] gap-[2px]">
                <button
                  v-for="option in rankSorts"
                  :key="option.id"
                  class="px-[9px] py-[4px] border-0 rounded-[7px] bg-transparent text-[color:var(--fg-dim)] cursor-pointer text-[11px] transition-[background,color] duration-[140ms] ease-[ease] hover:text-[color:var(--fg)]"
                  :class="{ 'bg-[var(--hover)] text-[color:var(--fg)]': rankSort === option.id }"
                  type="button"
                  @click="rankSort = option.id"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <div class="flex flex-col gap-[2px] p-[10px] cursor-default transition-[background] duration-[160ms] ease-[ease] hover:bg-[var(--surface)] rounded-[14px]">
              <div v-if="!topArtists.length" class="flex min-h-[96px] flex-col items-center justify-center gap-[8px] text-center">
                <Icon name="mingcute:mic-line" :size="20" class="text-[color:var(--fg-faint)]" />
                <span class="text-[color:var(--fg-faint)] text-[calc(13px*var(--text-scale,1))]">Пока пусто.</span>
              </div>

              <div
                v-for="(row, i) in topArtists"
                :key="row.key"
                class="flex items-center gap-[11px] px-[9px] py-[7px] rounded-[calc(var(--radius)*0.7)] transition-[background] duration-[120ms] ease-[ease] hover:bg-[var(--hover)]"
              >
                <span class="w-[20px] flex-none text-[color:var(--fg-faint)] text-[12px] tabular-nums text-right" :class="{ 'text-[color:var(--accent)] font-bold': i < 3 }">
                  {{ i + 1 }}
                </span>
                <div class="cover cover-round w-[36px] h-[36px] flex-none rounded-full overflow-hidden bg-[var(--surface-2)] flex items-center justify-center [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block">
                  <img v-if="row.cover" :src="row.cover" decoding="async" />
                  <Icon v-else name="mingcute:mic-line" :size="14" class="text-[color:var(--fg-faint)]" />
                </div>
                <div class="flex min-w-0 flex-auto flex-col gap-[4px]">
                  <div class="truncate text-[calc(13px*var(--text-scale,1))]">{{ row.label }}</div>
                  <div class="h-[4px] w-full rounded-[3px] bg-[var(--hover)] overflow-hidden [&>span]:block [&>span]:h-full [&>span]:rounded-[3px] [&>span]:bg-[var(--accent)] [&>span]:opacity-[0.85]">
                    <span :style="{ width: `${artistShare(row.seconds)}%` }" />
                  </div>
                </div>
                <span class="flex-none px-[9px] py-[3px] rounded-full bg-[var(--surface-2)] text-[color:var(--fg-dim)] text-[11px] tabular-nums whitespace-nowrap">{{ rankValue(row) }}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { askConfirm } from "@/lib/dialogs";
import type { RankRow } from "@/stores/stats";
import { plural } from "@/lib/format";
import { useStatsStore } from "@/stores/stats";

type ChartPoint = {
  day: string;
  label: string;
  seconds: number;
  minutes: number;
  x: number;
  y: number;
  top: number;
};

const WIDTH = 100;
const HEIGHT = 40;
const PADDING = 3;

const stats = useStatsStore();
type RankSort = "time" | "plays";

const days = ref(7);

const periods = [
  { days: 7, label: "Неделя" },
  { days: 30, label: "Месяц" },
  { days: 365, label: "Год" },
];

const periodLabel = computed(
  () => periods.find((p) => p.days === days.value)?.label ?? "Неделя",
);

const hours = computed(
  () => Math.round((stats.totalSeconds(days.value) / 3600) * 10) / 10,
);

const rankSort = ref<RankSort>("time");

const rankSorts: Array<{ id: RankSort; label: string }> = [
  { id: "time", label: "По времени" },
  { id: "plays", label: "По прослушиваниям" },
];

function rankBy(rows: RankRow[]): RankRow[] {
  const sorted = [...rows];
  sorted.sort((a, b) =>
    rankSort.value === "plays" ? b.plays - a.plays : b.seconds - a.seconds,
  );
  return sorted;
}

function rankValue(row: RankRow): string {
  if (rankSort.value === "plays")
    return plural(row.plays, "раз", "раза", "раз");
  const minutes = Math.max(1, Math.round(row.seconds / 60));
  return `${minutes} мин`;
}

const topTracks = computed(() => rankBy(stats.topTracks(days.value, 10)));
const topArtists = computed(() => rankBy(stats.topArtists(days.value, 10)));
const chart = computed(() => stats.daily(Math.min(days.value, 30)));
const hasChartData = computed(() => chart.value.some((row) => row.seconds > 0));

const avgPerDay = computed(() =>
  Math.round(stats.totalSeconds(days.value) / 60 / days.value),
);

const uniqueTracks = computed(() => stats.uniqueTracks(days.value));
const activeDays = computed(() => stats.activeDays(days.value));

const peak = computed(() =>
  Math.max(1, ...chart.value.map((row) => row.seconds)),
);
const peakMinutes = computed(() => Math.max(1, Math.round(peak.value / 60)));

const artistPeak = computed(() =>
  Math.max(1, ...topArtists.value.map((row) => row.seconds)),
);

const points = computed<ChartPoint[]>(() => {
  const rows = chart.value;
  const max = peak.value;
  const usable = HEIGHT - PADDING * 2;
  const step = rows.length > 1 ? WIDTH / (rows.length - 1) : 0;

  return rows.map((row, i) => {
    const ratio = Math.min(1, row.seconds / max);
    const y = HEIGHT - PADDING - ratio * usable;
    return {
      day: row.day,
      label: row.label,
      seconds: row.seconds,
      minutes: Math.round(row.seconds / 60),
      x: rows.length > 1 ? i * step : WIDTH / 2,
      y,
      top: (y / HEIGHT) * 100,
    };
  });
});

function curve(list: ChartPoint[]): string {
  if (!list.length) return "";
  const first = list[0] as ChartPoint;
  if (list.length === 1) return `M ${first.x} ${first.y}`;

  let path = `M ${first.x.toFixed(2)} ${first.y.toFixed(2)}`;
  for (let i = 0; i < list.length - 1; i += 1) {
    const p0 = list[Math.max(0, i - 1)] as ChartPoint;
    const p1 = list[i] as ChartPoint;
    const p2 = list[i + 1] as ChartPoint;
    const p3 = list[Math.min(list.length - 1, i + 2)] as ChartPoint;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const lo = Math.min(p1.y, p2.y);
    const hi = Math.max(p1.y, p2.y);
    const clampY = (v: number) => Math.min(hi, Math.max(lo, v));
    const c1y = clampY(p1.y + (p2.y - p0.y) / 6);
    const c2y = clampY(p2.y - (p3.y - p1.y) / 6);
    path += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return path;
}

const linePath = computed(() => curve(points.value));

const areaPath = computed(() => {
  const list = points.value;
  if (!list.length) return "";
  const first = list[0] as ChartPoint;
  const last = list[list.length - 1] as ChartPoint;
  return `${curve(list)} L ${last.x.toFixed(2)} ${HEIGHT} L ${first.x.toFixed(2)} ${HEIGHT} Z`;
});

const gridLines = [PADDING, HEIGHT / 2, HEIGHT - PADDING];

const axisTicks = computed(() => {
  const list = points.value;
  if (list.length <= 6) return list;
  const step = Math.ceil(list.length / 6);
  return list.filter((_, i) => i % step === 0 || i === list.length - 1);
});

const cards = computed(() => [
  {
    label: "Часов прослушано",
    value: hours.value,
    suffix: " ч",
    hint: periodLabel.value.toLowerCase(),
  },
  {
    label: "Прослушиваний",
    value: stats.totalPlays(days.value),
    suffix: "",
    hint: "засчитанных воспроизведений",
  },
  {
    label: "Уникальных треков",
    value: uniqueTracks.value,
    suffix: "",
    hint: `в ${activeDays.value} активных днях`,
  },
  {
    label: "Среднее за день",
    value: avgPerDay.value,
    suffix: " мин",
    hint: "по дням периода",
  },
]);

function artistShare(seconds: number): number {
  return Math.max(4, Math.round((seconds / artistPeak.value) * 100));
}

async function clear() {
  const ok = await askConfirm({
    title: "Очистить статистику?",
    message: "Вся локальная история прослушиваний будет удалена.",
    okLabel: "Очистить",
    danger: true,
  });
  if (ok) stats.clear();
}
</script>
