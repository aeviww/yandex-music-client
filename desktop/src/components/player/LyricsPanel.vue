<template>
  <div
    v-if="player.showLyrics"
    ref="root"
    class="fixed flex flex-col overflow-hidden isolate bg-[#07070a] text-[color:#fff]"
    :class="
      player.lyricsFullscreen
        ? 'inset-0 z-[2700] rounded-none lyrics-fs-anim'
        : 'z-[2500]'
    "
    :style="visualStyle"
  >
    <div
      v-if="s.backdrop === 'cover' && coverUrl"
      class="absolute z-[-3] inset-[calc(var(--lyrics-bg-blur)_*_-1.8)] opacity-[var(--lyrics-bg-opacity)] bg-center bg-cover [filter:blur(var(--lyrics-bg-blur))_saturate(1.35)] [transform:scale(1.08)] transition-[filter,opacity] duration-[500ms] ease-[ease]"
      :style="{ backgroundImage: `url(${coverUrl})` }"
    />
    <div
      v-else-if="s.backdrop === 'gradient'"
      class="absolute z-[-3] inset-0 opacity-[var(--lyrics-bg-opacity)] [background:radial-gradient(120%_90%_at_12%_0%,color-mix(in_srgb,var(--accent)_55%,transparent),transparent_62%),radial-gradient(110%_80%_at_100%_100%,color-mix(in_srgb,var(--accent)_32%,transparent),transparent_58%)]"
    />
    <div
      class="absolute z-[-2] inset-0 [background:linear-gradient(180deg,rgba(6,6,8,0.72)_0%,rgba(6,6,8,0.42)_26%,rgba(6,6,8,0.46)_74%,rgba(6,6,8,0.78)_100%)] [box-shadow:inset_0_0_220px_rgba(0,0,0,0.6)]"
    />
    <canvas
      v-if="ambientOn"
      ref="vizCanvas"
      class="absolute z-[0] inset-[auto_0_0] w-full h-[34vh] pointer-events-none opacity-[0.4] [-webkit-mask-image:linear-gradient(to_top,#000_0%,transparent_100%)] [mask-image:linear-gradient(to_top,#000_0%,transparent_100%)]"
    />

    <div
      class="relative z-[3] grid items-center flex-none gap-[14px] h-[62px] pt-0 pr-[16px] pb-0 pl-[18px] [grid-template-columns:minmax(0,1fr)_auto_minmax(0,1fr)]"
      @mousedown="onHeadDrag"
    >
      <div class="flex items-center min-w-0 gap-[10px]">
        <div
          class="cover w-[36px] h-[36px] flex-none rounded-[7px] [box-shadow:0_6px_18px_rgba(0,0,0,0.32)] overflow-hidden bg-[var(--surface-2)] flex items-center justify-center [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block"
        >
          <img
            v-if="coverUrl"
            loading="lazy"
            decoding="async"
            :src="coverUrl"
          />
          <Icon
            v-else
            name="mingcute:music-line"
            :size="16"
            class="text-[color:var(--fg-faint)]"
          />
        </div>
        <div style="min-width: 0">
          <div
            class="truncate text-[calc(13px*var(--text-scale,1))] font-semibold cursor-pointer hover:text-[color:#fff] hover:underline"
            data-no-drag
            @click="openAlbum"
          >
            {{ player.current?.title || "Текст песни" }}
          </div>
          <div
            class="mt-[1px] text-[color:rgba(255,255,255,0.55)] text-[11.5px] truncate cursor-pointer hover:text-[color:#fff] hover:underline"
            data-no-drag
            @click="openArtist"
          >
            {{ artistLabel }}
          </div>
        </div>
      </div>

      <div
        class="flex items-center gap-[2px] p-[3px] border border-[color:rgba(255,255,255,0.08)] rounded-full bg-[rgba(255,255,255,0.06)] justify-self-center backdrop-blur-[18px]"
      >
        <button
          v-for="opt in sources"
          :key="opt.id"
          type="button"
          :class="sourceBtnClass(pick === opt.id)"
          :disabled="!player.current"
          @click="choose(opt.id)"
        >
          {{ opt.label }}
        </button>
      </div>

      <div class="flex items-center justify-end gap-[2px]">
        <div
          class="flex items-center justify-center text-[color:var(--fg-faint)] cursor-pointer p-0 border-0 appearance-none transition-[background,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] w-[30px] h-[30px] rounded-full"
          :class="iconBtnClass()"
          data-no-drag
          @click="player.loadLyrics(true)"
        >
          <Icon name="mingcute:repeat-line" :size="16" />
          <q-tooltip>Загрузить текст заново</q-tooltip>
        </div>
        <div
          v-if="player.current"
          class="flex items-center justify-center text-[color:var(--fg-faint)] cursor-pointer p-0 border-0 appearance-none transition-[background,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] w-[30px] h-[30px] rounded-full"
          :class="iconBtnClass()"
          data-no-drag
        >
          <Icon name="mingcute:more-2-fill" :size="18" />
          <TrackMenu :track="player.current" />
        </div>
        <div
          class="flex items-center justify-center text-[color:var(--fg-faint)] cursor-pointer p-0 border-0 appearance-none transition-[background,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] w-[30px] h-[30px] rounded-full"
          :class="iconBtnClass(showSettings)"
          data-no-drag
          @click="showSettings = !showSettings"
        >
          <Icon name="mingcute:settings-5-line" :size="17" />
          <q-tooltip>Вид текста</q-tooltip>
        </div>
        <div
          class="flex items-center justify-center text-[color:var(--fg-faint)] cursor-pointer p-0 border-0 appearance-none transition-[background,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] w-[30px] h-[30px] rounded-full"
          :class="iconBtnClass(player.lyricsFullscreen)"
          data-no-drag
          @click="player.toggleLyricsFullscreen()"
        >
          <Icon
            :name="
              player.lyricsFullscreen
                ? 'mingcute:restore-line'
                : 'mingcute:square-line'
            "
            :size="15"
          />
          <q-tooltip>
            {{
              player.lyricsFullscreen
                ? "Выйти из полного экрана"
                : "На полный экран"
            }}
          </q-tooltip>
        </div>
        <div
          class="flex items-center justify-center text-[color:var(--fg-faint)] cursor-pointer p-0 border-0 appearance-none transition-[background,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] w-[30px] h-[30px] rounded-full"
          :class="iconBtnClass()"
          data-no-drag
          @click="player.openFullscreen()"
        >
          <Icon name="mingcute:album-line" :size="17" />
          <q-tooltip>Большая обложка</q-tooltip>
        </div>
        <div
          class="flex items-center justify-center text-[color:var(--fg-faint)] cursor-pointer p-0 border-0 appearance-none transition-[background,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] w-[30px] h-[30px] rounded-full"
          :class="iconBtnClass()"
          data-no-drag
          @click="player.toggleLyrics()"
        >
          <Icon name="mingcute:close-line" :size="18" />
        </div>
      </div>
    </div>

    <LyricsSettingsPanel v-if="showSettings" />

    <div
      v-if="player.lyricsLoading && !lines.length"
      class="flex items-center justify-center flex-auto flex-col gap-[8px] p-[24px] text-[color:rgba(255,255,255,0.62)] text-center relative z-[1]"
    >
      <q-spinner size="24px" color="primary" />
      <div class="max-w-[380px] text-[color:rgba(255,255,255,0.46)] text-[12.5px] leading-[1.5]">
        Ищем текст в {{ searchingIn }}…
      </div>
    </div>

    <div
      v-else-if="!lines.length"
      class="flex items-center justify-center flex-auto flex-col gap-[8px] p-[24px] text-[color:rgba(255,255,255,0.62)] text-center relative z-[1]"
    >
      <Icon name="maki:karaoke" :size="26" />
      <div class="text-[color:rgba(255,255,255,0.92)] text-[17px] font-[620] tracking-[-0.01em]">
        {{ player.lyricsError || "Текста для этого трека нет" }}
      </div>
      <div class="max-w-[380px] text-[color:rgba(255,255,255,0.46)] text-[12.5px] leading-[1.5]">
        Можно поискать в другом источнике: LRCLIB даёт строки с таймингами,
        Genius - полный текст с авторами.
      </div>
      <div class="flex flex-wrap justify-center gap-[6px] mt-[8px]">
        <button
          type="button"
          class="px-[13px] py-[6px] border border-[color:rgba(255,255,255,0.12)] rounded-full bg-[rgba(255,255,255,0.06)] text-[color:rgba(255,255,255,0.82)] text-[11.5px] cursor-pointer transition-[background,color] duration-[150ms] ease-[ease] hover:bg-[rgba(255,255,255,0.13)] hover:text-[color:#fff] select-none"
          @click="choose('lrclib', true)"
        >
          Искать в LRCLIB
        </button>
        <button
          type="button"
          class="px-[13px] py-[6px] border border-[color:rgba(255,255,255,0.12)] rounded-full bg-[rgba(255,255,255,0.06)] text-[color:rgba(255,255,255,0.82)] text-[11.5px] cursor-pointer transition-[background,color] duration-[150ms] ease-[ease] hover:bg-[rgba(255,255,255,0.13)] hover:text-[color:#fff] select-none"
          @click="choose('genius', true)"
        >
          Искать в Genius
        </button>
        <button
          type="button"
          class="px-[13px] py-[6px] border border-[color:rgba(255,255,255,0.12)] rounded-full bg-[rgba(255,255,255,0.06)] text-[color:rgba(255,255,255,0.82)] text-[11.5px] cursor-pointer transition-[background,color] duration-[150ms] ease-[ease] hover:bg-[rgba(255,255,255,0.13)] hover:text-[color:#fff] select-none"
          @click="choose('auto', true)"
        >
          Автоматически
        </button>
      </div>
    </div>

    <template v-else>
      <div
        class="flex-auto min-h-0 overflow-hidden gap-[clamp(40px,6vw,96px)] pt-[4px] px-[clamp(36px,6vw,104px)] pb-[10px] [grid-template-columns:minmax(240px,0.78fr)_minmax(360px,1.22fr)] relative z-[1] max-[980px]:px-[42px]"
        :class="
          artworkVisible
            ? 'grid max-[980px]:block'
            : 'flex justify-center max-[980px]:flex'
        "
        @wheel="onStageWheel"
      >
        <div
          v-if="artworkVisible"
          class="flex justify-center flex-col min-w-0 min-h-0 overflow-hidden max-[980px]:hidden"
        >
          <div
            class="group/artwork relative w-[min(100%,400px)] rounded-[14px] cursor-pointer aspect-square transition-transform duration-[800ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] [&_img]:relative [&_img]:z-[1] [&_img]:w-full [&_img]:h-full [&_img]:rounded-[inherit] [&_img]:object-cover"
            :class="
              player.isPlaying && s.motion
                ? '[transform:scale(1)]'
                : '[transform:scale(0.97)]'
            "
            @click="player.toggleLyricsFullscreen()"
          >
            <img loading="lazy" decoding="async" :src="coverUrl" />
            <div
              class="absolute z-[2] top-[12px] right-[12px] flex flex-col gap-[8px] opacity-0 [transform:translateX(6px)] transition-[opacity,transform] duration-[180ms] ease-[ease] group-hover/artwork:opacity-100 group-hover/artwork:[transform:translateX(0)] group-focus-within/artwork:opacity-100 group-focus-within/artwork:[transform:translateX(0)]"
            >
              <button
                type="button"
                :class="laBtnClass(isLiked)"
                @click.stop="toggleLike"
              >
                <Icon
                  :name="
                    isLiked ? 'mingcute:heart-fill' : 'mingcute:heart-line'
                  "
                  :size="17"
                />
                <q-tooltip>
                  {{ isLiked ? "Убрать из любимых" : "Мне нравится" }}
                </q-tooltip>
              </button>
              <button
                type="button"
                :class="laBtnClass()"
                @click.stop="player.openFullscreen()"
              >
                <Icon name="mingcute:album-line" :size="17" />
                <q-tooltip>Большая обложка</q-tooltip>
              </button>
            </div>

            <div
              class="absolute z-[2] inset-[auto_0_0] flex items-center justify-center gap-[10px] pt-[18px] px-[14px] pb-[16px] rounded-[0_0_inherit_inherit] opacity-0 [background:linear-gradient(to_top,rgba(0,0,0,0.72),rgba(0,0,0,0.32)_58%,transparent)] [transform:translateY(8px)] transition-[opacity,transform] duration-[180ms] ease-[ease] group-hover/artwork:opacity-100 group-hover/artwork:[transform:translateY(0)] group-focus-within/artwork:opacity-100 group-focus-within/artwork:[transform:translateY(0)]"
            >
              <button
                type="button"
                :class="laBtnClass(player.shuffle)"
                @click.stop="player.toggleShuffle()"
              >
                <Icon name="mingcute:shuffle-line" :size="16" />
                <q-tooltip>Перемешать</q-tooltip>
              </button>
              <button
                type="button"
                :class="laBtnClass()"
                :disabled="!player.hasPrev"
                @click.stop="player.prev()"
              >
                <Icon name="mingcute:skip-previous-fill" :size="18" />
              </button>
              <button
                type="button"
                :class="LA_BTN_MAIN_CLASS"
                @click.stop="player.toggle()"
              >
                <Icon
                  :name="
                    player.isPlaying
                      ? 'mingcute:pause-fill'
                      : 'mingcute:play-fill'
                  "
                  :size="22"
                />
              </button>
              <button
                type="button"
                :class="laBtnClass()"
                :disabled="!player.hasNext"
                @click.stop="player.next()"
              >
                <Icon name="mingcute:fast-forward-fill" :size="18" />
              </button>
              <button
                type="button"
                :class="laBtnClass(player.repeat !== 'off')"
                @click.stop="player.cycleRepeat()"
              >
                <Icon
                  :name="
                    player.repeat === 'one'
                      ? 'mingcute:repeat-one-line'
                      : 'mingcute:repeat-line'
                  "
                  :size="16"
                />
                <q-tooltip>Повтор</q-tooltip>
              </button>
            </div>
          </div>
          <div class="w-[min(100%,400px)] mt-[18px]">
            <div
              class="overflow-hidden text-[color:rgba(255,255,255,0.94)] text-[15px] font-[620] tracking-[-0.01em] text-ellipsis whitespace-nowrap"
            >
              {{ player.current?.title }}
            </div>
            <div class="mt-[1px] text-[color:rgba(255,255,255,0.55)] text-[11.5px] truncate">
              {{ artistLabel }}
            </div>
          </div>
        </div>

        <q-scroll-area
          ref="scroller"
          class="h-full min-h-0 min-w-0 overscroll-contain [&_.q-scrollarea__container]:overscroll-contain"
          :class="
            artworkVisible
              ? 'max-[980px]:w-[min(760px,100%)] max-[980px]:mx-auto'
              : 'w-[min(860px,92%)] max-[980px]:w-[min(860px,92%)] max-[980px]:mx-auto'
          "
        >
          <div
            class="min-h-full pr-[12px] pl-0"
            :class="[
              s.align === 'center'
                ? 'text-center'
                : s.align === 'right'
                  ? 'text-right'
                  : '',
              !synced ? 'pt-[24px] pb-[72px]' : 'pt-[34vh] pb-[44vh]',
            ]"
          >
            <template v-if="synced">
              <div
                v-if="introDots"
                class="w-full px-0 py-[7px] text-[color:#fff] text-[length:var(--lyrics-size)] leading-[var(--lyrics-line-height,1.15)]"
              >
                <span :class="dotsClass(true, dotsOut)">
                  <i
                    v-for="n in 3"
                    :key="n"
                    :style="{ '--f': dotLevel(n - 1) }"
                  />
                </span>
              </div>
              <button
                v-for="(line, i) in lines"
                :key="i"
                :ref="(el) => setLineRef(el, i)"
                :class="lineClass(i)"
                :style="i === player.activeLine ? fillStyle : undefined"
                @click="seekTo(line.time_ms)"
                @contextmenu.stop.prevent="onLineMenu($event, i)"
              >
                <span :class="annotationTextClass(i, i === player.activeLine)"
                  ><template v-if="translateReplace && lineTranslation(i)">{{
                    lineTranslation(i)
                  }}</template
                  ><template v-else-if="karaokeWordActive(i)"
                    ><span
                      v-for="(w, wi) in activeWords"
                      :key="wi"
                      class="whitespace-pre-wrap text-transparent [box-decoration-break:clone] [-webkit-box-decoration-break:clone] [background-image:linear-gradient(90deg,#fff_0%,#fff_var(--wp,0%),rgba(255,255,255,calc(var(--lyrics-inactive,0.32)_+_0.18))_var(--wp,0%),rgba(255,255,255,calc(var(--lyrics-inactive,0.32)_+_0.18))_100%)] [background-clip:text] [-webkit-background-clip:text]"
                      :style="{ '--wp': wordFill(wi) + '%' }"
                      >{{ w }}</span
                    ></template
                  ><template v-else-if="line.text">{{ line.text }}</template
                  ><span
                    v-else-if="dotsAllowed(i)"
                    :class="
                      dotsClass(
                        i === player.activeLine,
                        i === player.activeLine && dotsOut,
                        synced && i < player.activeLine,
                      )
                    "
                    ><i
                      v-for="n in 3"
                      :key="n"
                      :style="{ '--f': lineDotLevel(i, n - 1) }"
                  /></span> </span
                ><span
                  v-if="lineAnnotations[i]"
                  :class="noteClass()"
                  title="Разбор строки"
                  @click.stop="openAnnotation(lineAnnotations[i])"
                >
                  <Icon name="mingcute:information-line" :size="10" />
                </span>
                <span
                  v-if="!translateReplace && lineTranslation(i)"
                  class="block mt-[0.18em] text-[0.62em] font-medium leading-[1.25] opacity-[0.66] italic"
                  >{{ lineTranslation(i) }}</span
                >
              </button>
            </template>
            <div
              v-else
              class="max-w-[700px] text-[color:rgba(255,255,255,0.88)] text-[clamp(16px,var(--lyrics-size)*0.56,26px)] font-[number:var(--lyrics-weight,480)] tracking-[-0.012em] leading-[calc(var(--lyrics-line-height,1.18)*1.32)] select-text [font-family:var(--lyrics-font,inherit)]"
              :class="
                s.align === 'center'
                  ? 'mx-auto my-0 text-center'
                  : s.align === 'right'
                    ? 'ml-auto text-right'
                    : ''
              "
            >
              <p
                v-for="(line, i) in lines"
                :key="i"
                :class="[
                  isPart(line.text)
                    ? 'min-h-[1em] mt-[22px] mx-0 mb-[9px] p-0 text-[color:rgba(255,255,255,0.5)] text-[0.52em] font-[760] tracking-[0.1em] leading-[1.2] uppercase first:mt-0'
                    : 'min-h-[1em] mt-0 mx-0 mb-[7px] p-0',
                  !isPart(line.text) && lineAnnotations[i]
                    ? 'group/line cursor-pointer'
                    : '',
                ]"
                @click="
                  !isPart(line.text) &&
                  lineAnnotations[i] &&
                  openAnnotation(lineAnnotations[i])
                "
                @contextmenu.stop.prevent="onLineMenu($event, i)"
              >
                <span :class="annotationTextClass(i, false)">{{
                  !isPart(line.text) && translateReplace && lineTranslation(i)
                    ? lineTranslation(i)
                    : partLabel(line.text)
                }}</span>
                <span
                  v-if="!isPart(line.text) && lineAnnotations[i]"
                  :class="noteClass()"
                  title="Разбор строки"
                  @click.stop="openAnnotation(lineAnnotations[i])"
                >
                  <Icon name="mingcute:information-line" :size="10" />
                </span>
                <span
                  v-if="
                    !isPart(line.text) &&
                    !translateReplace &&
                    lineTranslation(i)
                  "
                  class="block mt-[0.18em] text-[0.62em] font-medium leading-[1.25] opacity-[0.66] italic"
                  >{{ lineTranslation(i) }}</span
                >
              </p>
            </div>
          </div>
        </q-scroll-area>
      </div>

      <div
        v-if="footVisible"
        class="relative z-[2] flex items-center flex-none flex-wrap gap-y-[6px] gap-x-[16px] pt-[8px] px-[clamp(36px,6vw,104px)] pb-[14px] text-[color:rgba(255,255,255,0.34)] text-[11.5px] leading-[1.5] [&_b]:text-[color:rgba(255,255,255,0.56)] [&_b]:font-[560]"
      >
        <span v-if="originTag && ui.settings.lyricsShowOrigin"
          >Источник: <b>{{ originTag }}</b></span
        >

        <template v-if="creditsVisible">
          <span v-if="credits.length" class="flex items-center flex-wrap gap-[6px]">
            <button
              v-for="person in credits"
              :key="`${person.id}-${person.role}-${person.name}`"
              type="button"
              class="inline-flex items-center gap-[6px] pt-[4px] pr-[10px] pb-[4px] pl-[4px] rounded-full bg-[rgba(255,255,255,0.07)] text-[color:rgba(255,255,255,0.72)] text-[11.5px] cursor-pointer border-0 transition-[background,color] duration-[160ms] ease-[ease] hover:bg-[rgba(255,255,255,0.14)] hover:text-[color:#fff] [&_img]:w-[18px] [&_img]:h-[18px] [&_img]:rounded-full [&_img]:object-cover [&_i]:text-[color:rgba(255,255,255,0.42)] [&_i]:text-[10.5px] [&_i]:not-italic select-none"
              @click="openPerson(person)"
            >
              <img v-if="person.image" :src="person.image" alt="" />
              <span
                v-else
                class="grid w-[18px] h-[18px] rounded-full bg-[rgba(255,255,255,0.12)] text-[9.5px] font-bold place-items-center"
                >{{ person.name.slice(0, 1) }}</span
              >
              <span>{{ person.name }}</span>
              <i>{{ person.role }}</i>
            </button>
          </span>
          <span v-else-if="writers"
            >Авторы: <b>{{ writers }}</b></span
          >
        </template>
      </div>
    </template>

    <button
      v-if="hint"
      ref="hintEl"
      type="button"
      class="fixed z-[3200] inline-flex items-center gap-[7px] px-[11px] py-[7px] border border-[color:var(--line)] rounded-[10px] bg-[var(--surface)] text-[color:var(--fg)] text-[12.5px] cursor-pointer [box-shadow:0_14px_34px_var(--shadow-soft)] hover:bg-[var(--hover)] select-none"
      :style="{ left: `${hint.x}px`, top: `${hint.y}px` }"
      @click.stop="openHint"
    >
      <Icon name="mingcute:information-line" :size="14" />
      <span>Разбор строки</span>
    </button>

    <q-dialog v-model="annotationOpen">
      <div
        class="w-[min(460px,92vw)] pt-[14px] px-[16px] pb-[14px] border border-[color:var(--line)] rounded-[var(--radius)] bg-[var(--surface)] text-[color:var(--fg)]"
      >
        <div class="flex items-center justify-between gap-[10px] mb-[10px]">
          <div
            class="min-w-0 text-[color:var(--fg-dim)] text-[12.5px] font-[560] truncate"
          >
            {{ player.current?.title }}
          </div>
          <div
            class="flex items-center justify-center text-[color:var(--fg-faint)] cursor-pointer p-0 border-0 appearance-none transition-[background,color] duration-[120ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] w-[30px] h-[30px] rounded-full"
            :class="iconBtnClass()"
            @click="annotationOpen = false"
          >
            <Icon name="mingcute:close-line" :size="16" />
          </div>
        </div>
        <div
          v-if="activeAnnotation"
          class="mb-[10px] text-[color:var(--fg)] text-[14.5px] font-[560] leading-[1.45] whitespace-pre-line"
        >
          {{ activeAnnotation.fragment }}
        </div>
        <p
          v-if="activeAnnotation"
          class="m-0 text-[color:var(--fg-dim)] text-[13.5px] leading-[1.6] whitespace-pre-line"
        >
          {{ activeAnnotation.text }}
        </p>
        <div
          class="flex items-center justify-between gap-[12px] mt-[14px] pt-[10px] text-[color:var(--fg-faint)] text-[11.5px] [border-top:1px_solid_var(--line)]"
        >
          <span class="min-w-0 truncate">
            {{
              activeAnnotation?.authors?.length
                ? activeAnnotation.authors.map((a) => a.name).join(", ")
                : "Genius"
            }}
          </span>
          <a
            v-if="activeAnnotation?.url"
            class="flex-none text-[color:var(--fg-dim)] cursor-pointer hover:text-[color:var(--fg)] hover:underline"
            @click.prevent="openUrl(activeAnnotation.url)"
            >Источник</a
          >
        </div>
      </div>
    </q-dialog>

    <TrackMenu
      v-if="player.current"
      :track="player.current"
      :context-menu="true"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import type { QScrollArea } from "quasar";
import { useRoute, useRouter } from "vue-router";
import LyricsSettingsPanel from "@/components/player/LyricsSettingsPanel.vue";
import TrackMenu from "@/components/common/TrackMenu.vue";
import { api } from "@/api/client";
import type { GeniusQuote } from "@/api/types";
import { audio } from "@/lib/audio";
import { useVisualizer } from "@/composables/useVisualizer";
import { artistNames } from "@/lib/format";
import { ORIGIN_LABEL } from "@/lib/lyricsSource";
import { startWindowDrag } from "@/lib/window";
import { useGeniusStore } from "@/stores/genius";
import { useLibraryStore } from "@/stores/library";
import { usePlayerStore } from "@/stores/player/index";
import { useUiStore } from "@/stores/ui/index";

type Credit = { id: number; name: string; role: string; image: string };

type SourcePick = "auto" | "lrclib" | "genius";

const player = usePlayerStore();
const router = useRouter();
const route = useRoute();
const ui = useUiStore();
const genius = useGeniusStore();
const library = useLibraryStore();

const s = computed(() => ({
  fontSize: ui.settings.lyricsFontSize,
  lineHeight: ui.settings.lyricsLineHeight,
  weight: ui.settings.lyricsWeight,
  backgroundBlur: ui.settings.lyricsBackgroundBlur,
  backgroundOpacity: ui.settings.lyricsBackgroundOpacity,
  lineBlur: ui.settings.lyricsLineBlur,
  inactive: ui.settings.lyricsInactive,
  align: ui.settings.lyricsAlign,
  backdrop: ui.settings.lyricsBackdrop,
  highlight: ui.settings.lyricsHighlight,
  glow: ui.settings.lyricsGlow,
  showArtwork: ui.settings.lyricsShowArtwork,
  motion: ui.settings.lyricsMotion,
  annotations: ui.settings.lyricsAnnotations,
  annotationMark: ui.settings.lyricsAnnotationMark,
}));

const markMode = computed(() =>
  s.value.annotations ? s.value.annotationMark : "off",
);

const showSettings = ref(false);
const scroller = ref<QScrollArea | null>(null);
const lineRefs = ref<Array<HTMLElement | null>>([]);

const ARTWORK_MIN_WIDTH = 900;
const root = ref<HTMLElement | null>(null);
const panelWidth = ref(1400);
let sizeObserver: ResizeObserver | null = null;

watch(root, (el) => {
  sizeObserver?.disconnect();
  sizeObserver = null;
  if (!el || typeof ResizeObserver === "undefined") return;
  panelWidth.value = el.clientWidth || panelWidth.value;
  sizeObserver = new ResizeObserver((entries) => {
    const width = entries[0]?.contentRect.width;
    if (width) panelWidth.value = width;
  });
  sizeObserver.observe(el);
});

onBeforeUnmount(() => {
  sizeObserver?.disconnect();
  sizeObserver = null;
});

const lines = computed(() => player.lyrics?.lines || []);
const synced = computed(() => Boolean(player.lyrics?.synced));

const coverUrl = computed(() => {
  const track = player.current;
  const url = track?.cover_url_large || track?.cover_url || "";
  return url.replace(/\/\d+x\d+(?=$|\?)/, "/1000x1000");
});
const artistLabel = computed(() =>
  player.current ? artistNames(player.current.artists) : "",
);
const writers = computed(() => player.lyrics?.writers?.join(", ") || "");

const artworkVisible = computed(
  () =>
    s.value.showArtwork &&
    Boolean(coverUrl.value) &&
    panelWidth.value >= ARTWORK_MIN_WIDTH,
);

const isLiked = computed(() =>
  player.current ? library.liked(player.current.id) : false,
);

function toggleLike() {
  if (player.current) void library.toggleLike(player.current);
}

const credits = computed<Credit[]>(() => {
  const current = player.current;
  if (!current || genius.songKey !== String(current.id)) return [];
  return (genius.people as Credit[])
    .filter((person) => person.id > 0)
    .slice(0, 8);
});

function openPerson(person: Credit) {
  void router.push({
    name: "genius-artist",
    params: { id: String(person.id) },
    query: { role: person.role },
  });
}

const annotations = computed<GeniusQuote[]>(() => {
  const current = player.current;
  if (!current || genius.songKey !== String(current.id)) return [];
  return genius.song?.quotes || [];
});

function normText(value: string): string {
  return (value || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N} ]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function annotationFor(text: string): GeniusQuote | null {
  const line = normText(text);
  if (line.length < 6) return null;

  for (const quote of annotations.value) {
    const frag = normText(quote.fragment);
    if (!frag) continue;
    if (frag.includes(line) || line.includes(frag)) return quote;

    const parts = (quote.fragment || "")
      .split(/\r?\n/)
      .map(normText)
      .filter((part) => part.length >= 6);
    if (parts.some((part) => part === line || part.includes(line))) {
      return quote;
    }
  }
  return null;
}

const lineAnnotations = computed<Array<GeniusQuote | null>>(() => {
  if (!s.value.annotations) return lines.value.map(() => null);
  return lines.value.map((line) => annotationFor(line.text));
});

const activeAnnotation = ref<GeniusQuote | null>(null);
const annotationOpen = computed({
  get: () => !!activeAnnotation.value,
  set: (value: boolean) => {
    if (!value) activeAnnotation.value = null;
  },
});

function openAnnotation(quote: GeniusQuote | null) {
  if (quote) activeAnnotation.value = quote;
  hint.value = null;
}

const hintEl = ref<HTMLElement | null>(null);
const hint = ref<{ x: number; y: number; quote: GeniusQuote } | null>(null);

function onLineMenu(event: MouseEvent, index: number) {
  const quote = lineAnnotations.value[index];
  if (!quote) {
    hint.value = null;
    return;
  }
  hint.value = {
    x: Math.min(event.clientX, window.innerWidth - 190),
    y: Math.min(event.clientY, window.innerHeight - 60),
    quote,
  };
}

function openHint() {
  openAnnotation(hint.value?.quote ?? null);
}

function closeHint(event?: Event) {
  if (!hint.value) return;
  const el = hintEl.value;
  if (event && el && event.composedPath().includes(el)) return;
  hint.value = null;
}

function onHintKey(event: KeyboardEvent) {
  if (event.key === "Escape") hint.value = null;
}

window.addEventListener("pointerdown", closeHint);
window.addEventListener("wheel", closeHint, { passive: true });
window.addEventListener("keydown", onHintKey);

onBeforeUnmount(() => {
  window.removeEventListener("pointerdown", closeHint);
  window.removeEventListener("wheel", closeHint);
  window.removeEventListener("keydown", onHintKey);
});

watch(
  () => player.current?.id,
  () => {
    hint.value = null;
    activeAnnotation.value = null;
  },
);

function openUrl(url: string) {
  if (url) void api.openExternal(url);
}

watch(
  () => [player.showLyrics, player.current?.id] as const,
  ([shown, id]) => {
    if (shown && id && genius.ready) void genius.fetchSong(player.current);
  },
  { immediate: true },
);

function isPart(text: string): boolean {
  const value = (text || "").trim();
  return value.length > 2 && value.startsWith("[") && value.endsWith("]");
}

function partLabel(text: string): string {
  const value = (text || "").trim();
  return isPart(value) ? value.slice(1, -1).trim() : text;
}

const sources: Array<{ id: SourcePick; label: string }> = [
  { id: "auto", label: "Авто" },
  { id: "lrclib", label: "LRCLIB" },
  { id: "genius", label: "Genius" },
];

const pick = computed<SourcePick>(
  () => (player.lyricsPick as SourcePick | null) ?? "auto",
);

const searchingIn = computed(() => {
  if (pick.value === "lrclib") return "LRCLIB";
  if (pick.value === "genius") return "Genius";
  return "LRCLIB и Genius";
});

const originTag = computed(() => {
  const origin = player.lyricsOrigin;
  if (!origin || !lines.value.length) return "";
  return ORIGIN_LABEL[origin];
});

const creditsVisible = computed(
  () =>
    ui.settings.lyricsShowCredits &&
    (credits.value.length > 0 || Boolean(writers.value)),
);

const footVisible = computed(
  () =>
    creditsVisible.value ||
    (ui.settings.lyricsShowOrigin && Boolean(originTag.value)),
);

async function choose(id: SourcePick, force = false) {
  await player.setLyricsSource(id === "auto" ? null : id, force);
}

const visualStyle = computed(() => ({
  "--lyrics-size": `${s.value.fontSize}px`,
  "--lyrics-line-height": `${s.value.lineHeight}`,
  "--lyrics-weight": `${s.value.weight}`,
  "--lyrics-inactive": `${s.value.inactive / 100}`,
  "--lyrics-bg-blur": `${s.value.backgroundBlur}px`,
  "--lyrics-bg-opacity": `${s.value.backgroundOpacity / 100}`,
  "--lyrics-line-blur": `${s.value.lineBlur}px`,
}));

const vizCanvas = ref<HTMLCanvasElement | null>(null);
const ambientOn = computed(
  () =>
    player.showLyrics &&
    player.lyricsFullscreen &&
    ui.settings.lyricsVisualizer,
);
useVisualizer(vizCanvas, () => ambientOn.value, { bars: 64 });

const translateReplace = computed(
  () => ui.settings.lyricsTranslateMode === "replace",
);

function lineTranslation(i: number): string {
  if (!ui.settings.lyricsTranslate) return "";
  const tr = player.lyricsTranslation?.[i];
  if (!tr) return "";
  const trimmed = tr.trim();
  if (!trimmed) return "";
  const orig = (lines.value[i]?.text || "").trim();
  if (trimmed.toLowerCase() === orig.toLowerCase()) return "";
  return trimmed;
}

watch(
  () => [
    ui.settings.lyricsTranslate,
    ui.settings.lyricsTranslateTarget,
    player.lyrics?.track_id ?? null,
  ],
  () => {
    if (ui.settings.lyricsTranslate) void player.loadTranslation(true);
  },
  { immediate: true },
);

const fill = ref(0);
const fillStyle = computed(() => ({ "--lp": `${fill.value}%` }));
const karaoke = computed(
  () => s.value.highlight === "karaoke" && synced.value && player.showLyrics,
);

const wordKaraoke = computed(
  () => karaoke.value && ui.settings.lyricsKaraokeWord,
);

const DOTS_MIN_GAP = 4000;
const DOTS_LEAD = 700;
const DOTS_TAIL = 450;

const dotsFill = ref(0);
const dotsOut = computed(() => dotsFill.value >= 100);

function gapProgress(elapsed: number, total: number): number {
  const usable = total - DOTS_LEAD - DOTS_TAIL;
  if (usable <= 0) return 0;
  return Math.min(100, Math.max(0, ((elapsed - DOTS_LEAD) / usable) * 100));
}

function dotLevel(n: number): number {
  return Math.min(1, Math.max(0, (dotsFill.value / 100) * 3 - n));
}

function lineDotLevel(i: number, n: number): number {
  return i === player.activeLine ? dotLevel(n) : 0;
}

function dotsAllowed(i: number): boolean {
  const list = lines.value;
  const next = list[i + 1];
  return !!next && next.time_ms - list[i].time_ms >= DOTS_MIN_GAP;
}

const tickOn = computed(() => player.showLyrics && synced.value);

const introDots = computed(
  () =>
    synced.value &&
    player.activeLine < 0 &&
    (lines.value[0]?.time_ms ?? 0) >= DOTS_MIN_GAP,
);

const activeWords = computed<string[]>(() => {
  if (!wordKaraoke.value) return [];
  const line = lines.value[player.activeLine];
  return (line?.text || "").match(/\S+\s*/gu) ?? [];
});

const wordBounds = computed<Array<[number, number]>>(() => {
  const words = activeWords.value;
  const total = words.reduce((sum, w) => sum + w.length, 0) || 1;
  let acc = 0;
  return words.map((w) => {
    const start = acc / total;
    acc += w.length;
    return [start, acc / total] as [number, number];
  });
});

function wordFill(index: number): number {
  const bounds = wordBounds.value[index];
  if (!bounds) return 0;
  const [start, end] = bounds;
  const p = fill.value / 100;
  if (p <= start) return 0;
  if (p >= end) return 100;
  return ((p - start) / (end - start || 1)) * 100;
}

function karaokeWordActive(i: number): boolean {
  return (
    wordKaraoke.value && i === player.activeLine && activeWords.value.length > 0
  );
}

let raf = 0;

function tick() {
  const index = player.activeLine;
  const list = lines.value;
  const line = index >= 0 ? list[index] : null;
  const now = audio.currentTime * 1000;
  if (line) {
    const start = line.time_ms;
    const end = list[index + 1]?.time_ms ?? start + 4200;
    const span = Math.max(320, end - start);
    fill.value = Math.min(100, Math.max(0, ((now - start) / span) * 100));
    dotsFill.value = line.text ? 0 : gapProgress(now - start, end - start);
  } else {
    fill.value = 0;
    const first = list[0]?.time_ms ?? 0;
    dotsFill.value = first > 0 ? gapProgress(now, first) : 0;
  }
  raf = requestAnimationFrame(tick);
}

function stopTick() {
  if (!raf) return;
  cancelAnimationFrame(raf);
  raf = 0;
  fill.value = 0;
  dotsFill.value = 0;
}

watch(
  tickOn,
  (on) => {
    if (on && !raf) raf = requestAnimationFrame(tick);
    if (!on) stopTick();
  },
  { immediate: true },
);

onBeforeUnmount(stopTick);

function onHeadDrag(event: MouseEvent) {
  if (!player.lyricsFullscreen) return;
  void startWindowDrag(event);
}

function openAlbum() {
  const id = player.current?.album_id;
  if (id) void router.push(`/album/${id}`);
}

function openArtist() {
  const id = player.current?.artists[0]?.id;
  if (id) void router.push(`/artist/${id}`);
}

function setLineRef(el: unknown, i: number) {
  lineRefs.value[i] = (el as HTMLElement | null) ?? null;
}

function seekTo(ms: number) {
  if (synced.value && ms >= 0) player.seek(ms / 1000);
}

const ICON_BTN_BASE =
  "flex w-[30px] h-[30px] items-center justify-center rounded-full cursor-pointer select-none transition-[background,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)]";

function iconBtnClass(active = false) {
  return active
    ? `${ICON_BTN_BASE} text-[color:var(--accent)] hover:text-[color:var(--accent)]`
    : `${ICON_BTN_BASE} text-[color:var(--fg-faint)] hover:text-[color:var(--fg)]`;
}

const SRC_BTN_BASE =
  "relative px-[13px] py-[5px] border-0 rounded-full text-[11.5px] font-[560] tracking-[0.01em] whitespace-nowrap cursor-pointer transition-[background,color] duration-[160ms] ease-[ease] disabled:cursor-default disabled:opacity-[0.34] select-none";

function sourceBtnClass(active: boolean) {
  return active
    ? `${SRC_BTN_BASE} on bg-[rgba(255,255,255,0.92)] text-[color:#101014] hover:text-[color:#101014]`
    : `${SRC_BTN_BASE} bg-transparent text-[color:rgba(255,255,255,0.6)] hover:text-[color:#fff]`;
}

const LA_BTN_BASE =
  "grid w-[38px] h-[38px] rounded-full bg-[rgba(255,255,255,0.16)] cursor-pointer place-items-center border-0 backdrop-blur-[8px] transition-[background,transform] duration-[160ms] ease-[ease] enabled:hover:bg-[rgba(255,255,255,0.28)] enabled:hover:[transform:scale(1.06)] disabled:opacity-[0.35] disabled:cursor-default select-none";

function laBtnClass(active = false) {
  return active
    ? `${LA_BTN_BASE} on text-[color:var(--accent,#ff4d63)]`
    : `${LA_BTN_BASE} text-[color:#fff]`;
}

const LA_BTN_MAIN_CLASS =
  "grid w-[52px] h-[52px] rounded-full bg-[#fff] text-[color:#111] cursor-pointer place-items-center border-0 backdrop-blur-[8px] transition-[background,transform] duration-[160ms] ease-[ease] enabled:hover:bg-[#fff] enabled:hover:[transform:scale(1.06)] disabled:opacity-[0.35] disabled:cursor-default select-none";

const LINE_BASE =
  "group/line block w-full m-0 px-0 py-[7px] border-0 [outline:0] [overflow-wrap:anywhere] bg-transparent cursor-pointer text-[length:var(--lyrics-size)] font-[number:var(--lyrics-weight,700)] tracking-[-0.03em] leading-[var(--lyrics-line-height,1.15)] [font-family:var(--lyrics-font,inherit)] [transition:color_0.42s_ease,filter_0.42s_ease,opacity_0.42s_ease,transform_0.52s_cubic-bezier(0.2,0.8,0.2,1)]";

const NOTE_BASE =
  "inline-flex items-center justify-center w-[0.72em] h-[0.72em] ml-[0.18em] mr-[-0.9em] rounded-full text-current cursor-pointer [vertical-align:0.14em] transition-[opacity,background] duration-[180ms] ease-[ease] hover:bg-[rgba(255,255,255,0.14)]";

const DOTS_BASE =
  "inline-flex items-center gap-[0.3em] h-[1em] align-middle [--dots-delay:0.35s] transition-opacity duration-[400ms] ease-[ease] [&_i]:w-[0.34em] [&_i]:h-[0.34em] [&_i]:rounded-full [&_i]:bg-[#fff] [&_i]:opacity-[calc(0.28_+_0.72_*_var(--f))] [&_i]:[transform:scale(calc(0.8_+_0.2_*_var(--f)))] [&_i]:[--f:0] [&_i]:transition-[opacity,transform] [&_i]:duration-[120ms] [&_i]:ease-linear";

function dotsOrigin() {
  return s.value.align === "center"
    ? "[transform-origin:center_center]"
    : s.value.align === "right"
      ? "[transform-origin:right_center]"
      : "[transform-origin:left_center]";
}

function dotsClass(live: boolean, out: boolean, hidden = false) {
  return [
    DOTS_BASE,
    dotsOrigin(),
    out ? "lyric-dots-out" : live ? "lyric-dots-live" : "",
    hidden ? "opacity-0" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function noteClass() {
  if (markMode.value === "off") return `${NOTE_BASE} hidden`;
  if (markMode.value === "dot") {
    return `${NOTE_BASE} opacity-[0.42]`;
  }
  return `${NOTE_BASE} opacity-0 group-hover/line:opacity-[0.55]`;
}

function annotationTextClass(i: number, active: boolean) {
  if (!lineAnnotations.value[i]) return "";
  if (markMode.value === "underline") {
    return "underline underline-offset-[0.18em] opacity-[0.999] [text-decoration-color:currentColor] [text-decoration-thickness:0.055em]";
  }
  if (markMode.value === "tint") {
    const common =
      "px-[0.12em] py-[0.02em] mx-[-0.12em] my-0 rounded-[0.16em] [box-decoration-break:clone] [-webkit-box-decoration-break:clone]";
    if (active) {
      return `${common} bg-[color-mix(in_srgb,var(--accent)_26%,transparent)]`;
    }
    if (!synced.value) {
      return `${common} bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] group-hover/line:bg-[color-mix(in_srgb,var(--accent)_26%,transparent)]`;
    }
    return `${common} bg-[color-mix(in_srgb,var(--accent)_16%,transparent)]`;
  }
  return "";
}

function lineClass(i: number) {
  const active = player.activeLine;
  const isOn = i === active;
  const isPast = synced.value && i < active;
  const isNear = synced.value && Math.abs(i - active) === 1;
  const isFar = synced.value && active >= 0 && Math.abs(i - active) > 1;
  const align =
    s.value.align === "center"
      ? "text-center [transform-origin:center_center]"
      : s.value.align === "right"
        ? "text-right [transform-origin:right_center]"
        : "text-left [transform-origin:left_center]";
  const hoverBase = "hover:opacity-100 hover:[filter:none]";

  if (isOn) {
    const glow = s.value.glow
      ? s.value.highlight === "accent"
        ? "[text-shadow:0_6px_34px_color-mix(in_srgb,var(--accent)_45%,transparent)]"
        : "[text-shadow:0_6px_34px_rgba(255,255,255,0.16)]"
      : "";
    const motion =
      s.value.motion && synced.value ? "lyric-focus-anim" : "";
    const onBase = "opacity-100 [filter:none] [transform:scale(1.02)]";

    if (s.value.highlight === "karaoke") {
      const karaokeClass = karaokeWordActive(i)
        ? "text-[color:#fff]"
        : "text-transparent [background-image:linear-gradient(90deg,#fff_0%,#fff_var(--lp,0%),rgba(255,255,255,calc(var(--lyrics-inactive,0.32)_+_0.18))_var(--lp,0%),rgba(255,255,255,calc(var(--lyrics-inactive,0.32)_+_0.18))_100%)] [background-clip:text] [-webkit-background-clip:text]";
      return [
        LINE_BASE,
        align,
        onBase,
        karaokeClass,
        hoverBase,
        glow,
        motion,
      ]
        .filter(Boolean)
        .join(" ");
    }

    const accent = s.value.highlight === "accent";
    return [
      LINE_BASE,
      align,
      onBase,
      accent
        ? "text-[color:var(--accent)]"
        : "text-[color:#fff] hover:text-[color:rgba(255,255,255,0.86)]",
      hoverBase,
      glow,
      motion,
    ]
      .filter(Boolean)
      .join(" ");
  }

  const hoverColor = "hover:text-[color:rgba(255,255,255,0.86)]";
  if (isFar) {
    return [
      LINE_BASE,
      align,
      "opacity-[0.74] [filter:blur(var(--lyrics-line-blur))]",
      "text-[color:rgba(255,255,255,var(--lyrics-inactive,0.32))]",
      hoverBase,
      hoverColor,
    ].join(" ");
  }
  if (isNear) {
    return [
      LINE_BASE,
      align,
      "text-[color:rgba(255,255,255,calc(var(--lyrics-inactive,0.32)_+_0.14))] [filter:blur(calc(var(--lyrics-line-blur)_*_0.45))]",
      hoverBase,
      hoverColor,
    ].join(" ");
  }
  if (isPast) {
    return [
      LINE_BASE,
      align,
      "text-[color:rgba(255,255,255,calc(var(--lyrics-inactive,0.32)_*_0.62))]",
      hoverBase,
      hoverColor,
    ].join(" ");
  }
  return [
    LINE_BASE,
    align,
    "text-[color:rgba(255,255,255,var(--lyrics-inactive,0.32))]",
    hoverBase,
    hoverColor,
  ].join(" ");
}

function onStageWheel(event: WheelEvent) {
  const area = scroller.value;
  if (!area) return;
  const target = area.getScrollTarget() as HTMLElement | null;
  if (!target) return;
  const max = target.scrollHeight - target.clientHeight;
  if (max <= 0) return;
  event.preventDefault();
  event.stopPropagation();
  let step = event.deltaY;
  if (event.deltaMode === 1) step *= 18;
  else if (event.deltaMode === 2) step *= target.clientHeight;
  target.scrollTop = Math.min(max, Math.max(0, target.scrollTop + step));
}

watch(
  () => player.activeLine,
  (i) => {
    if (!synced.value || i < 0) return;
    const el = lineRefs.value[i];
    const area = scroller.value;
    if (!el || !area) return;
    const target = Math.max(0, el.offsetTop - area.$el.clientHeight * 0.42);
    area.setScrollPosition("vertical", target, s.value.motion ? 520 : 0);
  },
);

watch(
  () => route.fullPath,
  () => {
    if (player.lyricsFullscreen) player.closeLyrics();
  },
);
</script>

<style scoped>
.lyrics-fs-anim {
  animation: lyrics-fs-in 0.24s ease;
}

.lyric-focus-anim {
  animation: lyric-focus 0.56s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.lyric-dots-live {
  animation:
    lyricDotsIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) var(--dots-delay) both,
    lyricDotsBreath 2.6s ease-in-out calc(var(--dots-delay) + 0.6s) infinite;
}

.lyric-dots-out {
  animation: lyricDotsOut 0.45s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@media (prefers-reduced-motion: reduce) {
  .lyric-focus-anim {
    animation: none;
  }

  .lyric-dots-live {
    animation: none;
  }
}

@keyframes lyrics-fs-in {
  from {
    opacity: 0;
    transform: scale(1.02);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes lyric-focus {
  from {
    opacity: 0.5;
    transform: translateY(7px) scale(0.99);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1.02);
  }
}

@keyframes lyricDotsIn {
  from {
    opacity: 0;
    transform: scale(0.4);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes lyricDotsBreath {
  0%,
  100% {
    scale: 1;
  }
  50% {
    scale: 1.14;
  }
}

@keyframes lyricDotsOut {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  35% {
    opacity: 1;
    transform: scale(1.2);
  }
  100% {
    opacity: 0;
    transform: scale(0.35);
  }
}
</style>
