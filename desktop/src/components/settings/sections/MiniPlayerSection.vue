<template>
  <SettingsSection
    id="settings-mini"
    title="Мини-плеер"
    description="Компактное окно поверх других приложений настраивается здесь, в большом окне. Изменения сохраняются сразу и видны в предпросмотре."
    icon="mingcute:miniplayer-fill"
  >
    <MiniLayoutEditor />

    <SettingsCard class="mt-4">
      <SettingsRow
        label="Сбросить вид мини-плеера"
        description="Размер окна, отступы и прозрачность вернутся к исходным."
      >
        <button :class="BUTTON" type="button" @click="ui.resetMiniLayout()">
          Сбросить
        </button>
      </SettingsRow>
    </SettingsCard>
  </SettingsSection>
</template>

<script setup lang="ts">
import MiniLayoutEditor from "@/components/player/MiniLayoutEditor.vue";
import SettingsCard from "@/components/settings/SettingsCard.vue";
import SettingsRow from "@/components/settings/SettingsRow.vue";
import SettingsSection from "@/components/settings/SettingsSection.vue";
import { BUTTON } from "@/components/settings/classes";
import { useUiStore } from "@/stores/ui/index";

const ui = useUiStore();
</script>
