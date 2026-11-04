<template>
  <q-page
    class="flex flex-col h-[calc(100vh_-_52px_-_var(--player-height,_78px))] !min-h-0 !p-0 !overflow-hidden"
  >
    <q-scroll-area ref="scrollArea" class="flex-auto min-h-0">
      <div class="relative min-h-full pb-[60px]">
        <!-- <div
          v-if="concert?.color"
          class="ambient-glow pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-[0.22] blur-[90px] transition-opacity duration-[400ms]"
          :style="{
            background: `radial-gradient(circle at 35% 20%, ${concert.color} 0%, transparent 70%)`,
          }"
        /> -->

        <div
          class="relative pt-[calc(var(--page-top-gap,_20px)_+_8px)] px-[var(--page-padding,40px)] max-[760px]:px-[16px]"
        >
          <!-- Back button -->
          <div class="mb-[18px]">
            <button
              class="inline-flex items-center gap-[6px] h-[32px] px-[12px] py-0 border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer transition-[background,border-color,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] select-none"
              type="button"
              @click="goBack"
            >
              <Icon name="mingcute:arrow-left-line" :size="16" />
              <span>Назад</span>
            </button>
          </div>

          <!-- Loading Spinner -->
          <div v-if="loading" class="flex flex-center" style="height: 380px">
            <q-spinner size="32px" color="primary" />
          </div>

          <!-- Error state -->
          <div
            v-else-if="error || !concert"
            class="flex flex-col items-center justify-center py-[60px] text-center"
          >
            <div
              class="w-[64px] h-[64px] rounded-full bg-[var(--surface-2)] flex items-center justify-center text-[color:var(--fg-faint)] mb-[16px]"
            >
              <Icon name="mingcute:calendar-line" :size="32" />
            </div>
            <div class="text-[17px] font-bold text-[color:var(--fg)] mb-[6px]">
              Не удалось загрузить концерт
            </div>
            <div
              class="text-[13px] text-[color:var(--fg-dim)] max-w-[360px] mb-[18px]"
            >
              {{
                error ||
                "Информация о концерте временно недоступна или мероприятие было завершено."
              }}
            </div>
            <button
              class="inline-flex items-center justify-center gap-[7px] h-[34px] px-[18px] py-0 border-0 rounded-[8px] bg-[var(--accent)] text-white text-[12px] font-medium cursor-pointer transition-opacity hover:opacity-[0.85]"
              type="button"
              @click="loadConcert"
            >
              <Icon name="mingcute:refresh-1-line" :size="16" />
              <span>Попробовать снова</span>
            </button>
          </div>

          <!-- Concert Content -->
          <template v-else>
            <!-- Hero Header -->
            <div
              class="flex items-end gap-[28px] min-w-0 max-[1024px]:flex-col max-[1024px]:items-start max-[1024px]:gap-[18px]"
            >
              <!-- Poster / Cover Image -->
              <div
                class="poster-box relative w-[clamp(150px,_20vw,_230px)] aspect-[16/10] sm:aspect-square rounded-[var(--radius-card)] flex-none overflow-hidden bg-[var(--surface-2)] flex items-center justify-center cursor-pointer group"
                @click="openViewer"
              >
                <img
                  v-if="concert.image_url"
                  loading="lazy"
                  decoding="async"
                  :src="concert.image_url"
                  class="w-full h-full object-cover block transition-transform duration-[260ms] group-hover:scale-[1.03]"
                />
                <Icon
                  v-else
                  name="mingcute:calendar-line"
                  :size="56"
                  class="text-[color:var(--fg-faint)]"
                />

                <div
                  v-if="concert.covers && concert.covers.length > 1"
                  class="absolute right-[8px] bottom-[8px] px-[8px] py-[3px] rounded-[var(--radius-control)] bg-[rgba(0,0,0,0.7)] text-white text-[11px] font-semibold pointer-events-none"
                >
                  {{ concert.covers.length }} фото
                </div>
              </div>

              <!-- Main Info Details -->
              <div
                class="flex-1 min-w-0 pb-[4px] max-[1024px]:w-full max-[1024px]:pb-0"
              >
                <!-- Badges -->
                <div class="flex items-center gap-[8px] flex-wrap mb-[8px]">
                  <span
                    class="px-[9px] py-[2px] rounded-[var(--radius-control)] bg-[var(--surface-2)] text-[color:var(--fg-dim)] text-[11px] font-semibold tracking-[0.02em]"
                  >
                    {{ eventTypeLabel }}
                  </span>
                  <span
                    v-if="concert.content_rating"
                    class="px-[7px] py-[2px] rounded-[var(--radius-control)] bg-[var(--surface-2)] text-[color:var(--fg-faint)] text-[11px] font-bold"
                  >
                    {{ concert.content_rating }}
                  </span>
                  <span
                    v-if="formattedPrice"
                    class="px-[8px] py-[2px] rounded-[var(--radius-control)] bg-[var(--surface-2)] text-[color:var(--fg)] text-[11px] font-semibold"
                  >
                    {{ formattedPrice }}
                  </span>
                </div>

                <!-- Concert Title -->
                <h1
                  class="text-[clamp(26px,_3.8vw,_46px)] leading-[1.08] font-black tracking-[-0.025em] m-0 break-words"
                >
                  {{ concert.title }}
                </h1>

                <!-- Date & Venue Subtitle -->
                <div
                  class="mt-[10px] flex items-center flex-wrap gap-y-[4px] gap-x-[8px] text-[13.5px] text-[color:var(--fg-dim)]"
                >
                  <div
                    v-if="fullDateTime"
                    class="flex items-center gap-[6px] font-medium text-[color:var(--fg)]"
                  >
                    <Icon
                      name="mingcute:time-line"
                      :size="16"
                      class="text-[color:var(--fg-faint)] flex-none"
                    />
                    <span>{{ fullDateTime }}</span>
                  </div>
                  <span
                    v-if="fullDateTime && (concert.city || concert.place)"
                    class="opacity-[0.4]"
                    >·</span
                  >
                  <div
                    v-if="concert.city || concert.place"
                    class="flex items-center gap-[6px]"
                  >
                    <Icon
                      name="mingcute:map-pin-line"
                      :size="16"
                      class="text-[color:var(--fg-faint)] flex-none"
                    />
                    <span
                      >{{ concert.city
                      }}<template v-if="concert.city && concert.place"
                        >, </template
                      >{{ concert.place }}</span
                    >
                  </div>
                </div>

                <!-- Artist chip if linked -->
                <div
                  v-if="concert.artist_id && concert.artist_name"
                  class="mt-[12px] inline-flex items-center gap-[8px] px-[10px] py-[4px] rounded-[var(--radius-control)] bg-[var(--surface)] hover:bg-[var(--hover)] text-[13px] font-medium cursor-pointer transition-colors border border-[color:var(--line)]"
                  @click="openArtist"
                >
                  <img
                    v-if="concert.artist_cover_url"
                    :src="concert.artist_cover_url"
                    class="w-[20px] h-[20px] rounded-full object-cover flex-none"
                  />
                  <Icon
                    v-else
                    name="mingcute:user-2-line"
                    :size="15"
                    class="text-[color:var(--fg-faint)]"
                  />
                  <span class="text-[color:var(--fg)]">{{
                    concert.artist_name
                  }}</span>
                  <Icon
                    name="mingcute:right-line"
                    :size="14"
                    class="text-[color:var(--fg-faint)]"
                  />
                </div>

                <!-- Action Buttons -->
                <div
                  class="flex items-center gap-[8px] flex-wrap mt-[22px] select-none max-[1024px]:mt-[16px]"
                >
                  <!-- Buy Ticket -->
                  <button
                    v-if="concert.afisha_url"
                    class="inline-flex items-center justify-center gap-[8px] h-[36px] px-[20px] py-0 border-0 rounded-[var(--radius-item)] bg-[var(--accent)] text-white text-[calc(12.5px*var(--text-scale,1))] font-semibold cursor-pointer transition-opacity duration-[120ms] hover:opacity-[0.9]"
                    type="button"
                    @click="openAfisha"
                  >
                    <Icon name="mingcute:ticket-line" :size="17" />
                    <span>{{
                      formattedPrice
                        ? `Купить билет ${formattedPrice}`
                        : "Купить билет"
                    }}</span>
                  </button>

                  <!-- Play popular tracks -->
                  <button
                    v-if="concert.artist_tracks.length"
                    class="inline-flex items-center justify-center gap-[7px] h-[34px] px-[16px] py-0 border border-[color:var(--line)] rounded-[var(--radius-control)] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer transition-[background,border-color,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]"
                    type="button"
                    @click="playTracks(0)"
                  >
                    <Icon name="mingcute:play-fill" :size="15" />
                    <span>Слушать треки</span>
                  </button>

                  <!-- Artist Wave -->
                  <button
                    v-if="concert.artist_id"
                    class="inline-flex items-center justify-center gap-[7px] h-[34px] px-[14px] py-0 border border-[color:var(--line)] rounded-[var(--radius-control)] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer transition-[background,border-color,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]"
                    type="button"
                    @click="playArtistWave"
                  >
                    <Icon name="mingcute:wave-line" :size="15" />
                    <span>Волна артиста</span>
                  </button>

                  <!-- Share -->
                  <button
                    class="flex w-[34px] h-[34px] items-center justify-center p-0 border border-[color:var(--line)] rounded-[var(--radius-control)] text-[color:var(--fg-dim)] cursor-pointer transition-[background,color] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]"
                    type="button"
                    title="Поделиться"
                    @click="copyShareLink"
                  >
                    <Icon name="mingcute:share-forward-line" :size="17" />
                  </button>

                  <!-- External Afisha link -->
                  <button
                    v-if="concert.afisha_url"
                    class="flex w-[34px] h-[34px] items-center justify-center p-0 border border-[color:var(--line)] rounded-[var(--radius-control)] text-[color:var(--fg-dim)] cursor-pointer transition-[background,color] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]"
                    type="button"
                    title="Открыть на Яндекс Афише"
                    @click="openAfisha"
                  >
                    <Icon name="mingcute:external-link-line" :size="16" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Description / About Event Section -->
            <div
              v-if="descriptionParagraphs.length"
              class="mt-[38px] max-w-[820px]"
            >
              <div
                class="text-[calc(18px*var(--text-scale,1))] font-bold text-[color:var(--fg)] tracking-[-0.02em] mb-[12px]"
              >
                О событии
              </div>
              <div
                class="space-y-[12px] text-[14px] text-[color:var(--fg-dim)] leading-[1.62]"
              >
                <p
                  v-for="(p, idx) in descriptionParagraphs"
                  :key="idx"
                  class="m-0"
                >
                  {{ p }}
                </p>
              </div>
              <div
                v-if="concert.description_source"
                class="mt-[10px] text-[11.5px] text-[color:var(--fg-faint)]"
              >
                Источник информации: {{ concert.description_source }}
              </div>
            </div>

            <!-- Venue & Location Section -->
            <div v-if="concert.venue" class="mt-[42px] max-w-[820px]">
              <div
                class="text-[calc(18px*var(--text-scale,1))] font-bold text-[color:var(--fg)] tracking-[-0.02em] mb-[14px]"
              >
                Место проведения
              </div>

              <div
                class="p-[18px] rounded-[14px] bg-[var(--surface)] border border-[color:var(--line)]"
              >
                <div
                  class="flex items-center justify-between gap-[16px] flex-wrap"
                >
                  <div class="flex-1 min-w-[240px]">
                    <div class="text-[16px] font-bold text-[color:var(--fg)]">
                      {{ concert.venue.place || concert.place || "Площадка" }}
                    </div>
                    <div
                      v-if="concert.venue.address || concert.address"
                      class="text-[13px] text-[color:var(--fg-dim)] mt-[4px]"
                    >
                      {{ concert.venue.address || concert.address }}
                    </div>

                    <!-- Metro stations -->
                    <div
                      v-if="
                        concert.venue.metro_stations &&
                        concert.venue.metro_stations.length
                      "
                      class="flex items-center gap-[8px] flex-wrap mt-[10px]"
                    >
                      <div
                        v-for="metro in concert.venue.metro_stations"
                        :key="metro.title"
                        class="inline-flex items-center gap-[6px] px-[8px] py-[3px] rounded-[6px] bg-[var(--surface-2)] text-[12px] font-medium text-[color:var(--fg-dim)]"
                      >
                        <span
                          class="w-[7px] h-[7px] rounded-full flex-none"
                          :style="{ background: metro.line_color || '#999' }"
                        />
                        <span>{{ metro.title }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Right column: map preview + button under it -->
                  <div
                    v-if="concert.venue.map_image_url || concert.venue.map_url"
                    class="flex flex-col gap-[10px] w-[clamp(240px,_35vw,_360px)] flex-none"
                  >
                    <div
                      v-if="concert.venue.map_image_url"
                      class="relative w-full aspect-[16/9] rounded-[var(--radius-item)] overflow-hidden bg-[var(--surface-2)] cursor-pointer group"
                      @click="openMap"
                    >
                      <img
                        :src="concert.venue.map_image_url"
                        class="w-full h-full object-cover block transition-transform duration-[200ms] group-hover:scale-[1.03]"
                        alt="Карта"
                      />
                      <div
                        class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[12px] font-bold gap-[6px]"
                      >
                        <Icon name="mingcute:external-link-line" :size="16" />
                        <span>Смотреть карту</span>
                      </div>
                    </div>

                    <button
                      v-if="concert.venue.map_url"
                      class="inline-flex items-center justify-center gap-[6px] w-full h-[32px] px-[14px] py-0 border border-[color:var(--line)] rounded-[var(--radius-control)] text-[color:var(--fg-dim)] text-[12px] font-medium cursor-pointer transition-[background,color] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]"
                      type="button"
                      @click="openMap"
                    >
                      <Icon name="mingcute:map-pin-line" :size="15" />
                      <span>Открыть на Яндекс Картах</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <!-- Artist Popular Tracks Section -->
            <div v-if="concert.artist_tracks.length" class="mt-[42px]">
              <div class="flex items-end justify-between mb-[14px] gap-[12px]">
                <div>
                  <div
                    class="text-[calc(18px*var(--text-scale,1))] font-bold text-[color:var(--fg)] tracking-[-0.02em]"
                  >
                    Популярные треки артиста
                  </div>
                  <div
                    class="text-[12px] text-[color:var(--fg-faint)] mt-[2px]"
                  >
                    Что может прозвучать на концерте
                  </div>
                </div>
                <button
                  v-if="concert.artist_id"
                  class="inline-flex items-center p-0 border-0 bg-transparent text-[color:var(--fg-faint)] cursor-pointer text-[12px] gap-[4px] whitespace-nowrap transition-colors hover:text-[color:var(--fg)]"
                  type="button"
                  @click="openArtist"
                >
                  <span>Все треки артиста</span>
                  <Icon name="mingcute:right-line" :size="15" />
                </button>
              </div>

              <!-- Track rows header -->
              <div
                class="flex items-center gap-[14px] h-[32px] px-[12px] py-0 text-[11px] font-semibold tracking-[0.06em] uppercase text-[color:var(--fg-faint)] border-b border-[var(--line)]"
              >
                <div style="width: 20px; text-align: center">#</div>
                <div style="width: 38px" />
                <div class="col">Название</div>
                <div style="width: 40px; text-align: right">Время</div>
              </div>

              <LazyTracks
                v-slot="{ item, index }"
                :items="concert.artist_tracks"
              >
                <TrackRow
                  :track="item"
                  :index="index"
                  @play="playTracks(index)"
                />
              </LazyTracks>
            </div>

            <!-- Other Tour Dates Section -->
            <div v-if="concert.artist_concerts.length" class="mt-[46px]">
              <div
                class="text-[calc(18px*var(--text-scale,1))] font-bold text-[color:var(--fg)] tracking-[-0.02em] mb-[14px]"
              >
                Другие концерты тура
              </div>
              <div class="flex items-stretch gap-[14px] flex-wrap">
                <ConcertCard
                  v-for="other in concert.artist_concerts"
                  :key="other.id"
                  :concert="other"
                  :artist-id="concert.artist_id"
                  width="210px"
                />
              </div>
            </div>

            <!-- Image Viewer for posters -->
            <ImageViewer
              v-model:open="viewerOpen"
              :images="concert.covers || []"
              :title="concert.title"
            />
          </template>
        </div>
      </div>
    </q-scroll-area>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Notify, type QScrollArea } from "quasar";
import type { ConcertPage } from "@/api/types";
import { api } from "@/api/client";
import { usePlayerStore } from "@/stores/player/index";
import ConcertCard from "@/components/common/ConcertCard.vue";
import TrackRow from "@/components/common/TrackRow.vue";
import LazyTracks from "@/components/common/LazyTracks.vue";
import ImageViewer from "@/components/common/ImageViewer.vue";

const props = defineProps<{
  id: string;
  artistId?: string;
}>();

const router = useRouter();
const player = usePlayerStore();

const scrollArea = ref<QScrollArea | null>(null);
const concert = ref<ConcertPage | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const viewerOpen = ref(false);

const eventTypeLabel = computed(() => {
  return "Концерт";
});

const formattedPrice = computed(() => {
  const p = concert.value?.min_price;
  if (!p || p.value == null) return null;
  const formatted = new Intl.NumberFormat("ru-RU").format(p.value);
  return `от ${formatted} ${p.currency_symbol || "₽"}`;
});

const fullDateTime = computed(() => {
  if (!concert.value?.datetime) return null;
  const d = new Date(concert.value.datetime);
  if (isNaN(d.getTime())) return null;

  const weekday = d.toLocaleDateString("ru-RU", { weekday: "long" });
  const day = d.getDate();
  const month = d.toLocaleDateString("ru-RU", { month: "long" });
  const year = d.getFullYear();

  const raw = concert.value.datetime;
  const hasExplicitTime =
    raw.includes("T") &&
    !raw.includes("T00:00:00") &&
    (d.getHours() !== 0 || d.getMinutes() !== 0);

  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);

  if (hasExplicitTime) {
    const time = d.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${capitalizedWeekday}, ${day} ${month} ${year} в ${time}`;
  }
  return `${capitalizedWeekday}, ${day} ${month} ${year}`;
});

const descriptionParagraphs = computed(() => {
  const text = concert.value?.description;
  if (!text) return [];
  return text
    .split(/\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
});

async function loadConcert() {
  loading.value = true;
  error.value = null;
  scrollArea.value?.setScrollPosition("vertical", 0, 100);
  try {
    concert.value = await api.concert(props.id, props.artistId);
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Ошибка загрузки концерта";
  } finally {
    loading.value = false;
  }
}

function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else if (concert.value?.artist_id) {
    router.push(`/artist/${concert.value.artist_id}`);
  } else {
    router.push("/");
  }
}

function openViewer() {
  if (concert.value?.covers?.length) {
    viewerOpen.value = true;
  }
}

function openArtist() {
  if (concert.value?.artist_id) {
    router.push(`/artist/${concert.value.artist_id}`);
  }
}

function openAfisha() {
  if (concert.value?.afisha_url) {
    api.openExternal(concert.value.afisha_url);
  }
}

function openMap() {
  if (concert.value?.venue?.map_url) {
    api.openExternal(concert.value.venue.map_url);
  }
}

function playTracks(startIndex: number) {
  if (concert.value?.artist_tracks?.length) {
    void player.playQueue(concert.value.artist_tracks, startIndex);
  }
}

function playArtistWave() {
  if (concert.value?.artist_id && concert.value.artist_name) {
    void player.waveByArtist({
      id: concert.value.artist_id,
      name: concert.value.artist_name,
    });
    void router.push("/wave");
  }
}

function copyShareLink() {
  const url = window.location.href;
  navigator.clipboard
    .writeText(url)
    .then(() => {
      Notify.create({
        message: "Ссылка на концерт скопирована",
        color: "positive",
        timeout: 2000,
      });
    })
    .catch(() => {
      Notify.create({
        message: "Не удалось скопировать ссылку",
        color: "negative",
        timeout: 2000,
      });
    });
}

watch(
  () => props.id,
  () => {
    loadConcert();
  },
);

onMounted(() => {
  loadConcert();
});
</script>
