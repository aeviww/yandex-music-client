<template>
  <SettingsSection
    id="settings-together"
    title="Слушать вместе"
    description="Синхронное прослушивание по локальной сети, через VPN (radmin, hamachi, zerotier) или сервер-ретранслятор. По сети идут только трек и позиция - звук каждый грузит из своего аккаунта."
    icon="mingcute:user-2-line"
  >
    <SettingsCard>
      <SettingsRow
        label="Имя в комнате"
        description="Как вас увидят остальные участники."
      >
        <input
          :class="INPUT"
          class="max-w-[190px]"
          type="text"
          placeholder="слушатель"
          :value="together.nick"
          :disabled="together.active"
          @input="onNick"
        />
      </SettingsRow>

      <SettingsRow
        label="Как подключаемся"
        description="По сети/VPN или через сервер без проброса портов."
      >
        <div
          class="inline-flex rounded-xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--fg)_5%,transparent)] p-1 transition-opacity"
          :class="together.active ? 'opacity-55' : ''"
        >
          <button
            type="button"
            class="inline-flex h-8 min-w-[130px] items-center justify-center gap-1.5 rounded-lg border-0 px-3 text-[12.5px] transition duration-150"
            :class="
              transport === 'local'
                ? 'bg-[var(--surface)] font-semibold text-[var(--fg)]'
                : 'bg-transparent text-[color:var(--fg-dim)] hover:text-[var(--fg)]'
            "
            :disabled="together.active"
            @click="setTransport('local')"
          >
            <Icon name="mingcute:wave-line" :size="15" />
            <span>Локально</span>
          </button>

          <button
            type="button"
            class="inline-flex h-8 min-w-[130px] items-center justify-center gap-1.5 rounded-lg border-0 px-3 text-[12.5px] transition duration-150"
            :class="
              transport === 'server'
                ? 'bg-[var(--surface)] font-semibold text-[var(--fg)]'
                : 'bg-transparent text-[color:var(--fg-dim)] hover:text-[var(--fg)]'
            "
            :disabled="together.active"
            @click="setTransport('server')"
          >
            <Icon name="mingcute:earth-2-line" :size="15" />
            <span>Через сервер</span>
          </button>
        </div>
      </SettingsRow>
    </SettingsCard>

    <div class="mt-4">
      <TogetherHostCard v-if="transport === 'local'" />
      <TogetherJoinCard v-if="transport === 'local'" />
      <TogetherServerCard v-if="transport === 'server'" />
    </div>

    <SettingsCard v-if="together.active" class="mt-4">
      <SettingsRow column>
        <template #copy>
          <div class="flex items-center gap-2">
            <span class="text-[13px] font-semibold text-[var(--fg)]">{{
              together.isHost ? "Хостите" : "Слушаете хоста"
            }}</span>
            <span
              class="rounded-full bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] px-2 py-0.5 text-[10.5px] font-semibold text-[var(--accent)]"
            >
              {{ together.peers.length }} в комнате
            </span>
          </div>
        </template>

        <TogetherPeers
          :peers="together.peers"
          :waiting="together.waiting"
          :manage="together.isHost"
          :host-id="together.hostId"
          @handoff="together.handoff"
        />

        <p
          v-if="together.waitingNicks.length"
          class="mb-0 text-[12.5px] text-[var(--accent)]"
        >
          Ждём загрузку: {{ together.waitingNicks.join(", ") }}
        </p>

        <p
          v-if="together.isHost"
          class="mb-0 text-[11.5px] leading-relaxed text-[color:var(--fg-faint)]"
        >
          Треки для всех включаете вы. Чтобы включал кто-то другой - передайте
          ему хост.
        </p>

        <p
          v-else
          class="mb-0 text-[11.5px] leading-relaxed text-[color:var(--fg-faint)]"
        >
          Хостит {{ together.hostNick }} - ваш плеер повторяет за ним. Чтобы
          самому включать треки, попросите передать вам хост.
        </p>
      </SettingsRow>
    </SettingsCard>

    <SettingsCard class="mt-4">
      <SettingToggle
        :model-value="ui.settings.togetherShowDock"
        label="Плашка комнаты поверх окна"
        description="Маленькая панель с текстом «Хостите» / «Слушаете» и списком участников. Комната при этом продолжает работать."
        @update:model-value="ui.set('togetherShowDock', $event)"
      />

      <p
        v-if="together.error"
        class="mb-0 px-5 py-3 text-[12.5px] text-[#ff8080]"
      >
        {{ together.error }}
      </p>

      <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
        <button
          type="button"
          class="border-0 bg-transparent p-0 text-[12.5px] text-[color:var(--fg-dim)] transition hover:text-[var(--fg)]"
          @click="showLog = !showLog"
        >
          {{ showLog ? "Скрыть журнал" : "Журнал подключения" }}
        </button>
      </div>
    </SettingsCard>

    <TogetherLog v-if="showLog" class="mt-4" />
  </SettingsSection>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import SettingToggle from "@/components/settings/SettingToggle.vue";
import SettingsCard from "@/components/settings/SettingsCard.vue";
import SettingsRow from "@/components/settings/SettingsRow.vue";
import SettingsSection from "@/components/settings/SettingsSection.vue";
import { INPUT } from "@/components/settings/classes";
import TogetherHostCard from "@/components/together/TogetherHostCard.vue";
import TogetherJoinCard from "@/components/together/TogetherJoinCard.vue";
import TogetherServerCard from "@/components/together/TogetherServerCard.vue";
import TogetherLog from "@/components/together/TogetherLog.vue";
import TogetherPeers from "@/components/together/TogetherPeers.vue";
import { useTogetherStore } from "@/stores/together/index";
import { TRANSPORT_KEY } from "@/stores/together/protocol";
import { useUiStore } from "@/stores/ui/index";

const together = useTogetherStore();
const ui = useUiStore();

type Transport = "local" | "server";

function loadTransport(): Transport {
  try {
    return localStorage.getItem(TRANSPORT_KEY) === "server"
      ? "server"
      : "local";
  } catch {
    return "local";
  }
}

const transport = ref<Transport>(loadTransport());
const showLog = ref(false);

function setTransport(next: Transport) {
  if (together.active) return;
  transport.value = next;
  try {
    localStorage.setItem(TRANSPORT_KEY, next);
  } catch {}
}

onMounted(() => {
  void together.init();
});

function onNick(event: Event) {
  together.setNick((event.target as HTMLInputElement).value);
}
</script>
