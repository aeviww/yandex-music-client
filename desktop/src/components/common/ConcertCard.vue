<template>
  <div
    class="concert-card group relative rounded-[14px] p-[10px] cursor-pointer transition-[background,transform] duration-[160ms] hover:bg-[var(--surface)] select-none flex flex-col"
    :style="{ width: width || '220px' }"
    @click="openConcert"
  >
    <div
      class="cover relative w-full aspect-[16/10] overflow-hidden bg-[var(--surface-2)] flex items-center justify-center flex-none rounded-[10px]"
    >
      <img
        v-if="concert.image_url"
        loading="lazy"
        decoding="async"
        :src="concert.image_url"
        class="w-full h-full object-cover block transition-transform duration-[240ms] group-hover:scale-[1.04]"
      />
      <div v-else class="flex flex-col items-center justify-center gap-[4px] text-[color:var(--fg-faint)]">
        <Icon name="mingcute:calendar-line" :size="32" />
      </div>

      <!-- Date Badge Overlay -->
      <div
        v-if="dateInfo.day"
        class="absolute left-[8px] top-[8px] flex flex-col items-center justify-center min-w-[38px] px-[6px] py-[3px] rounded-[8px] bg-[rgba(15,15,15,0.82)] backdrop-blur-[8px] text-white border border-[rgba(255,255,255,0.1)] shadow-[0_2px_8px_rgba(0,0,0,0.35)] pointer-events-none"
      >
        <span class="text-[14px] font-extrabold leading-none tracking-[-0.02em]">{{ dateInfo.day }}</span>
        <span class="text-[9px] font-bold uppercase leading-tight tracking-[0.04em] text-[var(--accent)]">{{ dateInfo.month }}</span>
      </div>

      <!-- Content Rating Badge -->
      <div
        v-if="concert.content_rating"
        class="absolute right-[8px] top-[8px] px-[6px] py-[2px] rounded-[6px] text-[10px] font-bold bg-[rgba(0,0,0,0.65)] backdrop-blur-[6px] text-white pointer-events-none border border-[rgba(255,255,255,0.08)]"
      >
        {{ concert.content_rating }}
      </div>

      <!-- Action Button on Hover -->
      <button
        v-if="concert.afisha_url"
        class="absolute right-[8px] bottom-[8px] flex w-[34px] h-[34px] items-center justify-center p-0 border-0 rounded-full bg-[var(--accent)] text-white cursor-pointer opacity-0 translate-y-[6px] transition-[opacity,transform] duration-[140ms] ease-out group-hover:opacity-[1] group-hover:translate-y-0 shadow-[0_4px_12px_rgba(0,0,0,0.35)] hover:scale-[1.08]"
        type="button"
        title="Купить билет на Яндекс Афише"
        @click.stop="openAfisha"
      >
        <Icon name="mingcute:ticket-line" :size="16" />
      </button>
    </div>

    <div class="mt-[10px] min-w-0 flex-1 flex flex-col justify-between">
      <div>
        <div class="text-[calc(13px*var(--text-scale,1))] font-bold text-[color:var(--fg)] truncate leading-snug">
          {{ concert.title }}
        </div>
        <div class="text-[calc(11.5px*var(--text-scale,1))] text-[color:var(--fg-dim)] truncate mt-[2px] flex items-center gap-[4px]">
          <span v-if="concert.city" class="font-medium text-[color:var(--fg)]">{{ concert.city }}</span>
          <span v-if="concert.city && concert.place" class="opacity-[0.5]">·</span>
          <span v-if="concert.place" class="truncate">{{ concert.place }}</span>
        </div>
      </div>

      <div class="mt-[8px] flex items-center justify-between gap-[6px] flex-wrap">
        <span
          v-if="formattedPrice"
          class="inline-flex items-center px-[7px] py-[2px] rounded-[6px] bg-[var(--surface-2)] text-[color:var(--fg-dim)] text-[11px] font-semibold"
        >
          {{ formattedPrice }}
        </span>
        <span v-if="dateInfo.time" class="text-[11px] text-[color:var(--fg-faint)] font-medium ml-auto">
          {{ dateInfo.time }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import type { ConcertBrief } from "@/api/types";
import { api } from "@/api/client";

const props = defineProps<{
  concert: ConcertBrief;
  artistId?: string | null;
  width?: string;
}>();

const router = useRouter();

const dateInfo = computed(() => {
  if (!props.concert.datetime) return { day: "", month: "", time: "", weekday: "" };
  const d = new Date(props.concert.datetime);
  if (isNaN(d.getTime())) return { day: "", month: "", time: "", weekday: "" };
  const day = d.getDate().toString();
  const month = d
    .toLocaleDateString("ru-RU", { month: "short" })
    .replace(".", "")
    .toUpperCase();
  const raw = props.concert.datetime || "";
  const hasExplicitTime =
    raw.includes("T") &&
    !raw.includes("T00:00:00") &&
    (d.getHours() !== 0 || d.getMinutes() !== 0);
  const time = hasExplicitTime
    ? d.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
  const weekday = d.toLocaleDateString("ru-RU", { weekday: "short" });
  return { day, month, time, weekday };
});

const formattedPrice = computed(() => {
  const p = props.concert.min_price;
  if (!p || p.value == null) return null;
  const formatted = new Intl.NumberFormat("ru-RU").format(p.value);
  return `от ${formatted} ${p.currency_symbol || "₽"}`;
});

function openConcert() {
  const query: Record<string, string> = {};
  if (props.artistId) query.artistId = props.artistId;
  router.push({ path: `/concert/${props.concert.id}`, query });
}

function openAfisha() {
  if (props.concert.afisha_url) {
    api.openExternal(props.concert.afisha_url);
  }
}
</script>
