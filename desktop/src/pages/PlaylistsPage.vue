<template>
  <q-page class="flex flex-col h-[calc(100vh_-_52px_-_var(--player-height,_78px))] !min-h-0 !p-0 !overflow-hidden">
    <q-scroll-area class="flex-auto min-h-0">
      <div class="pt-[var(--page-top-gap)] px-[32px] pb-[46px]">
        <div class="row items-center no-wrap" style="gap: 12px">
          <div class="text-[calc(30px*var(--text-scale,1))] font-semibold tracking-[-0.03em] leading-[1.15]">Коллекция</div>
          <div class="col" />
          <button class="inline-flex h-[34px] items-center justify-center px-[18px] py-0 border-0 rounded-[8px] !bg-[var(--accent)] text-[color:#fff] cursor-pointer text-[calc(12px*var(--text-scale,1))] font-medium gap-[7px] select-none transition-opacity duration-[120ms] ease-[ease] hover:opacity-[0.85] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none" type="button" @click="createPlaylist">
            <Icon name="mingcute:add-line" :size="15" />
            <span>Новый плейлист</span>
          </button>
        </div>

        <div v-if="loading" class="q-mt-xl">
          <q-spinner size="24px" color="primary" />
        </div>

        <div v-else class="row q-col-gutter-md q-mt-md">
          <div v-for="pl in ordered" :key="pl.kind" class="col-auto">
            <div
              class="group/card rounded-[14px] p-[10px] cursor-pointer transition-[background] duration-[160ms] ease-[ease] hover:bg-[var(--surface)]"
              style="width: 168px"
              @click="router.push(`/playlists/${pl.kind}`)"
            >
              <div
                class="cover relative rounded-[10px] overflow-hidden bg-[var(--surface-2)] flex items-center justify-center flex-none [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block"
                style="width: 100%; aspect-ratio: 1"
              >
                <img
                  loading="lazy"
                  decoding="async"
                  v-if="pl.cover_url"
                  :src="pl.cover_url"
                />
                <Icon v-else name="mingcute:playlist-2-line" :size="26" class="text-[color:var(--fg-faint)]" />
                <button
                  class="absolute right-[8px] bottom-[8px] flex w-[40px] h-[40px] items-center justify-center p-0 border-0 rounded-full bg-[var(--accent)] text-[color:#fff] cursor-pointer opacity-0 translate-y-[6px] shadow-[0_8px_18px_-8px_rgba(0,0,0,0.55)] transition-[opacity,transform,background] duration-[160ms,300ms,150ms] ease-[ease,cubic-bezier(0.34,1.56,0.64,1),ease] hover:bg-[color-mix(in_srgb,var(--accent)_88%,white)] active:scale-[0.88] group-hover/card:opacity-100 group-hover/card:translate-y-0"
                  type="button"
                  title="Слушать плейлист"
                  @click.stop="playPlaylist(pl)"
                >
                  <Icon name="mingcute:play-fill" :size="18" />
                </button>
              </div>
              <div class="row items-center no-wrap q-mt-sm" style="gap: 6px">
                <div class="col text-[calc(13px*var(--text-scale,1))] font-medium truncate">{{ pl.title }}</div>
                <div
                  class="flex w-[22px] h-[22px] flex-none items-center justify-center rounded-[6px] text-[color:var(--fg-faint)] cursor-pointer select-none opacity-0 transition-opacity duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] group-hover/card:opacity-100 p-0 border-0 appearance-none"
                  :class="{ '!opacity-[1] !bg-transparent !text-[color:var(--accent)] hover:!bg-[var(--hover)] hover:!text-[color:var(--accent)]': library.isPinned(pl.kind) }"
                  @click.stop="library.togglePin(pl.kind)"
                >
                  <Icon
                    :name="library.isPinned(pl.kind) ? 'gravity-ui:pin-slash' : 'mingcute:pin-2-line'"
                    :size="14"
                  />
                  <q-tooltip>{{
                    library.isPinned(pl.kind) ? "Открепить" : "Закрепить"
                  }}</q-tooltip>
                </div>
              </div>
              <div class="text-[color:var(--fg-faint)] text-[calc(11px*var(--text-scale,1))]">
                {{ plural(pl.track_count, "трек", "трека", "треков") }}
              </div>

              <q-menu context-menu touch-position class="!bg-[rgba(28,28,32,0.9)] !border !border-[color:rgba(255,255,255,0.09)] !rounded-[var(--radius)] shadow-[0_16px_40px_rgba(0,0,0,0.55)] backdrop-blur-[var(--glass-blur,24px)] backdrop-saturate-[1.35] overflow-x-hidden max-w-[268px]">
                <div class="p-[4px] min-w-[178px] max-w-[260px] overflow-x-hidden" style="min-width: 196px">
                  <div
                    class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:var(--fg)] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                    v-close-popup
                    @click="library.togglePin(pl.kind)"
                  >
                    <Icon
                      :name="library.isPinned(pl.kind) ? 'gravity-ui:pin-slash' : 'mingcute:pin-2-line'"
                      :size="17"
                    />
                    <span>{{
                      library.isPinned(pl.kind) ? "Открепить" : "Закрепить"
                    }}</span>
                  </div>
                  <div
                    class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:var(--fg)] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                    v-close-popup
                    @click="router.push(`/playlists/${pl.kind}`)"
                  >
                    <Icon name="mingcute:playlist-2-line" :size="17" />
                    <span>Открыть плейлист</span>
                  </div>
                  <div class="h-[1px] mx-[6px] my-[4px] bg-[var(--line)]" />
                  <div class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:var(--fg)] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis" v-close-popup @click="rename(pl)">
                    <Icon name="mingcute:pencil-line" :size="17" />
                    <span>Переименовать</span>
                  </div>
                  <div class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:var(--fg)] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis" v-close-popup @click="share(pl, true)">
                    <Icon name="mingcute:share-2-line" :size="17" />
                    <span>Сделать публичным</span>
                  </div>
                  <div
                    class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:var(--fg)] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                    v-close-popup
                    @click="share(pl, false)"
                  >
                    <Icon name="mingcute:user-2-line" :size="17" />
                    <span>Сделать личным</span>
                  </div>
                  <div class="h-[1px] mx-[6px] my-[4px] bg-[var(--line)]" />
                  <div
                    class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:var(--fg)] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                    v-close-popup
                    @click="library.toggleHidden(pl.kind)"
                  >
                    <Icon
                      :name="library.isHidden(pl.kind) ? 'mingcute:eye-2-line' : 'mingcute:eye-close-line'"
                      :size="17"
                    />
                    <span>{{
                      library.isHidden(pl.kind)
                        ? "Вернуть в коллекцию"
                        : "Скрыть плейлист"
                    }}</span>
                  </div>
                  <div class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:var(--fg)] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis" v-close-popup @click="clearTracks(pl)">
                    <Icon name="mingcute:filter-line" :size="17" />
                    <span>Очистить треки</span>
                  </div>
                  <div
                    class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:#f87171] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:#f87171] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                    v-close-popup
                    @click="removePlaylist(pl)"
                  >
                    <Icon name="mingcute:delete-2-line" :size="17" />
                    <span>Удалить плейлист</span>
                  </div>
                </div>
              </q-menu>
            </div>
          </div>

          <div
            v-for="al in likedAlbums"
            :key="`album-${al.id}`"
            class="col-auto"
          >
            <div
              class="rounded-[14px] p-[10px] cursor-pointer transition-[background] duration-[160ms] hover:bg-[var(--surface)]"
              style="width: 168px"
              @click="router.push(`/album/${al.id}`)"
            >
              <div class="cover overflow-hidden bg-[var(--surface-2)] flex items-center justify-center flex-none [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block rounded-[10px]" style="width: 100%; aspect-ratio: 1">
                <img
                  loading="lazy"
                  decoding="async"
                  v-if="al.cover_url"
                  :src="al.cover_url"
                />
                <Icon v-else name="mingcute:album-line" :size="26" class="text-[color:var(--fg-faint)]" />
                <div class="absolute left-[8px] bottom-[8px] px-[8px] py-[2px] rounded-full bg-[color-mix(in_srgb,var(--accent)_88%,black)] text-[color:#fff] font-semibold tracking-[0.02em] text-[calc(11px*var(--text-scale,1))]">Альбом</div>
              </div>
              <div class="row items-center no-wrap q-mt-sm" style="gap: 6px">
                <div class="col text-[calc(13px*var(--text-scale,1))] font-medium truncate">{{ al.title }}</div>
                <div
                  class="flex-none flex items-center justify-center text-[color:var(--fg-faint)] cursor-pointer p-0 border-0 appearance-none transition-[background,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] w-[22px] h-[22px] rounded-[6px]"
                  @click.stop="library.removeAlbumLike(al.id)"
                >
                  <Icon name="mingcute:heart-fill" :size="14" />
                  <q-tooltip>Убрать из коллекции</q-tooltip>
                </div>
              </div>
              <div class="text-[color:var(--fg-faint)] text-[calc(11px*var(--text-scale,1))] truncate">{{ al.artists }}</div>

              <q-menu context-menu touch-position class="bg-[color-mix(in_srgb,var(--surface-2)_90%,transparent)] border border-[rgba(255,255,255,0.09)] rounded-[var(--radius)] overflow-x-hidden max-w-[268px] shadow-[0_16px_40px_rgba(0,0,0,0.55)] backdrop-blur-[var(--glass-blur,24px)]">
                <div class="p-[4px] min-w-[178px] max-w-[260px] overflow-x-hidden" style="min-width: 196px">
                  <div
                    class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:var(--fg)] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                    v-close-popup
                    @click="router.push(`/album/${al.id}`)"
                  >
                    <Icon name="mingcute:album-line" :size="17" />
                    <span>Открыть альбом</span>
                  </div>
                  <div
                    class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:#f87171] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:#f87171] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                    v-close-popup
                    @click="library.removeAlbumLike(al.id)"
                  >
                    <Icon name="mingcute:heart-crack-line" :size="17" />
                    <span>Убрать из коллекции</span>
                  </div>
                </div>
              </q-menu>
            </div>
          </div>

          <div
            v-if="!playlists.length && !likedAlbums.length"
            class="q-pa-md text-[color:var(--fg-dim)] text-[calc(13px*var(--text-scale,1))]"
          >
            Плейлистов нет
          </div>
        </div>

        <template v-if="hiddenOrdered.length">
          <div class="row items-center no-wrap q-mt-xl">
            <div class="col text-[calc(17px*var(--text-scale,1))] font-semibold tracking-[-0.02em]">Скрытые</div>
            <button type="button" class="inline-flex items-center justify-center gap-[7px] h-[32px] px-[14px] py-0 border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer transition-[background,border-color,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none" @click="showHidden = !showHidden">
              {{
                showHidden ? "Свернуть" : `Показать (${hiddenOrdered.length})`
              }}
            </button>
          </div>

          <div v-if="showHidden" class="row q-col-gutter-md q-mt-sm">
            <div
              v-for="pl in hiddenOrdered"
              :key="`hidden-${pl.kind}`"
              class="col-auto"
            >
              <div class="playlist-hidden-card rounded-[14px] p-[10px] cursor-pointer transition-[background] duration-[160ms] hover:bg-[var(--surface)]" style="width: 168px">
                <div
                  class="cover relative overflow-hidden bg-[var(--surface-2)] flex items-center justify-center flex-none [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block rounded-[10px]"
                  @click="router.push(`/playlists/${pl.kind}`)"
                >
                  <img
                    v-if="pl.cover_url"
                    :src="pl.cover_url"
                    loading="lazy"
                    decoding="async"
                  />
                  <Icon v-else name="mingcute:playlist-2-line" :size="26" class="text-[color:var(--fg-faint)]" />
                </div>

                <div class="row items-center no-wrap q-mt-sm">
                  <div class="col text-[calc(13px*var(--text-scale,1))] font-medium truncate">{{ pl.title }}</div>
                  <button
                    type="button"
                    class="flex items-center justify-center text-[color:var(--fg-faint)] cursor-pointer p-0 border-0 appearance-none transition-[background,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] w-[22px] h-[22px] flex-none rounded-[6px]"
                    title="Вернуть в коллекцию"
                    @click="library.toggleHidden(pl.kind)"
                  >
                    <Icon name="mingcute:eye-2-line" :size="15" />
                  </button>
                </div>
                <div class="text-[color:var(--fg-faint)] text-[calc(11px*var(--text-scale,1))]">
                  {{ plural(pl.track_count, "трек", "трека", "треков") }}
                </div>

                <q-menu context-menu touch-position class="bg-[color-mix(in_srgb,var(--surface-2)_90%,transparent)] border border-[rgba(255,255,255,0.09)] rounded-[var(--radius)] overflow-x-hidden max-w-[268px] shadow-[0_16px_40px_rgba(0,0,0,0.55)] backdrop-blur-[var(--glass-blur,24px)]">
                  <div class="p-[4px] min-w-[178px] max-w-[260px] overflow-x-hidden" style="min-width: 196px">
                    <div
                      class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:var(--fg)] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                      v-close-popup
                      @click="library.toggleHidden(pl.kind)"
                    >
                      <Icon name="mingcute:eye-2-line" :size="17" />
                      <span>Вернуть в коллекцию</span>
                    </div>
                    <div
                      class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:var(--fg)] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                      v-close-popup
                      @click="router.push(`/playlists/${pl.kind}`)"
                    >
                      <Icon name="mingcute:playlist-2-line" :size="17" />
                      <span>Открыть плейлист</span>
                    </div>
                    <div class="h-[1px] mx-[6px] my-[4px] bg-[var(--line)]" />
                    <div
                      class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:#f87171] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:#f87171] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                      v-close-popup
                      @click="removePlaylist(pl)"
                    >
                      <Icon name="mingcute:delete-2-line" :size="17" />
                      <span>Удалить плейлист</span>
                    </div>
                  </div>
                </q-menu>
              </div>
            </div>
          </div>
        </template>
      </div>
    </q-scroll-area>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { api } from "@/api/client";
import type { Playlist, Track } from "@/api/types";
import { plural } from "@/lib/format";
import { readCache, swr, writeCache } from "@/lib/cache";
import { askConfirm, askText } from "@/lib/dialogs";
import { useLibraryStore } from "@/stores/library";
import { usePlayerStore } from "@/stores/player/index";

const router = useRouter();
const library = useLibraryStore();
const player = usePlayerStore();
const playlists = ref<Playlist[]>([]);
const loading = ref(false);

const likedAlbums = computed(() => library.sortedLikedAlbums);

const showHidden = ref(false);

const sorted = computed(() => {
  const rank = (kind: number) => {
    const at = library.pinned.indexOf(Number(kind));
    return at === -1 ? library.pinned.length + 1 : at;
  };
  return [...playlists.value].sort((a, b) => rank(a.kind) - rank(b.kind));
});

const ordered = computed(() =>
  sorted.value.filter((pl) => !library.isHidden(pl.kind)),
);

const hiddenOrdered = computed(() =>
  sorted.value.filter((pl) => library.isHidden(pl.kind)),
);

function syncFromStore() {
  playlists.value = [...library.playlists];
  writeCache("home.playlists", playlists.value);
}

async function playPlaylist(pl: Playlist) {
  const key = `playlist.${pl.kind}`;
  let list = readCache<Track[]>(key) ?? [];
  if (!list.length) {
    list = await api.playlistTracks(pl.kind).catch(() => [] as Track[]);
    if (list.length) writeCache(key, list);
  }
  if (!list.length) return;
  void player.playQueue(list, 0);
}

async function createPlaylist() {
  const title = await askText({
    title: "Новый плейлист",
    placeholder: "Название плейлиста",
    okLabel: "Создать",
  });
  if (!title) return;
  const created = await library.createPlaylist(title);
  if (created) syncFromStore();
}

async function rename(pl: Playlist) {
  const title = await askText({
    title: "Переименовать",
    value: pl.title,
    placeholder: "Название плейлиста",
  });
  if (!title || title === pl.title) return;
  if (await library.renamePlaylist(pl.kind, title)) {
    pl.title = title;
    syncFromStore();
  }
}

function share(pl: Playlist, isPublic: boolean) {
  void library.setPlaylistPublic(pl.kind, isPublic);
}

async function clearTracks(pl: Playlist) {
  const ok = await askConfirm({
    title: "Очистить плейлист?",
    message: `Из «${pl.title}» будут убраны все треки.`,
    okLabel: "Очистить",
    danger: true,
  });
  if (!ok) return;
  if (await library.clearPlaylist(pl.kind)) {
    pl.track_count = 0;
    syncFromStore();
  }
}

async function removePlaylist(pl: Playlist) {
  const ok = await askConfirm({
    title: "Удалить плейлист?",
    message: `«${pl.title}» будет удалён безвозвратно.`,
    okLabel: "Удалить",
    danger: true,
  });
  if (!ok) return;
  if (await library.deletePlaylist(pl.kind)) {
    playlists.value = playlists.value.filter((item) => item.kind !== pl.kind);
    writeCache("home.playlists", playlists.value);
  }
}

onMounted(() => {
  playlists.value = readCache<Playlist[]>("home.playlists") ?? [];
  loading.value = !playlists.value.length;

  void swr<Playlist[]>("home.playlists", () => api.playlists(), {
    onData: (data) => {
      playlists.value = data;
      library.playlists = data;
    },
    onSettled: () => {
      loading.value = false;
    },
  });
});
</script>

<style scoped>
.playlist-hidden-card {
  @apply opacity-[0.66];
  transition: opacity 0.15s ease;
}

.playlist-hidden-card:hover {
  @apply opacity-[1];
}
</style>
