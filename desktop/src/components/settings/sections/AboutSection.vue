<template>
  <SettingsSection
    id="settings-about"
    title="О проекте"
    description="Автор, версия сборки, лицензия и использованные проекты."
    icon="mingcute:information-line"
  >
    <div class="space-y-4">
      <div
        class="flex flex-col gap-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:flex-row sm:items-center"
      >
        <img
          class="h-16 w-16 flex-none rounded-xl object-cover"
          :src="avatar"
          alt="elytrya"
        />
        <div class="min-w-0">
          <div class="text-[17px] font-bold tracking-[-0.02em]">Mashiro</div>
          <div class="mt-0.5 text-[12px] text-[color:var(--fg-dim)]">
            неофициальный десктоп-клиент Яндекс Музыки
          </div>
          <div class="mt-2 text-[12px] text-[color:var(--fg-dim)]">
            автор:
            <a
              :href="AUTHOR_URL"
              :class="LINK"
              @click.prevent="openLink(AUTHOR_URL)"
              >elytrya</a
            >
          </div>
        </div>
      </div>

      <SettingsCard>
        <div class="flex gap-3 px-5 py-4 text-[13px]">
          <span class="w-[110px] flex-none text-[color:var(--fg-dim)]"
            >Версия</span
          >
          <span class="flex min-w-0 flex-wrap items-center gap-2">
            <span class="text-[14px] font-bold tracking-[-0.01em]">r1.0</span>
            <span
              class="rounded-full border border-[color-mix(in_srgb,var(--accent)_45%,transparent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] px-2 py-0.5 text-[10.5px] font-bold uppercase leading-tight tracking-[0.04em] text-[var(--accent)]"
            >
              pre-release
            </span>
            <button
              type="button"
              class="rounded-md border border-[var(--line)] bg-transparent px-2 py-0.5 font-mono text-[11px] leading-snug text-[color:var(--fg-dim)] transition hover:border-[color-mix(in_srgb,var(--accent)_50%,var(--line))] hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] hover:text-[var(--fg)]"
              title="Скопировать хэш коммита"
              @click="copyCommit"
            >
              {{ commit }}
            </button>
            <span class="text-[12px] text-[color:var(--fg-faint)]"
              >сборка от {{ buildDate }}</span
            >
          </span>
        </div>

        <div class="flex gap-3 px-5 py-4 text-[13px]">
          <span class="w-[110px] flex-none text-[color:var(--fg-dim)]"
            >Лицензия</span
          >
          <a
            :href="LICENSE_URL"
            :class="LINK"
            class="text-[13px]"
            @click.prevent="openLink(LICENSE_URL)"
            >GPL-3.0</a
          >
        </div>

        <div class="flex gap-3 px-5 py-4 text-[13px]">
          <span class="w-[110px] flex-none text-[color:var(--fg-dim)]"
            >Авторство</span
          >
          <span class="text-[13px] text-[var(--fg)]">
            ООО «Яндекс» к проекту отношения не имеет
          </span>
        </div>
      </SettingsCard>

      <SettingsCard>
        <div class="px-5 pb-2 pt-4">
          <div
            class="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[color:var(--fg-faint)]"
          >
            Благодарности
          </div>
          <p class="mb-0 mt-1.5 text-[11.5px] leading-relaxed text-[color:var(--fg-faint)]">
            Проекты, без которых этот клиент не работал бы в текущем виде.
          </p>
        </div>

        <a
          v-for="item in credits"
          :key="item.url"
          :href="item.url"
          :title="item.url"
          class="group flex flex-col gap-0.5 px-5 py-3 transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--fg)_3%,transparent)]"
          @click.prevent="openLink(item.url)"
        >
          <span :class="LINK" class="text-[13px] font-medium">{{
            item.name
          }}</span>
          <span class="text-[11.5px] text-[color:var(--fg-dim)]">{{
            item.desc
          }}</span>
        </a>
      </SettingsCard>
    </div>
  </SettingsSection>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Notify } from "quasar";
import { api } from "@/api/client";
import SettingsCard from "@/components/settings/SettingsCard.vue";
import SettingsSection from "@/components/settings/SettingsSection.vue";
import { LINK } from "@/components/settings/classes";
import { cachedImage, loadCachedImage } from "@/lib/imageCache";

const AUTHOR_URL = "https://github.com/elytrya";
const AVATAR_URL = "https://github.com/elytrya.png?size=200";
const LICENSE_URL = "https://www.gnu.org/licenses/gpl-3.0.html";
const FALLBACK = "icons/128x128.png";

const avatar = ref(cachedImage("elytrya") ?? FALLBACK);

const commit = __APP_COMMIT__;
const buildDate = formatDate(__APP_COMMIT_DATE__);

function formatDate(value: string): string {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return value;
  return `${match[3]}.${match[2]}.${match[1]}`;
}

async function copyCommit() {
  try {
    await navigator.clipboard.writeText(commit);
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
  avatar.value = await loadCachedImage("elytrya", AVATAR_URL);
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
    desc: "оттуда позаимствована логика подмены зацензуренных треков",
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
