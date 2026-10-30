<template>
  <q-dialog v-model="model">
    <div
      class="flex flex-col w-[min(520px,92vw)] max-h-[82vh] overflow-hidden rounded-[var(--radius,12px)] bg-[var(--surface)] outline-none [&_*]:outline-none"
    >
      <div class="flex items-center gap-[12px] pt-[14px] px-[14px] pb-[12px]">
        <div
          class="cover cover-round flex-none w-[42px] h-[42px] rounded-full overflow-hidden bg-[var(--surface-2)] flex items-center justify-center [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block"
        >
          <img v-if="artist?.cover_url" :src="artist.cover_url" />
          <Icon
            v-else
            name="mingcute:user-2-line"
            :size="22"
            class="text-[color:var(--fg-faint)]"
          />
        </div>

        <div class="col" style="min-width: 0">
          <div class="text-[15px] font-semibold truncate">
            {{ artist?.name }}
          </div>
          <div class="mt-[1px] text-[12px] text-[color:var(--fg-dim)] truncate">
            {{ subtitle }}
          </div>
        </div>

        <div
          class="flex w-[30px] h-[30px] items-center justify-center rounded-full text-[color:var(--fg-faint)] cursor-pointer select-none transition-[background,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] p-0 border-0 outline-none appearance-none"
          @click="model = false"
        >
          <Icon name="mingcute:close-line" :size="16" />
        </div>
      </div>

      <div class="overflow-y-auto pt-0 px-[16px] pb-[16px]">
        <div class="flex flex-col">
          <div
            v-for="fact in facts"
            :key="fact.key"
            class="flex items-baseline gap-[8px] py-[7px] text-[13px]"
          >
            <span class="flex-1 text-[color:var(--fg-dim)]">
              {{ fact.label }}
            </span>
            <span class="tabular-nums">{{ fact.value }}</span>
            <span
              v-if="fact.delta"
              class="text-[11px] tabular-nums"
              :class="
                fact.dir === 'up'
                  ? 'text-[#35c26a]'
                  : 'text-[color:var(--accent,#fa2d48)]'
              "
            >
              {{ fact.delta }}
            </span>
          </div>
        </div>

        <div
          v-if="chart"
          class="mt-[14px] [&_svg]:block [&_svg]:w-full [&_svg]:h-[56px] [&_polyline]:[stroke:var(--fg-dim)] [&_polyline]:[stroke-width:1.5] [&_polyline]:[vector-effect:non-scaling-stroke]"
        >
          <svg viewBox="0 0 300 56" preserveAspectRatio="none">
            <polyline :points="chart.line" fill="none" />
          </svg>
          <div
            class="flex justify-between gap-[10px] text-[10px] text-[color:var(--fg-dim)]"
          >
            <span>{{ chart.from }}</span>
            <span>слушатели по локальным замерам</span>
            <span>{{ chart.to }}</span>
          </div>
        </div>

        <p
          v-if="artist?.description"
          class="mt-[16px] mx-0 mb-0 text-[13px] leading-[1.6] whitespace-pre-line"
        >
          {{ artist.description }}
        </p>

        <div
          v-if="artist?.genres?.length"
          class="flex flex-wrap gap-[6px] mt-[14px]"
        >
          <span
            v-for="genre in artist.genres"
            :key="genre"
            class="h-[30px] px-[14px] py-0 inline-flex items-center rounded-full bg-[var(--surface)] text-[color:var(--fg-dim)] text-[13px] font-medium cursor-pointer select-none transition-[background,color] duration-[140ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]"
          >
            {{ genre }}
          </span>
        </div>

        <div
          v-if="links.length"
          class="flex flex-wrap gap-y-[6px] gap-x-[14px] mt-[14px] [&_a]:text-[color:var(--fg-dim)] [&_a]:text-[12px] [&_a]:no-underline [&_a]:cursor-pointer hover:[&_a]:text-[color:var(--fg)]"
        >
          <a
            v-for="link in links"
            :key="link.href"
            :title="link.href"
            @click.prevent="openLink(link.href)"
          >
            {{ link.title }}
          </a>
        </div>
      </div>

      <div
        class="flex items-center justify-between gap-[10px] pt-[10px] px-[16px] pb-[12px]"
      >
        <span class="text-[11px] text-[color:var(--fg-dim)]">
          id {{ artist?.id
          }}<template v-if="updatedAt"> · обновлено {{ updatedAt }}</template>
        </span>
        <button
          v-if="history.length"
          class="p-0 border-0 outline-none bg-transparent text-[color:var(--fg-dim)] text-[11px] cursor-pointer hover:text-[color:var(--fg)]"
          type="button"
          @click="resetHistory"
        >
          очистить замеры
        </button>
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { api } from "@/api/client";
import type { ArtistPage } from "@/api/types";
import type { ArtistSnapshot } from "@/lib/artistStats";
import {
  artistHistory,
  clearArtistStats,
  seriesOf,
  statDelta,
} from "@/lib/artistStats";

const props = defineProps<{
  open: boolean;
  artist: ArtistPage | null;
  links: Array<{ href: string; title: string }>;
}>();

const emit = defineEmits<{ "update:open": [boolean] }>();

const model = computed({
  get: () => props.open,
  set: (value: boolean) => emit("update:open", value),
});

const history = ref<ArtistSnapshot[]>([]);

watch(
  () => [props.open, props.artist?.id] as const,
  ([open, id]) => {
    if (open && id) history.value = artistHistory(id);
  },
  { immediate: true },
);

const subtitle = computed(() => {
  const genres = props.artist?.genres ?? [];
  return genres.length ? genres.slice(0, 3).join(" · ") : "Артист";
});

const count = (value: number) => value.toLocaleString("ru-RU");

const day = (ts: number) =>
  new Date(ts).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });

const facts = computed(() => {
  const defs = [
    { key: "listeners", label: "слушателей в месяц" },
    { key: "likes", label: "лайков" },
    { key: "tracks", label: "треков" },
    { key: "albums", label: "альбомов" },
  ] as const;

  return defs.map((def) => {
    const stat = statDelta(history.value, def.key, null);
    const diff = stat.diff ?? 0;
    return {
      key: def.key,
      label: def.label,
      value: stat.value === null ? "—" : count(stat.value),
      delta:
        diff === 0 ? "" : `${diff > 0 ? "+" : "−"}${count(Math.abs(diff))}`,
      dir: diff > 0 ? "up" : "down",
    };
  });
});

const chart = computed(() => {
  const points = seriesOf(history.value, "listeners");
  if (points.length < 3) return null;

  const values = points.map((p) => p.v);
  const min = Math.min(...values);
  const range = Math.max(...values) - min || 1;
  const line = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * 300;
      const y = 52 - ((p.v - min) / range) * 46;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return {
    line,
    from: day(points[0]!.t),
    to: day(points[points.length - 1]!.t),
  };
});

const updatedAt = computed(() => {
  const last = history.value[history.value.length - 1];
  return last ? day(last.t) : "";
});

function openLink(url: string) {
  void api.openExternal(url);
}

function resetHistory() {
  if (!props.artist?.id) return;
  clearArtistStats(props.artist.id);
  history.value = [];
}
</script>
