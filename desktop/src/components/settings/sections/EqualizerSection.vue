<template>
  <SettingsSection
    id="settings-equalizer"
    title="Эквалайзер"
    description="10 полос, предусиление и готовые пресеты. Применяется сразу."
    icon="mingcute:wave-line"
  >
    <EqualizerPanel />
  </SettingsSection>
</template>

<script setup lang="ts">
import EqualizerPanel from "@/components/settings/EqualizerPanel.vue";
import SettingsSection from "@/components/settings/SettingsSection.vue";
</script>
