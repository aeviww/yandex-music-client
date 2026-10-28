<template>
  <div
    class="absolute z-[8] top-[58px] right-[16px] w-[306px] max-h-[min(74vh,_620px)] overflow-x-hidden overflow-y-auto pt-[4px] px-[4px] pb-[10px] border border-[color:rgba(255,255,255,0.1)] rounded-[14px] bg-[rgba(18,18,22,0.86)] shadow-[0_26px_70px_rgba(0,0,0,0.55)] [backdrop-filter:blur(28px)_saturate(1.3)] text-[color:#fff] lset-anim"
    @click.stop
  >
    <div class="flex items-center justify-between gap-[8px] pt-[10px] pr-[10px] pb-[8px] pl-[12px]">
      <div class="text-[12.5px] font-[620] tracking-[-0.01em]">Вид текста</div>
      <button
        type="button"
        class="px-[8px] py-[4px] border-0 rounded-[7px] text-[color:rgba(255,255,255,0.5)] text-[11px] cursor-pointer hover:bg-[rgba(255,255,255,0.08)] hover:text-[color:#fff]"
        @click="ui.resetLyrics()"
      >
        Сбросить
      </button>
    </div>

    <div class="pt-[6px] px-[12px] pb-[10px]">
      <div class="mb-[9px] text-[color:rgba(255,255,255,0.42)] text-[10px] font-[620] tracking-[0.08em] uppercase">Текст</div>

      <label class="block mb-[11px]">
        <span class="flex items-baseline justify-between gap-[8px] mb-[3px] text-[color:rgba(255,255,255,0.56)] text-[11.5px] [&_b]:text-[color:rgba(255,255,255,0.9)] [&_b]:tabular-nums [&_b]:font-[560]">
          <span>Размер</span><b>{{ s.lyricsFontSize }} px</b>
        </span>
        <input
          :class="RANGE_CLASS"
          type="range"
          min="18"
          max="72"
          step="1"
          :value="s.lyricsFontSize"
          @input="onNum('lyricsFontSize', $event)"
        />
      </label>

      <label class="block mb-[11px]">
        <span class="flex items-baseline justify-between gap-[8px] mb-[3px] text-[color:rgba(255,255,255,0.56)] text-[11.5px] [&_b]:text-[color:rgba(255,255,255,0.9)] [&_b]:tabular-nums [&_b]:font-[560]">
          <span>Интерлиньяж</span><b>{{ s.lyricsLineHeight.toFixed(2) }}</b>
        </span>
        <input
          :class="RANGE_CLASS"
          type="range"
          min="1"
          max="1.8"
          step="0.02"
          :value="s.lyricsLineHeight"
          @input="onNum('lyricsLineHeight', $event)"
        />
      </label>

      <label class="block mb-[11px]">
        <span class="flex items-baseline justify-between gap-[8px] mb-[3px] text-[color:rgba(255,255,255,0.56)] text-[11.5px] [&_b]:text-[color:rgba(255,255,255,0.9)] [&_b]:tabular-nums [&_b]:font-[560]">
          <span>Жирность</span><b>{{ s.lyricsWeight }}</b>
        </span>
        <input
          :class="RANGE_CLASS"
          type="range"
          min="400"
          max="900"
          step="50"
          :value="s.lyricsWeight"
          @input="onNum('lyricsWeight', $event)"
        />
      </label>

      <div class="mb-[5px] text-[color:rgba(255,255,255,0.56)] text-[11.5px]">Шрифт</div>
      <div class="grid grid-flow-col [grid-auto-columns:1fr] gap-[3px] mb-[11px] p-[3px] rounded-[9px] bg-[rgba(255,255,255,0.06)]">
        <button
          v-for="font in fonts"
          :key="font.id"
          type="button"
          :class="segBtnClass(s.lyricsFont === font.id)"
          @click="ui.set('lyricsFont', font.id)"
        >
          {{ font.label }}
        </button>
      </div>

      <div v-if="s.lyricsFont === 'custom'" class="flex flex-col gap-[7px]">
        <input
          class="w-full h-[30px] px-[9px] py-0 border border-[color:var(--line)] rounded-[8px] bg-[rgba(255,255,255,0.04)] text-[color:var(--fg)] text-[12px] [outline:none] focus:border-[color:color-mix(in_srgb,var(--accent)_60%,transparent)]"
          type="text"
          :placeholder="
            fontsLoading
              ? 'Читаю шрифты системы…'
              : 'Найти шрифт или вписать своё название'
          "
          :value="fontQuery"
          @input="onFontQuery"
          @change="onFont"
        />

        <div
          v-if="s.lyricsFontCustom"
          class="flex items-baseline gap-[6px] overflow-hidden text-[color:rgba(255,255,255,0.4)] text-[10.5px]"
        >
          <span>Сейчас:</span>
          <b
            class="overflow-hidden text-[color:var(--fg)] text-[12.5px] text-ellipsis whitespace-nowrap"
            :style="{ fontFamily: `'${s.lyricsFontCustom}'` }"
            >{{ s.lyricsFontCustom }}</b
          >
        </div>

        <div v-if="fontsNotice" class="mt-[2px] text-[color:rgba(255,255,255,0.34)] text-[10.5px] leading-[1.45]">{{ fontsNotice }}</div>

        <div
          v-if="visibleFonts.length"
          class="flex max-h-[236px] flex-col pr-[2px] gap-[1px] overflow-y-auto overscroll-contain [scrollbar-width:thin]"
        >
          <button
            v-for="name in visibleFonts"
            :key="name"
            type="button"
            :class="fontBtnClass(s.lyricsFontCustom === name)"
            @click="pickFont(name)"
          >
            <span
              class="min-w-0 flex-1 text-[12.5px] [font-family:inherit] truncate"
              >{{ name }}</span
            >
            <span
              class="overflow-hidden max-w-[88px] flex-none text-[color:var(--fg-faint)] text-[13px] whitespace-nowrap"
              :style="{ fontFamily: `'${name}', sans-serif` }"
              >Аа Bb 12</span
            >
          </button>
        </div>

        <button
          v-if="!fontsLoading && needsPermission"
          type="button"
          class="px-[9px] py-[6px] border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] cursor-pointer text-[11.5px] hover:border-transparent hover:bg-[rgba(255,255,255,0.07)] hover:text-[color:var(--fg)]"
          @click="loadFonts(true)"
        >
          Показать шрифты системы
        </button>
      </div>

      <div class="mb-[5px] text-[color:rgba(255,255,255,0.56)] text-[11.5px]">Выравнивание</div>
      <div class="grid grid-flow-col [grid-auto-columns:1fr] gap-[3px] mb-[11px] p-[3px] rounded-[9px] bg-[rgba(255,255,255,0.06)]">
        <button
          v-for="align in aligns"
          :key="align.id"
          type="button"
          :class="segBtnClass(s.lyricsAlign === align.id)"
          @click="ui.set('lyricsAlign', align.id)"
        >
          {{ align.label }}
        </button>
      </div>

      <div class="mb-[5px] text-[color:rgba(255,255,255,0.56)] text-[11.5px]">Активная строка</div>
      <div class="grid grid-flow-col [grid-auto-columns:1fr] gap-[3px] mb-[11px] p-[3px] rounded-[9px] bg-[rgba(255,255,255,0.06)]">
        <button
          v-for="item in highlights"
          :key="item.id"
          type="button"
          :class="segBtnClass(s.lyricsHighlight === item.id)"
          @click="ui.set('lyricsHighlight', item.id)"
        >
          {{ item.label }}
        </button>
      </div>
      <div v-if="s.lyricsHighlight === 'karaoke'" class="mt-[2px] text-[color:rgba(255,255,255,0.34)] text-[10.5px] leading-[1.45]">
        Строка заливается по ходу песни — работает с синхронным текстом.
      </div>
      <button
        type="button"
        :class="switchClass(karaokeOn)"
        @click="setKaraoke(!karaokeOn)"
      >
        <span>Караоке-режим</span>
        <span class="relative w-[28px] h-[16px] flex-none rounded-full bg-[rgba(255,255,255,0.18)] transition-[background] duration-[160ms] ease-[ease] [&>i]:absolute [&>i]:top-[3px] [&>i]:left-[3px] [&>i]:w-[10px] [&>i]:h-[10px] [&>i]:rounded-full [&>i]:bg-[rgba(255,255,255,0.8)] [&>i]:[transition:transform_0.16s_cubic-bezier(0.22,0.65,0.28,1)]"><i /></span>
      </button>

      <label class="block mb-[11px]" style="margin-top: 10px">
        <span class="flex items-baseline justify-between gap-[8px] mb-[3px] text-[color:rgba(255,255,255,0.56)] text-[11.5px] [&_b]:text-[color:rgba(255,255,255,0.9)] [&_b]:tabular-nums [&_b]:font-[560]">
          <span>Яркость остальных</span><b>{{ s.lyricsInactive }}%</b>
        </span>
        <input
          :class="RANGE_CLASS"
          type="range"
          min="8"
          max="70"
          step="1"
          :value="s.lyricsInactive"
          @input="onNum('lyricsInactive', $event)"
        />
      </label>

      <label class="block mb-[11px]">
        <span class="flex items-baseline justify-between gap-[8px] mb-[3px] text-[color:rgba(255,255,255,0.56)] text-[11.5px] [&_b]:text-[color:rgba(255,255,255,0.9)] [&_b]:tabular-nums [&_b]:font-[560]">
          <span>Размытие строк</span><b>{{ s.lyricsLineBlur }} px</b>
        </span>
        <input
          :class="RANGE_CLASS"
          type="range"
          min="0"
          max="8"
          step="0.5"
          :value="s.lyricsLineBlur"
          @input="onNum('lyricsLineBlur', $event)"
        />
      </label>
    </div>

    <div class="pt-[6px] px-[12px] pb-[10px] border-t border-[color:rgba(255,255,255,0.07)]">
      <div class="mb-[9px] text-[color:rgba(255,255,255,0.42)] text-[10px] font-[620] tracking-[0.08em] uppercase">Фон</div>

      <div class="grid grid-flow-col [grid-auto-columns:1fr] gap-[3px] mb-[11px] p-[3px] rounded-[9px] bg-[rgba(255,255,255,0.06)]">
        <button
          v-for="item in backdrops"
          :key="item.id"
          type="button"
          :class="segBtnClass(s.lyricsBackdrop === item.id)"
          @click="ui.set('lyricsBackdrop', item.id)"
        >
          {{ item.label }}
        </button>
      </div>

      <label class="block mb-[11px]">
        <span class="flex items-baseline justify-between gap-[8px] mb-[3px] text-[color:rgba(255,255,255,0.56)] text-[11.5px] [&_b]:text-[color:rgba(255,255,255,0.9)] [&_b]:tabular-nums [&_b]:font-[560]">
          <span>Размытие</span><b>{{ s.lyricsBackgroundBlur }} px</b>
        </span>
        <input
          :class="RANGE_CLASS"
          type="range"
          min="0"
          max="90"
          step="1"
          :value="s.lyricsBackgroundBlur"
          @input="onNum('lyricsBackgroundBlur', $event)"
        />
      </label>

      <label class="block mb-[11px]">
        <span class="flex items-baseline justify-between gap-[8px] mb-[3px] text-[color:rgba(255,255,255,0.56)] text-[11.5px] [&_b]:text-[color:rgba(255,255,255,0.9)] [&_b]:tabular-nums [&_b]:font-[560]">
          <span>Насыщенность</span><b>{{ s.lyricsBackgroundOpacity }}%</b>
        </span>
        <input
          :class="RANGE_CLASS"
          type="range"
          min="0"
          max="100"
          step="1"
          :value="s.lyricsBackgroundOpacity"
          @input="onNum('lyricsBackgroundOpacity', $event)"
        />
      </label>

      <button
        type="button"
        :class="switchClass(s.lyricsShowArtwork)"
        @click="ui.set('lyricsShowArtwork', !s.lyricsShowArtwork)"
      >
        <span>Обложка рядом с текстом</span>
        <span class="relative w-[28px] h-[16px] flex-none rounded-full bg-[rgba(255,255,255,0.18)] transition-[background] duration-[160ms] ease-[ease] [&>i]:absolute [&>i]:top-[3px] [&>i]:left-[3px] [&>i]:w-[10px] [&>i]:h-[10px] [&>i]:rounded-full [&>i]:bg-[rgba(255,255,255,0.8)] [&>i]:[transition:transform_0.16s_cubic-bezier(0.22,0.65,0.28,1)]"><i /></span>
      </button>

      <button
        type="button"
        :class="switchClass(s.lyricsGlow)"
        @click="ui.set('lyricsGlow', !s.lyricsGlow)"
      >
        <span>Свечение активной строки</span>
        <span class="relative w-[28px] h-[16px] flex-none rounded-full bg-[rgba(255,255,255,0.18)] transition-[background] duration-[160ms] ease-[ease] [&>i]:absolute [&>i]:top-[3px] [&>i]:left-[3px] [&>i]:w-[10px] [&>i]:h-[10px] [&>i]:rounded-full [&>i]:bg-[rgba(255,255,255,0.8)] [&>i]:[transition:transform_0.16s_cubic-bezier(0.22,0.65,0.28,1)]"><i /></span>
      </button>

      <button
        type="button"
        :class="switchClass(s.lyricsMotion)"
        @click="ui.set('lyricsMotion', !s.lyricsMotion)"
      >
        <span>Плавные переходы</span>
        <span class="relative w-[28px] h-[16px] flex-none rounded-full bg-[rgba(255,255,255,0.18)] transition-[background] duration-[160ms] ease-[ease] [&>i]:absolute [&>i]:top-[3px] [&>i]:left-[3px] [&>i]:w-[10px] [&>i]:h-[10px] [&>i]:rounded-full [&>i]:bg-[rgba(255,255,255,0.8)] [&>i]:[transition:transform_0.16s_cubic-bezier(0.22,0.65,0.28,1)]"><i /></span>
      </button>

      <button
        type="button"
        :class="switchClass(s.lyricsVisualizer)"
        @click="ui.set('lyricsVisualizer', !s.lyricsVisualizer)"
      >
        <span>Визуализатор на весь экран</span>
        <span class="relative w-[28px] h-[16px] flex-none rounded-full bg-[rgba(255,255,255,0.18)] transition-[background] duration-[160ms] ease-[ease] [&>i]:absolute [&>i]:top-[3px] [&>i]:left-[3px] [&>i]:w-[10px] [&>i]:h-[10px] [&>i]:rounded-full [&>i]:bg-[rgba(255,255,255,0.8)] [&>i]:[transition:transform_0.16s_cubic-bezier(0.22,0.65,0.28,1)]"><i /></span>
      </button>
    </div>

    <div class="pt-[6px] px-[12px] pb-[10px] border-t border-[color:rgba(255,255,255,0.07)]">
      <div class="mb-[9px] text-[color:rgba(255,255,255,0.42)] text-[10px] font-[620] tracking-[0.08em] uppercase">Перевод</div>

      <button
        type="button"
        :class="switchClass(s.lyricsTranslate)"
        @click="ui.set('lyricsTranslate', !s.lyricsTranslate)"
      >
        <span>Переводить текст</span>
        <span class="relative w-[28px] h-[16px] flex-none rounded-full bg-[rgba(255,255,255,0.18)] transition-[background] duration-[160ms] ease-[ease] [&>i]:absolute [&>i]:top-[3px] [&>i]:left-[3px] [&>i]:w-[10px] [&>i]:h-[10px] [&>i]:rounded-full [&>i]:bg-[rgba(255,255,255,0.8)] [&>i]:[transition:transform_0.16s_cubic-bezier(0.22,0.65,0.28,1)]"><i /></span>
      </button>

      <template v-if="s.lyricsTranslate">
        <div class="mb-[5px] text-[color:rgba(255,255,255,0.56)] text-[11.5px]">Как показывать</div>
        <div class="grid grid-flow-col [grid-auto-columns:1fr] gap-[3px] mb-[11px] p-[3px] rounded-[9px] bg-[rgba(255,255,255,0.06)]">
          <button
            v-for="item in translateModes"
            :key="item.id"
            type="button"
            :class="segBtnClass(s.lyricsTranslateMode === item.id)"
            @click="ui.set('lyricsTranslateMode', item.id)"
          >
            {{ item.label }}
          </button>
        </div>

        <div class="mb-[5px] text-[color:rgba(255,255,255,0.56)] text-[11.5px]">Язык</div>
        <div class="grid grid-flow-col [grid-auto-columns:1fr] gap-[3px] mb-[11px] p-[3px] rounded-[9px] bg-[rgba(255,255,255,0.06)]">
          <button
            v-for="item in translateTargets"
            :key="item.id"
            type="button"
            :class="segBtnClass(s.lyricsTranslateTarget === item.id)"
            @click="ui.set('lyricsTranslateTarget', item.id)"
          >
            {{ item.label }}
          </button>
        </div>
      </template>
    </div>

    <div class="pt-[6px] px-[12px] pb-[10px] border-t border-[color:rgba(255,255,255,0.07)]">
      <div class="mb-[9px] text-[color:rgba(255,255,255,0.42)] text-[10px] font-[620] tracking-[0.08em] uppercase">Разборы Genius</div>

      <button
        type="button"
        :class="switchClass(s.lyricsAnnotations)"
        @click="ui.set('lyricsAnnotations', !s.lyricsAnnotations)"
      >
        <span>Отмечать строки с разбором</span>
        <span class="relative w-[28px] h-[16px] flex-none rounded-full bg-[rgba(255,255,255,0.18)] transition-[background] duration-[160ms] ease-[ease] [&>i]:absolute [&>i]:top-[3px] [&>i]:left-[3px] [&>i]:w-[10px] [&>i]:h-[10px] [&>i]:rounded-full [&>i]:bg-[rgba(255,255,255,0.8)] [&>i]:[transition:transform_0.16s_cubic-bezier(0.22,0.65,0.28,1)]"><i /></span>
      </button>

      <template v-if="s.lyricsAnnotations">
        <div class="mb-[5px] text-[color:rgba(255,255,255,0.56)] text-[11.5px]">Как отмечать</div>
        <div class="grid grid-flow-col [grid-auto-columns:1fr] gap-[3px] mb-[11px] p-[3px] rounded-[9px] bg-[rgba(255,255,255,0.06)]">
          <button
            v-for="item in marks"
            :key="item.id"
            type="button"
            :class="segBtnClass(s.lyricsAnnotationMark === item.id)"
            @click="ui.set('lyricsAnnotationMark', item.id)"
          >
            {{ item.label }}
          </button>
        </div>
        <div class="mt-[2px] text-[color:rgba(255,255,255,0.34)] text-[10.5px] leading-[1.45]">
          Левый клик по строке перематывает трек, правый - показывает значок
          разбора. Нужен включённый Genius с токеном.
        </div>
      </template>
    </div>

    <div class="pt-[6px] px-[12px] pb-[10px] border-t border-[color:rgba(255,255,255,0.07)]">
      <div class="mb-[9px] text-[color:rgba(255,255,255,0.42)] text-[10px] font-[620] tracking-[0.08em] uppercase">Подвал панели</div>

      <button
        type="button"
        :class="switchClass(s.lyricsShowCredits)"
        @click="ui.set('lyricsShowCredits', !s.lyricsShowCredits)"
      >
        <span>Продюсеры и авторы</span>
        <span class="relative w-[28px] h-[16px] flex-none rounded-full bg-[rgba(255,255,255,0.18)] transition-[background] duration-[160ms] ease-[ease] [&>i]:absolute [&>i]:top-[3px] [&>i]:left-[3px] [&>i]:w-[10px] [&>i]:h-[10px] [&>i]:rounded-full [&>i]:bg-[rgba(255,255,255,0.8)] [&>i]:[transition:transform_0.16s_cubic-bezier(0.22,0.65,0.28,1)]"><i /></span>
      </button>

      <button
        type="button"
        :class="switchClass(s.lyricsShowOrigin)"
        @click="ui.set('lyricsShowOrigin', !s.lyricsShowOrigin)"
      >
        <span>Подпись «Источник»</span>
        <span class="relative w-[28px] h-[16px] flex-none rounded-full bg-[rgba(255,255,255,0.18)] transition-[background] duration-[160ms] ease-[ease] [&>i]:absolute [&>i]:top-[3px] [&>i]:left-[3px] [&>i]:w-[10px] [&>i]:h-[10px] [&>i]:rounded-full [&>i]:bg-[rgba(255,255,255,0.8)] [&>i]:[transition:transform_0.16s_cubic-bezier(0.22,0.65,0.28,1)]"><i /></span>
      </button>

      <div class="mt-[2px] text-[color:rgba(255,255,255,0.34)] text-[10.5px] leading-[1.45]">
        Строка внизу с участниками записи с Genius. Если выключить оба пункта,
        подвал пропадёт полностью.
      </div>
    </div>

    <div class="pt-[6px] px-[12px] pb-[10px] border-t border-[color:rgba(255,255,255,0.07)]">
      <div class="mb-[9px] text-[color:rgba(255,255,255,0.42)] text-[10px] font-[620] tracking-[0.08em] uppercase">Источник по умолчанию</div>
      <div class="grid grid-flow-col [grid-auto-columns:1fr] gap-[3px] mb-[11px] p-[3px] rounded-[9px] bg-[rgba(255,255,255,0.06)]">
        <button
          v-for="item in lyricsSources"
          :key="item.id"
          type="button"
          :class="segBtnClass(s.lyricsSource === item.id)"
          @click="ui.set('lyricsSource', item.id)"
        >
          {{ item.label }}
        </button>
      </div>
      <div class="mt-[2px] text-[color:rgba(255,255,255,0.34)] text-[10.5px] leading-[1.45]">
        Авто: сначала LRCLIB (синхрон), потом Genius. Разборы с Genius
        подтягиваются к синхронному тексту LRCLIB. Кнопки вверху меняют источник
        только для текущего трека.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type {
  LyricsAlign,
  LyricsAnnotationMark,
  LyricsBackdrop,
  LyricsFont,
  LyricsHighlight,
  LyricsSource,
  LyricsTranslateMode,
} from "@/stores/ui/defaults";
import { useUiStore } from "@/stores/ui/index";

const ui = useUiStore();
const s = computed(() => ui.settings);

const RANGE_CLASS =
  "block w-full h-[16px] m-0 bg-transparent cursor-pointer appearance-none [-webkit-appearance:none] [&::-webkit-slider-runnable-track]:h-[3px] [&::-webkit-slider-runnable-track]:rounded-[3px] [&::-webkit-slider-runnable-track]:bg-[rgba(255,255,255,0.16)] [&::-moz-range-track]:h-[3px] [&::-moz-range-track]:rounded-[3px] [&::-moz-range-track]:bg-[rgba(255,255,255,0.16)] [&::-webkit-slider-thumb]:w-[12px] [&::-webkit-slider-thumb]:h-[12px] [&::-webkit-slider-thumb]:mt-[-4.5px] [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#fff] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:[-webkit-appearance:none] [&::-moz-range-thumb]:w-[12px] [&::-moz-range-thumb]:h-[12px] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#fff]";

const SEG_BTN_BASE =
  "px-[4px] py-[6px] border-0 rounded-[7px] text-[11px] whitespace-nowrap cursor-pointer transition-[background,color] duration-[140ms] ease-[ease]";

function segBtnClass(active: boolean) {
  return active
    ? `${SEG_BTN_BASE} on bg-[rgba(255,255,255,0.92)] text-[color:#101014] hover:text-[color:#101014]`
    : `${SEG_BTN_BASE} bg-transparent text-[color:rgba(255,255,255,0.58)] hover:text-[color:#fff]`;
}

const SWITCH_BASE =
  "flex w-full items-center justify-between gap-[10px] min-h-[32px] pt-[4px] pr-[6px] pb-[4px] pl-0 border-0 bg-transparent text-[color:rgba(255,255,255,0.82)] text-[12px] text-left cursor-pointer hover:text-[color:#fff]";

function switchClass(active: boolean) {
  return active
    ? `${SWITCH_BASE} on [&>span:last-child]:bg-[color-mix(in_srgb,var(--accent)_65%,transparent)] [&>span>i]:bg-[#fff] [&>span>i]:translate-x-[12px]`
    : SWITCH_BASE;
}

const FONT_BTN_BASE =
  "flex w-full items-center justify-between gap-[10px] overflow-hidden px-[9px] py-[6px] border-0 rounded-[7px] cursor-pointer text-[13px] text-left text-ellipsis whitespace-nowrap";

function fontBtnClass(active: boolean) {
  return active
    ? `${FONT_BTN_BASE} on bg-[color-mix(in_srgb,var(--accent)_22%,transparent)] text-[color:var(--fg)] hover:bg-[color-mix(in_srgb,var(--accent)_22%,transparent)] hover:text-[color:var(--fg)]`
    : `${FONT_BTN_BASE} text-[color:var(--fg-dim)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[color:var(--fg)]`;
}

const karaokeOn = computed(
  () => s.value.lyricsHighlight === "karaoke" && s.value.lyricsKaraokeWord,
);

function setKaraoke(on: boolean) {
  ui.set("lyricsKaraokeWord", on);
  if (on) ui.set("lyricsHighlight", "karaoke");
  else if (s.value.lyricsHighlight === "karaoke") {
    ui.set("lyricsHighlight", "white");
  }
}

type NumericKey =
  | "lyricsFontSize"
  | "lyricsLineHeight"
  | "lyricsWeight"
  | "lyricsInactive"
  | "lyricsLineBlur"
  | "lyricsBackgroundBlur"
  | "lyricsBackgroundOpacity";

function onNum(key: NumericKey, event: Event) {
  const value = Number((event.target as HTMLInputElement).value);
  if (Number.isFinite(value)) ui.set(key, value);
}

const fonts: Array<{ id: LyricsFont; label: string }> = [
  { id: "sans", label: "Гротеск" },
  { id: "serif", label: "Антиква" },
  { id: "mono", label: "Моно" },
  { id: "custom", label: "Свой" },
];

function onFont(event: Event) {
  const value = (event.target as HTMLInputElement).value.trim();
  if (value) ui.set("lyricsFontCustom", value);
}

type LocalFont = { family: string };
type FontHost = Window & {
  queryLocalFonts?: () => Promise<LocalFont[]>;
};

const PROBE_FAMILIES = [
  "Arial",
  "Arial Black",
  "Bahnschrift",
  "Calibri",
  "Cambria",
  "Candara",
  "Cascadia Code",
  "Cascadia Mono",
  "Century Gothic",
  "Comic Sans MS",
  "Consolas",
  "Constantia",
  "Corbel",
  "Courier New",
  "Ebrima",
  "Franklin Gothic",
  "Gabriola",
  "Gadugi",
  "Garamond",
  "Georgia",
  "Helvetica",
  "Impact",
  "Inter",
  "JetBrains Mono",
  "Lato",
  "Leelawadee UI",
  "Lucida Console",
  "Lucida Sans Unicode",
  "Malgun Gothic",
  "Manrope",
  "Menlo",
  "Meiryo",
  "Microsoft Sans Serif",
  "Montserrat",
  "MS Gothic",
  "Nirmala UI",
  "Nunito",
  "Open Sans",
  "Palatino Linotype",
  "PT Sans",
  "PT Serif",
  "Roboto",
  "Roboto Mono",
  "Rubik",
  "Segoe Print",
  "Segoe Script",
  "Segoe UI",
  "Segoe UI Emoji",
  "Segoe UI Semibold",
  "SF Pro Display",
  "Sitka",
  "Source Sans Pro",
  "Sylfaen",
  "Tahoma",
  "Times New Roman",
  "Trebuchet MS",
  "Verdana",
  "Yu Gothic",
];

const fontQuery = ref("");
const localFonts = ref<string[]>([]);
const fontsLoading = ref(false);
const fontsNotice = ref("");
const needsPermission = ref(false);

function onFontQuery(event: Event) {
  fontQuery.value = (event.target as HTMLInputElement).value;
}

function probeFamilies(): string[] {
  if (typeof document === "undefined" || !document.fonts?.check) return [];
  return PROBE_FAMILIES.filter((family) => {
    try {
      return document.fonts.check(`16px '${family}'`);
    } catch {
      return false;
    }
  });
}

function applyFallback(reason: string) {
  const probed = probeFamilies();
  localFonts.value = probed;
  needsPermission.value = true;
  fontsNotice.value = probed.length
    ? reason
    : `${reason} Впиши название шрифта вручную.`;
}

async function loadFonts(force = false) {
  if (fontsLoading.value) return;
  if (!force && localFonts.value.length) return;
  fontsLoading.value = true;
  fontsNotice.value = "";
  try {
    const query = (window as FontHost).queryLocalFonts;
    if (typeof query !== "function") {
      applyFallback(
        "Системный список шрифтов недоступен — показываю то, что удалось найти.",
      );
      return;
    }
    const found = await query.call(window);
    const families = [...new Set(found.map((item) => item.family))].sort(
      (a, b) => a.localeCompare(b, "ru"),
    );
    if (!families.length) {
      applyFallback("Система вернула пустой список шрифтов.");
      return;
    }
    localFonts.value = families;
    needsPermission.value = false;
    fontsNotice.value = "";
  } catch {
    applyFallback(
      "Доступ к шрифтам системы не выдан — показываю то, что удалось найти.",
    );
  } finally {
    fontsLoading.value = false;
  }
}

const visibleFonts = computed(() => {
  const needle = fontQuery.value.trim().toLowerCase();
  const list = needle
    ? localFonts.value.filter((name) => name.toLowerCase().includes(needle))
    : localFonts.value;
  return list.slice(0, 120);
});

function pickFont(name: string) {
  ui.set("lyricsFontCustom", name);
  fontQuery.value = "";
}

watch(
  () => s.value.lyricsFont,
  (font) => {
    if (font === "custom") void loadFonts();
  },
  { immediate: true },
);

const aligns: Array<{ id: LyricsAlign; label: string }> = [
  { id: "left", label: "Слева" },
  { id: "center", label: "По центру" },
  { id: "right", label: "Справа" },
];

const highlights: Array<{ id: LyricsHighlight; label: string }> = [
  { id: "white", label: "Белая" },
  { id: "accent", label: "Акцент" },
  { id: "karaoke", label: "Караоке" },
];

const backdrops: Array<{ id: LyricsBackdrop; label: string }> = [
  { id: "cover", label: "Обложка" },
  { id: "gradient", label: "Градиент" },
  { id: "solid", label: "Без фона" },
];

const marks: Array<{ id: LyricsAnnotationMark; label: string }> = [
  { id: "underline", label: "Подчёркивание" },
  { id: "tint", label: "Заливка" },
  { id: "dot", label: "Значок" },
  { id: "off", label: "Без метки" },
];

const lyricsSources: Array<{ id: LyricsSource; label: string }> = [
  { id: "auto", label: "Авто" },
  { id: "lrclib", label: "LRCLIB" },
  { id: "genius", label: "Genius" },
];

const translateModes: Array<{ id: LyricsTranslateMode; label: string }> = [
  { id: "under", label: "Под строкой" },
  { id: "replace", label: "Вместо оригинала" },
];

const translateTargets: Array<{ id: string; label: string }> = [
  { id: "ru", label: "Русский" },
  { id: "en", label: "English" },
  { id: "uk", label: "Українська" },
];
</script>

<style scoped>
.lset-anim {
  animation: lset-in 0.16s ease;
}

@keyframes lset-in {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
</style>
