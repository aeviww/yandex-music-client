<template>
  <q-dialog v-model="open">
    <div
      class="flex flex-col w-[min(640px,92vw)] pt-[18px] pr-[6px] pb-[14px] pl-[22px] border border-[color:var(--line)] rounded-[calc(var(--radius)+6px)] bg-[var(--surface)]"
    >
      <div class="flex items-start gap-[12px] pr-[16px]">
        <div class="col" style="min-width: 0">
          <div class="text-[19px] font-bold truncate">{{ title }}</div>
          <div class="mt-[2px] text-[color:var(--fg-dim)] text-[13px] truncate">
            {{ subtitle }}
          </div>
        </div>
        <div
          v-if="genius.ready"
          class="flex gap-[2px] mr-[4px] p-[2px] border border-[color:var(--line)] rounded-full"
        >
          <button
            type="button"
            class="px-[10px] py-[3px] border-0 rounded-full bg-transparent text-[11px] cursor-pointer"
            :class="
              source === 'yandex'
                ? 'bg-[var(--line)] text-[color:var(--fg)]'
                : 'text-[color:var(--fg-dim)]'
            "
            @click="source = 'yandex'"
          >
            РЇРЅРґРµРєСЃ
          </button>
          <button
            type="button"
            class="px-[10px] py-[3px] border-0 rounded-full bg-transparent text-[11px] cursor-pointer"
            :class="
              source === 'genius'
                ? 'bg-[var(--line)] text-[color:var(--fg)]'
                : 'text-[color:var(--fg-dim)]'
            "
            @click="source = 'genius'"
          >
            Genius
          </button>
        </div>
        <div
          class="flex w-[30px] h-[30px] items-center justify-center rounded-full text-[color:var(--fg-faint)] cursor-pointer select-none transition-[background,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] p-0 border-0 appearance-none"
          @click="open = false"
        >
          <Icon name="mingcute:close-line" :size="16" />
        </div>
      </div>

      <GeniusPanel
        v-if="source === 'genius'"
        :track="track"
        :active="open && source === 'genius'"
      />

      <template v-else>
        <div
          v-if="blocks.length"
          class="min-h-[160px] max-h-[58vh] mt-[14px] overflow-y-auto overscroll-contain"
        >
          <div class="pr-[18px]">
            <p
              v-for="(block, i) in blocks"
              :key="i"
              class="mt-0 mx-0 mb-[18px] text-[color:var(--fg)] text-[16px] leading-[1.55] whitespace-pre-wrap"
            >
              <template v-for="(line, j) in block" :key="j">
                {{ line }}<br v-if="j < block.length - 1" />
              </template>
            </p>
          </div>
          <div
            v-if="loading"
            class="flex items-center gap-[8px] pt-[8px] pr-[16px] pb-0 pl-0 text-[color:var(--fg-faint)] text-[12px]"
          >
            <q-spinner size="12px" color="grey-6" />
            <span>РћР±РЅРѕРІР»СЏСЋ С‚РµРєСЃС‚вЂ¦</span>
          </div>
        </div>

        <div
          v-else-if="loading"
          class="flex flex-col items-start gap-[14px] px-[16px] py-[34px] text-[color:var(--fg-dim)] text-[14px] text-center"
        >
          <q-spinner size="20px" color="grey-6" />
          <span>РС‰Сѓ С‚РµРєСЃС‚вЂ¦</span>
        </div>

        <div
          v-else
          class="flex flex-col items-start gap-[14px] px-[16px] py-[34px] text-[color:var(--fg-dim)] text-[14px] text-center"
        >
          <span>{{ error || "РўРµРєСЃС‚Р° РґР»СЏ СЌС‚РѕРіРѕ С‚СЂРµРєР° РЅРµС‚" }}</span>
          <div
            class="inline-flex h-[32px] items-center justify-center gap-[7px] px-[14px] py-0 border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer select-none transition-[background,border-color,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
            @click="retry"
          >
            РџРѕРїСЂРѕР±РѕРІР°С‚СЊ СЃРЅРѕРІР°
          </div>
          <div
            v-if="genius.ready"
            class="inline-flex h-[32px] items-center justify-center gap-[7px] px-[14px] py-0 border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer select-none transition-[background,border-color,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
            @click="source = 'genius'"
          >
            РџРѕСЃРјРѕС‚СЂРµС‚СЊ РЅР° Genius
          </div>
        </div>

        <div
          v-if="writers"
          class="pt-[10px] pr-[18px] pb-0 pl-0 mt-[8px] text-[color:var(--fg-faint)] text-[12px] truncate border-t border-t-[color:var(--line)] border-solid"
        >
          РђРІС‚РѕСЂС‹: {{ writers }}
        </div>
      </template>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import GeniusPanel from "@/components/player/GeniusPanel.vue";
import { api } from "@/api/client";
import type { Lyrics } from "@/api/types";
import { readCache, writeCache } from "@/lib/cache";
import { trackLyricsDialog } from "@/lib/dialogs";
import { artistNames } from "@/lib/format";
import { useGeniusStore } from "@/stores/genius";

const loading = ref(false);
const error = ref("");
const lyrics = ref<Lyrics | null>(null);
const source = ref<"yandex" | "genius">("yandex");

const genius = useGeniusStore();

const open = computed({
  get: () => trackLyricsDialog.open,
  set: (value: boolean) => {
    trackLyricsDialog.open = value;
  },
});

const track = computed(() => trackLyricsDialog.track);
const title = computed(() => track.value?.title || "РўРµРєСЃС‚ РїРµСЃРЅРё");
const subtitle = computed(() =>
  track.value ? artistNames(track.value.artists) : "",
);
const writers = computed(() => (lyrics.value?.writers || []).join(", "));

function toBlocks(value: Lyrics | null): string[][] {
  const lines = (value?.lines || []).map((line) => (line.text || "").trim());
  const groups: string[][] = [];
  let current: string[] = [];
  for (const line of lines) {
    if (!line) {
      if (current.length) groups.push(current);
      current = [];
      continue;
    }
    current.push(line);
  }
  if (current.length) groups.push(current);
  return groups;
}

const blocks = computed(() => toBlocks(lyrics.value));

async function load(id: string, force = false) {
  const key = `lyrics.${id}`;
  const cached = force ? null : readCache<Lyrics>(key);
  const cachedOk = !!cached && toBlocks(cached).length > 0;

  lyrics.value = cachedOk ? cached : null;
  loading.value = true;
  error.value = "";

  try {
    const fresh = await api.lyrics(id);
    if (trackLyricsDialog.track?.id !== id) return;
    if (toBlocks(fresh).length) {
      lyrics.value = fresh;
      writeCache(key, fresh);
    } else if (!cachedOk) {
      error.value = "РўРµРєСЃС‚Р° РґР»СЏ СЌС‚РѕРіРѕ С‚СЂРµРєР° РЅРµС‚";
    }
  } catch (e) {
    if (trackLyricsDialog.track?.id !== id) return;
    if (!cachedOk) {
      const message = e instanceof Error ? e.message : String(e);
      error.value = message || "РќРµ СѓРґР°Р»РѕСЃСЊ Р·Р°РіСЂСѓР·РёС‚СЊ С‚РµРєСЃС‚";
    }
  } finally {
    if (trackLyricsDialog.track?.id === id) {
      loading.value = false;
      if (
        genius.ready &&
        genius.lyricsMode !== "off" &&
        !toBlocks(lyrics.value).length
      ) {
        source.value = "genius";
      }
    }
  }
}

function retry() {
  const id = track.value?.id;
  if (id) void load(String(id), true);
}

watch(
  () => [trackLyricsDialog.open, trackLyricsDialog.track?.id] as const,
  ([isOpen, id]) => {
    if (!isOpen || !id) return;
    source.value =
      genius.ready && genius.lyricsMode === "always" ? "genius" : "yandex";
    void load(String(id));
  },
  { immediate: true },
);
</script>
