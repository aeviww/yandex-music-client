<template>
  <SettingsSection
    id="settings-cache"
    title="Кеш"
    description="Страницы открываются из кеша мгновенно, а свежие данные подгружаются фоном."
    icon="mingcute:delete-2-line"
  >
    <SettingsCard>
      <SettingToggle
        :model-value="ui.settings.cacheEnabled"
        label="Кешировать данные"
        description="Плейлисты, треки, волна, тексты песен."
        @update:model-value="ui.set('cacheEnabled', $event)"
      />

      <SettingsRow label="Занято" :description="`${size} КБ локального кеша.`">
        <button :class="BUTTON" type="button" @click="clear">
          Очистить кеш
        </button>
      </SettingsRow>
    </SettingsCard>
  </SettingsSection>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Notify } from "quasar";
import SettingToggle from "@/components/settings/SettingToggle.vue";
import SettingsCard from "@/components/settings/SettingsCard.vue";
import SettingsRow from "@/components/settings/SettingsRow.vue";
import SettingsSection from "@/components/settings/SettingsSection.vue";
import { BUTTON } from "@/components/settings/classes";
import { cacheSizeKb, clearCache } from "@/lib/cache";
import { useUiStore } from "@/stores/ui/index";

const ui = useUiStore();
const size = ref(cacheSizeKb());

function clear() {
  clearCache();
  size.value = cacheSizeKb();
  Notify.create({ message: "Кеш очищен" });
}
</script>
