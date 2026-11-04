<template>
  <q-page
    class="flex flex-col h-[calc(100vh_-_52px_-_var(--player-height,_78px))] !min-h-0 !p-0 !overflow-hidden"
  >
    <q-scroll-area class="flex-auto min-h-0">
      <div class="pt-[calc(var(--page-top-gap,_20px)_+_8px)] px-[32px] pb-[60px] max-[760px]:px-[16px]">
        <!-- Page Header -->
        <div class="flex items-end justify-between gap-[16px] flex-wrap mb-[20px]">
          <div>
            <div class="text-[12px] text-[color:var(--fg-dim)] uppercase tracking-[0.06em] font-semibold mb-[4px]">
              Афиша
            </div>
            <h1 class="text-[clamp(26px,_3.2vw,_38px)] font-black tracking-[-0.03em] m-0 leading-tight text-[color:var(--fg)]">
              Концерты
            </h1>
            <p class="text-[13.5px] text-[color:var(--fg-dim)] mt-[6px] mb-0 max-w-[560px]">
              Предстоящие выступления и туры артистов по всей России из вашей библиотеки и рекомендаций
            </p>
          </div>

          <!-- Controls: Search, Date Calendar, Sort, Refresh -->
          <div class="flex items-center gap-[10px] flex-wrap">
            <!-- Search input -->
            <div class="relative flex items-center">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Поиск по артисту или площадке..."
                class="h-[34px] w-[210px] max-[640px]:w-full px-[12px] pl-[34px] rounded-[9px] bg-[var(--surface)] border border-[color:var(--line)] text-[12.5px] text-[color:var(--fg)] outline-none transition-colors placeholder:text-[color:var(--fg-faint)] focus:border-[var(--accent)]"
              />
              <Icon
                name="mingcute:search-2-line"
                :size="16"
                class="absolute left-[10px] text-[color:var(--fg-faint)] pointer-events-none"
              />
              <button
                v-if="searchQuery"
                class="absolute right-[8px] p-0 border-0 bg-transparent text-[color:var(--fg-faint)] hover:text-[color:var(--fg)] cursor-pointer flex items-center justify-center"
                type="button"
                @click="searchQuery = ''"
              >
                <Icon name="mingcute:close-line" :size="14" />
              </button>
            </div>

            <!-- Calendar Filter Button & Popover -->
            <button
              class="inline-flex items-center gap-[6px] h-[34px] px-[12px] border rounded-[9px] text-[12.5px] font-medium cursor-pointer transition-[background,border-color,color] select-none"
              :class="
                isDateFilterActive
                  ? 'bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)] border-[var(--accent)] font-semibold'
                  : 'bg-[var(--surface)] text-[color:var(--fg-dim)] border-[color:var(--line)] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]'
              "
              type="button"
              title="Выбрать даты концертов"
            >
              <Icon name="mingcute:calendar-line" :size="16" />
              <span>{{ activeDateLabel }}</span>
              <span
                v-if="isDateFilterActive"
                class="ml-[2px] p-[2px] hover:text-[color:var(--fg)] flex items-center"
                title="Сбросить дату"
                @click.stop="resetDateFilter"
              >
                <Icon name="mingcute:close-line" :size="13" />
              </span>

              <!-- Calendar popup menu -->
              <q-menu
                anchor="bottom right"
                self="top right"
                :offset="[0, 8]"
                class="bg-[var(--surface)] border border-[color:var(--line)] rounded-[14px] p-[12px] shadow-2xl text-[color:var(--fg)] min-w-[290px] max-w-[340px]"
              >
                <!-- Quick date presets in calendar menu -->
                <div class="text-[11px] font-bold uppercase tracking-[0.05em] text-[color:var(--fg-faint)] mb-[8px]">
                  Быстрый выбор
                </div>
                <div class="grid grid-cols-2 gap-[6px] mb-[12px]">
                  <button
                    v-for="p in datePresets"
                    :key="p.id"
                    class="h-[28px] px-[8px] rounded-[7px] text-[11.5px] font-medium border text-left cursor-pointer transition-colors truncate"
                    :class="
                      selectedDatePreset === p.id
                        ? 'bg-[var(--accent)] text-white border-transparent'
                        : 'bg-[var(--surface-2)] text-[color:var(--fg-dim)] border-[color:var(--line)] hover:text-[color:var(--fg)] hover:bg-[var(--hover)]'
                    "
                    type="button"
                    @click="applyPreset(p.id)"
                  >
                    {{ p.label }}
                  </button>
                </div>

                <div class="h-[1px] bg-[var(--line)] my-[10px]" />

                <!-- Calendar Picker -->
                <div class="text-[11px] font-bold uppercase tracking-[0.05em] text-[color:var(--fg-faint)] mb-[8px] flex items-center justify-between">
                  <span>Диапазон дат</span>
                  <span v-if="customDateRangeText" class="text-[var(--accent)] normal-case font-medium">
                    {{ customDateRangeText }}
                  </span>
                </div>

                <q-date
                  v-model="calendarModel"
                  range
                  minimal
                  dark
                  flat
                  color="primary"
                  class="bg-transparent text-[12px] w-full !p-0"
                  :locale="russianLocale"
                  @update:model-value="onCalendarChange"
                />

                <div class="flex items-center justify-between gap-[8px] mt-[12px] pt-[8px] border-t border-[var(--line)]">
                  <button
                    class="h-[28px] px-[10px] rounded-[6px] text-[11.5px] font-medium bg-transparent border border-[color:var(--line)] text-[color:var(--fg-faint)] hover:text-[color:var(--fg)] cursor-pointer"
                    type="button"
                    @click="resetDateFilter"
                  >
                    Сбросить
                  </button>
                  <button
                    v-close-popup
                    class="h-[28px] px-[14px] rounded-[6px] text-[11.5px] font-medium bg-[var(--accent)] text-white border-0 cursor-pointer hover:opacity-90"
                    type="button"
                  >
                    Готово
                  </button>
                </div>
              </q-menu>
            </button>

            <!-- Sort Dropdown -->
            <button
              class="inline-flex items-center gap-[6px] h-[34px] px-[12px] border rounded-[9px] bg-[var(--surface)] text-[color:var(--fg-dim)] border-[color:var(--line)] text-[12.5px] font-medium cursor-pointer transition-colors hover:bg-[var(--hover)] hover:text-[color:var(--fg)] select-none"
              type="button"
              title="Сортировка"
            >
              <Icon name="mingcute:filter-3-line" :size="15" />
              <span>{{ activeSortLabel }}</span>
              <Icon name="mingcute:down-line" :size="13" class="opacity-60" />

              <q-menu
                anchor="bottom right"
                self="top right"
                :offset="[0, 8]"
                class="bg-[var(--surface)] border border-[color:var(--line)] rounded-[12px] p-[6px] shadow-2xl min-w-[190px]"
              >
                <div
                  v-for="s in sortOptions"
                  :key="s.id"
                  v-close-popup
                  class="flex items-center justify-between px-[10px] py-[7px] rounded-[7px] text-[12px] cursor-pointer transition-colors select-none"
                  :class="
                    currentSort === s.id
                      ? 'bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] text-[var(--accent)] font-semibold'
                      : 'text-[color:var(--fg-dim)] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]'
                  "
                  @click="currentSort = s.id"
                >
                  <span>{{ s.label }}</span>
                  <Icon
                    v-if="currentSort === s.id"
                    name="mingcute:check-line"
                    :size="14"
                    class="text-[var(--accent)]"
                  />
                </div>
              </q-menu>
            </button>

            <!-- Refresh button -->
            <button
              class="flex w-[34px] h-[34px] items-center justify-center p-0 border border-[color:var(--line)] rounded-[9px] text-[color:var(--fg-dim)] cursor-pointer transition-[background,color] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:opacity-50 select-none"
              type="button"
              title="Обновить афишу"
              :disabled="refreshing || loading"
              @click="refreshFeed"
            >
              <Icon
                name="mingcute:refresh-1-line"
                :size="16"
                :class="{ 'animate-spin': refreshing || (loading && !concerts.length) }"
              />
            </button>
          </div>
        </div>

        <!-- City Filter & City Selector Row -->
        <div class="flex items-center gap-[6px] flex-wrap mb-[14px]">
          <!-- All Cities button -->
          <button
            class="h-[28px] px-[12px] rounded-full text-[12px] font-medium border cursor-pointer select-none transition-colors"
            :class="
              selectedCity === null
                ? 'bg-[var(--accent)] text-white border-transparent'
                : 'bg-[var(--surface)] text-[color:var(--fg-dim)] border-[color:var(--line)] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]'
            "
            type="button"
            @click="setCity(null)"
          >
            Все города
          </button>

          <!-- Top popular cities chips -->
          <button
            v-for="city in topCities"
            :key="city.name"
            class="h-[28px] px-[12px] rounded-full text-[12px] font-medium border cursor-pointer select-none transition-colors flex items-center gap-[6px]"
            :class="
              selectedCity === city.name
                ? 'bg-[var(--accent)] text-white border-transparent'
                : 'bg-[var(--surface)] text-[color:var(--fg-dim)] border-[color:var(--line)] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]'
            "
            type="button"
            @click="setCity(city.name)"
          >
            <span>{{ city.name }}</span>
            <span class="text-[10.5px] opacity-70 tabular-nums">{{ city.count }}</span>
          </button>

          <!-- Selected Custom City Pill (if selected city is not in top 8) -->
          <button
            v-if="selectedCity && !topCities.some(c => c.name === selectedCity)"
            class="h-[28px] px-[12px] rounded-full text-[12px] font-semibold border cursor-pointer select-none transition-colors flex items-center gap-[6px] bg-[var(--accent)] text-white border-transparent"
            type="button"
            @click="setCity(null)"
          >
            <Icon name="mingcute:map-pin-line" :size="13" />
            <span>{{ selectedCity }}</span>
            <Icon name="mingcute:close-line" :size="13" class="opacity-80 hover:opacity-100" />
          </button>

          <!-- "Choose Any City" button with Search Dialog/Menu -->
          <button
            class="h-[28px] px-[12px] rounded-full text-[11.5px] font-medium border border-dashed border-[color:var(--line)] text-[color:var(--fg-dim)] hover:text-[color:var(--fg)] hover:border-[color:var(--fg-dim)] cursor-pointer select-none transition-colors flex items-center gap-[5px]"
            type="button"
          >
            <Icon name="mingcute:map-pin-line" :size="13" class="text-[color:var(--fg-faint)]" />
            <span>Выбрать город...</span>
            <Icon name="mingcute:down-line" :size="12" class="opacity-60" />

            <!-- City search dropdown menu -->
            <q-menu
              anchor="bottom left"
              self="top left"
              :offset="[0, 8]"
              class="bg-[var(--surface)] border border-[color:var(--line)] rounded-[14px] p-[10px] shadow-2xl w-[260px] max-h-[360px] flex flex-col text-[color:var(--fg)]"
            >
              <div class="relative mb-[8px] flex-none">
                <input
                  v-model="citySearchQuery"
                  type="text"
                  placeholder="Поиск города..."
                  class="w-full h-[32px] px-[10px] pl-[30px] rounded-[8px] bg-[var(--surface-2)] border border-[color:var(--line)] text-[12px] text-[color:var(--fg)] outline-none focus:border-[var(--accent)] placeholder:text-[color:var(--fg-faint)]"
                  @click.stop
                />
                <Icon
                  name="mingcute:search-2-line"
                  :size="14"
                  class="absolute left-[9px] top-[9px] text-[color:var(--fg-faint)] pointer-events-none"
                />
                <button
                  v-if="citySearchQuery"
                  class="absolute right-[6px] top-[7px] p-0 border-0 bg-transparent text-[color:var(--fg-faint)] hover:text-[color:var(--fg)] cursor-pointer flex items-center justify-center"
                  type="button"
                  @click.stop="citySearchQuery = ''"
                >
                  <Icon name="mingcute:close-line" :size="13" />
                </button>
              </div>

              <!-- Scrollable city list -->
              <div class="flex-auto overflow-y-auto space-y-[2px] pr-[4px]">
                <div
                  v-close-popup
                  class="flex items-center justify-between px-[10px] py-[6px] rounded-[6px] text-[12px] cursor-pointer transition-colors"
                  :class="selectedCity === null ? 'bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] text-[var(--accent)] font-semibold' : 'text-[color:var(--fg-dim)] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]'"
                  @click="setCity(null)"
                >
                  <span>Все города</span>
                  <span class="text-[10px] opacity-60 tabular-nums">{{ concerts.length }}</span>
                </div>

                <div
                  v-for="c in filteredCityList"
                  :key="c.name"
                  v-close-popup
                  class="flex items-center justify-between px-[10px] py-[6px] rounded-[6px] text-[12px] cursor-pointer transition-colors"
                  :class="selectedCity === c.name ? 'bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] text-[var(--accent)] font-semibold' : 'text-[color:var(--fg-dim)] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]'"
                  @click="setCity(c.name)"
                >
                  <span class="truncate">{{ c.name }}</span>
                  <span v-if="c.count > 0" class="text-[10px] opacity-60 tabular-nums ml-[8px] flex-none">
                    {{ c.count }}
                  </span>
                </div>

                <div
                  v-if="!filteredCityList.length"
                  class="py-[20px] text-center text-[12px] text-[color:var(--fg-faint)]"
                >
                  Город не найден
                </div>
              </div>
            </q-menu>
          </button>
        </div>

        <!-- Quick date filter chips strip -->
        <div class="flex items-center gap-[6px] flex-wrap mb-[22px]">
          <span class="text-[11.5px] font-semibold text-[color:var(--fg-faint)] uppercase tracking-[0.05em] mr-[4px]">
            Период:
          </span>
          <button
            v-for="preset in datePresets"
            :key="preset.id"
            class="h-[25px] px-[10px] rounded-[7px] text-[11.5px] font-medium border cursor-pointer select-none transition-colors"
            :class="
              selectedDatePreset === preset.id && !isCustomRangeActive
                ? 'bg-[var(--accent)] text-white border-transparent'
                : 'bg-[var(--surface-2)] text-[color:var(--fg-dim)] border-[color:var(--line)] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]'
            "
            type="button"
            @click="applyPreset(preset.id)"
          >
            {{ preset.label }}
          </button>

          <div
            v-if="isCustomRangeActive"
            class="h-[25px] px-[10px] rounded-[7px] text-[11.5px] font-semibold bg-[var(--accent)] text-white border border-transparent flex items-center gap-[6px]"
          >
            <Icon name="mingcute:calendar-line" :size="13" />
            <span>{{ customDateRangeText }}</span>
            <button
              class="p-0 border-0 bg-transparent text-white cursor-pointer hover:opacity-80 flex items-center"
              type="button"
              title="Сбросить даты"
              @click="resetDateFilter"
            >
              <Icon name="mingcute:close-line" :size="12" />
            </button>
          </div>
        </div>

        <!-- Loading spinner -->
        <div v-if="loading && !concerts.length" class="flex flex-center py-[80px]">
          <q-spinner size="32px" color="primary" />
        </div>

        <!-- Empty state -->
        <div
          v-else-if="!filteredConcerts.length"
          class="flex flex-col items-center justify-center py-[70px] text-center"
        >
          <div class="w-[64px] h-[64px] rounded-full bg-[var(--surface-2)] flex items-center justify-center text-[color:var(--fg-faint)] mb-[16px]">
            <Icon name="mingcute:calendar-line" :size="32" />
          </div>
          <div class="text-[17px] font-bold text-[color:var(--fg)] mb-[6px]">
            {{ hasActiveFilters ? 'Ничего не найдено' : 'Концертов пока нет' }}
          </div>
          <div class="text-[13px] text-[color:var(--fg-dim)] max-w-[420px] mb-[18px]">
            {{
              hasActiveFilters
                ? 'Попробуйте изменить выбранные даты, выбрать другой город или сбросить поисковый запрос.'
                : 'Когда у ваших любимых артистов появятся новые даты туров, они отобразятся здесь.'
            }}
          </div>

          <!-- Filter Reset Chips in Empty State -->
          <div v-if="hasActiveFilters" class="flex items-center gap-[8px] flex-wrap justify-center">
            <button
              v-if="selectedCity"
              class="inline-flex items-center gap-[5px] h-[30px] px-[12px] border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[12px] font-medium cursor-pointer transition-colors hover:bg-[var(--hover)] hover:text-[color:var(--fg)]"
              type="button"
              @click="setCity(null)"
            >
              <Icon name="mingcute:map-pin-line" :size="13" />
              <span>Сбросить город ({{ selectedCity }})</span>
            </button>
            <button
              v-if="isDateFilterActive"
              class="inline-flex items-center gap-[5px] h-[30px] px-[12px] border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[12px] font-medium cursor-pointer transition-colors hover:bg-[var(--hover)] hover:text-[color:var(--fg)]"
              type="button"
              @click="resetDateFilter"
            >
              <Icon name="mingcute:calendar-line" :size="13" />
              <span>Сбросить даты</span>
            </button>
            <button
              v-if="searchQuery"
              class="inline-flex items-center gap-[5px] h-[30px] px-[12px] border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[12px] font-medium cursor-pointer transition-colors hover:bg-[var(--hover)] hover:text-[color:var(--fg)]"
              type="button"
              @click="searchQuery = ''"
            >
              <Icon name="mingcute:close-line" :size="13" />
              <span>Очистить поиск</span>
            </button>
            <button
              class="inline-flex items-center gap-[5px] h-[30px] px-[14px] bg-[var(--accent)] text-white rounded-[8px] text-[12px] font-semibold border-0 cursor-pointer hover:opacity-90"
              type="button"
              @click="clearAllFilters"
            >
              <span>Сбросить все фильтры</span>
            </button>
          </div>
        </div>

        <!-- Concerts Grid -->
        <div v-else>
          <div class="flex items-baseline justify-between mb-[14px] gap-[12px]">
            <div class="text-[12px] text-[color:var(--fg-faint)] font-medium">
              {{ pluralWord(filteredConcerts.length, "концерт", "концерта", "концертов") }}
              <span v-if="selectedCity" class="text-[color:var(--fg-dim)]">· в г. {{ selectedCity }}</span>
              <span v-if="isDateFilterActive" class="text-[color:var(--fg-dim)]">· {{ activeDateLabel }}</span>
            </div>
            <div v-if="hasActiveFilters" class="text-[11.5px]">
              <button
                class="p-0 border-0 bg-transparent text-[var(--accent)] cursor-pointer hover:underline font-medium"
                type="button"
                @click="clearAllFilters"
              >
                Сбросить фильтры
              </button>
            </div>
          </div>

          <div class="flex items-stretch gap-[16px] flex-wrap">
            <ConcertCard
              v-for="c in filteredConcerts"
              :key="c.id"
              :concert="c"
              width="220px"
            />
          </div>
        </div>
      </div>
    </q-scroll-area>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Notify } from "quasar";
import type { ConcertBrief, ConcertLocation } from "@/api/types";
import { api } from "@/api/client";
import { readCache, swr, writeCache } from "@/lib/cache";
import { pluralWord } from "@/lib/format";
import ConcertCard from "@/components/common/ConcertCard.vue";

const CITY_KEY = "mashiro.concerts.selectedCity";
const CACHE_KEY_FEED = "concerts.feed";
const CACHE_KEY_LOCATIONS = "concerts.locations";

const concerts = ref<ConcertBrief[]>([]);
const locations = ref<ConcertLocation[]>([]);
const loading = ref(true);
const refreshing = ref(false);
const searchQuery = ref("");
const selectedCity = ref<string | null>(null);
const citySearchQuery = ref("");

// Date filter state
type DatePresetId = "all" | "today" | "tomorrow" | "weekend" | "this_week" | "this_month" | "next_month";

const selectedDatePreset = ref<DatePresetId>("all");
const calendarModel = ref<string | { from: string; to: string } | null>(null);
const isCustomRangeActive = ref(false);

const datePresets: { id: DatePresetId; label: string }[] = [
  { id: "all", label: "Все даты" },
  { id: "today", label: "Сегодня" },
  { id: "tomorrow", label: "Завтра" },
  { id: "this_week", label: "На этой неделе" },
  { id: "weekend", label: "В эти выходные" },
  { id: "this_month", label: "В этом месяце" },
  { id: "next_month", label: "Следующий месяц" },
];

const russianLocale = {
  days: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
  daysShort: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
  months: [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ],
  monthsShort: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
};

// Sort options
type SortOptionId = "date_asc" | "date_desc" | "price_asc" | "price_desc" | "title_asc";

const currentSort = ref<SortOptionId>("date_asc");

const sortOptions: { id: SortOptionId; label: string }[] = [
  { id: "date_asc", label: "Сначала ближайшие" },
  { id: "date_desc", label: "Сначала поздние" },
  { id: "price_asc", label: "Сначала недорогие" },
  { id: "price_desc", label: "Сначала дорогие" },
  { id: "title_asc", label: "По названию (А–Я)" },
];

const activeSortLabel = computed(() => {
  return sortOptions.find((s) => s.id === currentSort.value)?.label ?? "Сортировка";
});

// Cities computation
const cityStats = computed(() => {
  const map = new Map<string, number>();
  for (const c of concerts.value) {
    if (c.city && c.city.trim()) {
      const city = c.city.trim();
      map.set(city, (map.get(city) ?? 0) + 1);
    }
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ru"));
});

const topCities = computed(() => {
  return cityStats.value.slice(0, 8);
});

const filteredCityList = computed(() => {
  const q = citySearchQuery.value.trim().toLowerCase();
  const allNames = new Set<string>();

  // Collect from concerts feed stats
  for (const cs of cityStats.value) {
    allNames.add(cs.name);
  }

  // Also collect from official locations
  for (const loc of locations.value) {
    if (loc.name && loc.name.trim()) {
      allNames.add(loc.name.trim());
    }
  }

  const counts = new Map<string, number>();
  for (const cs of cityStats.value) {
    counts.set(cs.name, cs.count);
  }

  const list = Array.from(allNames).map((name) => ({
    name,
    count: counts.get(name) ?? 0,
  }));

  // Sort by count desc, then alphabetically
  list.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ru"));

  if (!q) return list;
  return list.filter((c) => c.name.toLowerCase().includes(q));
});

function setCity(city: string | null) {
  selectedCity.value = city;
  if (city) {
    localStorage.setItem(CITY_KEY, city);
  } else {
    localStorage.removeItem(CITY_KEY);
  }
}

// Date helpers
function formatIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseQuasarDate(str: string): string {
  // Quasar uses YYYY/MM/DD, convert to YYYY-MM-DD
  return str.replace(/\//g, "-");
}

function formatDisplayDate(iso: string): string {
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" }).replace(".", "");
}

const activeDateRange = computed<{ from: string | null; to: string | null }>(() => {
  if (isCustomRangeActive.value && calendarModel.value) {
    if (typeof calendarModel.value === "string") {
      const d = parseQuasarDate(calendarModel.value);
      return { from: d, to: d };
    }
    if (typeof calendarModel.value === "object" && calendarModel.value.from) {
      const from = parseQuasarDate(calendarModel.value.from);
      const to = calendarModel.value.to ? parseQuasarDate(calendarModel.value.to) : from;
      return { from, to };
    }
  }

  const now = new Date();
  const today = formatIsoDate(now);

  switch (selectedDatePreset.value) {
    case "today":
      return { from: today, to: today };
    case "tomorrow": {
      const tom = new Date(now);
      tom.setDate(tom.getDate() + 1);
      const tomStr = formatIsoDate(tom);
      return { from: tomStr, to: tomStr };
    }
    case "this_week": {
      const day = now.getDay();
      const diffToSunday = day === 0 ? 0 : 7 - day;
      const sun = new Date(now);
      sun.setDate(sun.getDate() + diffToSunday);
      return { from: today, to: formatIsoDate(sun) };
    }
    case "weekend": {
      const day = now.getDay();
      const sat = new Date(now);
      const sun = new Date(now);
      if (day === 0) {
        // Today is Sunday: weekend is today
        return { from: today, to: today };
      }
      sat.setDate(sat.getDate() + (6 - day));
      sun.setDate(sun.getDate() + (7 - day));
      return { from: formatIsoDate(sat), to: formatIsoDate(sun) };
    }
    case "this_month": {
      const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { from: today, to: formatIsoDate(endMonth) };
    }
    case "next_month": {
      const startNext = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const endNext = new Date(now.getFullYear(), now.getMonth() + 2, 0);
      return { from: formatIsoDate(startNext), to: formatIsoDate(endNext) };
    }
    default:
      return { from: null, to: null };
  }
});

const isDateFilterActive = computed(() => {
  return selectedDatePreset.value !== "all" || isCustomRangeActive.value;
});

const customDateRangeText = computed(() => {
  const r = activeDateRange.value;
  if (!r.from) return "";
  if (r.from === r.to) {
    return formatDisplayDate(r.from);
  }
  return `${formatDisplayDate(r.from)} — ${formatDisplayDate(r.to!)}`;
});

const activeDateLabel = computed(() => {
  if (isCustomRangeActive.value && customDateRangeText.value) {
    return customDateRangeText.value;
  }
  const preset = datePresets.find((p) => p.id === selectedDatePreset.value);
  if (preset && preset.id !== "all") {
    return preset.label;
  }
  return "Даты";
});

function applyPreset(presetId: DatePresetId) {
  selectedDatePreset.value = presetId;
  isCustomRangeActive.value = false;
  calendarModel.value = null;
}

function onCalendarChange(val: unknown) {
  if (val) {
    isCustomRangeActive.value = true;
    selectedDatePreset.value = "all";
  }
}

function resetDateFilter() {
  selectedDatePreset.value = "all";
  isCustomRangeActive.value = false;
  calendarModel.value = null;
}

// Master Filter & Sort
const filteredConcerts = computed(() => {
  let list = concerts.value;

  // 1. City Filter
  if (selectedCity.value) {
    list = list.filter((c) => c.city === selectedCity.value);
  }

  // 2. Date Range Filter
  const { from, to } = activeDateRange.value;
  if (from && to) {
    list = list.filter((c) => {
      if (!c.datetime) return false;
      const concertDate = c.datetime.slice(0, 10);
      return concertDate >= from && concertDate <= to;
    });
  }

  // 3. Search Query Filter
  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    list = list.filter((c) => {
      const titleMatch = (c.title || "").toLowerCase().includes(q);
      const cityMatch = (c.city || "").toLowerCase().includes(q);
      const placeMatch = (c.place || "").toLowerCase().includes(q);
      return titleMatch || cityMatch || placeMatch;
    });
  }

  // 4. Sorting
  const sorted = [...list];
  switch (currentSort.value) {
    case "date_asc":
      sorted.sort((a, b) => {
        const da = a.datetime || "9999";
        const db = b.datetime || "9999";
        return da.localeCompare(db);
      });
      break;
    case "date_desc":
      sorted.sort((a, b) => {
        const da = a.datetime || "";
        const db = b.datetime || "";
        return db.localeCompare(da);
      });
      break;
    case "price_asc":
      sorted.sort((a, b) => {
        const pa = a.min_price?.value ?? 999999999;
        const pb = b.min_price?.value ?? 999999999;
        return pa - pb;
      });
      break;
    case "price_desc":
      sorted.sort((a, b) => {
        const pa = a.min_price?.value ?? -1;
        const pb = b.min_price?.value ?? -1;
        return pb - pa;
      });
      break;
    case "title_asc":
      sorted.sort((a, b) => (a.title || "").localeCompare(b.title || "", "ru"));
      break;
  }

  return sorted;
});

const hasActiveFilters = computed(() => {
  return Boolean(selectedCity.value || isDateFilterActive.value || searchQuery.value.trim());
});

function clearAllFilters() {
  searchQuery.value = "";
  setCity(null);
  resetDateFilter();
}

async function loadFeed(force = false) {
  if (force) {
    refreshing.value = true;
  } else {
    const cached = readCache<ConcertBrief[]>(CACHE_KEY_FEED);
    if (cached?.length) {
      concerts.value = cached;
      loading.value = false;
    }
  }

  try {
    await swr<ConcertBrief[]>(
      CACHE_KEY_FEED,
      () => api.concertsFeed(),
      {
        force,
        onData: (data) => {
          concerts.value = data;
          writeCache(CACHE_KEY_FEED, data);
        },
        onSettled: () => {
          loading.value = false;
          refreshing.value = false;
        },
      },
    );

    if (force) {
      Notify.create({
        message: "Афиша обновлена",
        color: "positive",
        timeout: 2000,
      });
    }
  } catch {
    loading.value = false;
    refreshing.value = false;
    if (force) {
      Notify.create({
        type: "negative",
        message: "Не удалось обновить афишу",
        timeout: 2500,
      });
    }
  }
}

async function loadLocations() {
  const cached = readCache<ConcertLocation[]>(CACHE_KEY_LOCATIONS);
  if (cached?.length) {
    locations.value = cached;
  }

  try {
    await swr<ConcertLocation[]>(
      CACHE_KEY_LOCATIONS,
      () => api.concertLocations(),
      {
        onData: (data) => {
          locations.value = data;
          writeCache(CACHE_KEY_LOCATIONS, data);
        },
      },
    );
  } catch {
    // Non-critical: cityStats will still populate from concerts
  }
}

async function refreshFeed() {
  if (refreshing.value) return;
  await loadFeed(true);
}

onMounted(() => {
  const savedCity = localStorage.getItem(CITY_KEY);
  if (savedCity) {
    selectedCity.value = savedCity;
  }
  void loadFeed();
  void loadLocations();
});
</script>
