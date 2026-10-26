<template>
  <SettingsSection
    id="settings-lyrics"
    title="Текст песни"
    description="Всё то же есть в самой панели текста - кнопка с шестерёнкой справа сверху."
    icon="mingcute:subtitle-line"
  >
    <div class="space-y-4">
      <SettingsCard>
        <SettingsRow
          column
          label="Источник текста"
          description="«Авто» - сначала LRCLIB (там чаще есть синхронный текст), потом Genius. Яндекс не спрашивается, пока его не выберешь вручную. В самой панели источник переключается для одного трека."
        >
          <SettingsChoice
            :model-value="ui.settings.lyricsSource"
            :options="sources"
            @update:model-value="ui.set('lyricsSource', $event)"
          />
        </SettingsRow>
      </SettingsCard>

      <SettingsCard>
        <div class="px-5 pb-3 pt-4">
          <div
            class="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[color:var(--fg-faint)]"
          >
            Шрифт и строки
          </div>
        </div>

        <SettingsRow
          label="Гарнитура"
          description="Каким шрифтом набран текст песни."
        >
          <SettingsChoice
            :model-value="ui.settings.lyricsFont"
            :options="fonts"
            @update:model-value="ui.set('lyricsFont', $event)"
          />
        </SettingsRow>

        <SettingsRow
          v-if="ui.settings.lyricsFont === 'custom'"
          label="Свой шрифт"
          description="Имя шрифта, установленного в системе. Можно перечислить несколько через запятую - возьмётся первый доступный."
        >
          <input
            :class="INPUT"
            type="text"
            placeholder="Например: Inter"
            :value="ui.settings.lyricsFontCustom"
            @change="onCustomFont"
          />
        </SettingsRow>

        <SettingsRow
          label="Выравнивание"
          description="Положение строк в области текста."
        >
          <SettingsChoice
            :model-value="ui.settings.lyricsAlign"
            :options="aligns"
            @update:model-value="ui.set('lyricsAlign', $event)"
          />
        </SettingsRow>

        <SettingsRow
          label="Активная строка"
          description="«Караоке» заливает строку по ходу песни - нужен синхронный текст."
        >
          <SettingsChoice
            :model-value="ui.settings.lyricsHighlight"
            :options="highlights"
            @update:model-value="ui.set('lyricsHighlight', $event)"
          />
        </SettingsRow>

        <SettingToggle
          :model-value="
            ui.settings.lyricsHighlight === 'karaoke' &&
            ui.settings.lyricsKaraokeWord
          "
          label="Караоке-режим"
          description="Активная строка заливается по словам по ходу песни. Сам включает подсветку «Караоке» выше - нужен синхронный текст."
          @update:model-value="setKaraoke($event)"
        />

        <SettingSlider
          label="Размер строк"
          description="Размер текста песни."
          :model-value="ui.settings.lyricsFontSize"
          :min="18"
          :max="72"
          :step="1"
          suffix=" px"
          @update:model-value="ui.set('lyricsFontSize', $event)"
        />

        <SettingSlider
          label="Интерлиньяж"
          description="Расстояние между строками."
          :model-value="ui.settings.lyricsLineHeight"
          :min="1"
          :max="1.8"
          :step="0.02"
          suffix=""
          @update:model-value="ui.set('lyricsLineHeight', $event)"
        />

        <SettingSlider
          label="Жирность"
          description="Насыщенность шрифта активной строки."
          :model-value="ui.settings.lyricsWeight"
          :min="400"
          :max="900"
          :step="50"
          suffix=""
          @update:model-value="ui.set('lyricsWeight', $event)"
        />

        <SettingSlider
          label="Яркость остальных строк"
          description="Насколько видны строки вокруг активной."
          :model-value="ui.settings.lyricsInactive"
          :min="8"
          :max="70"
          :step="1"
          suffix="%"
          @update:model-value="ui.set('lyricsInactive', $event)"
        />

        <SettingSlider
          label="Размытие строк"
          description="Размытие строк вокруг активной."
          :model-value="ui.settings.lyricsLineBlur"
          :min="0"
          :max="8"
          :step="0.5"
          suffix=" px"
          @update:model-value="ui.set('lyricsLineBlur', $event)"
        />
      </SettingsCard>

      <SettingsCard>
        <div class="px-5 pb-3 pt-4">
          <div
            class="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[color:var(--fg-faint)]"
          >
            Фон и эффекты
          </div>
        </div>

        <SettingsRow
          label="Фон панели"
          description="Что показывать за текстом."
        >
          <SettingsChoice
            :model-value="ui.settings.lyricsBackdrop"
            :options="backdrops"
            @update:model-value="ui.set('lyricsBackdrop', $event)"
          />
        </SettingsRow>

        <SettingSlider
          label="Размытие фона"
          description="Размытие обложки за текстом."
          :model-value="ui.settings.lyricsBackgroundBlur"
          :min="0"
          :max="90"
          :step="1"
          suffix=" px"
          @update:model-value="ui.set('lyricsBackgroundBlur', $event)"
        />

        <SettingSlider
          label="Яркость фона"
          description="Насколько виден фон."
          :model-value="ui.settings.lyricsBackgroundOpacity"
          :min="0"
          :max="100"
          :step="1"
          suffix="%"
          @update:model-value="ui.set('lyricsBackgroundOpacity', $event)"
        />

        <SettingToggle
          :model-value="ui.settings.lyricsShowArtwork"
          label="Большая обложка"
          description="Показывать обложку рядом с текстом."
          @update:model-value="ui.set('lyricsShowArtwork', $event)"
        />

        <SettingToggle
          :model-value="ui.settings.lyricsGlow"
          label="Свечение активной строки"
          description="Мягкий свет вокруг текущей строки."
          @update:model-value="ui.set('lyricsGlow', $event)"
        />

        <SettingToggle
          :model-value="ui.settings.lyricsMotion"
          label="Анимация строк"
          description="Плавно прокручивать и увеличивать активную строку."
          @update:model-value="ui.set('lyricsMotion', $event)"
        />

        <SettingToggle
          :model-value="ui.settings.lyricsVisualizer"
          label="Визуализатор на весь экран"
          description="Спектр звука фоном в полноэкранном режиме текста - ambient «обложка + текст + визуализатор»."
          @update:model-value="ui.set('lyricsVisualizer', $event)"
        />

        <SettingToggle
          :model-value="ui.settings.lyricsShowCredits"
          label="Участники записи"
          description="Показывать продюсеров и авторов с Genius в подвале панели текста."
          @update:model-value="ui.set('lyricsShowCredits', $event)"
        />

        <SettingToggle
          :model-value="ui.settings.lyricsShowOrigin"
          label="Подпись «Источник»"
          description="Строка с названием сервиса, откуда загружен текст. Если выключить её и участников записи, подвал исчезнет."
          @update:model-value="ui.set('lyricsShowOrigin', $event)"
        />
      </SettingsCard>

      <SettingsCard>
        <div class="px-5 pb-3 pt-4">
          <div
            class="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[color:var(--fg-faint)]"
          >
            Перевод
          </div>
        </div>

        <SettingToggle
          :model-value="ui.settings.lyricsTranslate"
          label="Переводить текст"
          description="Показывать перевод строк песни. Берётся автоматически, работает и для синхронного текста."
          @update:model-value="ui.set('lyricsTranslate', $event)"
        />

        <SettingsRow
          v-if="ui.settings.lyricsTranslate"
          label="Как показывать"
          description="«Под строкой» - оригинал и перевод вместе; «Вместо» - только перевод."
        >
          <SettingsChoice
            :model-value="ui.settings.lyricsTranslateMode"
            :options="translateModes"
            @update:model-value="ui.set('lyricsTranslateMode', $event)"
          />
        </SettingsRow>

        <SettingsRow
          v-if="ui.settings.lyricsTranslate"
          label="Язык перевода"
          description="На какой язык переводить текст песни."
        >
          <SettingsChoice
            :model-value="ui.settings.lyricsTranslateTarget"
            :options="translateTargets"
            @update:model-value="ui.set('lyricsTranslateTarget', $event)"
          />
        </SettingsRow>
      </SettingsCard>

      <SettingsCard>
        <div class="px-5 pb-3 pt-4">
          <div
            class="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[color:var(--fg-faint)]"
          >
            Разборы Genius
          </div>
        </div>

        <SettingToggle
          :model-value="ui.settings.lyricsAnnotations"
          label="Разборы строк"
          description="Отмечать строки, у которых на Genius есть аннотация. Работает и с синхронным текстом из LRCLIB."
          @update:model-value="ui.set('lyricsAnnotations', $event)"
        />

        <SettingsRow
          v-if="ui.settings.lyricsAnnotations"
          label="Как отмечать"
          description="Левый клик по строке перематывает трек, правый - показывает значок разбора, по нему откроется аннотация."
        >
          <SettingsChoice
            :model-value="ui.settings.lyricsAnnotationMark"
            :options="marks"
            @update:model-value="ui.set('lyricsAnnotationMark', $event)"
          />
        </SettingsRow>

        <SettingsRow
          label="Сбросить вид текста"
          description="Шрифт, фон, эффекты и источник вернутся к исходным."
        >
          <button :class="BUTTON" type="button" @click="ui.resetLyrics()">
            Сбросить
          </button>
        </SettingsRow>
      </SettingsCard>
    </div>
  </SettingsSection>
</template>

<script setup lang="ts">
import SettingSlider from "@/components/settings/SettingSlider.vue";
import SettingToggle from "@/components/settings/SettingToggle.vue";
import SettingsCard from "@/components/settings/SettingsCard.vue";
import SettingsChoice from "@/components/settings/SettingsChoice.vue";
import SettingsRow from "@/components/settings/SettingsRow.vue";
import SettingsSection from "@/components/settings/SettingsSection.vue";
import { BUTTON, INPUT } from "@/components/settings/classes";
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

const sources: Array<{ value: LyricsSource; label: string }> = [
  { value: "auto", label: "Авто" },
  { value: "lrclib", label: "LRCLIB" },
  { value: "genius", label: "Genius" },
  { value: "yandex", label: "Яндекс" },
];

const fonts: Array<{ value: LyricsFont; label: string }> = [
  { value: "sans", label: "Гротеск" },
  { value: "serif", label: "Антиква" },
  { value: "mono", label: "Моно" },
  { value: "custom", label: "Свой" },
];

function onCustomFont(event: Event) {
  ui.set("lyricsFontCustom", (event.target as HTMLInputElement).value.trim());
}

const aligns: Array<{ value: LyricsAlign; label: string }> = [
  { value: "left", label: "Слева" },
  { value: "center", label: "По центру" },
  { value: "right", label: "Справа" },
];

const highlights: Array<{ value: LyricsHighlight; label: string }> = [
  { value: "white", label: "Белая" },
  { value: "accent", label: "Акцент" },
  { value: "karaoke", label: "Караоке" },
];

const backdrops: Array<{ value: LyricsBackdrop; label: string }> = [
  { value: "cover", label: "Обложка" },
  { value: "gradient", label: "Градиент" },
  { value: "solid", label: "Без фона" },
];

const marks: Array<{ value: LyricsAnnotationMark; label: string }> = [
  { value: "underline", label: "Подчёркивание" },
  { value: "tint", label: "Заливка" },
  { value: "dot", label: "Значок" },
  { value: "off", label: "Без метки" },
];

function setKaraoke(on: boolean) {
  ui.set("lyricsKaraokeWord", on);
  if (on) ui.set("lyricsHighlight", "karaoke");
  else if (ui.settings.lyricsHighlight === "karaoke") {
    ui.set("lyricsHighlight", "white");
  }
}

const translateModes: Array<{ value: LyricsTranslateMode; label: string }> = [
  { value: "under", label: "Под строкой" },
  { value: "replace", label: "Вместо оригинала" },
];

const translateTargets: Array<{ value: string; label: string }> = [
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
  { value: "uk", label: "Українська" },
];
</script>
