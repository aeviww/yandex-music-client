<template>
  <SettingsSection
    id="settings-behavior"
    title="Поведение"
    description="Как приложение ведёт себя во время работы: внешние эффекты, окно, воспроизведение и фильтры контента."
    icon="mingcute:settings-5-line"
  >
    <div class="space-y-4">
      <SettingsCard>
        <div class="px-5 pb-3 pt-4">
          <div
            class="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[color:var(--fg-faint)]"
          >
            Визуальные эффекты
          </div>
          <p class="mb-0 mt-1.5 text-[11.5px] leading-relaxed text-[color:var(--fg-faint)]">
            Влияют только на внешний вид. На звук не действуют.
          </p>
        </div>

        <SettingToggle
          :model-value="ui.settings.glass"
          label="Эффект стекла на панелях"
          description="Боковая панель, шапка страницы, панель плеера и контекстные меню становятся матовым стеклом: сквозь них размыто видно то, что под ними. Выключишь - панели станут плотными и непрозрачными, а интерфейс чуть быстрее."
          @update:model-value="ui.set('glass', $event)"
        />
        <SettingSlider
          v-if="ui.settings.glass"
          label="Сила размытия"
          description="0 px - панели почти прозрачные без размытия, 40 px - фон за панелью размывается полностью."
          :model-value="ui.settings.glassBlur"
          :min="0"
          :max="40"
          :step="2"
          suffix=" px"
          @update:model-value="ui.set('glassBlur', $event)"
        />
        <SettingToggle
          :model-value="ui.settings.animations"
          label="Анимации интерфейса"
          description="Плавные переходы между страницами, появление меню и движение элементов. Без них интерфейс переключается мгновенно."
          @update:model-value="ui.set('animations', $event)"
        />
        <SettingToggle
          :model-value="ui.settings.thinScrollbar"
          label="Тонкие полосы прокрутки"
          description="Узкие скроллбары во всех списках вместо системных широких."
          @update:model-value="ui.set('thinScrollbar', $event)"
        />
      </SettingsCard>

      <SettingsCard>
        <div class="px-5 pb-3 pt-4">
          <div
            class="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[color:var(--fg-faint)]"
          >
            Обложки и миниатюры
          </div>
          <p class="mb-0 mt-1.5 text-[11.5px] leading-relaxed text-[color:var(--fg-faint)]">
            Показывать ли картинки в боковой панели и в плеере.
          </p>
        </div>

        <SettingToggle
          :model-value="ui.settings.showPlaylistCovers"
          label="Обложки плейлистов в боковой панели"
          description="Рядом с названием каждого плейлиста показывается его миниатюра."
          @update:model-value="ui.set('showPlaylistCovers', $event)"
        />
        <SettingToggle
          :model-value="ui.settings.showPlayerArtwork"
          label="Обложка трека в нижней панели"
          description="Квадрат с обложкой слева от названия трека. По клику открывается альбом."
          @update:model-value="ui.set('showPlayerArtwork', $event)"
        />
      </SettingsCard>

      <SettingsCard>
        <div class="px-5 pb-3 pt-4">
          <div
            class="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[color:var(--fg-faint)]"
          >
            Окно и запуск
          </div>
          <p class="mb-0 mt-1.5 text-[11.5px] leading-relaxed text-[color:var(--fg-faint)]">
            Что происходит при закрытии окна и при следующем запуске.
          </p>
        </div>

        <SettingToggle
          :model-value="ui.settings.minimizeToTray"
          label="Закрытие сворачивает в трей"
          description="Крестик прячет окно в системный трей, музыка продолжает играть. Полностью выйти можно через меню трея."
          @update:model-value="ui.set('minimizeToTray', $event)"
        />
        <SettingToggle
          :model-value="ui.settings.resumeLastSession"
          label="Восстанавливать очередь после запуска"
          description="При старте приложение возвращает трек, очередь и позицию воспроизведения с прошлого раза."
          @update:model-value="ui.set('resumeLastSession', $event)"
        />
        <SettingToggle
          v-if="ui.settings.resumeLastSession"
          :model-value="ui.settings.resumeAutoplay"
          label="Сразу продолжать воспроизведение"
          description="Восстановленный трек заиграет автоматически с той же секунды. Если выключено - трек будет готов, но останется на паузе."
          @update:model-value="ui.set('resumeAutoplay', $event)"
        />
      </SettingsCard>

      <SettingsCard>
        <div class="px-5 pb-3 pt-4">
          <div
            class="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[color:var(--fg-faint)]"
          >
            Воспроизведение
          </div>
          <p class="mb-0 mt-1.5 text-[11.5px] leading-relaxed text-[color:var(--fg-faint)]">
            Как приложение обрабатывает сам звук и переходы между треками.
          </p>
        </div>

        <SettingToggle
          :model-value="ui.settings.autoSkipDisliked"
          label="Автоскип дизлайкнутых треков"
          description="Трек, отмеченный как «Не нравится», пропускается автоматически, когда доходит до него очередь. Сам трек остаётся в списке, но выглядит приглушённым."
          @update:model-value="ui.set('autoSkipDisliked', $event)"
        />
        <SettingToggle
          :model-value="ui.settings.trimSilence"
          label="Подрезать тишину в конце трека"
          description="Если последние секунды трека почти беззвучные, приложение не ждёт их и сразу включает следующий трек."
          @update:model-value="ui.set('trimSilence', $event)"
        />
        <SettingToggle
          :model-value="ui.settings.gaplessEnabled"
          label="Gapless - без пауз между треками"
          description="Следующий трек подгружается заранее и включается встык, без тишины между дорожками - для концертников, миксов и концепт-альбомов. Пока включён, отключает кроссфейд."
          @update:model-value="ui.set('gaplessEnabled', $event)"
        />
        <SettingToggle
          :model-value="ui.settings.normalizeVolume"
          label="Нормализация громкости"
          description="Выравнивает громкость между треками в стиле ReplayGain: тихие записи звучат громче, а слишком громкие - тише, чтобы не тянуться к регулятору при смене трека."
          @update:model-value="ui.set('normalizeVolume', $event)"
        />
        <SettingsRow
          column
          label="Когда очередь закончилась"
          description="Сыграл последний трек списка - дальше или плейлист идёт по кругу, или включается волна, подобранная по этому же плейлисту."
        >
          <SettingsChoice
            :model-value="queueEnd"
            :options="queueEndOptions"
            @update:model-value="setQueueEnd"
          />
        </SettingsRow>
      </SettingsCard>

      <SettingsCard>
        <div class="px-5 pb-3 pt-4">
          <div
            class="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[color:var(--fg-faint)]"
          >
            Фильтры контента
          </div>
          <p class="mb-0 mt-1.5 text-[11.5px] leading-relaxed text-[color:var(--fg-faint)]">
            Подмена зацензуренных версий и отношение к AI-музыке.
          </p>
        </div>

        <SettingToggle
          :model-value="ui.settings.censorBypass"
          label="Обход цензуры"
          description="Если у трека есть незацензуренная версия в открытой базе FckCensorData, приложение играет её вместо запиканной. Работает только для треков из этой базы, остальные играют как обычно."
          @update:model-value="ui.set('censorBypass', $event)"
        />
        <SettingToggle
          v-if="ui.settings.censorBypass"
          :model-value="ui.settings.censorBadge"
          label="Показывать пометку о подмене"
          description="Рядом с названием трека в плеере появляется метка «без цензуры», когда играет подменённая версия."
          @update:model-value="ui.set('censorBadge', $event)"
        />
        <SettingsRow
          column
          label="Что делать с AI-треками"
          description="Реакция на треки, помеченные базой Slopless как сгенерированные нейросетью. «Скипать» - просто переключить дальше, «Дизлайкать и скипать» - ещё и поставить дизлайк, чтобы Яндекс больше не подкидывал его в волне и рекомендациях."
        >
          <SettingsChoice
            :model-value="ui.settings.aiTrackAction"
            :options="aiActions"
            @update:model-value="ui.set('aiTrackAction', $event)"
          />
        </SettingsRow>
      </SettingsCard>
    </div>
  </SettingsSection>
</template>

<script setup lang="ts">
import { computed } from "vue";
import SettingSlider from "@/components/settings/SettingSlider.vue";
import SettingToggle from "@/components/settings/SettingToggle.vue";
import SettingsCard from "@/components/settings/SettingsCard.vue";
import SettingsChoice from "@/components/settings/SettingsChoice.vue";
import SettingsRow from "@/components/settings/SettingsRow.vue";
import SettingsSection from "@/components/settings/SettingsSection.vue";
import type { AiTrackAction } from "@/stores/ui/defaults";
import { useUiStore } from "@/stores/ui/index";

const ui = useUiStore();

const aiActions: Array<{ value: AiTrackAction; label: string }> = [
  { value: "none", label: "Ничего не делать" },
  { value: "skip", label: "Скипать" },
  { value: "dislike", label: "Дизлайкать и скипать" },
];

type QueueEnd = "stop" | "repeat" | "wave";

const queueEnd = computed<QueueEnd>(() => {
  if (ui.settings.repeatPlaylistAlways) return "repeat";
  return ui.settings.autoWaveOnQueueEnd ? "wave" : "stop";
});

const queueEndOptions: Array<{ value: QueueEnd; label: string }> = [
  { value: "stop", label: "Остановиться" },
  { value: "repeat", label: "Повтор плейлиста" },
  { value: "wave", label: "Моя волна по плейлисту" },
];

function setQueueEnd(mode: QueueEnd) {
  ui.set("repeatPlaylistAlways", mode === "repeat");
  ui.set("autoWaveOnQueueEnd", mode === "wave");
  if (mode === "wave") ui.set("autoWaveSource", "playlist");
}
</script>
