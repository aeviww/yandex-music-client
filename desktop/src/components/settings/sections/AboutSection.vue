<template>
  <SettingsSection
    id="settings-about"
    title="О проекте"
    description="Версия, автор и проекты, на которых держится клиент."
    icon="mingcute:information-line"
  >
    <div class="space-y-4">
      <SettingsCard>
        <div class="flex items-center gap-4 px-5 py-5">
          <img
            class="h-11 w-11 flex-none rounded-lg object-cover"
            :src="avatar"
            alt="aeviww"
          />
          <div class="min-w-0">
            <div class="text-[16px] font-bold tracking-[-0.02em]">mashiro</div>
            <div class="mt-0.5 text-[12px] text-[color:var(--fg-dim)]">
              неофициальный десктоп-клиент Яндекс Музыки
            </div>
            <div class="mt-1.5 text-[12px] text-[color:var(--fg-dim)]">
              автор:
              <a
                :href="AUTHOR_URL"
                :class="LINK"
                @click.prevent="openLink(AUTHOR_URL)"
                >aeviww</a
              >
            </div>
          </div>
        </div>

        <div
          class="grid gap-1 px-5 py-3.5 text-[12.5px] sm:grid-cols-[100px_minmax(0,1fr)] sm:gap-3"
        >
          <span class="text-[color:var(--fg-faint)]">Версия</span>
          <span class="flex min-w-0 flex-wrap items-center gap-2">
            <span class="font-semibold text-[var(--fg)]">r1.0</span>
            <span
              class="rounded-full border border-[color-mix(in_srgb,var(--accent)_35%,var(--line))] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-[var(--accent)]"
            >
              pre-release
            </span>
            <button
              type="button"
              class="rounded border border-[var(--line)] bg-transparent px-1.5 py-0.5 font-mono text-[10.5px] leading-snug text-[color:var(--fg-dim)] transition hover:bg-[var(--hover)] hover:text-[var(--fg)]"
              title="Скопировать хэш коммита"
              @click="copyCommit"
            >
              {{ commit }}
            </button>
            <span class="text-[11.5px] text-[color:var(--fg-faint)]"
              >от {{ buildDate }}</span
            >
          </span>
        </div>

        <div
          class="grid gap-1 px-5 py-3.5 text-[12.5px] sm:grid-cols-[100px_minmax(0,1fr)] sm:gap-3"
        >
          <span class="text-[color:var(--fg-faint)]">Лицензия</span>
          <a
            :href="LICENSE_URL"
            :class="LINK"
            class="w-fit text-[12.5px]"
            @click.prevent="openLink(LICENSE_URL)"
            >GPL-3.0</a
          >
        </div>

        <div
          class="grid gap-1 px-5 py-3.5 text-[12.5px] sm:grid-cols-[100px_minmax(0,1fr)] sm:gap-3"
        >
          <span class="text-[color:var(--fg-faint)]">Авторство</span>
          <span class="text-[color:var(--fg-dim)]">
            ООО «Яндекс» к проекту отношения не имеет
          </span>
        </div>
      </SettingsCard>

      <SettingsCard>
        <div class="px-5 pb-1 pt-4">
          <div
            class="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[color:var(--fg-faint)]"
          >
            Благодарности
          </div>
        </div>

        <a
          v-for="item in credits"
          :key="item.url"
          :href="item.url"
          :title="item.url"
          class="group flex flex-col gap-0.5 px-5 py-2.5 transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--fg)_3%,transparent)]"
          @click.prevent="openLink(item.url)"
        >
          <span :class="LINK" class="text-[12.5px] font-medium">{{
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

const AUTHOR_URL = "https://github.com/aeviww";
const AVATAR_URL = "https://github.com/aeviww.png?size=200";
const LICENSE_URL = "https://www.gnu.org/licenses/gpl-3.0.html";
const FALLBACK = "icons/128x128.png";

const avatar = ref(cachedImage("aeviww") ?? FALLBACK);

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
