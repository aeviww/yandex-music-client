<template>
  <SettingsSection
    id="settings-downloads"
    title="Загрузки и качество"
    description="Скачанные треки играются с диска и не тратят трафик."
    icon="mingcute:download-2-line"
  >
    <SettingsCard>
      <SettingsRow
        label="Папка для загрузок"
        :description="`Пусто - папка по умолчанию: ${defaultDir || 'Музыка/Mashiro'}`"
      >
        <input
          :class="INPUT"
          :value="ui.settings.downloadDir"
          type="text"
          spellcheck="false"
          :placeholder="defaultDir"
          @change="setDir"
        />
      </SettingsRow>

      <SettingsRow label="Скачано" :description="info">
        <div class="flex flex-wrap gap-2">
          <button :class="BUTTON" type="button" @click="refresh">
            Обновить
          </button>
          <button :class="BUTTON" type="button" @click="useDefault">
            Папка по умолчанию
          </button>
        </div>
      </SettingsRow>

      <SettingToggle
        :model-value="ui.settings.preferLocalFiles"
        label="Сначала искать скачанный файл"
        description="Если трек уже есть на диске - играем его, иначе берём из сети."
        @update:model-value="ui.set('preferLocalFiles', $event)"
      />

      <SettingsRow
        label="Качество воспроизведения"
        description="Максимум, что отдаёт Яндекс для твоей подписки."
      >
        <SettingsChoice
          :model-value="player.quality"
          :options="qualities"
          @update:model-value="player.setQuality($event)"
        />
      </SettingsRow>

      <SettingToggle
        :model-value="ui.settings.crossfadeEnabled"
        label="Плавные переходы"
        description="Старый трек угасает, новый плавно разгорается."
        @update:model-value="ui.set('crossfadeEnabled', $event)"
      />

      <SettingSlider
        v-if="ui.settings.crossfadeEnabled"
        :model-value="ui.settings.crossfadeSeconds"
        label="Длительность перехода"
        description="Сколько длится угасание и разгорание."
        :min="0.5"
        :max="8"
        :step="0.5"
        suffix=" с"
        @update:model-value="ui.set('crossfadeSeconds', $event)"
      />
    </SettingsCard>
  </SettingsSection>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api } from "@/api/client";
import type { Quality } from "@/api/types";
import SettingSlider from "@/components/settings/SettingSlider.vue";
import SettingToggle from "@/components/settings/SettingToggle.vue";
import SettingsCard from "@/components/settings/SettingsCard.vue";
import SettingsChoice from "@/components/settings/SettingsChoice.vue";
import SettingsRow from "@/components/settings/SettingsRow.vue";
import SettingsSection from "@/components/settings/SettingsSection.vue";
import { BUTTON, INPUT } from "@/components/settings/classes";
import { usePlayerStore } from "@/stores/player/index";
import { useUiStore } from "@/stores/ui/index";

const ui = useUiStore();
const player = usePlayerStore();

const defaultDir = ref("");
const info = ref("Считаем…");

const qualities: Array<{ value: Quality; label: string }> = [
  { value: "low", label: "Экономное" },
  { value: "normal", label: "Стандартное" },
  { value: "high", label: "Высокое" },
  { value: "lossless", label: "Максимальное" },
];

function setDir(event: Event) {
  const value = (event.target as HTMLInputElement).value.trim();
  ui.set("downloadDir", value);
  void refresh();
}

function useDefault() {
  ui.set("downloadDir", "");
  void refresh();
}

async function refresh() {
  try {
    const [count, mb] = await api.downloadsInfo(
      ui.settings.downloadDir || null,
    );
    info.value = count ? `${count} файлов, ${mb} МБ` : "Пока ничего не скачано";
  } catch {
    info.value = "Папка недоступна";
  }
}

onMounted(async () => {
  defaultDir.value = await api.defaultDownloadDir().catch(() => "");
  void refresh();
});
</script>
