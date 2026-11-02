<template>
  <SettingsSection
    id="settings-about"
    title="О проекте"
    description="Версия, автор и открытый код, на котором держится клиент."
    icon="mingcute:information-line"
  >
    <SettingsCard>
      <div class="flex items-center gap-3.5 px-5 py-4">
        <img
          class="h-12 w-12 flex-none rounded-[12px] object-cover ring-1 ring-[var(--line)]"
          :src="avatar"
          alt="aeviww"
        />
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <span class="text-[15.5px] font-semibold tracking-[-0.02em]"
              >mashiro</span
            >
            <span
              class="rounded-full border border-[color-mix(in_srgb,var(--accent)_35%,var(--line))] px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.06em] text-[var(--accent)]"
            >
              pre-release
            </span>
          </div>
          <div class="mt-0.5 text-[12px] text-[color:var(--fg-dim)]">
            неофициальный десктоп-клиент Яндекс Музыки
          </div>
        </div>
        <a
          :href="AUTHOR_URL"
          class="group inline-flex flex-none items-center gap-1.5 rounded-lg border border-[var(--line)] px-2.5 py-1.5 text-[11.5px] text-[color:var(--fg-dim)] no-underline transition-colors duration-150 hover:border-[color:color-mix(in_srgb,var(--fg)_16%,var(--line))] hover:text-[var(--fg)]"
          @click.prevent="openLink(AUTHOR_URL)"
        >
          <Icon name="mingcute:github-line" :size="14" />
          aeviww
          <Icon
            name="mingcute:external-link-line"
            :size="12"
            class="text-[color:var(--fg-faint)]"
          />
        </a>
      </div>

      <div
        class="grid gap-1 px-5 py-3 text-[12.5px] sm:grid-cols-[92px_minmax(0,1fr)] sm:items-center sm:gap-3"
      >
        <span class="text-[color:var(--fg-faint)]">Версия</span>
        <div class="flex min-w-0 flex-wrap items-center gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-2 py-1 font-mono text-[11px] text-[color:var(--fg-dim)] transition-colors duration-150 hover:text-[var(--fg)]"
            title="Скопировать хэш коммита"
            @click="copyCommit"
          >
            <Icon name="mingcute:git-commit-line" :size="13" />
            {{ version.hash }}
            <Icon
              name="mingcute:copy-line"
              :size="12"
              class="text-[color:var(--fg-faint)]"
            />
          </button>
          <span class="text-[11.5px] text-[color:var(--fg-faint)]">
            сборка от {{ buildDate }}
          </span>
        </div>
      </div>

      <div
        class="grid gap-1 px-5 py-3 text-[12.5px] sm:grid-cols-[92px_minmax(0,1fr)] sm:items-center sm:gap-3"
      >
        <span class="text-[color:var(--fg-faint)]">Лицензия</span>
        <a
          :href="LICENSE_URL"
          class="w-fit text-[12.5px] text-[color:var(--accent)] no-underline transition-opacity duration-150 hover:opacity-75"
          @click.prevent="openLink(LICENSE_URL)"
          >GPL-3.0</a
        >
      </div>

      <div
        class="grid gap-1 px-5 py-3 text-[12.5px] sm:grid-cols-[92px_minmax(0,1fr)] sm:gap-3"
      >
        <span class="text-[color:var(--fg-faint)]">Авторство</span>
        <span class="text-[color:var(--fg-dim)]">
          ООО «Яндекс» к проекту отношения не имеет
        </span>
      </div>
    </SettingsCard>

    <SettingsCard>
      <div class="flex items-baseline justify-between gap-3 px-5 pb-1 pt-2">
        <span
          class="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[color:var(--fg-faint)]"
        >
          Благодарности
        </span>
        <span class="text-[11px] text-[color:var(--fg-faint)]">
          проекты с открытым кодом
        </span>
      </div>

      <a
        v-for="item in credits"
        :key="item.url"
        :href="item.url"
        :title="item.url"
        class="group flex items-center gap-3 px-5 py-2.5 no-underline transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--fg)_3%,transparent)]"
        @click.prevent="openLink(item.url)"
      >
        <div class="min-w-0 flex-1">
          <div
            class="truncate text-[12.5px] font-medium text-[var(--fg)] transition-colors duration-150 group-hover:text-[var(--accent)]"
          >
            {{ item.name }}
          </div>
          <div class="mt-0.5 truncate text-[11.5px] text-[color:var(--fg-dim)]">
            {{ item.desc }}
          </div>
        </div>
        <Icon
          name="mingcute:external-link-line"
          :size="14"
          class="flex-none text-[color:var(--fg-faint)] transition-colors duration-150 group-hover:text-[var(--accent)]"
        />
      </a>
    </SettingsCard>
  </SettingsSection>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { Notify } from "quasar";
import { api } from "@/api/client";
import SettingsCard from "@/components/settings/SettingsCard.vue";
import SettingsSection from "@/components/settings/SettingsSection.vue";
import { cachedImage, loadCachedImage } from "@/lib/imageCache";
import { appVersion, loadVersion } from "@/lib/version";

const AUTHOR_URL = "https://github.com/aeviww";
const AVATAR_URL = "https://github.com/aeviww.png?size=200";
const LICENSE_URL = "https://www.gnu.org/licenses/gpl-3.0.html";
const FALLBACK = "icons/128x128.png";

const avatar = ref(cachedImage("aeviww") ?? FALLBACK);
const version = appVersion;
const buildDate = computed(() => formatDate(version.value.date));

function formatDate(value: string): string {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return value || "неизвестно";
  return `${match[3]}.${match[2]}.${match[1]}`;
}

async function copyCommit() {
  try {
    await navigator.clipboard.writeText(version.value.hash);
    Notify.create({ message: "Хэш коммита скопирован" });
  } catch {
    Notify.create({
      type: "negative",
      message: "Не удалось скопировать хэш",
    });
  }
}

function openLink(url: string) {
  void api.openExternal(url);
}

onMounted(async () => {
  void loadVersion();
  avatar.value = await loadCachedImage("aeviww", AVATAR_URL);
});

const credits = [
  {
    name: "MarshalX/yandex-music-api",
    desc: "описание неофициального API Яндекс Музыки",
    url: "https://github.com/MarshalX/yandex-music-api",
  },
  {
    name: "vyfor/yandex-music-rs",
    desc: "схемы ответов API для Rust-части",
    url: "https://github.com/vyfor/yandex-music-rs",
  },
  {
    name: "Hazzz895/FckCensor",
    desc: "логика подмены зацензуренных треков",
    url: "https://github.com/Hazzz895/FckCensor",
  },
  {
    name: "Hazzz895/FckCensorData",
    desc: "база ссылок на незацензуренные версии треков",
    url: "https://github.com/Hazzz895/FckCensorData",
  },
  {
    name: "alexeyfv/slopless",
    desc: "база артистов с музыкой, сгенерированной нейросетями",
    url: "https://github.com/alexeyfv/slopless",
  },
];
</script>
