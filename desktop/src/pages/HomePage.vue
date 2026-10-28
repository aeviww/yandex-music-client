<template>
  <q-page
    class="h-[calc(100vh-52px-var(--player-height,78px))] !min-h-0 !overflow-hidden"
  >
    <q-scroll-area class="h-full w-full overscroll-contain">
      <div class="min-w-0 pb-[56px]">
        <div
          class="mx-auto w-full max-w-[1240px] px-[var(--page-padding,40px)]"
        >
          <header
            class="flex flex-wrap items-end justify-between gap-y-[20px] gap-x-[36px] border-b border-[var(--line)] pt-[10px] px-0 pb-[28px] max-[720px]:items-start max-[720px]:pb-[24px]"
          >
            <div class="min-w-0">
              <h1
                class="m-0 text-[clamp(32px,_3.8vw,_48px)] font-semibold leading-[1.05] tracking-[-0.05em] max-[720px]:text-[clamp(30px,_7vw,_40px)]"
              >
                {{ greeting
                }}<template v-if="userName">, {{ userName }}</template>
              </h1>
              <p
                class="mt-[10px] mx-0 mb-0 text-[14px] leading-[1.5] text-[color:var(--fg-dim)]"
              >
                ваша музыка на сегодня
              </p>
            </div>

            <div class="flex flex-wrap gap-[10px] pb-[3px] max-[720px]:pb-0">
              <button :class="quickPrimary" type="button" @click="openWave">
                <Icon name="mingcute:wave-line" :size="16" class="flex-none" />
                <span>Моя волна</span>
              </button>
              <button
                :class="quickGhost"
                type="button"
                @click="router.push('/playlists')"
              >
                <Icon
                  name="mingcute:book-2-line"
                  :size="15"
                  class="flex-none"
                />
                <span>Коллекция</span>
              </button>
              <button
                :class="quickGhost"
                type="button"
                @click="router.push('/search')"
              >
                <Icon
                  name="mingcute:search-2-line"
                  :size="15"
                  class="flex-none"
                />
                <span>Поиск</span>
              </button>
            </div>
          </header>

          <template v-if="visiblePlaylists.length">
            <div
              class="flex items-baseline justify-between mt-[38px] mx-0 mb-[14px] gap-[12px] max-[720px]:mt-[34px]"
            >
              <h2
                class="m-0 text-[clamp(18px,_1.6vw,_21px)] font-semibold leading-[1.15] tracking-[-0.03em]"
              >
                для тебя
              </h2>
              <button
                class="inline-flex items-center p-0 border-0 bg-transparent text-[color:var(--fg-dim)] cursor-pointer text-[13px] gap-[4px] whitespace-nowrap appearance-none transition-colors hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.6]"
                type="button"
                @click="router.push('/playlists')"
              >
                <span>смотреть всё</span>
                <Icon name="mingcute:arrow-right-line" :size="13" />
              </button>
            </div>

            <div :class="[strip, colsLg]">
              <div
                v-for="pl in visiblePlaylists"
                :key="pl.kind"
                class="group relative min-w-0 rounded-[14px] p-[8px] cursor-pointer transition-[background] duration-[160ms] ease-[ease] hover:bg-[var(--surface)]"
                @click="router.push(`/playlists/${pl.kind}`)"
              >
                <div
                  class="cover relative aspect-square w-full rounded-[12px] overflow-hidden bg-[var(--surface-2)] flex items-center justify-center flex-none [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_img]:block"
                >
                  <img
                    v-if="pl.cover_url"
                    loading="lazy"
                    decoding="async"
                    :src="pl.cover_url"
                  />
                  <Icon
                    v-else
                    name="mingcute:playlist-2-line"
                    :size="24"
                    class="text-[color:var(--fg-faint)]"
                  />

                  <button
                    :class="fab"
                    type="button"
                    title="Слушать"
                    @click.stop="playPlaylist(pl)"
                  >
                    <Icon name="mingcute:play-fill" :size="15" />
                  </button>

                  <span
                    v-if="library.isPinned(pl.kind)"
                    class="absolute left-[10px] top-[10px] flex h-[24px] w-[24px] items-center justify-center rounded-full bg-black/55 text-[color:var(--fg)]"
                    title="Закреплён в боковой панели"
                  >
                    <Icon name="mingcute:pin-2-line" :size="11" />
                  </span>
                </div>

                <div
                  class="mt-[9px] text-[14.5px] font-semibold leading-[1.35] tracking-[-0.015em] truncate"
                >
                  {{ pl.title }}
                </div>
                <div
                  class="mt-[3px] text-[12px] leading-[1.45] text-[color:var(--fg-faint)] truncate"
                >
                  {{ plural(pl.track_count, "трек", "трека", "треков") }}
                </div>

                <q-menu
                  context-menu
                  touch-position
                  class="!rounded-[12px] !border !border-[color:rgba(255,255,255,0.09)] !bg-[#141414] shadow-[0_16px_40px_rgba(0,0,0,0.55)] backdrop-blur-[18px] overflow-x-hidden max-w-[268px]"
                >
                  <div
                    class="p-[4px] min-w-[178px] max-w-[260px] overflow-x-hidden"
                    style="min-width: 216px"
                  >
                    <div
                      class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap transition-[background,color] duration-100 hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:var(--fg)] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis"
                      v-close-popup
                      @click="playPlaylist(pl)"
                    >
                      <Icon name="mingcute:play-fill" :size="17" />
                      <span>Слушать</span>
                    </div>
                    <div
                      class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap transition-[background,color] duration-100 hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:var(--fg)] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis"
                      v-close-popup
                      @click="router.push(`/playlists/${pl.kind}`)"
                    >
                      <Icon name="mingcute:playlist-2-line" :size="17" />
                      <span>Открыть плейлист</span>
                    </div>
                    <div
                      class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap transition-[background,color] duration-100 hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:var(--fg)] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis"
                      v-close-popup
                      @click="library.togglePin(pl.kind)"
                    >
                      <Icon
                        :name="
                          library.isPinned(pl.kind)
                            ? 'gravity-ui:pin-slash'
                            : 'mingcute:pin-2-line'
                        "
                        :size="17"
                      />
                      <span>{{
                        library.isPinned(pl.kind) ? "Открепить" : "Закрепить"
                      }}</span>
                    </div>

                    <div class="h-[1px] mx-[6px] my-[4px] bg-[var(--line)]" />

                    <div
                      class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap transition-[background,color] duration-100 hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:var(--fg)] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis"
                      v-close-popup
                      @click="rename(pl)"
                    >
                      <Icon name="mingcute:pencil-line" :size="17" />
                      <span>Переименовать</span>
                    </div>
                    <div
                      class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap transition-[background,color] duration-100 hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:var(--fg)] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis"
                      v-close-popup
                      @click="library.setPlaylistPublic(pl.kind, true)"
                    >
                      <Icon name="mingcute:share-2-line" :size="17" />
                      <span>Сделать публичным</span>
                    </div>
                    <div
                      class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap transition-[background,color] duration-100 hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:var(--fg)] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis"
                      v-close-popup
                      @click="library.setPlaylistPublic(pl.kind, false)"
                    >
                      <Icon name="mingcute:user-2-line" :size="17" />
                      <span>Сделать личным</span>
                    </div>

                    <div class="h-[1px] mx-[6px] my-[4px] bg-[var(--line)]" />

                    <div
                      class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap transition-[background,color] duration-100 hover:bg-[var(--hover)] hover:text-[color:#f87171] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:#f87171] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis"
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
          </template>

          <div
            class="flex items-baseline justify-between mt-[38px] mx-0 mb-[14px] gap-[12px] max-[720px]:mt-[34px]"
          >
            <h2
              class="m-0 text-[clamp(18px,_1.6vw,_21px)] font-semibold leading-[1.15] tracking-[-0.03em]"
            >
              недавно прослушанные
            </h2>
          </div>

          <div :class="[strip, colsMd]">
            <template v-if="recent.length">
              <div
                v-for="r in recent"
                :key="r.id"
                class="group relative min-w-0 rounded-[14px] p-[8px] cursor-pointer transition-[background] duration-[160ms] ease-[ease] hover:bg-[var(--surface)]"
                @click="openRecent(r)"
              >
                <div
                  class="cover relative aspect-square w-full rounded-[12px] overflow-hidden bg-[var(--surface-2)] flex items-center justify-center flex-none [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_img]:block"
                >
                  <img
                    v-if="r.cover_url"
                    loading="lazy"
                    decoding="async"
                    :src="r.cover_url"
                  />
                  <Icon
                    v-else
                    name="mingcute:album-line"
                    :size="22"
                    class="text-[color:var(--fg-faint)]"
                  />

                  <button
                    :class="fab"
                    type="button"
                    title="Слушать"
                    @click.stop="playRecent(r)"
                  >
                    <Icon name="mingcute:play-fill" :size="15" />
                  </button>
                </div>
                <div
                  class="mt-[9px] text-[14.5px] font-semibold leading-[1.35] tracking-[-0.015em] truncate"
                >
                  {{ r.title }}
                </div>
                <div
                  class="mt-[3px] text-[12px] leading-[1.45] text-[color:var(--fg-faint)] truncate"
                >
                  {{ r.subtitle }}
                </div>
              </div>
            </template>

            <template v-else>
              <div
                class="col-span-full py-[28px] text-[13.5px] text-[color:var(--fg-faint)]"
              >
                тут появится то, что послушаешь
              </div>
            </template>
          </div>

          <div
            class="flex items-baseline justify-between mt-[38px] mx-0 mb-[14px] gap-[12px] max-[720px]:mt-[34px]"
          >
            <h2
              class="m-0 text-[clamp(18px,_1.6vw,_21px)] font-semibold leading-[1.15] tracking-[-0.03em]"
            >
              новые релизы
            </h2>
          </div>

          <div :class="[strip, colsSm]">
            <template v-if="releases.length">
              <div
                v-for="a in releases"
                :key="a.id"
                class="group relative min-w-0 rounded-[14px] p-[8px] cursor-pointer transition-[background] duration-[160ms] ease-[ease] hover:bg-[var(--surface)]"
                @click="router.push(`/album/${a.id}`)"
              >
                <div
                  class="cover relative aspect-square w-full rounded-[12px] overflow-hidden bg-[var(--surface-2)] flex items-center justify-center flex-none [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_img]:block"
                >
                  <img
                    v-if="a.cover_url"
                    loading="lazy"
                    decoding="async"
                    :src="a.cover_url"
                  />
                  <Icon
                    v-else
                    name="mingcute:album-line"
                    :size="22"
                    class="text-[color:var(--fg-faint)]"
                  />

                  <button
                    :class="fab"
                    type="button"
                    title="Слушать"
                    @click.stop="playAlbum(a.id)"
                  >
                    <Icon name="mingcute:play-fill" :size="15" />
                  </button>
                </div>
                <div
                  class="mt-[9px] text-[14.5px] font-semibold leading-[1.35] tracking-[-0.015em] truncate"
                >
                  {{ a.title }}
                </div>
                <div
                  class="mt-[3px] text-[12px] leading-[1.45] text-[color:var(--fg-faint)] truncate"
                >
                  {{ a.artist || a.year || "" }}
                </div>
              </div>
            </template>

            <template v-else>
              <div v-for="n in 12" :key="n" class="min-w-0">
                <div
                  class="relative aspect-square w-full overflow-hidden rounded-[10px] bg-[var(--surface)]"
                />
                <div
                  class="mt-[10px] h-[11px] w-[70%] rounded bg-[var(--surface)]"
                />
                <div
                  class="mt-[6px] h-[9px] w-[45%] rounded bg-[var(--surface)]"
                />
              </div>
            </template>
          </div>

          <template v-if="picks.length">
            <div
              class="flex items-baseline justify-between mt-[38px] mx-0 mb-[14px] gap-[12px] max-[720px]:mt-[34px]"
            >
              <h2
                class="m-0 text-[clamp(18px,_1.6vw,_21px)] font-semibold leading-[1.15] tracking-[-0.03em]"
              >
                новое для тебя
              </h2>
            </div>

            <div :class="[strip, colsSm]">
              <div
                v-for="p in picks"
                :key="`${p.kind}-${p.id}`"
                class="group relative min-w-0 rounded-[14px] p-[8px] cursor-pointer transition-[background] duration-[160ms] ease-[ease] hover:bg-[var(--surface)]"
                @click="openPick(p)"
              >
                <div
                  class="cover relative aspect-square w-full overflow-hidden bg-[var(--surface-2)] flex items-center justify-center flex-none [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_img]:block"
                  :class="
                    p.kind === 'artist' ? 'rounded-full' : 'rounded-[12px]'
                  "
                  :style="p.color ? { background: p.color } : {}"
                >
                  <img
                    v-if="p.cover_url"
                    loading="lazy"
                    decoding="async"
                    :src="p.cover_url"
                  />
                  <Icon
                    v-else
                    :name="
                      p.kind === 'artist'
                        ? 'mingcute:user-2-line'
                        : 'mingcute:album-line'
                    "
                    :size="22"
                    class="text-[color:var(--fg-faint)]"
                  />

                  <button
                    :class="fab"
                    type="button"
                    title="Слушать"
                    @click.stop="playPick(p)"
                  >
                    <Icon name="mingcute:play-fill" :size="15" />
                  </button>
                </div>

                <div
                  class="mt-[9px] text-[14.5px] font-semibold leading-[1.35] tracking-[-0.015em] truncate"
                >
                  {{ p.name }}
                </div>
                <div
                  class="mt-[3px] text-[12px] leading-[1.45] text-[color:var(--fg-faint)] truncate"
                >
                  {{
                    p.artists.length ? artistNames(p.artists) : p.description
                  }}
                </div>

                <q-menu
                  context-menu
                  touch-position
                  class="!rounded-[12px] !border !border-[color:rgba(255,255,255,0.09)] !bg-[#141414] shadow-[0_16px_40px_rgba(0,0,0,0.55)] backdrop-blur-[18px] overflow-x-hidden max-w-[268px]"
                >
                  <div
                    class="p-[4px] min-w-[178px] max-w-[260px] overflow-x-hidden"
                    style="min-width: 212px"
                  >
                    <div
                      class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap transition-[background,color] duration-100 hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:var(--fg)] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis"
                      v-close-popup
                      @click="playPick(p)"
                    >
                      <Icon name="mingcute:play-fill" :size="17" />
                      <span>Слушать</span>
                    </div>
                    <div
                      class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap transition-[background,color] duration-100 hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:var(--fg)] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis"
                      v-close-popup
                      @click="openPick(p)"
                    >
                      <Icon
                        :name="
                          p.kind === 'artist'
                            ? 'mingcute:mic-line'
                            : 'mingcute:album-line'
                        "
                        :size="17"
                      />
                      <span>{{
                        p.kind === "artist"
                          ? "Открыть артиста"
                          : "Открыть альбом"
                      }}</span>
                    </div>
                    <div
                      class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap transition-[background,color] duration-100 hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:var(--fg)] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis"
                      v-close-popup
                      @click="waveFrom(p)"
                    >
                      <Icon name="mingcute:wave-line" :size="17" />
                      <span>Волна по этому</span>
                    </div>
                  </div>
                </q-menu>
              </div>
            </div>
          </template>

          <template v-if="waves.length">
            <div
              class="flex items-baseline justify-between mt-[38px] mx-0 mb-[14px] gap-[12px] max-[720px]:mt-[34px]"
            >
              <h2
                class="m-0 text-[clamp(18px,_1.6vw,_21px)] font-semibold leading-[1.15] tracking-[-0.03em]"
              >
                миксы для тебя
              </h2>
              <button
                class="inline-flex items-center p-0 border-0 bg-transparent text-[color:var(--fg-dim)] cursor-pointer text-[13px] gap-[4px] whitespace-nowrap appearance-none transition-colors hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.6]"
                type="button"
                @click="router.push('/wave')"
              >
                <span>смотреть всё</span>
                <Icon name="mingcute:arrow-right-line" :size="13" />
              </button>
            </div>

            <div :class="[strip, colsMd]">
              <div
                v-for="w in waves"
                :key="w.id"
                class="group relative min-w-0 rounded-[14px] p-[8px] cursor-pointer transition-[background] duration-[160ms] ease-[ease] hover:bg-[var(--surface)]"
                @click="playWave(w)"
              >
                <div
                  class="cover cover-round relative aspect-square w-full rounded-full overflow-hidden bg-[var(--surface-2)] flex items-center justify-center flex-none [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_img]:block"
                  :style="w.color ? { background: w.color } : {}"
                >
                  <img
                    v-if="w.cover_url"
                    loading="lazy"
                    decoding="async"
                    :src="w.cover_url"
                  />
                  <Icon
                    v-else
                    name="mingcute:wave-line"
                    :size="20"
                    class="text-[color:var(--fg-faint)]"
                  />

                  <span :class="fab" title="Запустить">
                    <Icon name="mingcute:play-fill" :size="15" />
                  </span>
                </div>

                <div
                  class="mt-[9px] text-[14.5px] font-semibold leading-[1.35] tracking-[-0.015em] overflow-hidden [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]"
                >
                  {{ w.name }}
                </div>
                <div
                  class="mt-[3px] text-[12px] leading-[1.45] text-[color:var(--fg-faint)] truncate"
                >
                  {{ w.description }}
                </div>

                <q-menu
                  context-menu
                  touch-position
                  class="!rounded-[12px] !border !border-[color:rgba(255,255,255,0.09)] !bg-[#141414] shadow-[0_16px_40px_rgba(0,0,0,0.55)] backdrop-blur-[18px] overflow-x-hidden max-w-[268px]"
                >
                  <div
                    class="p-[4px] min-w-[178px] max-w-[260px] overflow-x-hidden"
                    style="min-width: 200px"
                  >
                    <div
                      class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap transition-[background,color] duration-100 hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:var(--fg)] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis"
                      v-close-popup
                      @click="playWave(w)"
                    >
                      <Icon name="mingcute:play-fill" :size="17" />
                      <span>Запустить волну</span>
                    </div>
                    <div
                      class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap transition-[background,color] duration-100 hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:var(--fg)] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis"
                      v-close-popup
                      @click="router.push('/wave')"
                    >
                      <Icon name="mingcute:wave-line" :size="17" />
                      <span>Открыть страницу волны</span>
                    </div>
                  </div>
                </q-menu>
              </div>
            </div>
          </template>

          <template v-if="neuroItems.length">
            <div
              class="flex items-baseline justify-between mt-[38px] mx-0 mb-[14px] gap-[12px] max-[720px]:mt-[34px]"
            >
              <h2
                class="m-0 text-[clamp(18px,_1.6vw,_21px)] font-semibold leading-[1.15] tracking-[-0.03em]"
              >
                нейромузыка
              </h2>
            </div>
            <p class="mb-0 mt-[-6px] text-[12px] text-[color:var(--fg-faint)]">
              отвлечёт от шума и сфокусирует на важном
            </p>

            <div :class="[strip, colsMd]" class="mt-[16px]">
              <div
                v-for="n in neuroItems"
                :key="n.id"
                class="group relative min-w-0 rounded-[14px] p-[8px] cursor-pointer transition-[background] duration-[160ms] ease-[ease] hover:bg-[var(--surface)]"
                @click="playNeuro(n)"
              >
                <div
                  class="cover relative aspect-square w-full rounded-[12px] overflow-hidden bg-[var(--surface-2)] flex items-center justify-center flex-none [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_img]:block"
                  :style="n.color ? { background: n.color } : {}"
                >
                  <img
                    v-if="n.cover_url"
                    loading="lazy"
                    decoding="async"
                    :src="n.cover_url"
                  />
                  <Icon
                    v-else
                    name="mingcute:wave-line"
                    :size="20"
                    class="text-[color:var(--fg-faint)]"
                  />

                  <span :class="fab" title="Слушать">
                    <Icon
                      :name="
                        neuro.item?.id === n.id && neuro.playing
                          ? 'mingcute:pause-fill'
                          : 'mingcute:play-fill'
                      "
                      :size="15"
                    />
                  </span>
                </div>
                <div
                  class="mt-[9px] text-[14.5px] font-semibold leading-[1.35] tracking-[-0.015em] truncate"
                >
                  {{ n.title }}
                </div>
                <div
                  class="mt-[3px] text-[12px] leading-[1.45] text-[color:var(--fg-faint)] truncate"
                >
                  нейромузыка
                </div>
              </div>
            </div>
          </template>

          <div v-if="loading" class="mt-8">
            <q-spinner size="20px" color="primary" />
          </div>

          <footer
            class="mt-9 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-[var(--line)] pb-7 pt-4 text-[11.5px] leading-relaxed text-[color:var(--fg-faint)]"
          >
            <span
              class="font-semibold text-[color:var(--fg-dim)]"
              :title="commitTitle"
              >mashiro{{ commit ? ` · ${commit}` : "" }}</span
            >
            <span>неофициальный десктоп-клиент Я.Музыки</span>
            <a
              class="cursor-pointer transition-colors hover:text-[color:var(--fg-dim)]"
              title="Открыть GitHub автора"
              @click.prevent="openAboutLink(AUTHOR_URL)"
              >автор: aeviww</a
            >
            <a
              class="cursor-pointer transition-colors hover:text-[color:var(--fg-dim)]"
              title="Лицензия проекта"
              @click.prevent="openAboutLink(LICENSE_URL)"
              >GPL-3.0</a
            >
            <span
              class="text-[color:color-mix(in_srgb,var(--fg-faint)_70%,transparent)]"
              >ООО «Яндекс» к проекту отношения не имеет</span
            >
          </footer>
        </div>
      </div>
    </q-scroll-area>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Notify } from "quasar";
import { api } from "@/api/client";
import type {
  AlbumBrief,
  NeuroItem,
  Playlist,
  Track,
  WheelItem,
} from "@/api/types";
import { artistNames, plural } from "@/lib/format";
import { askConfirm, askText } from "@/lib/dialogs";
import { readCache, swr, writeCache } from "@/lib/cache";
import { neuro, startNeuro } from "@/lib/neuro";
import { useLibraryStore } from "@/stores/library";
import { usePlayerStore } from "@/stores/player/index";
import { useStatsStore } from "@/stores/stats";

interface RecentItem {
  id: string;
  title: string;
  subtitle: string;
  cover_url?: string | null;
  albumId: string | null;
  artistId: string;
}

const router = useRouter();
const player = usePlayerStore();
const library = useLibraryStore();
const stats = useStatsStore();
const playlists = ref<Playlist[]>([]);
const wheel = ref<WheelItem[]>([]);
const releases = ref<AlbumBrief[]>([]);
const neuroItems = ref<NeuroItem[]>([]);
const loading = ref(false);

const userName = ref("");

const recent = computed<RecentItem[]>(() => {
  const seen = new Set<string>();
  const out: RecentItem[] = [];
  for (let i = stats.events.length - 1; i >= 0 && out.length < 14; i--) {
    const e = stats.events[i];
    if (e.seconds < 20 || seen.has(e.id)) continue;
    seen.add(e.id);
    out.push({
      id: e.id,
      title: e.title,
      subtitle: e.artist,
      cover_url: e.cover,
      albumId: e.albumId ?? null,
      artistId: e.artistId,
    });
  }
  return out;
});

async function openRecent(item: RecentItem) {
  const to = item.albumId
    ? `/album/${item.albumId}`
    : item.artistId
      ? `/artist/${item.artistId}`
      : "";
  if (to) void router.push(to);
}

async function playRecent(item: RecentItem) {
  try {
    const track = await api.track(item.id);
    await player.playQueue([track], 0);
  } catch {
    Notify.create({ message: "Не удалось загрузить трек" });
  }
}

const hiddenWaves = ["встряхнуть", "назад к привычному"];

const strip =
  "grid grid-rows-[auto] auto-rows-[0px] gap-x-[18px] gap-y-0 overflow-hidden";
const colsLg = "grid-cols-[repeat(auto-fill,minmax(190px,1fr))]";
const colsMd = "grid-cols-[repeat(auto-fill,minmax(160px,1fr))]";
const colsSm = "grid-cols-[repeat(auto-fill,minmax(144px,1fr))]";
const quickPrimary =
  "flex h-10 flex-nowrap items-center gap-[9px] rounded-[10px] border-0 bg-[var(--accent)] px-4 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";
const quickGhost =
  "flex h-10 flex-nowrap items-center gap-[9px] rounded-[10px] border border-[var(--line)] px-4 text-[13px] font-medium text-[color:var(--fg-dim)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fg)]";

const fab =
  "absolute bottom-[10px] right-[10px] flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full border-0 bg-[var(--accent)] p-0 text-white opacity-0 translate-y-[6px] transition-[opacity,transform] duration-[140ms] ease-[ease] group-hover:opacity-100 group-hover:translate-y-0";

const visiblePlaylists = computed(() =>
  playlists.value.filter((pl) => !library.isHidden(pl.kind)),
);

const waves = computed(() =>
  wheel.value.filter((item) => {
    if (item.kind !== "wave") return false;
    const name = (item.name ?? "").toLowerCase();
    return !hiddenWaves.some((h) => name.includes(h));
  }),
);
const picks = computed(() =>
  wheel.value.filter((item) => item.kind !== "wave"),
);

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 6) return "доброй ночи";
  if (hour < 12) return "доброе утро";
  if (hour < 18) return "добрый день";
  return "добрый вечер";
});

async function playPlaylist(pl: Playlist) {
  try {
    const tracks =
      readCache<Track[]>(`playlist.${pl.kind}`) ??
      (await api.playlistTracks(pl.kind));
    if (!tracks.length) {
      Notify.create({ message: "Плейлист пуст" });
      return;
    }
    await player.playQueue(tracks, 0);
  } catch {
    Notify.create({ message: "Не удалось загрузить плейлист" });
  }
}

async function playPick(item: WheelItem) {
  if (item.kind === "album") {
    try {
      const album = await api.album(item.id);
      if (!album.tracks.length) {
        Notify.create({ message: "В альбоме нет доступных треков" });
        return;
      }
      await player.playQueue(album.tracks, 0);
    } catch {
      Notify.create({ message: "Не удалось загрузить альбом" });
    }
    return;
  }
  waveFrom(item);
}

function openWave() {
  void player.startWave(undefined, "Моя волна");
  void router.push("/wave");
}

function waveFrom(item: WheelItem) {
  const station =
    item.kind === "artist" ? `artist:${item.id}` : `album:${item.id}`;
  void player.startWave(station, item.name);
  void router.push("/wave");
}

function playWave(item: WheelItem) {
  void player.startWave(item.station || item.id, item.name);
  void router.push("/wave");
}

function openPick(item: WheelItem) {
  if (item.kind === "album") void router.push(`/album/${item.id}`);
  else if (item.kind === "artist") void router.push(`/artist/${item.id}`);
}

function syncCache() {
  writeCache("home.playlists", playlists.value);
}

async function rename(pl: Playlist) {
  const next = await askText({
    title: "Переименовать плейлист",
    value: pl.title,
    placeholder: "Название плейлиста",
  });
  if (!next || next === pl.title) return;
  if (await library.renamePlaylist(pl.kind, next)) {
    pl.title = next;
    syncCache();
  }
}

async function removePlaylist(pl: Playlist) {
  const ok = await askConfirm({
    title: "Удалить плейлист?",
    message: `«${pl.title}» исчезнет из Яндекс Музыки.`,
    okLabel: "Удалить",
    danger: true,
  });
  if (!ok) return;
  if (await library.deletePlaylist(pl.kind)) {
    playlists.value = playlists.value.filter((item) => item.kind !== pl.kind);
    syncCache();
  }
}

onMounted(() => {
  playlists.value = readCache<Playlist[]>("home.playlists") ?? [];
  wheel.value = readCache<WheelItem[]>("home.wheel") ?? [];
  releases.value = readCache<AlbumBrief[]>("home.newReleases.v2") ?? [];
  loading.value = !playlists.value.length && !wheel.value.length;

  void swr<Playlist[]>("home.playlists", () => api.playlists(), {
    onData: (data) => {
      playlists.value = data;
    },
    onSettled: () => {
      loading.value = false;
    },
  });

  void swr<WheelItem[]>("home.wheel", () => api.wheel(), {
    onData: (data) => {
      wheel.value = data;
    },
    onSettled: () => {
      loading.value = false;
    },
  });

  void swr<AlbumBrief[]>("home.newReleases.v2", () => api.newReleases(), {
    onData: (data) => {
      releases.value = data;
    },
  });

  neuroItems.value = readCache<NeuroItem[]>("home.neuro") ?? [];
  void swr<NeuroItem[]>("home.neuro", () => api.neuroItems(), {
    onData: (data) => {
      neuroItems.value = data;
    },
  });
});

function playNeuro(item: NeuroItem) {
  if (neuro.item?.id === item.id && neuro.playing) {
    Notify.create({ message: "Уже играет: " + item.title });
    return;
  }
  void startNeuro(item);
}

const AUTHOR_URL = "https://github.com/aeviww";
const LICENSE_URL = "https://www.gnu.org/licenses/gpl-3.0.html";

const commit = typeof __APP_COMMIT__ === "string" ? __APP_COMMIT__ : "local";
const commitTitle = `сборка от коммита ${__APP_COMMIT__} · ${__APP_COMMIT_DATE__}`;

function openAboutLink(url: string) {
  void api.openExternal(url);
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
</script>
