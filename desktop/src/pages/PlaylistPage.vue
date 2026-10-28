<template>
  <q-page
    class="flex flex-col h-[calc(100vh_-_52px_-_var(--player-height,_78px))] !min-h-0 pt-[var(--page-top-gap)] px-[32px] pb-0 !overflow-hidden"
  >
    <div
      class="flex-none pb-[18px] overflow-hidden max-h-[460px] [transition:max-height_0.34s_ease,opacity_0.24s_ease,padding_0.34s_ease,transform_0.34s_ease]"
      :class="{
        '!max-h-0 !pb-0 opacity-[0] pointer-events-none translate-y-[-8px]':
          headerCollapsed,
      }"
    >
      <div
        class="flex items-end gap-[26px] min-w-0 max-[1360px]:gap-[20px] max-[1024px]:flex-col max-[1024px]:items-start max-[1024px]:gap-[14px]"
      >
        <div
          class="cover group relative cursor-pointer w-[clamp(112px,15vw,190px)] h-[clamp(112px,15vw,190px)] rounded-[12px] flex-none overflow-hidden bg-[var(--surface-2)] flex items-center justify-center [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block"
          :title="tracks.length ? 'Слушать плейлист' : ''"
          @click="playFrom(0)"
        >
          <img loading="lazy" decoding="async" v-if="cover" :src="cover" />
          <Icon
            v-else
            name="mingcute:playlist-2-line"
            :size="42"
            class="text-[color:var(--fg-faint)]"
          />
          <div
            v-if="tracks.length"
            class="absolute right-[10px] bottom-[10px] flex w-[44px] h-[44px] items-center justify-center rounded-full bg-[var(--accent)] text-[color:#fff] opacity-[0] cursor-pointer translate-y-[6px] [transition:opacity_0.14s_ease,transform_0.3s_cubic-bezier(0.34,1.56,0.64,1)] active:scale-[0.85] group-hover:opacity-[1] group-hover:translate-y-0"
          >
            <Icon name="mingcute:play-fill" :size="20" />
          </div>
        </div>

        <div
          class="flex-1 min-w-0 pb-[4px] max-[1024px]:w-full max-[1024px]:pb-0"
        >
          <div class="text-[12px] text-[color:var(--fg-dim)]">
            Плейлист
            <span
              v-if="isPinned"
              class="inline-flex items-center ml-[8px] text-[color:var(--fg-faint)] gap-[4px]"
            >
              <Icon name="mingcute:pin-2-line" :size="12" />
              закреплён
            </span>
          </div>

          <input
            v-if="editing"
            ref="titleInput"
            v-model="draftTitle"
            class="block w-full max-w-[640px] p-0 border-0 rounded-none m-0 bg-transparent text-inherit text-[44px] font-extrabold leading-[1.06] tracking-[-0.025em] outline-none border-b-2 border-b-[color:var(--line)] shadow-none break-words focus:border-b-[color:var(--accent)] max-[1024px]:mt-[4px] max-[1024px]:mx-0 max-[1024px]:mb-[8px]"
            type="text"
            spellcheck="false"
            maxlength="120"
            @keyup.enter="commitTitle"
            @keyup.esc="cancelTitle"
            @blur="commitTitle"
          />
          <button
            v-else
            class="group inline-flex max-w-full items-center p-0 border-0 bg-transparent text-inherit cursor-text text-[44px] font-extrabold leading-[1.06] gap-[10px] tracking-[-0.025em] text-left border-b-2 border-b-transparent break-words mt-[6px] mx-0 mb-[10px] max-[1024px]:mt-[4px] max-[1024px]:mx-0 max-[1024px]:mb-[8px] hover:[&_span]:underline hover:[&_span]:underline-offset-[4px] hover:[&_span]:decoration-2"
            type="button"
            title="Нажми, чтобы переименовать"
            @click="beginEdit"
          >
            <span>{{ title }}</span>
            <Icon
              class="flex-none text-[color:var(--fg-faint)] opacity-[0] transition-opacity duration-[120ms] ease-[ease] group-hover:opacity-[1]"
              name="mingcute:pencil-line"
              :size="20"
            />
          </button>

          <div
            class="flex items-baseline flex-wrap gap-y-[0] gap-x-[6px] text-[13px] text-[color:var(--fg-dim)] min-w-0 max-[760px]:text-[12px] [&>span]:whitespace-nowrap"
          >
            {{ plural(tracks.length, "трек", "трека", "треков") }}
            <span v-if="totalLabel" class="text-[color:var(--fg-faint)]">
              · {{ totalLabel }}</span
            >
          </div>

          <div
            class="flex items-center gap-[8px] flex-wrap mt-[22px] max-[1180px]:gap-[7px] max-[1180px]:mt-[16px] max-[1024px]:mt-[14px] [&_.btn]:whitespace-nowrap [&_.btn-solid]:whitespace-nowrap max-[760px]:[&_.btn_span]:hidden max-[760px]:[&_.btn-solid_span]:hidden max-[760px]:[&_.btn]:px-[12px] max-[760px]:[&_.btn-solid]:px-[12px]"
          >
            <button
              class="inline-flex h-[34px] items-center justify-center px-[18px] py-0 border-0 rounded-[8px] !bg-[var(--accent)] text-[color:#fff] cursor-pointer text-[calc(12px*var(--text-scale,1))] font-medium gap-[7px] select-none transition-opacity duration-[120ms] ease-[ease] hover:opacity-[0.85] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none text-white"
              type="button"
              :disabled="!tracks.length"
              @click="playFrom(0)"
            >
              <Icon name="mingcute:play-fill" :size="15" />
              <span>Слушать</span>
            </button>

            <button
              class="inline-flex h-[32px] items-center justify-center px-[14px] py-0 border border-solid border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] cursor-pointer text-[calc(12px*var(--text-scale,1))] font-medium gap-[7px] select-none transition-[background,border-color,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
              type="button"
              :disabled="!tracks.length"
              @click="shufflePlay"
            >
              <Icon name="mingcute:shuffle-line" :size="15" />
              <span>Перемешать</span>
            </button>

            <button
              v-if="downloading"
              class="inline-flex h-[32px] items-center justify-center px-[14px] py-0 border border-solid border-[color:var(--line)] rounded-[8px] text-[color:var(--accent)] cursor-pointer text-[calc(12px*var(--text-scale,1))] font-medium gap-[7px] select-none transition-[background,border-color,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--accent)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none text-[color:var(--fg-dim)] hover:text-[color:var(--fg)]"
              type="button"
              title="Отменить загрузку плейлиста"
              @click="cancelDownload"
            >
              <q-spinner size="15px" />
              <span>{{ downloadLabel }}</span>
              <Icon name="mingcute:close-line" :size="14" />
            </button>

            <button
              v-else
              class="inline-flex h-[32px] items-center justify-center px-[14px] py-0 border border-solid rounded-[8px] cursor-pointer text-[calc(12px*var(--text-scale,1))] font-medium gap-[7px] select-none transition-[background,border-color,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none border-[color:var(--line)] text-[color:var(--fg-dim)] hover:text-[color:var(--fg)]"
              type="button"
              :class="
                fullyDownloaded
                  ? 'on border-[color:var(--accent)] text-[color:var(--fg)] hover:border-[color:var(--accent)] hover:text-[color:var(--fg)]'
                  : 'border-[color:var(--line)] text-[color:var(--fg-dim)] hover:text-[color:var(--fg)]'
              "
              :disabled="!tracks.length || fullyDownloaded"
              :title="
                fullyDownloaded
                  ? 'Плейлист уже скачан целиком'
                  : 'Скачать все треки плейлиста в отдельную папку'
              "
              @click="downloadAll"
            >
              <Icon
                :name="
                  fullyDownloaded
                    ? 'mingcute:check-line'
                    : 'mingcute:download-2-line'
                "
                :size="15"
              />
              <span>{{ downloadLabel }}</span>
            </button>

            <button
              class="inline-flex h-[32px] items-center justify-center px-[14px] py-0 border border-solid rounded-[8px] cursor-pointer text-[calc(12px*var(--text-scale,1))] font-medium gap-[7px] select-none transition-[background,border-color,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none border-[color:var(--line)] text-[color:var(--fg-dim)] hover:text-[color:var(--fg)]"
              type="button"
              :class="
                isPinned
                  ? 'on border-[color:var(--accent)] text-[color:var(--fg)] hover:border-[color:var(--accent)] hover:text-[color:var(--fg)]'
                  : 'border-[color:var(--line)] text-[color:var(--fg-dim)] hover:text-[color:var(--fg)]'
              "
              :title="
                isPinned
                  ? 'Открепить от боковой панели'
                  : 'Закрепить в боковой панели'
              "
              @click="library.togglePin(kindNumber)"
            >
              <Icon
                :name="
                  isPinned ? 'gravity-ui:pin-slash' : 'mingcute:pin-2-line'
                "
                :size="15"
              />
              <span>{{ isPinned ? "Открепить" : "Закрепить" }}</span>
            </button>

            <button
              class="flex w-[30px] h-[30px] items-center justify-center rounded-[8px] p-0 border-0 appearance-none text-[color:var(--fg-faint)] cursor-pointer select-none transition-[background,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default"
              type="button"
              title="Ещё"
            >
              <Icon name="mingcute:more-2-fill" :size="18" />
              <q-menu
                class="select-none bg-[color-mix(in_srgb,var(--surface-2)_90%,transparent)] border border-solid border-[rgba(255,255,255,0.09)] !rounded-[var(--radius)] overflow-x-hidden max-w-[268px] shadow-[0_16px_40px_rgba(0,0,0,0.55)] [backdrop-filter:blur(var(--glass-blur,24px))_saturate(1.35)]"
                anchor="bottom left"
                self="top left"
              >
                <div
                  class="p-[4px] min-w-[178px] max-w-[260px] overflow-x-hidden select-none"
                  style="min-width: 232px"
                >
                  <div
                    class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:w-[15px] [&_svg]:h-[15px] [&_svg]:text-[color:var(--fg-faint)] [&_svg]:flex-none [&_svg]:[transition:color_0.1s_ease] [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                    v-close-popup
                    @click="beginEdit"
                  >
                    <Icon name="mingcute:pencil-line" :size="17" />
                    <span>Переименовать</span>
                  </div>

                  <div
                    class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:w-[15px] [&_svg]:h-[15px] [&_svg]:text-[color:var(--fg-faint)] [&_svg]:flex-none [&_svg]:[transition:color_0.1s_ease] [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                    v-close-popup
                    @click="enqueueAll"
                    :class="{
                      'opacity-[0.4] pointer-events-none': !tracks.length,
                    }"
                  >
                    <Icon name="mingcute:add-circle-line" :size="17" />
                    <span>Добавить всё в очередь</span>
                  </div>

                  <div
                    class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:w-[15px] [&_svg]:h-[15px] [&_svg]:text-[color:var(--fg-faint)] [&_svg]:flex-none [&_svg]:[transition:color_0.1s_ease] [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                    v-close-popup
                    :class="{
                      'opacity-[0.4] pointer-events-none':
                        !tracks.length || fullyDownloaded,
                    }"
                    @click="downloadAll"
                  >
                    <Icon name="mingcute:download-2-line" :size="17" />
                    <span>{{
                      fullyDownloaded ? "Уже скачано" : "Скачать всё"
                    }}</span>
                  </div>

                  <div
                    v-if="downloading"
                    class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[#f87171] [&_svg]:w-[15px] [&_svg]:h-[15px] [&_svg]:text-[color:var(--fg-faint)] [&_svg]:flex-none [&_svg]:[transition:color_0.1s_ease] [&:hover_svg]:text-[#f87171] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis hover:text-[color:var(--fg)] [&:hover_svg]:text-[color:var(--fg)]"
                    v-close-popup
                    @click="cancelDownload"
                  >
                    <Icon name="mingcute:close-line" :size="17" />
                    <span>Отменить загрузку</span>
                  </div>

                  <div
                    class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:w-[15px] [&_svg]:h-[15px] [&_svg]:text-[color:var(--fg-faint)] [&_svg]:flex-none [&_svg]:[transition:color_0.1s_ease] [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                    v-close-popup
                    @click="playRecommended"
                  >
                    <Icon name="mingcute:wave-line" :size="17" />
                    <span>Моя волна по плейлисту</span>
                  </div>

                  <div class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:w-[15px] [&_svg]:h-[15px] [&_svg]:text-[color:var(--fg-faint)] [&_svg]:flex-none [&_svg]:[transition:color_0.1s_ease] [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis" v-close-popup @click="playRecommended">                    <Icon name="mingcute:wave-line" :size="17" />
                    <span>Похожее на плейлист</span>
                  </div>

                  <div class="h-[1px] mx-[6px] my-[4px] bg-[var(--line)]" />

                  <div
                    class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:w-[15px] [&_svg]:h-[15px] [&_svg]:text-[color:var(--fg-faint)] [&_svg]:flex-none [&_svg]:[transition:color_0.1s_ease] [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                    v-close-popup
                    @click="setPublic(true)"
                  >
                    <Icon name="mingcute:share-2-line" :size="17" />
                    <span>Сделать публичным</span>
                  </div>

                  <div
                    class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:w-[15px] [&_svg]:h-[15px] [&_svg]:text-[color:var(--fg-faint)] [&_svg]:flex-none [&_svg]:[transition:color_0.1s_ease] [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                    v-close-popup
                    @click="setPublic(false)"
                  >
                    <Icon name="mingcute:user-2-line" :size="17" />
                    <span>Сделать личным</span>
                  </div>

                  <div class="h-[1px] mx-[6px] my-[4px] bg-[var(--line)]" />

                  <div
                    class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:w-[15px] [&_svg]:h-[15px] [&_svg]:text-[color:var(--fg-faint)] [&_svg]:flex-none [&_svg]:[transition:color_0.1s_ease] [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                    v-close-popup
                    @click="clearTracks"
                  >
                    <Icon name="mingcute:filter-line" :size="17" />
                    <span>Очистить плейлист</span>
                  </div>

                  <div
                    class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[#f87171] [&_svg]:w-[15px] [&_svg]:h-[15px] [&_svg]:text-[color:var(--fg-faint)] [&_svg]:flex-none [&_svg]:[transition:color_0.1s_ease] [&:hover_svg]:text-[#f87171] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis hover:text-[color:var(--fg)] [&:hover_svg]:text-[color:var(--fg)]"
                    v-close-popup
                    @click="removePlaylist"
                  >
                    <Icon name="mingcute:delete-2-line" :size="17" />
                    <span>Удалить плейлист</span>
                  </div>
                </div>
              </q-menu>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center flex-auto">
      <q-spinner size="24px" color="primary" />
    </div>

    <div v-else class="flex flex-auto flex-col min-h-0 overflow-hidden">
      <div v-if="selectedIds.length" class="select-float">
        <button
          class="flex w-[16px] h-[16px] flex-none items-center justify-center border border-solid border-[color:var(--line)] rounded-[5px] bg-[var(--surface-2)] text-[color:#fff] [transition:background_0.12s_ease,border-color_0.12s_ease]"
          :class="{
            '!bg-[var(--accent)] ': allVisibleSelected,
          }"
          type="button"
          title="Выбрать все"
          @click="toggleSelectAllRows"
        >
          <Icon
            v-if="allVisibleSelected"
            name="mingcute:check-line"
            :size="13"
          />
        </button>

        <div
          class="text-[color:var(--fg)] whitespace-nowrap text-[calc(12px*var(--text-scale,1))] font-semibold"
        >
          {{ plural(selectedIds.length, "трек", "трека", "треков") }}
        </div>

        <div class="flex items-center gap-[8px] flex-nowrap ml-auto">
          <button
            class="inline-flex items-center justify-center gap-[7px] h-[32px] px-[14px] border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer transition-[background,border-color,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
            type="button"
            :disabled="!selectedIds.length"
            @click="playRowSelection"
          >
            <Icon name="mingcute:play-fill" :size="14" />
            <span>Слушать</span>
          </button>

          <button
            class="shrink-0 whitespace-nowrap inline-flex items-center justify-center gap-[7px] h-[32px] px-[14px] border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer transition-[background,border-color,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
            type="button"
            :disabled="!selectedIds.length"
            @click="enqueueRowSelection"
          >
            <Icon name="mingcute:add-circle-line" :size="14" />
            <span>В очередь</span>
          </button>

          <button
            class="shrink-0 whitespace-nowrap inline-flex items-center justify-center gap-[7px] h-[32px] px-[14px] border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer transition-[background,border-color,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
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
                  v-if="!otherPlaylists.length"
                  class="flex items-center gap-[8px] h-[26px] px-[7px] rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:w-[15px] [&_svg]:h-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis opacity-[0.4] pointer-events-none"
                >
                  <span>Нет других плейлистов</span>
                </div>
                <div
                  v-for="playlist in otherPlaylists"
                  :key="playlist.kind"
                  class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:w-[15px] [&_svg]:h-[15px] [&_svg]:text-[color:var(--fg-faint)] [&_svg]:flex-none [&_svg]:[transition:color_0.1s_ease] [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                  v-close-popup
                  @click="addRowSelectionTo(playlist.kind)"
                >
                  <div
                    class="cover w-[26px] h-[26px] rounded-[6px] flex-none overflow-hidden bg-[var(--surface-2)] flex items-center justify-center [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block"
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
            class="inline-flex items-center justify-center gap-[7px] h-[32px] px-[14px] border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer transition-[background,border-color,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
            type="button"
            :disabled="!selectedIds.length || downloading"
            @click="downloadRowSelection"
          >
            <Icon name="mingcute:download-2-line" :size="14" />
            <span>Скачать</span>
          </button>

          <button
            v-if="canReorder"
            class="inline-flex items-center justify-center gap-[7px] h-[32px] px-[14px] border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer transition-[background,border-color,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none text-[color:var(--accent)]"
            type="button"
            :disabled="!selectedIds.length"
            @click="removeRowSelection"
          >
            <Icon name="mingcute:delete-2-line" :size="14" />
            <span>Удалить</span>
          </button>

          <button
            class="flex shrink-0 whitespace-nowrap items-center justify-center text-[color:var(--fg-faint)] cursor-pointer p-0 border-0 appearance-none transition-[background,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] w-[27px] h-[27px] rounded-[7px]"
            type="button"
            title="Снять выделение"
            @click="clearRowSelection"
          >
            <Icon name="mingcute:close-line" :size="15" />
          </button>
        </div>
      </div>

      <div
        ref="toolsRef"
        class="flex-none min-h-0 will-change-transform"
        :style="toolsStyle"
      >
        <div
          v-if="tracks.length"
          class="flex items-center pt-0 px-[2px] pb-[12px] gap-[8px] max-[760px]:flex-wrap max-[760px]:gap-[8px]"
        >
          <div
            class="w-[240px] !h-[34px] flex-none flex items-center gap-[8px] px-[12px] rounded-[10px] bg-[var(--surface)] border border-transparent transition-[border-color,background] duration-[140ms] focus-within:border-[color:color-mix(in_srgb,var(--fg)_22%,transparent)] focus-within:bg-[var(--surface-2)] [&_input]:flex-1 [&_input]:min-w-0 [&_input]:border-0 [&_input]:bg-transparent [&_input]:outline-none [&_input]:text-[color:var(--fg)] [&_input]:text-[13px] [&_input::placeholder]:text-[color:var(--fg-faint)] [&_select]:w-full [&_select]:border-0 [&_select]:bg-transparent [&_select]:outline-none [&_select]:text-[color:var(--fg)] [&_select]:text-[13px] [&_select]:cursor-pointer"
          >
            <Icon
              name="mingcute:search-2-line"
              :size="15"
              class="text-[color:var(--fg-faint)]"
            />
            <input
              v-model="filter"
              type="text"
              spellcheck="false"
              placeholder="Найти в плейлисте"
            />
            <button
              v-if="filter"
              class="flex items-center justify-center text-[color:var(--fg-faint)] cursor-pointer p-0 border-0 appearance-none transition-[background,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] w-[22px] h-[22px] flex-none rounded-[6px]"
              type="button"
              title="Сбросить"
              @click="filter = ''"
            >
              <Icon name="mingcute:close-line" :size="13" />
            </button>
          </div>

          <button
            class="inline-flex items-center justify-center gap-[7px] h-[32px] px-[14px] border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer transition-[background,border-color,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
            type="button"
            title="Сортировка"
          >
            <Icon name="mingcute:filter-line" :size="15" />
            <span>{{ sortLabel }}</span>
            <Icon name="mingcute:down-line" :size="13" />
            <q-menu
              class="select-none bg-[color-mix(in_srgb,var(--surface-2)_90%,transparent)] border border-solid border-[rgba(255,255,255,0.09)] !rounded-[var(--radius)] overflow-x-hidden max-w-[268px] shadow-[0_16px_40px_rgba(0,0,0,0.55)] [backdrop-filter:blur(var(--glass-blur,24px))_saturate(1.35)]"
              anchor="bottom left"
              self="top left"
            >
              <div
                class="p-[4px] min-w-[178px] max-w-[260px] overflow-x-hidden select-none"
                style="min-width: 220px"
              >
                <div
                  v-for="option in sortOptions"
                  :key="option.id"
                  class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:w-[15px] [&_svg]:h-[15px] [&_svg]:text-[color:var(--fg-faint)] [&_svg]:flex-none [&_svg]:[transition:color_0.1s_ease] [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                  v-close-popup
                  @click="sortMode = option.id"
                >
                  <Icon
                    :name="
                      sortMode === option.id
                        ? 'mingcute:check-line'
                        : 'mingcute:pencil-line'
                    "
                    :size="16"
                  />
                  <span>{{ option.label }}</span>
                </div>
              </div>
            </q-menu>
          </button>

          <button
            class="inline-flex items-center justify-center gap-[7px] h-[32px] px-[14px] border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer transition-[background,border-color,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
            type="button"
            :title="
              sortDir === 'asc'
                ? 'Сейчас по возрастанию - нажми для убывания'
                : 'Сейчас по убыванию - нажми для возрастания'
            "
            @click="sortDir = sortDir === 'asc' ? 'desc' : 'asc'"
          >
            <span class="text-[calc(13px*var(--text-scale,1))] font-semibold">{{
              sortDir === "asc" ? "↑" : "↓"
            }}</span>
            <span>{{
              sortDir === "asc" ? "По возрастанию" : "По убыванию"
            }}</span>
          </button>

          <div class="col" />

          <div
            v-if="filter"
            class="text-[color:var(--fg-faint)] text-[calc(12px*var(--text-scale,1))]"
          >
            {{ plural(rows.length, "совпадение", "совпадения", "совпадений") }}
          </div>
          <div
            v-else-if="canReorder"
            class="text-[color:var(--fg-faint)] text-[calc(12px*var(--text-scale,1))]"
          >
            Перетаскивай треки, чтобы менять порядок
          </div>
        </div>

        <div
          class="flex items-center gap-[14px] h-[32px] px-[12px] py-0 text-[11px] font-semibold tracking-[0.06em] uppercase text-[color:var(--fg-faint)] border-b border-[var(--line)]"
        >
          <div style="width: 26px" />
          <div class="w-[16px] flex-none" />
          <div style="width: 20px; text-align: center">#</div>
          <div style="width: 38px" />
          <div class="col">Название</div>
          <div class="gt-sm" style="width: 190px">Альбом</div>
          <div style="width: 84px" />
          <div style="width: 40px; text-align: right">Время</div>
        </div>
      </div>

      <q-virtual-scroll
        v-if="rows.length"
        ref="virtualRef"
        v-slot="{ item }"
        class="flex-auto min-h-0 overflow-x-hidden pb-[18px] [&_.q-virtual-scroll__content]:min-w-0"
        data-track-scroll
        :items="rows"
        :virtual-scroll-item-size="52"
        :virtual-scroll-slice-size="20"
        @scroll="onTracksScroll"
      >
        <TrackRow
          :key="`${item.track.id}-${item.index}`"
          :track="item.track"
          :index="item.index"
          :playlist-kind="props.kind"
          :dragging="dragFrom === item.index"
          :drop-target="dragOver === item.index && dragFrom !== item.index"
          :selectable="true"
          :selected="isRowSelected(item.track)"
          :downloaded="localIds.has(item.track.id)"
          @play="playFrom(item.index)"
          @remove="removeAt(item.index)"
          @reorder-start="startReorder"
          @toggle-select="toggleRow(item.track, $event)"
        />
      </q-virtual-scroll>

      <div
        v-else-if="filter"
        class="flex flex-col items-center justify-center px-0 py-[54px] text-[color:var(--fg-dim)] gap-[10px] text-center"
      >
        <Icon
          name="mingcute:search-2-line"
          :size="22"
          class="text-[color:var(--fg-faint)]"
        />
        <div class="text-[calc(13px*var(--text-scale,1))]">
          По запросу «{{ filter }}» ничего нет
        </div>
        <button
          class="inline-flex items-center justify-center gap-[7px] h-[32px] px-[14px] border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer transition-[background,border-color,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
          type="button"
          @click="filter = ''"
        >
          Сбросить поиск
        </button>
      </div>

      <div
        v-else
        class="flex flex-col items-center justify-center px-0 py-[54px] text-[color:var(--fg-dim)] gap-[10px] text-center"
      >
        <Icon
          name="mingcute:playlist-2-line"
          :size="22"
          class="text-[color:var(--fg-faint)]"
        />
        <div class="text-[calc(13px*var(--text-scale,1))]">Плейлист пуст</div>
        <div
          class="text-[color:var(--fg-faint)] text-[calc(12px*var(--text-scale,1))]"
        >
          Добавляй треки через меню трека - «Добавить в плейлист»
        </div>
        <button
          class="inline-flex items-center justify-center gap-[7px] h-[32px] px-[14px] border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer transition-[background,border-color,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
          type="button"
          @click="playRecommended"
        >
          <Icon name="mingcute:wave-line" :size="15" />
          <span>Подобрать похожее</span>
        </button>
      </div>
    </div>

    <q-dialog v-model="pickerOpen">
      <div
        class="flex w-[620px] max-w-[94vw] flex-col p-[22px] border border-[color:var(--line)] rounded-[var(--radius)] bg-[var(--surface)] gap-[14px]"
      >
        <div class="flex items-start justify-between gap-[12px]">
          <div>
            <div
              class="text-[color:var(--fg)] text-[16px] font-semibold tracking-[-0.01em]"
            >
              Выбор треков
            </div>
            <div class="text-[color:var(--fg-dim)] text-[13px] leading-[1.5]">
              Отметь треки и примени действие сразу ко всем.
            </div>
          </div>
          <button
            class="ml-auto flex shrink-0 items-center justify-center text-[color:var(--fg-faint)] cursor-pointer p-0 border-0 appearance-none transition-[background,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] w-[27px] h-[27px] rounded-[7px]"
            type="button"
            title="Снять выделение"
            @click="clearRowSelection"
          >
            <Icon name="mingcute:close-line" :size="15" />
          </button>
        </div>

        <div class="flex items-center gap-[12px]">
          <div
            class="w-full !h-[34px] flex-auto flex items-center gap-[8px] px-[12px] rounded-[10px] bg-[var(--surface)] border border-transparent transition-[border-color,background] duration-[140ms] focus-within:border-[color:color-mix(in_srgb,var(--fg)_22%,transparent)] focus-within:bg-[var(--surface-2)] [&_input]:flex-1 [&_input]:min-w-0 [&_input]:border-0 [&_input]:bg-transparent [&_input]:outline-none [&_input]:text-[color:var(--fg)] [&_input]:text-[13px] [&_input::placeholder]:text-[color:var(--fg-faint)] [&_select]:w-full [&_select]:border-0 [&_select]:bg-transparent [&_select]:outline-none [&_select]:text-[color:var(--fg)] [&_select]:text-[13px] [&_select]:cursor-pointer"
          >
            <Icon
              name="mingcute:search-2-line"
              :size="15"
              class="text-[color:var(--fg-faint)]"
            />
            <input
              v-model="pickerFilter"
              type="text"
              spellcheck="false"
              placeholder="Найти трек"
            />
          </div>
          <button
            class="!bg-[var(--accent)] inline-flex items-center gap-[4px] whitespace-nowrap border-0 bg-transparent p-0 text-[12px] text-[color:var(--fg-faint)] cursor-pointer appearance-none font-[inherit] transition-[color] duration-[0.12s] ease-[ease] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.6]"
            type="button"
            @click="selectAllVisible"
          >
            Выбрать все
          </button>
          <button
            class="inline-flex items-center gap-[4px] whitespace-nowrap border-0 !bg-[var(--accent)] p-0 text-[12px] text-[color:var(--fg-faint)] cursor-pointer appearance-none font-[inherit] transition-[color] duration-[0.12s] ease-[ease] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.6]"
            type="button"
            :disabled="!selected.length"
            @click="clearSelection"
          >
            Снять
          </button>
        </div>

        <div
          class="flex max-h-[46vh] flex-col gap-[2px] overflow-x-hidden overflow-y-auto overscroll-contain rounded-[10px] border border-[color:var(--line)] bg-[var(--bg)] p-[4px]"
        >
          <button
            v-for="row in pickerRows"
            :key="`${row.track.id}-${row.index}`"
            class="flex w-full items-center gap-[10px] rounded-[8px] border-0 px-[8px] py-[6px] text-left text-inherit font-[inherit] cursor-pointer hover:bg-[var(--hover)]"
            :class="selected.includes(row.index) ? 'bg-[var(--surface-2)]' : ''"
            type="button"
            @click="toggleSelect(row.index, $event)"
          >
            <span
              class="flex h-[16px] w-[16px] flex-none items-center justify-center rounded-[5px] border bg-[var(--surface-2)] text-[color:#fff] transition-[background,border-color] duration-[0.12s] ease-[ease]"
              :class="
                selected.includes(row.index)
                  ? 'border-[color:var(--accent)] bg-[var(--accent)]'
                  : 'border-[color:var(--line)]'
              "
            >
              <Icon
                v-if="selected.includes(row.index)"
                name="mingcute:check-line"
                :size="12"
              />
            </span>

            <div
              class="cover w-[34px] h-[34px] flex-none rounded-[6px] overflow-hidden bg-[var(--surface-2)] flex items-center justify-center [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block"
            >
              <img
                v-if="row.track.cover_url"
                loading="lazy"
                decoding="async"
                :src="row.track.cover_url"
              />
              <Icon
                v-else
                name="mingcute:music-line"
                :size="14"
                class="text-[color:var(--fg-faint)]"
              />
            </div>

            <span class="flex min-w-0 flex-auto flex-col gap-[1px]">
              <span class="truncate text-[calc(13px*var(--text-scale,1))]">{{
                row.track.title
              }}</span>
              <span
                class="text-[color:var(--fg-faint)] text-[calc(11px*var(--text-scale,1))] truncate"
              >
                {{ artistNames(row.track.artists) }}
              </span>
            </span>

            <span
              class="text-[color:var(--fg-faint)] text-[calc(11px*var(--text-scale,1))]"
            >
              {{ formatDuration(row.track.duration_ms) }}
            </span>
          </button>

          <div
            v-if="!pickerRows.length"
            class="px-0 py-[26px] text-center text-[color:var(--fg-faint)]"
          >
            Ничего не нашлось
          </div>
        </div>

        <div class="flex items-center gap-[8px] flex-wrap">
          <span
            class="text-[color:var(--fg-faint)] text-[calc(12px*var(--text-scale,1))]"
            >Выбрано: {{ selected.length }}</span
          >

          <div class="flex-auto" />

          <button
            class="inline-flex items-center justify-center gap-[7px] h-[32px] px-[14px] border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer transition-[background,border-color,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
            type="button"
            :disabled="!selected.length"
            @click="playSelected"
          >
            <Icon name="mingcute:play-fill" :size="15" />
            <span>Слушать</span>
          </button>

          <button
            class="inline-flex items-center justify-center gap-[7px] h-[32px] px-[14px] border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer transition-[background,border-color,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
            type="button"
            :disabled="!selected.length"
            @click="enqueueSelected"
          >
            <Icon name="mingcute:add-circle-line" :size="15" />
            <span>В очередь</span>
          </button>

          <button
            class="inline-flex items-center justify-center gap-[7px] h-[32px] px-[14px] border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer transition-[background,border-color,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
            type="button"
            :disabled="!selected.length"
          >
            <Icon name="mingcute:classify-add-line" :size="15" />
            <span>В плейлист</span>
            <q-menu
              class="select-none bg-[color-mix(in_srgb,var(--surface-2)_90%,transparent)] border border-solid border-[rgba(255,255,255,0.09)] !rounded-[var(--radius)] overflow-x-hidden max-w-[268px] shadow-[0_16px_40px_rgba(0,0,0,0.55)] [backdrop-filter:blur(var(--glass-blur,24px))_saturate(1.35)]"
              anchor="top right"
              self="bottom right"
            >
              <div
                class="p-[4px] min-w-[178px] max-w-[260px] overflow-x-hidden select-none"
                style="min-width: 220px"
              >
                <div
                  class="pt-[8px] px-[10px] pb-[10px] mb-[4px] min-w-0 border-b border-solid border-[color:var(--line)]"
                >
                  Добавить в плейлист
                </div>
                <div
                  v-for="item in otherPlaylists"
                  :key="item.kind"
                  class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:w-[15px] [&_svg]:h-[15px] [&_svg]:text-[color:var(--fg-faint)] [&_svg]:flex-none [&_svg]:[transition:color_0.1s_ease] [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                  v-close-popup
                  @click="addSelectedTo(item.kind)"
                >
                  <Icon name="mingcute:playlist-2-line" :size="16" />
                  <span class="truncate">{{ item.title }}</span>
                </div>
                <div
                  v-if="!otherPlaylists.length"
                  class="flex items-center gap-[8px] h-[26px] px-[7px] rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:w-[15px] [&_svg]:h-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis opacity-[0.4] pointer-events-none"
                >
                  <span class="text-[color:var(--fg-faint)]"
                    >Нет других плейлистов</span
                  >
                </div>
              </div>
            </q-menu>
          </button>

          <button
            class="inline-flex items-center justify-center gap-[7px] h-[32px] px-[14px] border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer transition-[background,border-color,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
            type="button"
            :disabled="!selected.length || downloading"
            @click="downloadSelected"
          >
            <Icon name="mingcute:download-2-line" :size="15" />
            <span>Скачать</span>
          </button>

          <button
            class="inline-flex items-center justify-center gap-[7px] h-[32px] px-[14px] border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer transition-[background,border-color,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none text-[color:var(--accent)]"
            type="button"
            :disabled="!selected.length"
            @click="removeSelected"
          >
            <Icon name="mingcute:delete-2-line" :size="15" />
            <span>Удалить</span>
          </button>
        </div>
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  nextTick,
} from "vue";
import { Notify } from "quasar";
import { useRoute, useRouter } from "vue-router";
import TrackRow from "@/components/common/TrackRow.vue";
import { api } from "@/api/client";
import type { Playlist, Track } from "@/api/types";
import { artistNames, formatDuration, plural } from "@/lib/format";
import { readCache, swr, writeCache } from "@/lib/cache";
import { askConfirm } from "@/lib/dialogs";
import { useLibraryStore } from "@/stores/library";
import { usePlayerStore } from "@/stores/player/index";
import { useUiStore } from "@/stores/ui/index";

type SortMode = "custom" | "title" | "artist" | "album" | "duration";

const props = defineProps<{ kind: string }>();
const router = useRouter();
const route = useRoute();
const player = usePlayerStore();
const library = useLibraryStore();
const ui = useUiStore();
const tracks = ref<Track[]>([]);
const title = ref("Плейлист");
const cover = ref<string | null>(null);
const loading = ref(false);
const filter = ref("");
const dragFrom = ref<number | null>(null);
const dragOver = ref<number | null>(null);
const editing = ref(false);
const draftTitle = ref("");
const titleInput = ref<HTMLInputElement | null>(null);
const sortMode = ref<SortMode>("custom");
const sortDir = ref<"asc" | "desc">("asc");
const pickerOpen = ref(false);
const pickerFilter = ref("");
const selected = ref<number[]>([]);
const lastPicked = ref<number | null>(null);
const downloading = ref(false);
const downloadDone = ref(0);
const downloadTotal = ref(0);
const cancelRequested = ref(false);
const localIds = ref<Set<string>>(new Set());
const selectedIds = ref<string[]>([]);
const headerCollapsed = ref(false);
const HERO_COLLAPSE_AT = 24;
const virtualRef = ref<{
  scrollTo: (index: number, edge?: string) => void;
} | null>(null);
const toolsRef = ref<HTMLElement | null>(null);
const toolsOffset = ref(0);

const toolsStyle = computed(() => {
  const offset = toolsOffset.value;
  if (!offset) return undefined;
  return {
    transform: `translateY(-${offset}px)`,
    marginBottom: `-${offset}px`,
  };
});

const sortOptions: Array<{ id: SortMode; label: string }> = [
  { id: "custom", label: "Как в плейлисте" },
  { id: "title", label: "По названию" },
  { id: "artist", label: "По исполнителю" },
  { id: "album", label: "По альбому" },
  { id: "duration", label: "По длительности" },
];

const kindNumber = computed(() => Number(props.kind));
const isPinned = computed(() => library.isPinned(kindNumber.value));
const canReorder = computed(
  () => sortMode.value === "custom" && sortDir.value === "asc" && !filter.value,
);

const sortLabel = computed(
  () => sortOptions.find((option) => option.id === sortMode.value)?.label ?? "",
);

const otherPlaylists = computed(() =>
  library.sortedPlaylists.filter(
    (playlist) => String(playlist.kind) !== String(props.kind),
  ),
);

const downloadLabel = computed(() => {
  if (downloading.value)
    return cancelRequested.value
      ? "Отменяю…"
      : `${downloadDone.value} / ${downloadTotal.value}`;
  if (fullyDownloaded.value) return "Уже скачано";
  const left = pendingTracks.value.length;
  if (left && left !== tracks.value.length) return `Дозакачать (${left})`;
  return "Скачать всё";
});

const pendingTracks = computed(() =>
  tracks.value.filter((track) => !localIds.value.has(track.id)),
);

const fullyDownloaded = computed(
  () => tracks.value.length > 0 && pendingTracks.value.length === 0,
);

const folderName = computed(() => safeFolder(title.value));

const rows = computed(() => {
  const all = tracks.value.map((track, index) => ({ track, index }));
  const query = filter.value.trim().toLowerCase();
  const found = query
    ? all.filter(({ track }) => {
        const artists = track.artists.map((artist) => artist.name).join(" ");
        const haystack = `${track.title} ${artists} ${track.album_title || ""}`;
        return haystack.toLowerCase().includes(query);
      })
    : all;

  let result: Array<{ track: Track; index: number }>;
  if (sortMode.value === "custom") {
    result = found;
  } else {
    result = [...found];
    result.sort((a, b) => {
      if (sortMode.value === "duration")
        return (a.track.duration_ms || 0) - (b.track.duration_ms || 0);
      const left = sortKey(a.track);
      const right = sortKey(b.track);
      return left.localeCompare(right, "ru");
    });
  }

  if (sortDir.value === "desc") result = [...result].reverse();
  return result;
});

function sortKey(track: Track): string {
  if (sortMode.value === "artist") return artistNames(track.artists) || "";
  if (sortMode.value === "album") return track.album_title || "";
  return track.title || "";
}

const selectedTracks = computed(() =>
  selected.value
    .slice()
    .sort((a, b) => a - b)
    .map((index) => tracks.value[index])
    .filter((track): track is Track => Boolean(track)),
);

const totalLabel = computed(() => {
  const ms = tracks.value.reduce(
    (sum, track) => sum + (track.duration_ms || 0),
    0,
  );
  if (!ms) return "";
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes} мин`;
  return `${Math.floor(minutes / 60)} ч ${minutes % 60} мин`;
});

function playFrom(index: number) {
  if (tracks.value.length) void player.playQueue(tracks.value, index);
}

function shufflePlay() {
  if (!tracks.value.length) return;
  void player.playQueue(tracks.value, 0).then(() => {
    if (!player.shuffle) player.toggleShuffle();
  });
}

function enqueueAll() {
  if (!tracks.value.length) return;
  tracks.value.forEach((track) => player.enqueue(track));
  Notify.create({
    message: `В очередь добавлено: ${tracks.value.length}`,
  });
}

function openPicker() {
  pickerFilter.value = "";
  pickerOpen.value = true;
}

function closePicker() {
  pickerOpen.value = false;
  clearSelection();
}

const selectedRowTracks = computed(() =>
  tracks.value.filter((track) => selectedIds.value.includes(track.id)),
);

const allVisibleSelected = computed(
  () =>
    rows.value.length > 0 &&
    rows.value.every((row) => selectedIds.value.includes(row.track.id)),
);

function isRowSelected(track: Track): boolean {
  return selectedIds.value.includes(track.id);
}

function clearRowSelection() {
  selectedIds.value = [];
}

function toggleRow(track: Track, event?: MouseEvent) {
  const visible = rows.value.map((row) => row.track.id);
  const lastId = lastPicked.value !== null ? String(lastPicked.value) : null;

  if (event?.shiftKey && lastId) {
    const from = visible.indexOf(lastId);
    const to = visible.indexOf(track.id);
    if (from >= 0 && to >= 0) {
      const range = visible.slice(Math.min(from, to), Math.max(from, to) + 1);
      selectedIds.value = [...new Set([...selectedIds.value, ...range])];
      return;
    }
  }

  selectedIds.value = selectedIds.value.includes(track.id)
    ? selectedIds.value.filter((id) => id !== track.id)
    : [...selectedIds.value, track.id];
  lastPicked.value = track.id as unknown as number;
}

function toggleSelectAllRows() {
  selectedIds.value = allVisibleSelected.value
    ? []
    : rows.value.map((row) => row.track.id);
}

function playRowSelection() {
  const list = selectedRowTracks.value;
  if (list.length) void player.playQueue(list, 0);
}

function enqueueRowSelection() {
  const list = selectedRowTracks.value;
  if (!list.length) return;
  list.forEach((track) => player.enqueue(track));
  Notify.create({ message: `В очередь добавлено: ${list.length}` });
}

async function addRowSelectionTo(kind: number | string) {
  const list = selectedRowTracks.value;
  if (!list.length) return;
  await library.addTracksToPlaylist(Number(kind), list);
}

async function downloadRowSelection() {
  await downloadList(selectedRowTracks.value);
}

async function removeRowSelection() {
  const list = selectedRowTracks.value;
  if (!list.length) return;
  const ok = await askConfirm({
    title: "Удалить выбранные треки?",
    message: `Из «${title.value}» будет убрано ${list.length}.`,
    okLabel: "Удалить",
    danger: true,
  });
  if (!ok) return;

  const ids = new Set(list.map((track) => track.id));
  let removed = 0;
  for (let index = tracks.value.length - 1; index >= 0; index -= 1) {
    const track = tracks.value[index];
    if (!track || !ids.has(track.id)) continue;
    if (await library.removeFromPlaylist(kindNumber.value, track, index)) {
      tracks.value.splice(index, 1);
      removed += 1;
    }
  }
  selectedIds.value = [];
  writeCache(`playlist.${props.kind}`, tracks.value);
  Notify.create({ message: `Удалено треков: ${removed}` });
}

function clearSelection() {
  selected.value = [];
  lastPicked.value = null;
}

const pickerRows = computed(() => {
  const query = pickerFilter.value.trim().toLowerCase();
  const all = tracks.value.map((track, index) => ({ track, index }));
  if (!query) return all;
  return all.filter(({ track }) => {
    const artists = artistNames(track.artists);
    return `${track.title} ${artists}`.toLowerCase().includes(query);
  });
});

function selectAllVisible() {
  selected.value = pickerRows.value.map((row) => row.index);
}

function toggleSelect(index: number, event?: MouseEvent) {
  const visible = pickerRows.value.map((row) => row.index);
  if (event?.shiftKey && lastPicked.value !== null) {
    const from = visible.indexOf(lastPicked.value);
    const to = visible.indexOf(index);
    if (from >= 0 && to >= 0) {
      const range = visible.slice(Math.min(from, to), Math.max(from, to) + 1);
      const merged = new Set([...selected.value, ...range]);
      selected.value = [...merged];
      lastPicked.value = index;
      return;
    }
  }
  selected.value = selected.value.includes(index)
    ? selected.value.filter((value) => value !== index)
    : [...selected.value, index];
  lastPicked.value = index;
}

function playSelected() {
  const list = selectedTracks.value;
  if (!list.length) return;
  pickerOpen.value = false;
  void player.playQueue(list, 0);
}

function enqueueSelected() {
  const list = selectedTracks.value;
  if (!list.length) return;
  pickerOpen.value = false;
  list.forEach((track) => player.enqueue(track));
  Notify.create({ message: `В очередь добавлено: ${list.length}` });
}

async function addSelectedTo(kind: number | string) {
  const list = selectedTracks.value;
  if (!list.length) return;
  pickerOpen.value = false;
  let added = 0;
  for (const track of list) {
    if (await library.addToPlaylist(Number(kind), track)) added += 1;
  }
  Notify.create({ message: `Добавлено треков: ${added}` });
}

async function removeSelected() {
  const list = selected.value.slice().sort((a, b) => b - a);
  if (!list.length) return;
  const ok = await askConfirm({
    title: "Удалить выбранные треки?",
    message: `Из «${title.value}» будет убрано ${list.length}.`,
    okLabel: "Удалить",
    danger: true,
  });
  if (!ok) return;

  pickerOpen.value = false;
  let removed = 0;
  for (const index of list) {
    const track = tracks.value[index];
    if (!track) continue;
    if (await library.removeFromPlaylist(kindNumber.value, track, index)) {
      tracks.value.splice(index, 1);
      removed += 1;
    }
  }
  clearSelection();
  writeCache(`playlist.${props.kind}`, tracks.value);
  Notify.create({ message: `Удалено треков: ${removed}` });
}

function safeFolder(name: string): string {
  const cleaned = name
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\.+$/, "");
  return cleaned || "Playlist";
}

function joinPath(base: string, folder: string): string {
  const sep = base.includes("\\") ? "\\" : "/";
  const trimmed = base.replace(/[\\/]+$/, "");
  return `${trimmed}${sep}${folder}`;
}

async function playlistDir(): Promise<string> {
  const base =
    ui.settings.downloadDir.trim() ||
    (await api.defaultDownloadDir().catch(() => ""));
  if (!base) return "";
  return joinPath(base, folderName.value);
}

async function refreshLocal() {
  const dir = await playlistDir();
  if (!dir) {
    localIds.value = new Set();
    return;
  }
  const found = new Set<string>();
  const list = tracks.value.slice();
  for (const track of list) {
    try {
      const path = await api.findLocalTrack(track.id, dir);
      if (path) found.add(track.id);
    } catch {}
  }
  localIds.value = found;
}

function cancelDownload() {
  if (!downloading.value) return;
  cancelRequested.value = true;
  Notify.create({ message: "Отменяю загрузку плейлиста…" });
}

async function downloadList(list: Track[], skipExisting = true) {
  if (!list.length || downloading.value) return;
  const dir = await playlistDir();
  const queue = skipExisting
    ? list.filter((track) => !localIds.value.has(track.id))
    : list;

  if (!queue.length) {
    Notify.create({ message: "Всё это уже скачано" });
    return;
  }

  downloading.value = true;
  cancelRequested.value = false;
  downloadTotal.value = queue.length;
  downloadDone.value = 0;
  let failed = 0;
  let done = 0;

  for (const track of queue) {
    if (cancelRequested.value) break;
    try {
      await api.download(
        track.id,
        `${artistNames(track.artists)} - ${track.title}`,
        "lossless",
        dir || null,
      );
      localIds.value = new Set([...localIds.value, track.id]);
      done += 1;
    } catch {
      failed += 1;
    }
    downloadDone.value += 1;
  }

  const wasCancelled = cancelRequested.value;
  downloading.value = false;
  cancelRequested.value = false;

  if (wasCancelled) {
    Notify.create({
      type: "warning",
      message: `Загрузка отменена. Успел скачать: ${done}`,
    });
    return;
  }

  Notify.create({
    type: failed ? "warning" : "positive",
    message: failed
      ? `Скачано ${done} из ${queue.length}`
      : `Скачано треков: ${done}${dir ? ` → ${folderName.value}` : ""}`,
  });
}

async function downloadAll() {
  if (downloading.value) return;
  if (fullyDownloaded.value) {
    Notify.create({ message: "Плейлист уже скачан целиком" });
    return;
  }
  const left = pendingTracks.value.length;
  const already = tracks.value.length - left;
  const ok = await askConfirm({
    title: "Скачать плейлист?",
    message: already
      ? `Будет скачано ${left} треков в папку «${folderName.value}». Уже на диске: ${already}.`
      : `Будет скачано ${left} треков в папку «${folderName.value}».`,
    okLabel: "Скачать",
  });
  if (ok) await downloadList(tracks.value);
}

async function downloadSelected() {
  const list = selectedTracks.value;
  pickerOpen.value = false;
  await downloadList(list);
}

function playPlaylistWave() {
  const pl = library.playlists.find((p) => String(p.kind) === String(props.kind));
  void player.waveByPlaylist({
    kind: Number(props.kind),
    title: title.value,
    owner_uid: pl?.owner_uid ?? null,
  });
  void router.push("/wave");
}

async function playRecommended() {
  try {
    const list = await api.playlistRecommendations(props.kind);
    if (!list.length) {
      Notify.create({ message: "Яндекс не предложил похожих треков" });
      return;
    }
    await player.playQueue(list, 0);
    Notify.create({ message: `Похожих треков: ${list.length}` });
  } catch {
    Notify.create({ message: "Не удалось получить рекомендации" });
  }
}

function syncMeta(nextTitle?: string) {
  const cached = readCache<Playlist[]>("home.playlists") ?? [];
  const updated = cached.map((playlist) =>
    String(playlist.kind) === String(props.kind) && nextTitle
      ? { ...playlist, title: nextTitle }
      : playlist,
  );
  writeCache("home.playlists", updated);
  const inStore = library.playlists.find(
    (playlist) => String(playlist.kind) === String(props.kind),
  );
  if (inStore && nextTitle) inStore.title = nextTitle;
}

function beginEdit() {
  draftTitle.value = title.value;
  editing.value = true;
  void nextTick(() => {
    const input = titleInput.value;
    if (!input) return;
    input.focus();
    input.select();
  });
}

function cancelTitle() {
  editing.value = false;
  draftTitle.value = title.value;
}

async function commitTitle() {
  if (!editing.value) return;
  editing.value = false;
  const next = draftTitle.value.trim();
  if (!next || next === title.value) return;
  if (await library.renamePlaylist(kindNumber.value, next)) {
    title.value = next;
    syncMeta(next);
  }
}

function setPublic(isPublic: boolean) {
  void library.setPlaylistPublic(kindNumber.value, isPublic);
}

async function clearTracks() {
  const ok = await askConfirm({
    title: "Очистить плейлист?",
    message: `Из «${title.value}» будут убраны все треки.`,
    okLabel: "Очистить",
    danger: true,
  });
  if (!ok) return;
  if (await library.clearPlaylist(kindNumber.value)) {
    tracks.value = [];
    clearSelection();
    writeCache(`playlist.${props.kind}`, []);
  }
}

async function removePlaylist() {
  const ok = await askConfirm({
    title: "Удалить плейлист?",
    message: `«${title.value}» будет удалён безвозвратно.`,
    okLabel: "Удалить",
    danger: true,
  });
  if (!ok) return;
  if (await library.deletePlaylist(kindNumber.value)) {
    void router.push("/playlists");
  }
}

async function removeAt(index: number) {
  const track = tracks.value[index];
  if (!track) return;
  const ok = await library.removeFromPlaylist(kindNumber.value, track, index);
  if (ok) {
    tracks.value.splice(index, 1);
    clearSelection();
  }
}

function startReorder(index: number, event: PointerEvent) {
  if (event.button !== 0) return;
  if (!canReorder.value) {
    Notify.create({
      message: "Сбрось поиск и сортировку, чтобы менять порядок",
    });
    return;
  }
  dragFrom.value = index;
  dragOver.value = index;
  document.body.classList.add("track-reordering");
  window.addEventListener("pointermove", trackPointer, { passive: false });
  window.addEventListener("pointerup", finishReorder, { once: true });
  window.addEventListener("pointercancel", cancelReorder, { once: true });
}

function trackPointer(event: PointerEvent) {
  if (dragFrom.value === null) return;
  event.preventDefault();
  const element = document.elementFromPoint(event.clientX, event.clientY);
  const row = element?.closest<HTMLElement>("[data-track-index]");
  const index = Number(row?.dataset.trackIndex);
  if (Number.isInteger(index) && index >= 0 && index < tracks.value.length) {
    dragOver.value = index;
  }
  const area = document.querySelector<HTMLElement>("[data-track-scroll]");
  if (!area) return;
  const bounds = area.getBoundingClientRect();
  if (event.clientY < bounds.top + 48) area.scrollTop -= 18;
  if (event.clientY > bounds.bottom - 48) area.scrollTop += 18;
}

async function finishReorder() {
  const from = dragFrom.value;
  const to = dragOver.value;
  clearReorder();
  if (from === null || to === null || from === to) return;
  const track = tracks.value[from];
  if (!track) return;
  const next = [...tracks.value];
  next.splice(from, 1);
  next.splice(to, 0, track);
  tracks.value = next;
  const ok = await library.moveInPlaylist(kindNumber.value, track, from, to);
  if (!ok) await load();
}

function cancelReorder() {
  clearReorder();
}

function clearReorder() {
  dragFrom.value = null;
  dragOver.value = null;
  document.body.classList.remove("track-reordering");
  window.removeEventListener("pointermove", trackPointer);
  window.removeEventListener("pointerup", finishReorder);
  window.removeEventListener("pointercancel", cancelReorder);
}

function onTracksScroll(event: Event) {
  const target = event.target as HTMLElement | null;
  if (!target) return;
  const top = target.scrollTop;
  headerCollapsed.value = top > HERO_COLLAPSE_AT;
  const height = toolsRef.value?.offsetHeight ?? 0;
  toolsOffset.value = Math.min(Math.max(top - HERO_COLLAPSE_AT, 0), height);
}

function jumpToTrack(id: string) {
  const at = rows.value.findIndex((row) => row.track.id === id);
  if (at < 0) return;
  void nextTick(() => {
    virtualRef.value?.scrollTo(at, "start");
    headerCollapsed.value = true;
  });
}

function applyMeta(list: Track[]) {
  const all = readCache<Playlist[]>("home.playlists") ?? [];
  const meta = all.find(
    (playlist) => String(playlist.kind) === String(props.kind),
  );
  title.value = meta?.title || title.value || "Плейлист";
  cover.value = meta?.cover_url || list[0]?.cover_url || null;
}

async function load() {
  const key = `playlist.${props.kind}`;
  const cached = readCache<Track[]>(key) ?? [];
  tracks.value = cached;
  filter.value = "";
  headerCollapsed.value = false;
  editing.value = false;
  closePicker();
  applyMeta(cached);
  loading.value = !cached.length;

  void swr<Playlist[]>("home.playlists", () => api.playlists(), {
    onData: () => applyMeta(tracks.value),
  });

  await swr<Track[]>(key, () => api.playlistTracks(props.kind), {
    onData: (list) => {
      tracks.value = list;
      applyMeta(list);
    },
    onSettled: () => {
      loading.value = false;
      void refreshLocal();
      const target = route.query.track;
      if (target) void nextTick(() => jumpToTrack(String(target)));
    },
  });
}

watch(() => props.kind, load);
onMounted(load);
onBeforeUnmount(clearReorder);
</script>
