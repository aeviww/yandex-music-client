<template>
  <q-page
    class="flex flex-col h-[calc(100vh_-_52px_-_var(--player-height,_78px))] !min-h-0 !p-0 !overflow-hidden"
  >
    <q-scroll-area class="flex-auto min-h-0">
      <div class="pt-[var(--page-top-gap)] px-[32px] pb-[46px]">
        <div v-if="loading" class="flex flex-center" style="height: 300px">
          <q-spinner size="26px" color="primary" />
        </div>

        <template v-else-if="album">
          <div
            class="flex items-end gap-[26px] min-w-0 max-[1360px]:gap-[20px] max-[1024px]:flex-col max-[1024px]:items-start max-[1024px]:gap-[14px]"
          >
            <div
              class="cover w-[clamp(112px,_15vw,_190px)] h-[clamp(112px,_15vw,_190px)] rounded-[12px] flex-none overflow-hidden bg-[var(--surface-2)] flex items-center justify-center [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block"
            >
              <img
                loading="lazy"
                decoding="async"
                v-if="album.cover_url"
                :src="album.cover_url"
              />
              <Icon
                v-else
                name="mingcute:album-line"
                :size="42"
                class="text-[color:var(--fg-faint)]"
              />
            </div>

            <div
              class="flex-1 min-w-0 pb-[4px] max-[1024px]:w-full max-[1024px]:pb-0"
            >
              <div class="text-[12px] text-[color:var(--fg-dim)]">Альбом</div>
              <div
                class="text-[clamp(24px,_3.4vw,_44px)] leading-[1.06] font-extrabold tracking-[-0.025em] mt-[6px] mx-0 mb-[10px] break-words max-[1024px]:mt-[4px] max-[1024px]:mx-0 max-[1024px]:mb-[8px]"
              >
                {{ album.title }}
              </div>
              <div
                class="flex items-baseline flex-wrap gap-y-[0] gap-x-[6px] text-[13px] text-[color:var(--fg-dim)] min-w-0 max-[760px]:text-[12px] [&>span]:whitespace-nowrap"
              >
                <ArtistsLine :artists="album.artists" :limit="3" />
                <span v-if="album.year" class="text-[color:var(--fg-faint)]">
                  · {{ album.year }}</span
                >
                <span v-if="album.genre" class="text-[color:var(--fg-faint)]">
                  · {{ album.genre }}</span
                >
                <span class="text-[color:var(--fg-faint)]">
                  · {{ plural(album.tracks.length, "трек", "трека", "треков") }}
                </span>
              </div>

              <div
                class="flex items-center gap-[8px] flex-wrap mt-[22px] max-[1180px]:gap-[7px] max-[1180px]:mt-[16px] max-[1024px]:mt-[14px] [&_.btn]:whitespace-nowrap [&_.btn-solid]:whitespace-nowrap max-[760px]:[&_.btn_span]:hidden max-[760px]:[&_.btn-solid_span]:hidden max-[760px]:[&_.btn]:px-[12px] max-[760px]:[&_.btn-solid]:px-[12px]"
              >
                <button
                  class="inline-flex h-[34px] items-center justify-center px-[18px] py-0 border-0 rounded-[8px] !bg-[var(--accent)] text-[color:#fff] cursor-pointer text-[calc(12px*var(--text-scale,1))] font-medium gap-[7px] select-none transition-opacity duration-[120ms] ease-[ease] hover:opacity-[0.85] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
                  type="button"
                  :disabled="!album.tracks.length"
                  @click="playFrom(0)"
                >
                  <Icon name="mingcute:play-fill" :size="15" />
                  <span>Слушать</span>
                </button>

                <button
                  class="inline-flex h-[32px] items-center justify-center px-[14px] py-0 border border-solid border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] cursor-pointer text-[calc(12px*var(--text-scale,1))] font-medium gap-[7px] select-none whitespace-nowrap transition-[background,border-color,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
                  type="button"
                  :disabled="!album.tracks.length"
                  @click="shufflePlay"
                >
                  <Icon name="mingcute:shuffle-line" :size="15" />
                  <span>Перемешать</span>
                </button>

                <button
                  class="inline-flex h-[32px] items-center justify-center px-[14px] py-0 border border-solid border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] cursor-pointer text-[calc(12px*var(--text-scale,1))] font-medium gap-[7px] select-none whitespace-nowrap transition-[background,border-color,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
                  type="button"
                  @click="playAlbumWave"
                >
                  <Icon name="mingcute:wave-line" :size="15" />
                  <span>Волна по альбому</span>
                </button>

                <button
                  class="flex w-[30px] h-[30px] items-center justify-center p-0 border-0 rounded-[8px] appearance-none text-[color:var(--fg-faint)] cursor-pointer select-none transition-[background,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default"
                  :class="{ '!text-[color:var(--accent)]': albumLiked }"
                  type="button"
                  :title="
                    albumLiked
                      ? 'Убрать альбом из коллекции'
                      : 'Сохранить альбом в коллекцию'
                  "
                  @click="toggleAlbumLike"
                >
                  <Icon
                    :name="
                      albumLiked ? 'mingcute:heart-fill' : 'mingcute:heart-line'
                    "
                    :size="18"
                  />
                </button>

                <button
                  class="flex w-[30px] h-[30px] items-center justify-center p-0 border-0 rounded-[8px] appearance-none text-[color:var(--fg-faint)] cursor-pointer select-none transition-[background,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default"
                  type="button"
                  title="Ещё"
                >
                  <Icon name="mingcute:more-1-fill" :size="18" />
                  <q-menu
                    class="select-none bg-[color-mix(in_srgb,var(--surface-2)_90%,transparent)] border border-solid border-[rgba(255,255,255,0.09)] !rounded-[var(--radius)] overflow-x-hidden max-w-[268px] shadow-[0_16px_40px_rgba(0,0,0,0.55)] [backdrop-filter:blur(var(--glass-blur,24px))_saturate(1.35)]"
                    anchor="bottom left"
                    self="top left"
                  >
                    <div
                      class="p-[4px] min-w-[178px] max-w-[260px] overflow-x-hidden select-none"
                      style="min-width: 226px"
                    >
                      <div
                        class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:w-[15px] [&_svg]:h-[15px] [&_svg]:text-[color:var(--fg-faint)] [&_svg]:flex-none [&_svg]:[transition:color_0.1s_ease] [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                        :class="{
                          'opacity-[0.4] pointer-events-none':
                            !album.tracks.length,
                        }"
                        v-close-popup
                        @click="enqueueAll"
                      >
                        <Icon name="mingcute:add-circle-line" :size="17" />
                        <span>Добавить в конец очереди</span>
                      </div>
                      <div
                        class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:w-[15px] [&_svg]:h-[15px] [&_svg]:text-[color:var(--fg-faint)] [&_svg]:flex-none [&_svg]:[transition:color_0.1s_ease] [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                        :class="{
                          'opacity-[0.4] pointer-events-none':
                            !album.tracks.length,
                        }"
                      >
                        <Icon name="mingcute:classify-add-line" :size="17" />
                        <span>Перенести все треки в плейлист</span>
                        <Icon
                          name="mingcute:right-line"
                          :size="15"
                          class="text-[color:var(--fg-faint)]"
                        />
                        <q-menu
                          class="select-none bg-[color-mix(in_srgb,var(--surface-2)_90%,transparent)] border border-solid border-[rgba(255,255,255,0.09)] !rounded-[var(--radius)] overflow-x-hidden max-w-[268px] shadow-[0_16px_40px_rgba(0,0,0,0.55)] [backdrop-filter:blur(var(--glass-blur,24px))_saturate(1.35)]"
                          anchor="top end"
                          self="top start"
                        >
                          <div
                            class="p-[4px] min-w-[178px] max-w-[260px] overflow-x-hidden select-none"
                            style="min-width: 200px"
                          >
                            <div
                              v-if="!library.playlists.length"
                              class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:w-[15px] [&_svg]:h-[15px] [&_svg]:text-[color:var(--fg-faint)] [&_svg]:flex-none [&_svg]:[transition:color_0.1s_ease] [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis opacity-[0.4] pointer-events-none"
                            >
                              <span>Нет плейлистов</span>
                            </div>
                            <div
                              v-for="playlist in library.playlists"
                              :key="playlist.kind"
                              class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:w-[15px] [&_svg]:h-[15px] [&_svg]:text-[color:var(--fg-faint)] [&_svg]:flex-none [&_svg]:[transition:color_0.1s_ease] [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                              v-close-popup
                              @click="moveAllTo(playlist.kind)"
                            >
                              <div
                                class="cover w-[26px] h-[26px] rounded-[6px] flex-none overflow-hidden bg-[var(--surface-2)] flex items-center justify-center [&_img]:block [&_img]:w-full [&_img]:h-full [&_img]:object-cover"
                              >
                                <img
                                  v-if="playlist.cover_url"
                                  :src="playlist.cover_url"
                                  loading="lazy"
                                  decoding="async"
                                />
                                <Icon
                                  v-else
                                  name="mingcute:playlist-2-line"
                                  :size="14"
                                  class="text-[color:var(--fg-faint)]"
                                />
                              </div>
                              <span class="truncate">{{ playlist.title }}</span>
                            </div>
                          </div>
                        </q-menu>
                      </div>

                      <div class="h-[1px] mx-[6px] my-[4px] bg-[var(--line)]" />

                      <div
                        class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:w-[15px] [&_svg]:h-[15px] [&_svg]:text-[color:var(--fg-faint)] [&_svg]:flex-none [&_svg]:[transition:color_0.1s_ease] [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                        :class="{
                          'opacity-[0.4] pointer-events-none': !firstArtistId,
                        }"
                        v-close-popup
                        @click="openArtist"
                      >
                        <Icon name="mingcute:mic-line" :size="17" />
                        <span>Перейти к исполнителю</span>
                      </div>
                    </div>
                  </q-menu>
                </button>
              </div>
            </div>
          </div>

          <div
            v-if="selectedIds.length"
            class="select-float fixed left-[50%] bottom-[94px] z-[850] flex items-center gap-[12px] flex-wrap max-w-[min(760px,_100vw_-_48px)] px-[16px] py-[11px] rounded-[16px] bg-[color-mix(in_srgb,var(--accent)_12%,var(--surface))] shadow-[0_22px_48px_-20px_rgba(0,0,0,0.85)] [backdrop-filter:blur(var(--glass-blur,12px))] -translate-x-1/2 max-[900px]:max-w-[calc(100vw_-_24px)] max-[900px]:px-[12px] max-[900px]:py-[9px]"
          >
            <button
              class="flex w-[16px] h-[16px] flex-none items-center justify-center border border-solid border-[color:var(--line)] rounded-[5px] bg-[var(--surface-2)] text-[color:#fff] [transition:background_0.12s_ease,border-color_0.12s_ease]"
              :class="{
                'border-[color:var(--accent)] bg-[var(--accent)]': allSelected,
              }"
              type="button"
              title="Выбрать все"
              @click="toggleSelectAll"
            >
              <Icon v-if="allSelected" name="mingcute:check-line" :size="13" />
            </button>

            <div
              class="text-[color:var(--fg)] whitespace-nowrap text-[calc(12px*var(--text-scale,1))] font-semibold"
            >
              {{ plural(selectedIds.length, "трек", "трека", "треков") }}
            </div>

            <div class="flex items-center gap-[8px] flex-wrap ml-[4px]">
              <button
                class="inline-flex h-[32px] items-center justify-center px-[14px] py-0 border border-solid border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] cursor-pointer text-[calc(12px*var(--text-scale,1))] font-medium gap-[7px] select-none whitespace-nowrap transition-[background,border-color,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
                type="button"
                :disabled="!selectedIds.length"
                @click="playSelected"
              >
                <Icon name="mingcute:play-fill" :size="14" />
                <span>Слушать</span>
              </button>

              <button
                class="inline-flex h-[32px] items-center justify-center px-[14px] py-0 border border-solid border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] cursor-pointer text-[calc(12px*var(--text-scale,1))] font-medium gap-[7px] select-none whitespace-nowrap transition-[background,border-color,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
                type="button"
                :disabled="!selectedIds.length"
                @click="enqueueSelected"
              >
                <Icon name="mingcute:add-circle-line" :size="14" />
                <span>В очередь</span>
              </button>

              <button
                class="inline-flex h-[32px] items-center justify-center px-[14px] py-0 border border-solid border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] cursor-pointer text-[calc(12px*var(--text-scale,1))] font-medium gap-[7px] select-none whitespace-nowrap transition-[background,border-color,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
                type="button"
                :disabled="!selectedIds.length"
              >
                <Icon name="mingcute:classify-add-line" :size="14" />
                <span>В плейлист</span>
                <q-menu
                  class="select-none bg-[color-mix(in_srgb,var(--surface-2)_90%,transparent)] border border-solid border-[rgba(255,255,255,0.09)] !rounded-[var(--radius)] overflow-x-hidden max-w-[268px] shadow-[0_16px_40px_rgba(0,0,0,0.55)] [backdrop-filter:blur(var(--glass-blur,24px))_saturate(1.35)]"
                  anchor="bottom start"
                  self="top start"
                >
                  <div
                    class="p-[4px] min-w-[178px] max-w-[260px] overflow-x-hidden select-none"
                  >
                    <div
                      v-if="!library.playlists.length"
                      class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:w-[15px] [&_svg]:h-[15px] [&_svg]:text-[color:var(--fg-faint)] [&_svg]:flex-none [&_svg]:[transition:color_0.1s_ease] [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis opacity-[0.4] pointer-events-none"
                    >
                      <span>Нет плейлистов</span>
                    </div>
                    <div
                      v-for="playlist in library.playlists"
                      :key="playlist.kind"
                      class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:w-[15px] [&_svg]:h-[15px] [&_svg]:text-[color:var(--fg-faint)] [&_svg]:flex-none [&_svg]:[transition:color_0.1s_ease] [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                      v-close-popup
                      @click="addSelectedTo(playlist.kind)"
                    >
                      <div
                        class="cover w-[26px] h-[26px] rounded-[6px] flex-none overflow-hidden bg-[var(--surface-2)] flex items-center justify-center [&_img]:block [&_img]:w-full [&_img]:h-full [&_img]:object-cover"
                      >
                        <img
                          v-if="playlist.cover_url"
                          :src="playlist.cover_url"
                          loading="lazy"
                          decoding="async"
                        />
                        <Icon
                          v-else
                          name="mingcute:playlist-2-line"
                          :size="14"
                          class="text-[color:var(--fg-faint)]"
                        />
                      </div>
                      <span class="truncate">{{ playlist.title }}</span>
                    </div>
                  </div>
                </q-menu>
              </button>

              <button
                class="flex w-[27px] h-[27px] items-center justify-center p-0 border-0 rounded-[7px] appearance-none text-[color:var(--fg-faint)] cursor-pointer select-none transition-[background,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default"
                type="button"
                title="Снять выделение"
                @click="clearSelection"
              >
                <Icon name="mingcute:close-line" :size="15" />
              </button>
            </div>
          </div>

          <div
            class="flex items-center gap-[14px] h-[32px] px-[12px] py-0 text-[11px] font-semibold tracking-[0.06em] uppercase text-[color:var(--fg-faint)] border-b border-[var(--line)] q-mt-xl"
          >
            <div style="width: 20px; text-align: center">#</div>
            <div class="col">Название</div>
            <div style="width: 40px; text-align: right">Время</div>
          </div>

          <LazyTracks v-slot="{ item, index }" :items="album.tracks">
            <TrackRow
              :track="item"
              :index="index"
              :show-cover="false"
              :show-album="false"
              :selectable="true"
              :selected="selectedIds.includes(item.id)"
              @play="playFrom(index)"
              @toggle-select="toggleRow(item.id, $event)"
            />
          </LazyTracks>
        </template>

        <div
          v-else
          class="text-[color:var(--fg-dim)] text-[calc(13px*var(--text-scale,1))]"
        >
          Не удалось загрузить альбом
        </div>
      </div>
    </q-scroll-area>
  </q-page>
</template>

<script setup lang="ts">
import ArtistsLine from "@/components/common/ArtistsLine.vue";
import { computed, onMounted, ref, watch } from "vue";
import { Notify } from "quasar";
import { useRouter } from "vue-router";
import LazyTracks from "@/components/common/LazyTracks.vue";
import TrackRow from "@/components/common/TrackRow.vue";
import { api } from "@/api/client";
import type { AlbumPage } from "@/api/types";
import { plural } from "@/lib/format";
import { readCache, swr } from "@/lib/cache";
import { useLibraryStore } from "@/stores/library";
import { usePlayerStore } from "@/stores/player/index";

const props = defineProps<{ id: string }>();

const router = useRouter();
const player = usePlayerStore();
const library = useLibraryStore();

const album = ref<AlbumPage | null>(null);
const loading = ref(false);
const selectedIds = ref<string[]>([]);
const lastPicked = ref<string | null>(null);

const albumLiked = computed(() => library.albumLiked(props.id));

const allSelected = computed(() => {
  const tracks = album.value?.tracks || [];
  return (
    tracks.length > 0 &&
    tracks.every((track) => selectedIds.value.includes(track.id))
  );
});

const selectedTracks = computed(() =>
  (album.value?.tracks || []).filter((track) =>
    selectedIds.value.includes(track.id),
  ),
);

function toggleAlbumLike() {
  if (album.value) library.toggleAlbumLike(album.value);
}

function clearSelection() {
  selectedIds.value = [];
  lastPicked.value = null;
}

function toggleRow(id: string, event?: MouseEvent) {
  const ids = (album.value?.tracks || []).map((track) => track.id);

  if (event?.shiftKey && lastPicked.value) {
    const from = ids.indexOf(lastPicked.value);
    const to = ids.indexOf(id);
    if (from >= 0 && to >= 0) {
      const range = ids.slice(Math.min(from, to), Math.max(from, to) + 1);
      selectedIds.value = [...new Set([...selectedIds.value, ...range])];
      return;
    }
  }

  selectedIds.value = selectedIds.value.includes(id)
    ? selectedIds.value.filter((item) => item !== id)
    : [...selectedIds.value, id];
  lastPicked.value = id;
}

function toggleSelectAll() {
  selectedIds.value = allSelected.value
    ? []
    : (album.value?.tracks || []).map((track) => track.id);
}

function playSelected() {
  const list = selectedTracks.value;
  if (list.length) void player.playQueue(list, 0);
}

function enqueueSelected() {
  const list = selectedTracks.value;
  if (!list.length) return;
  list.forEach((track) => player.enqueue(track));
  Notify.create({ message: `В очередь добавлено: ${list.length}` });
}

async function addSelectedTo(kind: number | string) {
  const list = selectedTracks.value;
  if (!list.length) return;
  await library.addTracksToPlaylist(Number(kind), list);
}

async function moveAllTo(kind: number | string) {
  const tracks = album.value?.tracks || [];
  if (!tracks.length) return;
  await library.addTracksToPlaylist(Number(kind), tracks);
}

function playFrom(i: number) {
  const tracks = album.value?.tracks || [];
  if (!tracks.length) return;
  void player.playQueue(tracks, i);
}

const firstArtistId = computed(() => album.value?.artists?.[0]?.id ?? "");

function enqueueAll() {
  const tracks = album.value?.tracks || [];
  if (!tracks.length) return;
  tracks.forEach((track) => player.enqueue(track));
  Notify.create({ message: `В очередь добавлено: ${tracks.length}` });
}

function playAlbumWave() {
  void player.startWave(`album:${props.id}`, album.value?.title);
  void router.push("/wave");
}

function openArtist() {
  if (firstArtistId.value) void router.push(`/artist/${firstArtistId.value}`);
}

function shufflePlay() {
  const tracks = album.value?.tracks || [];
  if (!tracks.length) return;
  void player.playQueue(tracks, 0).then(() => {
    if (!player.shuffle) player.toggleShuffle();
  });
}

async function load() {
  const key = `album.${props.id}`;
  const cached = readCache<AlbumPage>(key);
  album.value = cached ?? null;
  loading.value = !cached;

  await swr<AlbumPage>(key, () => api.album(props.id), {
    onData: (data) => {
      album.value = data;
    },
    onSettled: () => {
      loading.value = false;
    },
  });
}

watch(() => props.id, load);
onMounted(load);
</script>
