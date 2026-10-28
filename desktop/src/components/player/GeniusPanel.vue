<template>
  <div class="flex flex-col gap-[12px] min-h-[120px] pt-[14px] px-[16px] pb-[16px] overflow-y-auto">
    <div
      v-if="!genius.ready"
      class="flex items-center gap-[10px] py-[18px] px-0 text-[color:var(--fg-dim)] text-[13px]"
    >
      <span>
        Genius РІС‹РєР»СЋС‡РµРЅ. РћС‚РєСЂРѕР№ РќР°СЃС‚СЂРѕР№РєРё в†’ Genius Рё РІСЃС‚Р°РІСЊ Client Access Token.
      </span>
      <div
        class="inline-flex h-[32px] items-center justify-center gap-[7px] px-[14px] py-0 border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer select-none transition-[background,border-color,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
        @click="openUrl('https://genius.com/api-clients')"
      >
        РџРѕР»СѓС‡РёС‚СЊ С‚РѕРєРµРЅ
      </div>
    </div>

    <div v-else-if="personOpen" class="flex flex-col gap-[12px]">
      <button
        class="flex items-center gap-[4px] p-0 border-0 bg-transparent text-left text-[color:var(--fg-dim)] text-[11px] cursor-pointer hover:text-[color:var(--fg)]"
        type="button"
        @click="genius.closePerson()"
      >
        <Icon name="mingcute:left-line" :size="14" />
        <span>РќР°Р·Р°Рґ Рє С‚СЂРµРєСѓ</span>
      </button>

      <div
        v-if="genius.personLoading"
        class="flex items-center gap-[10px] py-[18px] px-0 text-[color:var(--fg-dim)] text-[13px]"
      >
        <q-spinner size="16px" color="grey-6" />
        <span>РћС‚РєСЂС‹РІР°СЋ СЃС‚СЂР°РЅРёС†СѓвЂ¦</span>
      </div>

      <div
        v-else-if="genius.personError"
        class="flex items-center gap-[10px] py-[18px] px-0 text-[color:var(--fg-dim)] text-[13px]"
      >
        <span>{{ genius.personError }}</span>
      </div>

      <template v-else-if="genius.person">
        <div class="flex items-center gap-[10px]">
          <div
            class="cover cover-round flex-none w-[44px] h-[44px] rounded-full overflow-hidden bg-[var(--surface-2)] flex items-center justify-center [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block"
          >
            <img v-if="genius.person.image" :src="genius.person.image" />
            <Icon
              v-else
              name="mingcute:user-2-line"
              :size="18"
              class="text-[color:var(--fg-faint)]"
            />
          </div>
          <div class="col" style="min-width: 0">
            <div class="text-[14px] font-semibold truncate">
              {{ genius.person.name }}
            </div>
            <div class="mt-[2px] text-[11px] text-[color:var(--fg-dim)] truncate">
              {{ personMeta }}
            </div>
          </div>
        </div>

        <p
          v-if="genius.person.description"
          class="mt-[4px] mx-0 mb-0 text-[13px] leading-[1.6] whitespace-pre-line"
        >
          {{ genius.person.description }}
        </p>

        <div
          class="flex flex-wrap gap-y-[6px] gap-x-[14px] text-[12px]"
        >
          <a
            class="text-[color:var(--fg-dim)] cursor-pointer no-underline border-b border-b-[color:var(--line)] hover:text-[color:var(--fg)]"
            @click.prevent="openUrl(genius.person.url)"
            >РћС‚РєСЂС‹С‚СЊ РЅР° Genius</a
          >
          <a
            v-for="social in genius.person.socials"
            :key="social.url"
            class="text-[color:var(--fg-dim)] cursor-pointer no-underline border-b border-b-[color:var(--line)] hover:text-[color:var(--fg)]"
            @click.prevent="openUrl(social.url)"
          >
            {{ social.kind }}: {{ social.handle }}
          </a>
        </div>
      </template>
    </div>

    <div v-else-if="picking" class="flex flex-col gap-[12px]">
      <button
        class="flex items-center gap-[4px] p-0 border-0 bg-transparent text-left text-[color:var(--fg-dim)] text-[11px] cursor-pointer hover:text-[color:var(--fg)]"
        type="button"
        @click="picking = false"
      >
        <Icon name="mingcute:left-line" :size="14" />
        <span>РќР°Р·Р°Рґ</span>
      </button>

      <form class="flex gap-[8px]" @submit.prevent="runSearch">
        <input
          v-model="query"
          type="text"
          placeholder="Р°СЂС‚РёСЃС‚ Рё РЅР°Р·РІР°РЅРёРµ"
          class="flex-1 min-w-0 px-[10px] py-[6px] border border-[color:var(--line)] rounded-[8px] bg-transparent text-inherit text-[13px]"
        />
        <button
          class="inline-flex h-[32px] items-center justify-center gap-[7px] px-[14px] py-0 border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer select-none transition-[background,border-color,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
          type="submit"
        >
          РќР°Р№С‚Рё
        </button>
      </form>

      <div
        v-if="genius.hitsLoading"
        class="flex items-center gap-[10px] py-[18px] px-0 text-[color:var(--fg-dim)] text-[13px]"
      >
        <q-spinner size="16px" color="grey-6" />
        <span>РС‰СѓвЂ¦</span>
      </div>

      <button
        v-for="hit in genius.hits"
        :key="hit.id"
        class="flex items-center gap-[10px] p-[6px] border-0 rounded-[8px] text-inherit text-[13px] text-left cursor-pointer hover:bg-[var(--line)]"
        type="button"
        @click="choose(hit)"
      >
        <div
          class="cover flex-none w-[32px] h-[32px] rounded-[10px] overflow-hidden bg-[var(--surface-2)] flex items-center justify-center [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block"
        >
          <img v-if="hit.art" :src="hit.art" />
        </div>
        <span class="truncate">{{ hit.full_title || hit.title }}</span>
      </button>
    </div>

    <div
      v-else-if="genius.loading"
      class="flex items-center gap-[10px] py-[18px] px-0 text-[color:var(--fg-dim)] text-[13px]"
    >
      <q-spinner size="16px" color="grey-6" />
      <span>РЎРјРѕС‚СЂСЋ GeniusвЂ¦</span>
    </div>

    <div
      v-else-if="!song"
      class="flex items-center gap-[10px] py-[18px] px-0 text-[color:var(--fg-dim)] text-[13px]"
    >
      <span>{{ genius.error || "РќР° Genius РЅРёС‡РµРіРѕ РЅРµ РЅР°С€Р»РѕСЃСЊ" }}</span>
      <div
        class="inline-flex h-[32px] items-center justify-center gap-[7px] px-[14px] py-0 border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer select-none transition-[background,border-color,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
        @click="startPicking"
      >
        РќР°Р№С‚Рё РІСЂСѓС‡РЅСѓСЋ
      </div>
    </div>

    <template v-else>
      <div class="flex items-center gap-[10px]">
        <div
          class="cover flex-none w-[44px] h-[44px] rounded-[10px] overflow-hidden bg-[var(--surface-2)] flex items-center justify-center [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block"
        >
          <img v-if="song.art" :src="song.art" />
          <Icon
            v-else
            name="mingcute:music-line"
            :size="18"
            class="text-[color:var(--fg-faint)]"
          />
        </div>
        <div class="col" style="min-width: 0">
          <div class="text-[14px] font-semibold truncate">
            {{ song.full_title || song.title }}
          </div>
          <div class="mt-[2px] text-[11px] text-[color:var(--fg-dim)] truncate">
            {{ songMeta }}
          </div>
        </div>
        <div class="flex flex-col gap-[4px] ml-auto">
          <button
            class="p-0 border-0 bg-transparent text-right text-[color:var(--fg-dim)] text-[11px] cursor-pointer hover:text-[color:var(--fg)]"
            type="button"
            @click="openUrl(song.url)"
          >
            РќР° Genius
          </button>
          <button
            class="p-0 border-0 bg-transparent text-right text-[color:var(--fg-dim)] text-[11px] cursor-pointer hover:text-[color:var(--fg)]"
            type="button"
            @click="refresh"
          >
            РћР±РЅРѕРІРёС‚СЊ
          </button>
          <button
            class="p-0 border-0 bg-transparent text-right text-[color:var(--fg-dim)] text-[11px] cursor-pointer hover:text-[color:var(--fg)]"
            type="button"
            @click="startPicking"
          >
            РќРµ С‚РѕС‚ С‚СЂРµРє
          </button>
        </div>
      </div>

      <div class="flex gap-[14px] border-b border-b-[color:var(--line)] border-solid">
        <button
          v-for="item in tabs"
          :key="item.value"
          type="button"
          class="pt-0 px-0 pb-[7px] border-x-0 border-t-0 border-b-2 border-solid bg-transparent text-[12px] cursor-pointer"
          :class="
            tab === item.value
              ? 'text-[color:var(--fg)] border-b-[color:currentColor]'
              : 'text-[color:var(--fg-dim)] border-b-transparent'
          "
          @click="tab = item.value"
        >
          {{ item.label }}
        </button>
      </div>

      <div v-if="tab === 'lyrics'" class="flex flex-col gap-[12px]">
        <p
          v-if="!song.lyrics.length"
          class="mt-[4px] mx-0 mb-0 text-[color:var(--fg-dim)] text-[13px]"
        >
          {{ song.lyrics_error || "Genius РЅРµ РѕС‚РґР°Р» С‚РµРєСЃС‚ РґР»СЏ СЌС‚РѕР№ СЃС‚СЂР°РЅРёС†С‹." }}
        </p>
        <div
          v-for="(section, i) in lyricSections"
          :key="i"
          class="flex flex-col gap-[4px]"
        >
          <div
            v-if="section.heading"
            class="self-start px-[8px] py-[2px] rounded-full bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] text-[color:var(--accent)] text-[10.5px] font-[650] tracking-[0.04em] uppercase"
          >
            {{ section.heading }}
          </div>
          <p v-if="section.lines.length" class="m-0 text-[13px] leading-[1.7]">
            <template v-for="(line, j) in section.lines" :key="j">
              {{ line }}<br v-if="j < section.lines.length - 1" />
            </template>
          </p>
        </div>
      </div>

      <div v-else-if="tab === 'quotes'" class="flex flex-col gap-[12px]">
        <div
          v-if="!quotes.length"
          class="mt-[4px] mx-0 mb-0 text-[color:var(--fg-dim)] text-[13px]"
        >
          <p>
            {{ song.quotes_error || "Рљ СЌС‚РѕРјСѓ С‚СЂРµРєСѓ РµС‰С‘ РЅРµ РЅР°РїРёСЃР°Р»Рё СЂР°Р·Р±РѕСЂРѕРІ." }}
          </p>
          <p v-if="song.annotation_count" class="text-[color:var(--fg-dim)] text-[11px]">
            Genius РЅР°СЃС‡РёС‚Р°Р» СЂР°Р·Р±РѕСЂРѕРІ РЅР° СЌС‚РѕРј С‚СЂРµРєРµ:
            {{ song.annotation_count }}
          </p>
          <button
            class="p-0 border-0 bg-transparent text-right text-[color:var(--fg-dim)] text-[11px] cursor-pointer hover:text-[color:var(--fg)]"
            type="button"
            @click="refresh"
          >
            Р—Р°РіСЂСѓР·РёС‚СЊ Р·Р°РЅРѕРІРѕ
          </button>
        </div>
        <p
          v-else-if="song.quotes_source !== 'api'"
          class="text-[color:var(--fg-dim)] text-[11px]"
        >
          Р Р°Р·Р±РѕСЂС‹ СЃРѕР±СЂР°РЅС‹ РІ РѕР±С…РѕРґ API-С‚РѕРєРµРЅР° вЂ” РёСЃС‚РѕС‡РЅРёРє:
          {{ song.quotes_source }}.
        </p>
        <div
          v-for="(quote, i) in quotes"
          :key="i"
          class="pl-[10px] border-l-2 border-l-[color:var(--line)] border-solid"
        >
          <div class="text-[13px] italic whitespace-pre-line">
            {{ quote.fragment }}
          </div>
          <p class="mt-[5px] mx-0 mb-[4px] text-[13px] leading-[1.6] whitespace-pre-line">
            {{ quote.text }}
          </p>

          <div class="flex flex-wrap gap-[5px] mb-[5px]">
            <button
              v-for="author in quote.authors"
              :key="author.url || author.name"
              class="inline-flex max-w-[220px] items-center gap-[5px] pt-[2px] pr-[8px] pb-[2px] pl-[3px] border border-[color:var(--line)] rounded-full bg-transparent text-inherit text-[11px] cursor-pointer hover:border-[color:var(--fg-dim)] [&_img]:w-[16px] [&_img]:h-[16px] [&_img]:rounded-full [&_img]:object-cover [&_b]:text-[color:var(--accent)] [&_b]:text-[10px] [&_i]:text-[color:var(--fg-dim)] [&_i]:text-[10px] [&_i]:not-italic [&_i]:tabular-nums"
              type="button"
              @click="openUrl(author.url)"
            >
              <img v-if="author.image" :src="author.image" />
              <span class="truncate">{{ author.name }}</span>
              <b v-if="author.verified" title="РџРѕРґС‚РІРµСЂР¶РґС‘РЅРЅС‹Р№ Р°РєРєР°СѓРЅС‚">вњ“</b>
              <i v-if="author.iq">{{ shortNumber(author.iq) }} IQ</i>
            </button>
            <span
              v-if="!quote.authors.length"
              class="text-[color:var(--fg-dim)] text-[11px]"
            >
              РЎРѕРѕР±С‰РµСЃС‚РІРѕ Genius
            </span>
          </div>

          <div class="flex gap-[10px] text-[11px] text-[color:var(--fg-dim)]">
            <span>{{ quoteMeta(quote) }}</span>
            <a
              v-if="quote.url"
              class="text-[color:var(--fg-dim)] cursor-pointer no-underline border-b border-b-[color:var(--line)] hover:text-[color:var(--fg)]"
              @click.prevent="openUrl(quote.url)"
            >
              РЅР° Genius
            </a>
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col gap-[12px]">
        <p
          v-if="!groups.length"
          class="mt-[4px] mx-0 mb-0 text-[color:var(--fg-dim)] text-[13px]"
        >
          РЈС‡Р°СЃС‚РЅРёРєРё Р·Р°РїРёСЃРё РЅРµ СѓРєР°Р·Р°РЅС‹.
        </p>
        <div v-for="group in groups" :key="group.role">
          <div class="mb-[6px] text-[11px] text-[color:var(--fg-dim)]">
            {{ group.role }}
          </div>
          <div class="flex flex-wrap gap-[6px]">
            <button
              v-for="person in group.people"
              :key="`${group.role}-${person.name}`"
              class="flex items-center gap-[6px] max-w-[220px] pt-[4px] pr-[9px] pb-[4px] pl-[4px] border border-[color:var(--line)] rounded-full bg-transparent text-inherit text-[12px] cursor-pointer hover:border-[color:var(--fg-dim)] [&_img]:w-[20px] [&_img]:h-[20px] [&_img]:rounded-full [&_img]:object-cover"
              type="button"
              @click="openPerson(person)"
            >
              <img v-if="person.image" :src="person.image" />
              <span class="truncate">{{ person.name }}</span>
            </button>
          </div>
        </div>

        <div
          v-if="infoRows.length"
          class="flex flex-col gap-[4px] pt-[10px] px-[12px] pb-[10px] border border-[color:var(--line)] rounded-[10px]"
        >
          <div
            v-for="row in infoRows"
            :key="row.label"
            class="flex items-baseline justify-between gap-[12px] text-[12px]"
          >
            <span class="flex-none text-[color:var(--fg-dim)]">{{ row.label }}</span>
            <span class="overflow-hidden text-right truncate">{{ row.value }}</span>
          </div>
        </div>

        <div v-if="tags.length" class="flex flex-wrap gap-[5px]">
          <span
            v-for="tag in tags"
            :key="tag"
            class="px-[8px] py-[2px] border border-[color:var(--line)] rounded-full text-[color:var(--fg-dim)] text-[11px]"
            >{{ tag }}</span
          >
        </div>

        <div
          v-if="media.length"
          class="flex flex-wrap gap-y-[6px] gap-x-[14px] text-[12px]"
        >
          <a
            v-for="item in media"
            :key="item.url"
            class="text-[color:var(--fg-dim)] cursor-pointer no-underline border-b border-b-[color:var(--line)] hover:text-[color:var(--fg)]"
            @click.prevent="openUrl(item.url)"
          >
            {{ mediaLabel(item) }}
          </a>
        </div>

        <div v-for="relation in relations" :key="relation.kind">
          <div class="mb-[6px] text-[11px] text-[color:var(--fg-dim)]">
            {{ relation.kind }}
          </div>
          <div class="flex flex-wrap gap-[6px]">
            <button
              v-for="item in relation.songs"
              :key="item.id"
              class="flex items-center gap-[6px] max-w-[220px] pt-[4px] pr-[9px] pb-[4px] pl-[4px] border border-[color:var(--line)] rounded-full bg-transparent text-inherit text-[12px] cursor-pointer hover:border-[color:var(--fg-dim)] [&_img]:w-[20px] [&_img]:h-[20px] [&_img]:rounded-full [&_img]:object-cover"
              type="button"
              @click="openUrl(item.url)"
            >
              <img v-if="item.art" :src="item.art" />
              <span class="truncate">{{ item.full_title || item.title }}</span>
            </button>
          </div>
        </div>

        <p
          v-if="song.description"
          class="mt-[4px] mx-0 mb-0 text-[13px] leading-[1.6] whitespace-pre-line"
        >
          {{ song.description }}
        </p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { api } from "@/api/client";
import type {
  GeniusHit,
  GeniusMedia,
  GeniusPerson,
  GeniusQuote,
  Track,
} from "@/api/types";
import { artistNames } from "@/lib/format";
import { useGeniusStore } from "@/stores/genius";
import { useRouter } from "vue-router";

const props = defineProps<{ track: Track | null; active?: boolean }>();

const genius = useGeniusStore();
const router = useRouter();

function refresh() {
  if (props.track) void genius.refresh(props.track);
}

type Tab = "lyrics" | "quotes" | "credits";

const tab = ref<Tab>("lyrics");
const picking = ref(false);
const query = ref("");

const song = computed(() => genius.song);
const personOpen = computed(
  () => !!genius.person || genius.personLoading || !!genius.personError,
);

const tabs = computed(() => {
  const list: Array<{ value: Tab; label: string }> = [
    { value: "lyrics", label: "РўРµРєСЃС‚" },
  ];
  if (genius.showQuotes) {
    list.push({
      value: "quotes",
      label: `Р¦РёС‚Р°С‚С‹ Рё СЂР°Р·Р±РѕСЂС‹ (${quotes.value.length})`,
    });
  }
  list.push({ value: "credits", label: "РќР°Рґ С‚СЂРµРєРѕРј СЂР°Р±РѕС‚Р°Р»Рё" });
  return list;
});

const quotes = computed(() =>
  genius.showQuotes ? song.value?.quotes || [] : [],
);

type LyricSection = { heading: string | null; lines: string[] };

const lyricSections = computed<LyricSection[]>(() => {
  const sections: LyricSection[] = [];
  let heading: string | null = null;
  let lines: string[] = [];

  const flush = () => {
    if (heading !== null || lines.length) sections.push({ heading, lines });
    heading = null;
    lines = [];
  };

  for (const raw of song.value?.lyrics || []) {
    const line = raw.trim();

    if (!line) {
      if (heading !== null || lines.length) flush();
      continue;
    }

    if (line.startsWith("[") && line.endsWith("]")) {
      if (heading !== null || lines.length) flush();
      heading = line.slice(1, -1).trim();
      continue;
    }

    lines.push(raw);
  }

  flush();
  return sections;
});

const groups = computed(() => {
  const map = new Map<string, GeniusPerson[]>();
  const people = [
    ...(song.value?.credits || []),
    ...(song.value?.verified_by || []),
  ];
  for (const person of people) {
    const list = map.get(person.role) || [];
    if (list.some((old) => old.name === person.name)) continue;
    list.push(person);
    map.set(person.role, list);
  }
  return [...map.entries()].map(([role, people]) => ({ role, people }));
});

const tags = computed(() => song.value?.tags || []);
const media = computed(() => song.value?.media || []);
const relations = computed(() => song.value?.relations || []);

const infoRows = computed(() => {
  const value = song.value;
  const rows: Array<{ label: string; value: string }> = [];
  if (!value) return rows;

  const album = value.album_info;
  if (album?.name) {
    rows.push({
      label: "РђР»СЊР±РѕРј",
      value: album.artist ? `${album.name} вЂ” ${album.artist}` : album.name,
    });
    if (album.release_date) {
      rows.push({ label: "Р РµР»РёР· Р°Р»СЊР±РѕРјР°", value: album.release_date });
    }
  } else if (value.album) {
    rows.push({ label: "РђР»СЊР±РѕРј", value: value.album });
  }

  if (value.release_date)
    rows.push({ label: "Р РµР»РёР·", value: value.release_date });
  if (value.recording_location) {
    rows.push({ label: "Р—Р°РїРёСЃР°РЅРѕ", value: value.recording_location });
  }
  if (value.language) {
    rows.push({ label: "РЇР·С‹Рє", value: value.language.toUpperCase() });
  }
  if (value.pageviews) {
    rows.push({ label: "РџСЂРѕСЃРјРѕС‚СЂС‹", value: ruNumber(value.pageviews) });
  }
  if (value.contributors) {
    rows.push({ label: "РЈС‡Р°СЃС‚РЅРёРєРѕРІ", value: ruNumber(value.contributors) });
  }
  if (value.annotation_count) {
    rows.push({ label: "РђРЅРЅРѕС‚Р°С†РёР№", value: ruNumber(value.annotation_count) });
  }
  if (value.concurrents) {
    rows.push({ label: "Р§РёС‚Р°СЋС‚ СЃРµР№С‡Р°СЃ", value: ruNumber(value.concurrents) });
  }
  if (value.apple_music_id) {
    rows.push({ label: "Apple Music ID", value: value.apple_music_id });
  }
  if (value.hot) rows.push({ label: "РЎС‚Р°С‚СѓСЃ", value: "Р’ С‚СЂРµРЅРґРµ РЅР° Genius" });

  return rows;
});

const producerNames = computed(() =>
  (song.value?.credits || [])
    .filter((person) => person.role === "РџСЂРѕРґСЋСЃРµСЂ")
    .map((person) => person.name)
    .slice(0, 3)
    .join(", "),
);

const songMeta = computed(() => {
  const value = song.value;
  if (!value) return "";
  const parts: string[] = [];
  if (value.album) parts.push(value.album);
  if (value.release_date) parts.push(value.release_date);
  if (value.pageviews) parts.push(`${ruNumber(value.pageviews)} РїСЂРѕСЃРјРѕС‚СЂРѕРІ`);
  if (producerNames.value) parts.push(`РїСЂРѕРґ: ${producerNames.value}`);
  return parts.join(" В· ");
});

const personMeta = computed(() => {
  const person = genius.person;
  if (!person) return "";
  const parts: string[] = [];
  if (person.followers) {
    parts.push(
      `${person.followers.toLocaleString("ru-RU")} РїРѕРґРїРёСЃС‡РёРєРѕРІ РЅР° Genius`,
    );
  }
  if (person.alternate_names.length) {
    parts.push(person.alternate_names.slice(0, 3).join(", "));
  }
  return parts.join(" В· ");
});

function ruNumber(value: number): string {
  return value.toLocaleString("ru-RU");
}

function shortNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
}

function quoteMeta(quote: GeniusQuote): string {
  const parts: string[] = [];
  if (quote.votes) parts.push(`${quote.votes} РіРѕР»РѕСЃРѕРІ`);
  if (quote.comments) parts.push(`${quote.comments} РєРѕРјРјРµРЅС‚Р°СЂРёРµРІ`);
  if (quote.verified) parts.push("РїРѕРґС‚РІРµСЂР¶РґРµРЅРѕ");
  if (quote.pinned) parts.push("Р·Р°РєСЂРµРїР»РµРЅРѕ");
  return parts.join(" В· ");
}

function mediaLabel(item: GeniusMedia): string {
  const provider = item.provider
    ? item.provider.charAt(0).toUpperCase() + item.provider.slice(1)
    : "РЎСЃС‹Р»РєР°";
  if (item.kind === "video") return `${provider} В· РІРёРґРµРѕ`;
  if (item.kind === "audio") return `${provider} В· Р°СѓРґРёРѕ`;
  return provider;
}

function openUrl(url: string) {
  if (url) void api.openExternal(url);
}

function openPerson(person: GeniusPerson) {
  if (person.id) {
    void router.push({
      name: "genius-artist",
      params: { id: String(person.id) },
      query: person.role ? { role: person.role } : {},
    });
    return;
  }
  openUrl(person.url);
}

function startPicking() {
  picking.value = true;
  query.value = props.track
    ? `${props.track.title} ${artistNames(props.track.artists)}`.trim()
    : "";
  void genius.searchHits(query.value);
}

function runSearch() {
  void genius.searchHits(query.value);
}

async function choose(hit: GeniusHit) {
  picking.value = false;
  tab.value = "lyrics";
  await genius.pickHit(hit);
}

watch(
  () => [props.active !== false, props.track?.id] as const,
  ([visible, id]) => {
    if (!visible || !id) return;
    tab.value = "lyrics";
    picking.value = false;
    genius.closePerson();
    void genius.fetchSong(props.track);
  },
  { immediate: true },
);
</script>
