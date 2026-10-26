<template>
  <SettingsSection
    id="settings-player"
    title="Плеер"
    description="Вид плеера настраивается прямо на самом плеере — без списков и табличек."
    icon="mingcute:play-fill"
  >
    <SettingsCard>
      <SettingsRow
        column
        label="Режим редактирования"
        description="Включи его — и меняй плеер живьём: всё обновляется сразу на экране."
      >
        <ul class="m-0 flex list-none flex-col gap-2 p-0">
          <li
            v-for="step in steps"
            :key="step.icon"
            class="flex items-center gap-2.5 text-[12.5px] leading-snug text-[color:var(--fg-dim)]"
          >
            <Icon
              :name="step.icon"
              :size="14"
              class="flex-none text-[var(--accent)]"
            />
            <span>{{ step.text }}</span>
          </li>
        </ul>

        <div class="mt-2 flex flex-wrap items-center gap-3">
          <button
            :class="BUTTON_ACCENT_OUTLINE"
            type="button"
            @click="editOnPlayer"
          >
            <Icon name="mingcute:layout-left-line" :size="15" />
            Редактировать на плеере
          </button>
          <span class="text-[12px] text-[color:var(--fg-faint)]">
            Или просто кликни правой кнопкой мыши по пустому месту плеера.
          </span>
        </div>
      </SettingsRow>

      <SettingToggle
        label="Визуализатор"
        description="Живой спектр звука фоном в нижней панели. Требует воспроизведения."
        :model-value="ui.settings.playerVisualizer"
        @update:model-value="ui.set('playerVisualizer', $event)"
      />

      <SettingToggle
        label="Показывать тайминги"
        description="Текущее время и длительность по краям полосы прогресса."
        :model-value="ui.settings.playerShowTimes"
        @update:model-value="ui.set('playerShowTimes', $event)"
      />

      <SettingsRow
        label="Сбросить размеры плеера"
        description="Высота, отступы и пропорции вернутся к исходным."
      >
        <button :class="BUTTON" type="button" @click="ui.resetPlayerLayout()">
          Сбросить
        </button>
      </SettingsRow>

      <SettingsRow
        label="Сбросить раскладку кнопок"
        description="Кнопки плеера и мини-плеера вернутся на свои места."
      >
        <button :class="BUTTON" type="button" @click="ui.resetPlayerButtons()">
          Сбросить
        </button>
      </SettingsRow>
    </SettingsCard>
  </SettingsSection>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import SettingToggle from "@/components/settings/SettingToggle.vue";
import SettingsCard from "@/components/settings/SettingsCard.vue";
import SettingsRow from "@/components/settings/SettingsRow.vue";
import SettingsSection from "@/components/settings/SettingsSection.vue";
import { BUTTON, BUTTON_ACCENT_OUTLINE } from "@/components/settings/classes";
import { useUiStore } from "@/stores/ui/index";

const ui = useUiStore();
const route = useRoute();
const router = useRouter();

function editOnPlayer() {
  ui.playerEditReturnPath = router.resolve({
    path: "/settings",
    query: { ...route.query, section: "player" },
  }).fullPath;
  if (!ui.settings.playerEditMode) ui.togglePlayerEdit(true);
  closeSettings();
}

function closeSettings() {
  const back = window.history.state?.back;
  if (typeof back === "string" && back && !back.startsWith("/settings")) {
    router.back();
  } else {
    void router.replace("/");
  }
}

const steps = [
  {
    icon: "mingcute:dots-line",
    text: "Перетаскивай любую кнопку между левой, центральной и правой частями",
  },
  {
    icon: "mingcute:close-line",
    text: "Лишнее тяни в корзину «Скрытые кнопки», оттуда же возвращай обратно",
  },
  {
    icon: "mingcute:fullscreen-line",
    text: "Верхний край тянет высоту, боковой — ширину блока с треком",
  },
  {
    icon: "mingcute:settings-5-line",
    text: "Ползунки рядом — обложка, иконки, отступы, полоса прогресса",
  },
  {
    icon: "mingcute:check-line",
    text: "«Готово» сохраняет, «Отмена» возвращает всё как было",
  },
];
</script>
