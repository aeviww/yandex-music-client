<template>
  <SettingsSection
    id="settings-genius"
    title="Genius"
    description="Разборы строчек, авторы и продюсеры с genius.com. Нужен бесплатный Client Access Token — порядок действий ниже. Чем берётся сам текст, настраивается в разделе «Текст песни»."
    icon="mingcute:music-line"
  >
    <SettingsCard>
      <SettingToggle
        :model-value="genius.enabled"
        label="Включить Genius"
        description="В окне текста песни появится второй источник с цитатами и участниками записи."
        @update:model-value="genius.apply({ enabled: $event })"
      />

      <SettingsRow
        column
        label="Client Access Token"
        description="genius.com/api-clients → New API Client. App Name - любое, например mashiro. App Website URL и Redirect URI обязательные, подойдёт https://example.com - без них форма не сохраняется. После Save нажми Generate Access Token и вставь строку сюда. Токен хранится только на этом компьютере."
      >
        <input
          :class="INPUT"
          :value="genius.token"
          type="password"
          spellcheck="false"
          autocomplete="off"
          placeholder="вставь токен"
          @change="setToken"
        />
      </SettingsRow>

      <SettingsRow
        column
        label="Проверка и ссылки"
        :description="genius.checkResult || 'Токен ещё не проверяли.'"
      >
        <div class="flex flex-wrap gap-2">
          <button
            :class="BUTTON"
            type="button"
            :disabled="genius.checking || !genius.token.trim()"
            @click="genius.check()"
          >
            {{ genius.checking ? "Проверяем…" : "Проверить токен" }}
          </button>
          <button
            :class="BUTTON"
            type="button"
            @click="open('https://genius.com/api-clients')"
          >
            Получить токен
          </button>
          <button
            :class="BUTTON"
            type="button"
            @click="open('https://docs.genius.com/')"
          >
            Документация
          </button>
          <button :class="BUTTON" type="button" @click="clear">
            Очистить кеш Genius
          </button>
        </div>
      </SettingsRow>

      <SettingToggle
        :model-value="genius.showQuotes"
        label="Показывать цитаты и разборы"
        description="Комментарии сообщества Genius к отдельным строчкам."
        @update:model-value="genius.apply({ showQuotes: $event })"
      />
    </SettingsCard>
  </SettingsSection>
</template>

<script setup lang="ts">
import { Notify } from "quasar";
import { api } from "@/api/client";
import SettingToggle from "@/components/settings/SettingToggle.vue";
import SettingsCard from "@/components/settings/SettingsCard.vue";
import SettingsRow from "@/components/settings/SettingsRow.vue";
import SettingsSection from "@/components/settings/SettingsSection.vue";
import { BUTTON, INPUT } from "@/components/settings/classes";
import { useGeniusStore } from "@/stores/genius";

const genius = useGeniusStore();

function setToken(event: Event) {
  const input = event.target as HTMLInputElement;
  const value = input.value.trim();
  input.value = value;
  genius.apply({ token: value, enabled: value ? true : genius.enabled });
}

function open(url: string) {
  void api.openExternal(url);
}

async function clear() {
  await genius.clearCache();
  Notify.create({ message: "Кеш Genius очищен" });
}
</script>
