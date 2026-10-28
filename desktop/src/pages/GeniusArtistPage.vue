<template>
  <q-page class="flex flex-col h-[calc(100vh_-_52px_-_var(--player-height,_78px))] !min-h-0 !p-0 !overflow-hidden">
    <q-scroll-area class="flex-auto min-h-0">
      <div class="pt-[var(--page-top-gap)] px-[32px] pb-[46px]">
        <div v-if="!genius.ready" class="text-[color:var(--fg-dim)] text-[calc(13px*var(--text-scale,1))]">
          Включи Genius и добавь токен в настройках, чтобы открывать страницы
          людей.
        </div>

        <div v-else-if="loading" class="flex flex-center" style="height: 300px">
          <q-spinner size="26px" color="primary" />
        </div>

        <template v-else-if="person">
          <div class="flex items-end gap-[26px] min-w-0 overflow-hidden max-h-[520px] [transition:max-height_0.34s_ease,opacity_0.24s_ease,transform_0.34s_ease,margin_0.34s_ease] max-[1360px]:gap-[20px] max-[1024px]:flex-col max-[1024px]:items-start max-[1024px]:gap-[14px]">
            <div
              class="cover cover-round w-[clamp(112px,_15vw,_190px)] h-[clamp(112px,_15vw,_190px)] rounded-full overflow-hidden bg-[var(--surface-2)] flex items-center justify-center flex-none [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block"
              :class="{ 'relative cursor-pointer group/cover': photos.length }"
              @click="openViewer"
            >
              <img
                v-if="person.image"
                loading="lazy"
                decoding="async"
                :src="person.image"
              />
              <Icon v-else name="mingcute:user-2-line" :size="56" class="text-[color:var(--fg-faint)]" />
              <div v-if="photos.length" class="absolute flex items-center justify-center rounded-[inherit] bg-[rgba(0,0,0,0.32)] text-[color:#fff] inset-0 opacity-[0] transition-opacity duration-[160ms] ease-[ease] group-hover/cover:opacity-[1]">
                <Icon name="mingcute:square-line" :size="22" />
              </div>
              <div v-if="photos.length > 1" class="absolute right-[6px] bottom-[6px] px-[8px] py-[2px] rounded-[10px] bg-[rgba(0,0,0,0.6)] text-[color:#fff] text-[11px] font-medium pointer-events-none">
                {{ photos.length }} фото
              </div>
            </div>

            <div class="flex-1 min-w-0 pb-[4px] max-[1024px]:w-full max-[1024px]:pb-0">
              <div class="text-[12px] text-[color:var(--fg-dim)]">{{ roleLabel }}</div>
              <div class="text-[clamp(24px,_3.4vw,_44px)] leading-[1.06] font-extrabold tracking-[-0.025em] mt-[6px] mx-0 mb-[10px] break-words max-[1024px]:mt-[4px] max-[1024px]:mx-0 max-[1024px]:mb-[8px]">
                {{ person.name
                }}<span
                  v-if="person.verified"
                  class="inline-flex items-center ml-[7px] text-[color:#ffd400] align-middle"
                  title="Подтверждённый аккаунт"
                >
                  <Icon name="mingcute:check-line" :size="15" />
                </span>
              </div>

              <div class="flex items-baseline flex-wrap gap-y-0 gap-x-[6px] text-[13px] text-[color:var(--fg-dim)] min-w-0 [&>span]:whitespace-nowrap max-[760px]:text-[12px]">
                <span v-if="person.followers">
                  {{ person.followers.toLocaleString("ru-RU") }}
                  {{
                    pluralWord(
                      person.followers,
                      "подписчик",
                      "подписчика",
                      "подписчиков",
                    )
                  }}
                </span>
                <span v-if="person.iq" class="text-[color:var(--fg-faint)]">
                  · {{ person.iq.toLocaleString("ru-RU") }} IQ
                </span>
                <span v-if="person.songs.length" class="text-[color:var(--fg-faint)]">
                  ·
                  {{ plural(person.songs.length, "трек", "трека", "треков") }}
                </span>
              </div>

              <div class="flex items-center gap-[8px] flex-wrap mt-[22px] select-none max-[1180px]:gap-[7px] max-[1180px]:mt-[16px] max-[1024px]:mt-[14px]">
                <button
                  class="inline-flex h-[34px] items-center justify-center px-[18px] py-0 border-0 rounded-[8px] !bg-[var(--accent)] text-[color:#fff] cursor-pointer text-[calc(12px*var(--text-scale,1))] font-medium gap-[7px] select-none whitespace-nowrap transition-opacity duration-[120ms] ease-[ease] hover:opacity-[0.85] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none max-[760px]:px-[12px]"
                  type="button"
                  @click="open(person.url)"
                >
                  <Icon name="mingcute:earth-2-line" :size="15" />
                  <span class="max-[760px]:hidden">Открыть на Genius</span>
                </button>

                <button class="inline-flex h-[32px] items-center justify-center px-[14px] py-0 border border-solid border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] cursor-pointer text-[calc(12px*var(--text-scale,1))] font-medium gap-[7px] select-none whitespace-nowrap transition-[background,border-color,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none max-[760px]:px-[12px]" type="button" @click="load(true)">
                  <Icon name="mingcute:repeat-line" :size="15" />
                  <span class="max-[760px]:hidden">Обновить</span>
                </button>

                <button class="inline-flex h-[32px] items-center justify-center px-[14px] py-0 border border-solid border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] cursor-pointer text-[calc(12px*var(--text-scale,1))] font-medium gap-[7px] select-none whitespace-nowrap transition-[background,border-color,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none max-[760px]:px-[12px]" type="button" @click="goBack">
                  <Icon name="mingcute:left-line" :size="15" />
                  <span class="max-[760px]:hidden">Назад</span>
                </button>

                <button class="flex w-[30px] h-[30px] items-center justify-center p-0 border-0 rounded-[8px] appearance-none text-[color:var(--fg-faint)] cursor-pointer select-none transition-[background,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default" type="button" title="Ещё">
                  <Icon name="mingcute:more-2-fill" :size="18" />
                  <q-menu class="select-none overflow-x-hidden max-w-[268px] !rounded-[var(--radius)] border border-solid border-[color:rgba(255,255,255,0.09)] bg-[color-mix(in_srgb,var(--surface-2)_90%,transparent)] shadow-[0_16px_40px_rgba(0,0,0,0.55)] backdrop-blur-[var(--glass-blur,24px)] backdrop-saturate-[1.35]" anchor="bottom left" self="top left">
                    <div class="p-[4px] min-w-[178px] max-w-[260px] overflow-x-hidden select-none" style="min-width: 224px">
                      <div
                        class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:var(--fg)] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                        v-close-popup
                        @click="open(person.url)"
                      >
                        <Icon name="mingcute:earth-2-line" :size="17" />
                        <span>Открыть на Genius</span>
                      </div>
                      <div class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:var(--fg)] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis" v-close-popup @click="copyLink">
                        <Icon name="mingcute:copy-2-line" :size="17" />
                        <span>Скопировать ссылку</span>
                      </div>
                      <div
                        v-if="photos.length"
                        class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:var(--fg)] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                        v-close-popup
                        @click="openViewer"
                      >
                        <Icon name="mingcute:square-line" :size="17" />
                        <span>{{
                          photos.length > 1 ? "Все фото" : "Открыть фото"
                        }}</span>
                      </div>
                    </div>
                  </q-menu>
                </button>
              </div>

              <div class="flex flex-wrap mt-[10px] gap-[6px] max-[900px]:mt-[8px]">
                <button
                  v-if="person.socials.length"
                  class="h-[30px] px-[14px] py-0 inline-flex items-center gap-[6px] rounded-full border border-solid border-[color:var(--line)] text-[color:var(--fg)] text-[12px] font-medium normal-case cursor-pointer select-none transition-[background,border-color] duration-[140ms] ease-[ease] hover:bg-[var(--hover)] hover:border-[color:var(--fg-dim)] hover:text-[color:var(--fg)]"
                  type="button"
                >
                  <span>Ссылки и соцсети</span>
                  <span class="px-[5px] py-0 rounded-[7px] bg-[var(--surface-2)] text-[color:var(--fg-dim)] text-[10px] font-semibold">{{ person.socials.length }}</span>
                  <Icon name="mingcute:down-line" :size="12" />

                  <q-menu class="select-none overflow-x-hidden max-w-[268px] !rounded-[var(--radius)] border border-solid border-[color:rgba(255,255,255,0.09)] bg-[color-mix(in_srgb,var(--surface-2)_90%,transparent)] shadow-[0_16px_40px_rgba(0,0,0,0.55)] backdrop-blur-[var(--glass-blur,24px)] backdrop-saturate-[1.35]" anchor="bottom left" self="top left">
                    <div class="p-[4px] min-w-[236px] max-w-[260px] overflow-x-hidden overflow-y-auto max-h-[340px] select-none">
                      <div class="pt-[8px] px-[12px] pb-[4px] text-[10px] font-semibold tracking-[0.05em] uppercase text-[color:var(--fg-dim)]">Соцсети</div>
                      <div
                        v-for="social in person.socials"
                        :key="social.url"
                        class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:var(--fg)] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                        :title="social.url"
                        v-close-popup
                        @click="open(social.url)"
                      >
                        <Icon :name="iconFor(social.kind)" :size="16" />
                        <span class="col truncate">{{
                          social.handle || social.kind
                        }}</span>
                      </div>
                    </div>
                  </q-menu>
                </button>

                <button
                  v-if="person.alternate_names.length"
                  class="h-[30px] px-[14px] py-0 inline-flex items-center gap-[6px] rounded-full border border-solid border-[color:var(--line)] text-[color:var(--fg)] text-[12px] font-medium normal-case cursor-pointer select-none transition-[background,border-color] duration-[140ms] ease-[ease] hover:bg-[var(--hover)] hover:border-[color:var(--fg-dim)] hover:text-[color:var(--fg)]"
                  type="button"
                >
                  <span>Также известен как</span>
                  <span class="px-[5px] py-0 rounded-[7px] bg-[var(--surface-2)] text-[color:var(--fg-dim)] text-[10px] font-semibold">{{
                    person.alternate_names.length
                  }}</span>
                  <Icon name="mingcute:down-line" :size="12" />

                  <q-menu class="select-none overflow-x-hidden max-w-[268px] !rounded-[var(--radius)] border border-solid border-[color:rgba(255,255,255,0.09)] bg-[color-mix(in_srgb,var(--surface-2)_90%,transparent)] shadow-[0_16px_40px_rgba(0,0,0,0.55)] backdrop-blur-[var(--glass-blur,24px)] backdrop-saturate-[1.35]" anchor="bottom left" self="top left">
                    <div class="p-[4px] min-w-[236px] max-w-[260px] overflow-x-hidden overflow-y-auto max-h-[340px] select-none">
                      <div class="pt-[8px] px-[12px] pb-[4px] text-[10px] font-semibold tracking-[0.05em] uppercase text-[color:var(--fg-dim)]">Также известен как</div>
                      <div
                        v-for="name in person.alternate_names"
                        :key="name"
                        class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:var(--fg)] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                      >
                        <span class="col truncate">{{ name }}</span>
                      </div>
                    </div>
                  </q-menu>
                </button>
              </div>
            </div>
          </div>

          <p v-if="person.description" class="max-w-[760px] mt-[22px] mx-0 mb-0 overflow-hidden text-[color:var(--fg-dim)] text-[13px] leading-[1.55] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4] max-[1180px]:max-w-full">
            {{ person.description }}
          </p>

          <template v-if="person.songs.length">
            <div class="flex items-end justify-between mt-[34px] mx-0 mb-[12px] gap-[12px]">
              <div class="text-[calc(17px*var(--text-scale,1))] font-semibold tracking-[-0.02em]">Треки</div>
              <div class="flex items-center gap-[12px]">
                <button
                  v-if="person.songs.length > SONGS_PREVIEW"
                  class="inline-flex items-center p-0 border-0 bg-transparent text-[color:var(--fg-faint)] cursor-pointer text-[12px] gap-[4px] whitespace-nowrap appearance-none transition-colors duration-[120ms] ease-[ease] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.6]"
                  type="button"
                  @click="openAllSongs"
                >
                  <span>Показать все ({{ person.songs.length }})</span>
                  <Icon name="mingcute:right-line" :size="15" />
                </button>
                <button
                  class="inline-flex items-center p-0 border-0 bg-transparent text-[color:var(--fg-faint)] cursor-pointer text-[12px] gap-[4px] whitespace-nowrap appearance-none transition-colors duration-[120ms] ease-[ease] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.6]"
                  type="button"
                  @click="open(person.url)"
                >
                  <span>Всё на Genius</span>
                  <Icon name="mingcute:right-line" :size="15" />
                </button>
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div v-for="song in visibleSongs" :key="song.id" class="col-auto">
                <div
                  class="relative rounded-[14px] p-[10px] cursor-pointer transition-[background] duration-[160ms] ease-[ease] hover:bg-[var(--surface)] group/card"
                  style="width: 168px"
                  @click="open(song.url)"
                >
                  <div class="cover relative w-full aspect-square rounded-[10px] overflow-hidden bg-[var(--surface-2)] flex items-center justify-center flex-none [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block">
                    <img
                      v-if="song.art"
                      loading="lazy"
                      decoding="async"
                      :src="song.art"
                    />
                    <Icon v-else name="mingcute:music-line" :size="26" class="text-[color:var(--fg-faint)]" />

                    <button
                      class="absolute right-[8px] bottom-[8px] flex w-[34px] h-[34px] items-center justify-center p-0 border-0 rounded-full bg-[var(--accent)] text-[color:#fff] cursor-pointer select-none opacity-[0] translate-y-[6px] transition-[opacity,transform] duration-[140ms] ease-[ease] group-hover/card:opacity-[1] group-hover/card:translate-y-0"
                      type="button"
                      title="Открыть на Genius"
                      @click.stop="open(song.url)"
                    >
                      <Icon name="mingcute:earth-2-line" :size="15" />
                    </button>
                  </div>

                  <div class="text-[calc(13px*var(--text-scale,1))] font-medium truncate q-mt-sm">
                    {{ song.title }}
                  </div>
                  <div class="text-[color:var(--fg-faint)] text-[calc(11px*var(--text-scale,1))] truncate">{{ song.artist }}</div>

                  <q-menu context-menu touch-position class="select-none overflow-x-hidden max-w-[268px] !rounded-[var(--radius)] border border-solid border-[color:rgba(255,255,255,0.09)] bg-[color-mix(in_srgb,var(--surface-2)_90%,transparent)] shadow-[0_16px_40px_rgba(0,0,0,0.55)] backdrop-blur-[var(--glass-blur,24px)] backdrop-saturate-[1.35]">
                    <div class="p-[4px] min-w-[178px] max-w-[260px] overflow-x-hidden select-none" style="min-width: 200px">
                      <div
                        class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:var(--fg)] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                        v-close-popup
                        @click="open(song.url)"
                      >
                        <Icon name="mingcute:earth-2-line" :size="17" />
                        <span>Открыть разбор на Genius</span>
                      </div>
                      <div
                        class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:var(--fg)] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                        v-close-popup
                        @click="searchInApp(song)"
                      >
                        <Icon name="mingcute:search-2-line" :size="17" />
                        <span>Найти в Яндекс Музыке</span>
                      </div>
                    </div>
                  </q-menu>
                </div>
              </div>
            </div>
          </template>

          <p v-else class="text-[color:var(--fg-dim)] text-[calc(13px*var(--text-scale,1))] q-mt-lg">
            Genius не отдал список треков — у продюсеров он часто пустой.
          </p>

          <ImageViewer
            v-model:open="viewerOpen"
            :images="photos"
            :title="person.name"
          />
        </template>

        <div v-else class="text-[color:var(--fg-dim)] text-[calc(13px*var(--text-scale,1))]">
          {{ error || "Не удалось загрузить страницу" }}
        </div>
      </div>
    </q-scroll-area>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Notify } from "quasar";
import ImageViewer from "@/components/common/ImageViewer.vue";
import { api } from "@/api/client";
import type { GeniusArtist, GeniusHit } from "@/api/types";
import { plural, pluralWord } from "@/lib/format";
import { useGeniusStore } from "@/stores/genius";

const route = useRoute();
const router = useRouter();
const genius = useGeniusStore();

const person = ref<GeniusArtist | null>(null);
const loading = ref(false);
const error = ref("");
const viewerOpen = ref(false);

const SONGS_PREVIEW = 12;
const visibleSongs = computed(() =>
  (person.value?.songs || []).slice(0, SONGS_PREVIEW),
);

const id = computed(() => Number(route.params.id) || 0);
const roleLabel = computed(() => String(route.query.role || "Страница Genius"));

const photos = computed(() =>
  [person.value?.image, person.value?.header].filter((src): src is string =>
    Boolean(src),
  ),
);

const SOCIAL_ICONS: Record<string, string> = {
  instagram: "simple-icons:instagram",
  twitter: "simple-icons:x",
  x: "simple-icons:x",
  facebook: "simple-icons:facebook",
  youtube: "simple-icons:youtube",
  soundcloud: "simple-icons:soundcloud",
  spotify: "simple-icons:spotify",
  vk: "simple-icons:vk",
  telegram: "simple-icons:telegram",
  tiktok: "simple-icons:tiktok",
};

function iconFor(kind: string): string {
  return SOCIAL_ICONS[kind.toLowerCase()] ?? "mingcute:earth-2-line";
}

async function load(force = false) {
  if (!genius.ready || !id.value) return;
  loading.value = true;
  error.value = "";
  try {
    person.value = await api.geniusArtist(genius.token.trim(), id.value, force);
  } catch (cause) {
    person.value = null;
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    loading.value = false;
  }
}

function open(url: string) {
  if (url) void api.openExternal(url);
}

function openViewer() {
  if (photos.value.length) viewerOpen.value = true;
}

async function copyLink() {
  const url = person.value?.url;
  if (!url) return;
  try {
    await navigator.clipboard.writeText(url);
    Notify.create({ message: "Ссылка скопирована" });
  } catch {
    Notify.create({ type: "negative", message: "Не вышло скопировать" });
  }
}

function searchInApp(song: GeniusHit) {
  const query = [song.title, song.artist].filter(Boolean).join(" ");
  void router.push({ path: "/search", query: { q: query } });
}

function openAllSongs() {
  void router.push({
    name: "genius-songs",
    params: { id: String(id.value) },
    query: route.query.role ? { role: String(route.query.role) } : {},
  });
}

function goBack() {
  if (window.history.length > 1) router.back();
  else void router.push("/");
}

watch(id, () => void load(), { immediate: true });
</script>
