<template>
  <q-page class="flex flex-col h-[calc(100vh_-_52px_-_var(--player-height,_78px))] !min-h-0 !p-0 !overflow-hidden">
    <q-scroll-area class="flex-auto min-h-0" @scroll="onScroll">
      <div class="pt-[var(--page-top-gap)] px-[32px] pb-[46px]">
        <div v-if="loading" class="flex flex-center" style="height: 300px">
          <q-spinner size="26px" color="primary" />
        </div>

        <template v-else-if="artist">
          <div
            class="flex items-end gap-[26px] min-w-0 overflow-hidden max-h-[520px] [transition:max-height_0.34s_ease,opacity_0.24s_ease,transform_0.34s_ease,margin_0.34s_ease] max-[1360px]:gap-[20px] max-[1024px]:flex-col max-[1024px]:items-start max-[1024px]:gap-[14px]"
            :class="{
              'max-h-0 opacity-[0] mb-0 pointer-events-none translate-y-[-8px]':
                headerCollapsed,
            }"
          >
            <div
              class="cover w-[clamp(112px,_15vw,_190px)] h-[clamp(112px,_15vw,_190px)] rounded-[12px] flex-none overflow-hidden bg-[var(--surface-2)] flex items-center justify-center [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block"
              :class="{ clickable: coverImages.length }"
              @click="openViewer"
            >
              <img
                v-if="artist.cover_url"
                loading="lazy"
                decoding="async"
                :src="artist.cover_url"
              />
              <Icon v-else name="mingcute:user-2-line" :size="56" class="text-[color:var(--fg-faint)]" />
              <div v-if="coverImages.length" class="cover-zoom">
                <Icon name="mingcute:square-line" :size="22" />
              </div>
              <div v-if="coverImages.length > 1" class="cover-badge">
                {{ coverImages.length }} фото
              </div>
            </div>

            <div class="flex-1 min-w-0 pb-[4px] max-[1024px]:w-full max-[1024px]:pb-0">
              <div class="text-[12px] text-[color:var(--fg-dim)]">Артист</div>
              <div class="text-[clamp(24px,_3.4vw,_44px)] leading-[1.06] font-extrabold tracking-[-0.025em] mt-[6px] mx-0 mb-[10px] break-words max-[1024px]:mt-[4px] max-[1024px]:mx-0 max-[1024px]:mb-[8px]">
                {{ artist.name }}<AiTag :show="isAiArtistPage" />
              </div>

              <div class="flex items-baseline flex-wrap gap-y-0 gap-x-[6px] text-[13px] text-[color:var(--fg-dim)] min-w-0 max-[760px]:text-[12px] [&>span]:whitespace-nowrap">
                <span v-if="artist.listeners">
                  {{ formatCount(artist.listeners) }}
                  {{
                    pluralWord(
                      artist.listeners,
                      "слушатель",
                      "слушателя",
                      "слушателей",
                    )
                  }}
                  в месяц
                </span>
                <span v-if="artist.likes" class="text-[color:var(--fg-faint)]">
                  · {{ formatCount(artist.likes) }}
                  {{ pluralWord(artist.likes, "лайк", "лайка", "лайков") }}
                </span>
                <span v-if="artist.tracks_count" class="text-[color:var(--fg-faint)]">
                  · {{ plural(artist.tracks_count, "трек", "трека", "треков") }}
                </span>
                <span v-if="artist.albums_count" class="text-[color:var(--fg-faint)]">
                  ·
                  {{
                    plural(artist.albums_count, "альбом", "альбома", "альбомов")
                  }}
                </span>
              </div>

              <div class="flex items-center gap-[8px] flex-wrap mt-[22px] select-none max-[1180px]:gap-[7px] max-[1180px]:mt-[16px] max-[1024px]:mt-[14px] max-[760px]:[&_.btn_span]:hidden max-[760px]:[&_.btn-solid_span]:hidden max-[760px]:[&_.btn]:px-[12px] max-[760px]:[&_.btn-solid]:px-[12px] [&_.btn]:whitespace-nowrap [&_.btn-solid]:whitespace-nowrap">
                <button
                  class="inline-flex items-center justify-center gap-[7px] h-[34px] px-[18px] py-0 border-0 rounded-[8px] bg-[var(--accent)] text-white text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer transition-opacity duration-[120ms] hover:opacity-[0.85] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
                  type="button"
                  :disabled="!popular.length"
                  @click="playPopular(0)"
                >
                  <Icon name="mingcute:play-fill" :size="15" />
                  <span>Слушать</span>
                </button>

                <button
                  class="inline-flex items-center justify-center gap-[7px] h-[32px] px-[14px] py-0 border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer transition-[background,border-color,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
                  type="button"
                  :disabled="!popular.length"
                  @click="shufflePlay"
                >
                  <Icon name="mingcute:shuffle-line" :size="15" />
                  <span>Перемешать</span>
                </button>

                <button class="inline-flex items-center justify-center gap-[7px] h-[32px] px-[14px] py-0 border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer transition-[background,border-color,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none" type="button" @click="playArtistWave">
                  <Icon name="mingcute:wave-line" :size="15" />
                  <span>Волна по артисту</span>
                </button>

                <button class="flex items-center justify-center text-[color:var(--fg-faint)] cursor-pointer p-0 border-0 appearance-none transition-[background,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] w-[30px] h-[30px] rounded-[8px]" type="button" title="Ещё">
                  <Icon name="mingcute:more-2-fill" :size="18" />
                  <q-menu class="bg-[color-mix(in_srgb,var(--surface-2)_90%,transparent)] border border-[rgba(255,255,255,0.09)] rounded-[var(--radius)] overflow-x-hidden max-w-[268px] shadow-[0_16px_40px_rgba(0,0,0,0.55)] backdrop-blur-[var(--glass-blur,24px)]" anchor="bottom left" self="top left">
                    <div class="p-[4px] min-w-[178px] max-w-[260px] overflow-x-hidden" style="min-width: 224px">
                      <div
                        class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:w-[15px] [&_svg]:h-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                        :class="{ disabled: !popular.length }"
                        v-close-popup
                        @click="enqueuePopular"
                      >
                        <Icon name="mingcute:add-circle-line" :size="17" />
                        <span>Популярное в очередь</span>
                      </div>
                      <div
                        class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:w-[15px] [&_svg]:h-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                        v-close-popup
                        @click="openAllTracks"
                      >
                        <Icon name="mingcute:book-2-line" :size="17" />
                        <span>Все треки артиста</span>
                      </div>
                      <div
                        v-if="coverImages.length"
                        class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:w-[15px] [&_svg]:h-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                        v-close-popup
                        @click="openViewer"
                      >
                        <Icon name="mingcute:square-line" :size="17" />
                        <span>{{
                          coverImages.length > 1
                            ? "Все фото артиста"
                            : "Открыть фото"
                        }}</span>
                      </div>
                    </div>
                  </q-menu>
                </button>
              </div>

              <div class="flex flex-wrap mt-[10px] gap-[6px] max-[900px]:mt-[8px]">
                <button
                  v-if="normalizedLinks.length"
                  class="chip-menu inline-flex items-center h-[30px] px-[14px] py-0 rounded-full bg-[var(--surface)] text-[color:var(--fg-dim)] text-[13px] font-medium cursor-pointer select-none transition-[background,color] duration-[140ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]"
                  type="button"
                >
                  <span>Ссылки и соцсети</span>
                  <span class="chip-count">{{ normalizedLinks.length }}</span>
                  <Icon name="mingcute:down-line" :size="12" />

                  <q-menu class="bg-[color-mix(in_srgb,var(--surface-2)_90%,transparent)] border border-[rgba(255,255,255,0.09)] rounded-[var(--radius)] overflow-x-hidden max-w-[268px] shadow-[0_16px_40px_rgba(0,0,0,0.55)] backdrop-blur-[var(--glass-blur,24px)]" anchor="bottom left" self="top left">
                    <div class="links-menu p-[4px] min-w-[178px] max-w-[260px] overflow-x-hidden">
                      <template v-if="officialLinks.length">
                        <div class="menu-label">Официальные</div>
                        <div
                          v-for="link in officialLinks"
                          :key="link.href"
                          class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:w-[15px] [&_svg]:h-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                          :title="link.href"
                          v-close-popup
                          @click="openLink(link.href)"
                        >
                          <Icon :name="iconForLink(link)" :size="16" />
                          <span class="col truncate">{{ link.title }}</span>
                        </div>
                      </template>

                      <template v-if="socialLinks.length">
                        <div class="menu-label">Соцсети</div>
                        <div
                          v-for="link in socialLinks"
                          :key="link.href"
                          class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:w-[15px] [&_svg]:h-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                          :title="link.href"
                          v-close-popup
                          @click="openLink(link.href)"
                        >
                          <Icon :name="iconForLink(link)" :size="16" />
                          <span class="col truncate">{{ link.title }}</span>
                        </div>
                      </template>
                    </div>
                  </q-menu>
                </button>

                <button
                  class="chip-menu inline-flex items-center h-[30px] px-[14px] py-0 rounded-full bg-[var(--surface)] text-[color:var(--fg-dim)] text-[13px] font-medium cursor-pointer select-none transition-[background,color] duration-[140ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]"
                  type="button"
                  @click="infoOpen = true"
                >
                  <span>Подробнее</span>
                </button>
              </div>
            </div>
          </div>

          <p
            v-if="artist.description"
            class="max-w-[760px] max-[1024px]:max-w-full mt-[22px] mx-0 mb-0 overflow-hidden text-[color:var(--fg-dim)] text-[13px] leading-[1.55] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4]"
          >
            {{ artist.description }}
          </p>

          <template v-if="popular.length">
            <div class="flex items-end justify-between mt-[34px] mx-0 mb-[12px] gap-[12px]">
              <div class="text-[calc(17px*var(--text-scale,1))] font-semibold tracking-[-0.02em]">Популярное</div>
              <button class="inline-flex items-center p-0 border-0 bg-transparent text-[color:var(--fg-faint)] cursor-pointer text-[12px] gap-[4px] whitespace-nowrap appearance-none transition-colors hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.6]" type="button" @click="openAllTracks">
                <span>Все треки</span>
                <Icon name="mingcute:right-line" :size="15" />
              </button>
            </div>

            <div class="flex items-center gap-[14px] h-[32px] px-[12px] py-0 text-[11px] font-semibold tracking-[0.06em] uppercase text-[color:var(--fg-faint)] border-b border-[var(--line)]">
              <div style="width: 20px; text-align: center">#</div>
              <div style="width: 38px" />
              <div class="col">Название</div>
              <div style="width: 40px; text-align: right">Время</div>
            </div>

            <LazyTracks v-slot="{ item, index }" :items="popular">
              <TrackRow
                :track="item"
                :index="index"
                @play="playPopular(index)"
              />
            </LazyTracks>
          </template>

          <template v-if="artist.albums.length">
            <div class="flex items-end justify-between mt-[34px] mx-0 mb-[12px] gap-[12px]">
              <div class="text-[calc(17px*var(--text-scale,1))] font-semibold tracking-[-0.02em]">Альбомы</div>
              <div class="flex items-center gap-[8px] ml-auto">
                <button class="inline-flex items-center justify-center gap-[7px] h-[32px] px-[14px] py-0 border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer transition-[background,border-color,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none" type="button" title="Сортировка">
                  <Icon name="mingcute:filter-line" :size="14" />
                  <span>{{ albumSortLabel }}</span>
                  <Icon name="mingcute:down-line" :size="12" />
                  <q-menu class="bg-[color-mix(in_srgb,var(--surface-2)_90%,transparent)] border border-[rgba(255,255,255,0.09)] rounded-[var(--radius)] overflow-x-hidden max-w-[268px] shadow-[0_16px_40px_rgba(0,0,0,0.55)] backdrop-blur-[var(--glass-blur,24px)]" anchor="bottom right" self="top right">
                    <div class="p-[4px] min-w-[178px] max-w-[260px] overflow-x-hidden" style="min-width: 190px">
                      <div
                        v-for="opt in albumSortOptions"
                        :key="opt.id"
                        class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:w-[15px] [&_svg]:h-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                        v-close-popup
                        @click="albumSort = opt.id"
                      >
                        <Icon
                          :name="albumSort === opt.id ? 'mingcute:check-line' : 'mingcute:pencil-line'"
                          :size="16"
                        />
                        <span>{{ opt.label }}</span>
                      </div>
                    </div>
                  </q-menu>
                </button>
                <button
                  class="inline-flex items-center justify-center gap-[7px] h-[32px] px-[14px] py-0 border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer transition-[background,border-color,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
                  type="button"
                  :title="albumDir === 'asc' ? 'По возрастанию' : 'По убыванию'"
                  @click="albumDir = albumDir === 'asc' ? 'desc' : 'asc'"
                >
                  <span class="text-[calc(13px*var(--text-scale,1))] font-semibold">{{
                    albumDir === "asc" ? "↑" : "↓"
                  }}</span>
                </button>
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div
                v-for="album in sortedAlbums"
                :key="album.id"
                class="col-auto"
              >
                <div
                  class="group relative rounded-[14px] p-[10px] cursor-pointer transition-[background] duration-[160ms] hover:bg-[var(--surface)]"
                  style="width: 168px"
                  @click="router.push(`/album/${album.id}`)"
                >
                  <div class="cover relative w-full aspect-square overflow-hidden bg-[var(--surface-2)] flex items-center justify-center flex-none [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block rounded-[10px]">
                    <img
                      v-if="album.cover_url"
                      loading="lazy"
                      decoding="async"
                      :src="album.cover_url"
                    />
                    <Icon v-else name="mingcute:album-line" :size="26" class="text-[color:var(--fg-faint)]" />

                    <div
                      v-if="album.id === latestAlbumId"
                      class="absolute left-[6px] top-[6px] px-[8px] py-[2px] rounded-[8px] text-[10px] font-semibold leading-[1.4] tracking-[0.2px] bg-[var(--accent)] text-[color:#fff] pointer-events-none z-[2] shadow-[0_2px_8px_rgba(0,0,0,0.28)]"
                    >
                      Последний релиз
                    </div>

                    <button
                      class="absolute right-[8px] bottom-[8px] flex w-[34px] h-[34px] items-center justify-center p-0 border-0 rounded-full bg-[var(--accent)] text-[color:#fff] cursor-pointer opacity-0 translate-y-[6px] transition-[opacity,transform] duration-[140ms] ease-[ease] group-hover:opacity-[1] group-hover:translate-y-0"
                      type="button"
                      title="Слушать альбом"
                      @click.stop="playAlbum(album.id)"
                    >
                      <Icon name="mingcute:play-fill" :size="16" />
                    </button>
                  </div>

                  <div class="q-mt-sm text-[calc(13px*var(--text-scale,1))] font-medium truncate">
                    {{ album.title }}
                  </div>
                  <div class="text-[color:var(--fg-faint)] text-[calc(11px*var(--text-scale,1))]">{{ album.year || "" }}</div>

                  <q-menu context-menu touch-position class="bg-[color-mix(in_srgb,var(--surface-2)_90%,transparent)] border border-[rgba(255,255,255,0.09)] rounded-[var(--radius)] overflow-x-hidden max-w-[268px] shadow-[0_16px_40px_rgba(0,0,0,0.55)] backdrop-blur-[var(--glass-blur,24px)]">
                    <div class="p-[4px] min-w-[178px] max-w-[260px] overflow-x-hidden" style="min-width: 200px">
                      <div
                        class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:w-[15px] [&_svg]:h-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                        v-close-popup
                        @click="playAlbum(album.id)"
                      >
                        <Icon name="mingcute:play-fill" :size="17" />
                        <span>Слушать альбом</span>
                      </div>
                      <div
                        class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:w-[15px] [&_svg]:h-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                        v-close-popup
                        @click="router.push(`/album/${album.id}`)"
                      >
                        <Icon name="mingcute:album-line" :size="17" />
                        <span>Открыть альбом</span>
                      </div>
                    </div>
                  </q-menu>
                </div>
              </div>
            </div>
          </template>

          <ImageViewer
            v-model:open="viewerOpen"
            :images="coverImages"
            :title="artist.name"
          />

          <ArtistInfoDialog
            v-model:open="infoOpen"
            :artist="artist"
            :links="normalizedLinks"
          />
        </template>

        <div v-else class="text-[color:var(--fg-dim)] text-[calc(13px*var(--text-scale,1))]">Не удалось загрузить артиста</div>
      </div>
    </q-scroll-area>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Notify } from "quasar";
import { api } from "@/api/client";

import type { ArtistLink, ArtistPage } from "@/api/types";
import LazyTracks from "@/components/common/LazyTracks.vue";
import TrackRow from "@/components/common/TrackRow.vue";
import ImageViewer from "@/components/common/ImageViewer.vue";
import ArtistInfoDialog from "@/components/dialog/ArtistInfoDialog.vue";
import AiTag from "@/components/common/AiTag.vue";
import { plural, pluralWord } from "@/lib/format";
import { readCache, swr } from "@/lib/cache";
import { recordArtistStats } from "@/lib/artistStats";
import { ensureAiArtists, isAiArtist } from "@/lib/aiTag";
import { usePlayerStore } from "@/stores/player/index";

const props = defineProps<{ id: string }>();
const router = useRouter();
const player = usePlayerStore();
const artist = ref<ArtistPage | null>(null);
const loading = ref(false);
const popular = computed(() => artist.value?.tracks ?? []);
const viewerOpen = ref(false);
const infoOpen = ref(false);
const headerCollapsed = ref(false);

type AlbumSort = "year" | "title";
const albumSort = ref<AlbumSort>("year");
const albumDir = ref<"asc" | "desc">("desc");
const albumSortOptions: Array<{ id: AlbumSort; label: string }> = [
  { id: "year", label: "По году" },
  { id: "title", label: "По названию" },
];
const albumSortLabel = computed(
  () => albumSortOptions.find((o) => o.id === albumSort.value)?.label ?? "",
);
const sortedAlbums = computed(() => {
  const list = [...(artist.value?.albums ?? [])];
  list.sort((a, b) => {
    if (albumSort.value === "year") return (a.year || 0) - (b.year || 0);
    return (a.title || "").localeCompare(b.title || "", "ru");
  });
  if (albumDir.value === "desc") list.reverse();
  return list;
});
const latestAlbumId = computed(() => {
  const list = artist.value?.albums ?? [];
  if (!list.length) return null;
  let best = list[0];
  for (const al of list) {
    if ((al.year || 0) > (best.year || 0)) best = al;
  }
  return best.id;
});

function onScroll(info: { verticalPosition: number }) {
  const y = info.verticalPosition;
  if (!headerCollapsed.value && y > 220) headerCollapsed.value = true;
  else if (headerCollapsed.value && y < 80) headerCollapsed.value = false;
}
const isAiArtistPage = computed(() => isAiArtist(artist.value?.id ?? null));
watch(
  () => artist.value?.id,
  (id) => {
    if (id) ensureAiArtists([id]);
  },
);

function openLink(url: string) {
  void api.openExternal(url);
}

const socialTitles: Record<string, string> = {
  vk: "ВКонтакте",
  telegram: "Telegram",
  instagram: "Instagram",
  youtube: "YouTube",
  twitter: "X",
  tiktok: "TikTok",
  facebook: "Facebook",
  soundcloud: "SoundCloud",
  spotify: "Spotify",
  apple: "Apple Music",
  bandcamp: "Bandcamp",
  twitch: "Twitch",
  dzen: "Дзен",
  ok: "Одноклассники",
};

function hostOf(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}

function linkLabel(link: ArtistLink): string {
  const network = (link.network || "").toLowerCase();
  if (network && socialTitles[network]) return socialTitles[network];
  const title = (link.title || "").trim();
  if (title && !/^https?:\/\//i.test(title)) return title;
  return hostOf(link.href);
}

const socialIcons: Record<string, string> = {
  vk: "simple-icons:vk",
  telegram: "simple-icons:telegram",
  instagram: "simple-icons:instagram",
  youtube: "simple-icons:youtube",
  twitter: "simple-icons:x",
  x: "simple-icons:x",
  tiktok: "simple-icons:tiktok",
  facebook: "simple-icons:facebook",
  soundcloud: "simple-icons:soundcloud",
  spotify: "simple-icons:spotify",
  apple: "mingcute:earth-2-line",
  itunes: "mingcute:earth-2-line",
  bandcamp: "simple-icons:bandcamp",
  twitch: "simple-icons:twitch",
  dzen: "mingcute:sparkles-line",
  zen: "mingcute:sparkles-line",
  ok: "simple-icons:odnoklassniki",
  odnoklassniki: "simple-icons:odnoklassniki",
  discord: "simple-icons:discord",
};

const hostIcons: Array<[string, string]> = [
  ["vk.com", "simple-icons:vk"],
  ["vk.ru", "simple-icons:vk"],
  ["t.me", "simple-icons:telegram"],
  ["telegram", "simple-icons:telegram"],
  ["instagram", "simple-icons:instagram"],
  ["youtube", "simple-icons:youtube"],
  ["youtu.be", "simple-icons:youtube"],
  ["twitter", "simple-icons:x"],
  ["x.com", "simple-icons:x"],
  ["tiktok", "simple-icons:tiktok"],
  ["facebook", "simple-icons:facebook"],
  ["fb.com", "simple-icons:facebook"],
  ["soundcloud", "simple-icons:soundcloud"],
  ["spotify", "simple-icons:spotify"],
  ["apple", "mingcute:earth-2-line"],
  ["bandcamp", "simple-icons:bandcamp"],
  ["twitch", "simple-icons:twitch"],
  ["dzen.ru", "mingcute:sparkles-line"],
  ["zen.yandex", "mingcute:sparkles-line"],
  ["ok.ru", "simple-icons:odnoklassniki"],
  ["discord", "simple-icons:discord"],
];

function iconForLink(link: { network?: string; href: string }): string {
  const network = (link.network || "").toLowerCase();
  if (network && socialIcons[network]) return socialIcons[network]!;
  const host = hostOf(link.href).toLowerCase();
  const hit = hostIcons.find(([needle]) => host.includes(needle));
  return hit ? hit[1] : "mingcute:earth-2-line";
}

const normalizedLinks = computed(() => {
  const list = artist.value?.links ?? [];
  const seen = new Set<string>();
  return list
    .filter((link) => {
      if (!link.href || seen.has(link.href)) return false;
      seen.add(link.href);
      return true;
    })
    .map((link) => ({
      href: link.href,
      title: linkLabel(link),
      network: (link.network || "").toLowerCase(),
      social:
        (link.kind || "").toLowerCase() === "social" || Boolean(link.network),
    }));
});

const officialLinks = computed(() =>
  normalizedLinks.value.filter((link) => !link.social),
);
const socialLinks = computed(() =>
  normalizedLinks.value.filter((link) => link.social),
);

const coverImages = computed<string[]>(() => {
  const list = artist.value?.covers ?? [];
  if (list.length) return list;
  return artist.value?.cover_url ? [artist.value.cover_url] : [];
});

function openViewer() {
  if (coverImages.value.length) viewerOpen.value = true;
}

function playPopular(index: number) {
  if (popular.value.length) void player.playQueue(popular.value, index);
}

function openAllTracks() {
  void router.push(`/artist/${props.id}/tracks`);
}

function formatCount(value: number): string {
  return value.toLocaleString("ru-RU");
}

function shufflePlay() {
  if (!popular.value.length) return;
  void player.playQueue(popular.value, 0).then(() => {
    if (!player.shuffle) player.toggleShuffle();
  });
}

function enqueuePopular() {
  if (!popular.value.length) return;
  popular.value.forEach((track) => player.enqueue(track));
  Notify.create({ message: `В очередь добавлено: ${popular.value.length}` });
}

function playArtistWave() {
  void player.startWave(`artist:${props.id}`, artist.value?.name);
  void router.push("/wave");
}

async function playAlbum(id: string) {
  try {
    const album = await api.album(id);
    if (!album.tracks.length) {
      Notify.create({ message: "В альбоме нет доступных треков" });
      return;
    }
    await player.playQueue(album.tracks, 0);
  } catch {
    Notify.create({ message: "Не удалось загрузить альбом" });
  }
}

async function load() {
  const key = `artist.${props.id}`;
  headerCollapsed.value = false;
  const cached = readCache<ArtistPage>(key);
  artist.value = cached ?? null;
  loading.value = !cached;

  if (cached) recordArtistStats(cached);

  await swr<ArtistPage>(key, () => api.artist(props.id), {
    onData: (data) => {
      artist.value = data;
      recordArtistStats(data);
    },
    onSettled: () => {
      loading.value = false;
    },
  });
}

watch(() => props.id, load);
onMounted(load);
</script>

<style scoped>
.chip.link {
  @apply inline-flex items-center gap-[6px];
}
.chip.link.social {
  @apply normal-case;
}
.chip-social {
  @apply inline-flex w-[28px] h-[28px] items-center justify-center p-0 cursor-pointer;
  transition:
    color 0.14s ease,
    background 0.14s ease,
    transform 0.14s ease;
}

.chip-social:hover {
  @apply bg-[var(--hover)] text-[color:var(--accent)];
  transform: translateY(-1px);
}

.head-chips-links {
  @apply mt-[10px];
}

.chip-menu {
  font: inherit;
  @apply inline-flex items-center gap-[6px] border border-[color:var(--line)] bg-transparent text-[color:var(--fg)] text-[12px] normal-case cursor-pointer;
  transition:
    background 0.14s ease,
    border-color 0.14s ease;
}
.chip-menu:hover {
  @apply bg-[var(--hover)] border-[color:var(--fg-dim)];
}
.chip-count {
  @apply px-[5px] py-0 rounded-[7px] bg-[var(--surface-2)] text-[color:var(--fg-dim)] text-[10px] font-semibold;
}
.links-menu {
  @apply min-w-[236px] max-h-[340px] overflow-y-auto;
}
.menu-label {
  @apply pt-[8px] px-[12px] pb-[4px] text-[10px] font-semibold tracking-[0.05em] uppercase text-[color:var(--fg-dim)];
}
.cover.clickable {
  @apply cursor-pointer relative;
}
.cover-zoom {
  @apply absolute inset-0 flex items-center justify-center bg-[rgba(0,_0,_0,_0.32)] text-[color:#fff] opacity-[0] rounded-[inherit];
  transition: opacity 0.15s ease;
}
.cover.clickable:hover .cover-zoom {
  @apply opacity-[1];
}
.cover-badge {
  @apply absolute right-[6px] bottom-[6px] px-[8px] py-[2px] rounded-[10px] text-[11px] font-medium bg-[rgba(0,_0,_0,_0.6)] text-[color:#fff] pointer-events-none;
}
</style>
