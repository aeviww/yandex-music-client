<template>
  <div
    class="flex w-full items-center justify-between min-h-[50px] box-border gap-[20px] px-[10px] py-[9px] rounded-[10px] m-0 text-inherit text-left transition-[background] duration-[120ms] ease-[ease] hover:bg-[color-mix(in_srgb,_var(--fg)_3.5%,_transparent)]"
  >
    <div
      class="flex min-w-0 flex-col gap-[3px] [&_b]:text-[color:var(--fg)] [&_b]:text-[calc(13px*var(--text-scale,1))] [&_b]:font-semibold [&_span]:text-[color:var(--fg-dim)] [&_span]:text-[calc(11.5px*var(--text-scale,1))] [&_span]:leading-[1.4]"
    >
      <b>Сервер</b>
      <span
        >Общий сервер по умолчанию. Можно указать свой адрес или
        127.0.0.1:7332.</span
      >
    </div>

    <input
      v-model="address"
      class="w-[280px] max-w-full px-[10px] py-[7px] rounded-[8px] border border-[color:var(--border,rgba(255,255,255,0.12))] bg-transparent text-inherit"
      type="text"
      placeholder="relay.aevi.lol"
      :disabled="connected"
    />
  </div>

  <div
    v-if="!connected"
    class="flex w-full items-center justify-between min-h-[50px] box-border gap-[20px] px-[10px] py-[9px] rounded-[10px] m-0 text-inherit text-left transition-[background] duration-[120ms] ease-[ease] border-t border-[color:var(--line)] hover:bg-[color-mix(in_srgb,_var(--fg)_3.5%,_transparent)]"
  >
    <div
      class="flex min-w-0 flex-col gap-[3px] [&_b]:text-[color:var(--fg)] [&_b]:text-[calc(13px*var(--text-scale,1))] [&_b]:font-semibold [&_span]:text-[color:var(--fg-dim)] [&_span]:text-[calc(11.5px*var(--text-scale,1))] [&_span]:leading-[1.4]"
    >
      <b>Создать комнату</b>
      <span>Дадим код из шести слов - перешлите его друзьям.</span>
    </div>

    <button
      class="inline-flex items-center justify-center gap-[6px] h-[30px] px-[12px] py-0 border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] whitespace-nowrap cursor-pointer transition-[background,color,border-color] duration-[140ms] ease-[ease] hover:bg-[var(--hover)] hover:border-[color:color-mix(in_srgb,_var(--fg)_14%,_transparent)] hover:text-[color:var(--fg)]"
      type="button"
      :disabled="busy"
      @click="create"
    >
      Создать комнату
    </button>
  </div>

  <div
    v-if="!connected"
    class="flex w-full items-center justify-between min-h-[50px] box-border gap-[20px] px-[10px] py-[9px] rounded-[10px] m-0 text-inherit text-left transition-[background] duration-[120ms] ease-[ease] border-t border-[color:var(--line)] hover:bg-[color-mix(in_srgb,_var(--fg)_3.5%,_transparent)]"
  >
    <div
      class="flex min-w-0 flex-col gap-[3px] [&_b]:text-[color:var(--fg)] [&_b]:text-[calc(13px*var(--text-scale,1))] [&_b]:font-semibold [&_span]:text-[color:var(--fg-dim)] [&_span]:text-[calc(11.5px*var(--text-scale,1))] [&_span]:leading-[1.4]"
    >
      <b>Войти по коду</b>
      <span>Вставьте код, который прислал друг.</span>
    </div>

    <div class="flex flex-wrap items-center gap-[8px]">
      <input
        v-model="invite"
        class="w-[280px] max-w-full px-[10px] py-[7px] rounded-[8px] border border-[color:var(--border,rgba(255,255,255,0.12))] bg-transparent text-inherit"
        type="text"
        placeholder="olive canyon spirit velvet ladder onion"
        @keyup.enter="join"
      />

      <button
        class="inline-flex items-center justify-center gap-[6px] h-[30px] px-[12px] py-0 border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] whitespace-nowrap cursor-pointer transition-[background,color,border-color] duration-[140ms] ease-[ease] hover:bg-[var(--hover)] hover:border-[color:color-mix(in_srgb,_var(--fg)_14%,_transparent)] hover:text-[color:var(--fg)]"
        type="button"
        :disabled="busy || !invite.trim()"
        @click="join"
      >
        Войти
      </button>
    </div>
  </div>

  <div
    v-if="roomCode"
    class="flex flex-col gap-[6px] px-[14px] py-[12px] rounded-[10px] bg-[var(--surface-2,rgba(255,255,255,0.06))] [&_span]:text-[12px] [&_span]:opacity-[0.65]"
  >
    <b>Код вашей комнаты</b>

    <div
      class="flex items-center gap-[8px] [&_code]:flex-auto [&_code]:overflow-hidden [&_code]:text-[15px] [&_code]:truncate [&_code]:cursor-pointer [&_code:hover]:text-[color:var(--accent,inherit)]"
    >
      <code title="Нажмите, чтобы скопировать" @click="copy(roomCode)">{{
        roomCode
      }}</code>

      <button
        class="inline-flex flex-none p-[5px] border-0 rounded-[7px] text-[color:var(--fg-dim,inherit)] cursor-pointer hover:bg-[var(--hover,rgba(255,255,255,0.08))] hover:text-[color:var(--fg,inherit)]"
        type="button"
        title="Скопировать код"
        @click="copy(roomCode)"
      >
        <Icon name="mingcute:copy-2-line" :size="14" />
      </button>
    </div>

    <span>Шесть слов для входа. Перешлите их друзьям.</span>
  </div>

  <div
    v-if="connected"
    class="flex w-full items-center justify-between min-h-[50px] box-border gap-[20px] px-[10px] py-[9px] rounded-[10px] m-0 text-inherit text-left transition-[background] duration-[120ms] ease-[ease] hover:bg-[color-mix(in_srgb,_var(--fg)_3.5%,_transparent)]"
    :class="{ 'border-t border-[color:var(--line)]': !roomCode }"
  >
    <div
      class="flex min-w-0 flex-col gap-[3px] [&_b]:text-[color:var(--fg)] [&_b]:text-[calc(13px*var(--text-scale,1))] [&_b]:font-semibold [&_span]:text-[color:var(--fg-dim)] [&_span]:text-[calc(11.5px*var(--text-scale,1))] [&_span]:leading-[1.4]"
    >
      <b>Вы в комнате</b>
      <span>{{ peopleLabel }}</span>
    </div>

    <button
      class="inline-flex items-center justify-center gap-[6px] h-[30px] px-[12px] py-0 border border-[color:color-mix(in_srgb,_#ff5d5d_45%,_var(--line))] rounded-[8px] text-[color:#ff8b8b] text-[calc(12px*var(--text-scale,1))] whitespace-nowrap cursor-pointer transition-[background,color,border-color] duration-[140ms] ease-[ease] hover:bg-[color-mix(in_srgb,_#ff5d5d_14%,_transparent)] hover:border-[color:#ff5d5d] hover:text-[color:#ff5d5d]"
      type="button"
      :disabled="busy"
      @click="leave"
    >
      Выйти
    </button>
  </div>

  <button
    class="self-start p-[4px_0] border-0 bg-transparent text-[color:var(--fg-dim,inherit)] text-[13px] cursor-pointer opacity-[0.75] hover:opacity-100"
    type="button"
    @click="advanced = !advanced"
  >
    {{ advanced ? "Скрыть дополнительное" : "Дополнительное" }}
  </button>

  <div
    v-if="advanced"
    class="flex flex-col gap-[6px] px-[14px] py-[12px] rounded-[10px] bg-[var(--surface-2,rgba(255,255,255,0.06))] [&_span]:text-[12px] [&_span]:opacity-[0.65]"
  >
    <b>Ключ-аккаунт</b>
    <span
      >Создаётся автоматически и хранится на этом устройстве. Скопируйте ключ,
      только чтобы войти под тем же именем на другом устройстве.</span
    >

    <div class="flex flex-wrap items-center gap-[8px]">
      <span class="text-[13px] opacity-[0.7]">{{
        hasSeed ? "аккаунт готов" : "создастся при входе"
      }}</span>

      <button
        class="inline-flex items-center justify-center gap-[6px] h-[30px] px-[12px] py-0 border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] whitespace-nowrap cursor-pointer transition-[background,color,border-color] duration-[140ms] ease-[ease] hover:bg-[var(--hover)] hover:border-[color:color-mix(in_srgb,_var(--fg)_14%,_transparent)] hover:text-[color:var(--fg)]"
        type="button"
        :disabled="busy || !hasSeed"
        @click="showSeed"
      >
        Показать ключ
      </button>

      <button
        class="inline-flex items-center justify-center gap-[6px] h-[30px] px-[12px] py-0 border border-[color:color-mix(in_srgb,_#ff5d5d_45%,_var(--line))] rounded-[8px] text-[color:#ff8b8b] text-[calc(12px*var(--text-scale,1))] whitespace-nowrap cursor-pointer transition-[background,color,border-color] duration-[140ms] ease-[ease] hover:bg-[color-mix(in_srgb,_#ff5d5d_14%,_transparent)] hover:border-[color:#ff5d5d] hover:text-[color:#ff5d5d]"
        type="button"
        :disabled="busy"
        @click="resetSeed"
      >
        Сбросить
      </button>
    </div>

    <textarea
      v-if="phrase"
      v-model="phrase"
      class="w-full px-[10px] py-[7px] rounded-[8px] border border-[color:var(--border,rgba(255,255,255,0.12))] bg-transparent text-inherit resize-y"
      rows="2"
    ></textarea>

    <div v-if="phrase" class="flex flex-wrap items-center gap-[8px]">
      <button
        class="inline-flex items-center justify-center gap-[6px] h-[30px] px-[12px] py-0 border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] whitespace-nowrap cursor-pointer transition-[background,color,border-color] duration-[140ms] ease-[ease] hover:bg-[var(--hover)] hover:border-[color:color-mix(in_srgb,_var(--fg)_14%,_transparent)] hover:text-[color:var(--fg)]"
        type="button"
        @click="copy(phrase)"
      >
        Скопировать
      </button>

      <button
        class="inline-flex items-center justify-center gap-[6px] h-[30px] px-[12px] py-0 border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] whitespace-nowrap cursor-pointer transition-[background,color,border-color] duration-[140ms] ease-[ease] hover:bg-[var(--hover)] hover:border-[color:color-mix(in_srgb,_var(--fg)_14%,_transparent)] hover:text-[color:var(--fg)]"
        type="button"
        :disabled="!phrase.trim()"
        @click="saveSeed"
      >
        Сохранить ключ
      </button>
    </div>
  </div>

  <p v-if="reason" class="m-0 text-[13px] text-[color:var(--accent,#ffcc00)]">
    {{ reason }}
  </p>

  <div
    class="flex w-full items-center justify-between min-h-[50px] box-border gap-[20px] px-[10px] py-[9px] rounded-[10px] m-0 text-inherit text-left transition-[background] duration-[120ms] ease-[ease] hover:bg-[color-mix(in_srgb,_var(--fg)_3.5%,_transparent)]"
  >
    <div
      class="flex min-w-0 flex-col gap-[3px] [&_b]:text-[color:var(--fg)] [&_b]:text-[calc(13px*var(--text-scale,1))] [&_b]:font-semibold [&_span]:text-[color:var(--fg-dim)] [&_span]:text-[calc(11.5px*var(--text-scale,1))] [&_span]:leading-[1.4]"
    >
      <b>Исходный код сервера</b>
      <span>Открыть репозиторий mashiro-together на GitHub.</span>
    </div>

    <button
      class="inline-flex items-center justify-center gap-[6px] h-[30px] px-[12px] py-0 border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] whitespace-nowrap cursor-pointer transition-[background,color,border-color] duration-[140ms] ease-[ease] hover:bg-[var(--hover)] hover:border-[color:color-mix(in_srgb,_var(--fg)_14%,_transparent)] hover:text-[color:var(--fg)]"
      type="button"
      @click="openRepo"
    >
      <Icon name="simple-icons:github" :size="14" />
      GitHub
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { copyText } from "@/lib/clipboard";
import { api } from "@/api/client";
import {
  seedExists,
  seedForget,
  seedNew,
  seedSet,
  seedShow,
} from "@/api/relay";
import {
  createRoom,
  joinRoom,
  leaveRoom,
  relayBusy,
  relayReason,
  relayView,
} from "@/stores/together/relay";
import { useTogetherStore } from "@/stores/together/index";
import { SERVER_KEY } from "@/stores/together/protocol";

const DEFAULT_SERVER = "relay.aevi.lol";
const REPO_URL = "https://github.com/elytrya/mashiro-together";

function openRepo() {
  void api.openExternal(REPO_URL);
}

const together = useTogetherStore();

const address = ref(localStorage.getItem(SERVER_KEY) || DEFAULT_SERVER);
const invite = ref("");
const phrase = ref("");
const hasSeed = ref(false);
const advanced = ref(false);

const status = relayView;
const busy = relayBusy;
const reason = relayReason;
const connected = computed(() => status.value.connected);
const roomCode = computed(() => status.value.invite);
const peopleLabel = computed(() => {
  const total = status.value.peers.length || 1;
  return `участников: ${total}`;
});

onMounted(async () => {
  hasSeed.value = await seedExists();
});

function remember() {
  localStorage.setItem(SERVER_KEY, address.value.trim());
}

async function copy(text: string) {
  await copyText(text, "Скопировано", "Нечего копировать");
}

async function ensureSeed() {
  if (hasSeed.value) return;
  await seedNew(12);
  hasSeed.value = true;
}

async function resetSeed() {
  await seedForget();
  phrase.value = await seedNew(12);
  hasSeed.value = true;
}

async function showSeed() {
  phrase.value = (await seedShow()) ?? "";
}

async function saveSeed() {
  phrase.value = await seedSet(phrase.value);
  hasSeed.value = true;
}

async function create() {
  remember();
  await ensureSeed();
  await createRoom(address.value, together.nick, invite.value || undefined);
}

async function join() {
  if (!invite.value.trim()) return;
  remember();
  await ensureSeed();
  await joinRoom(address.value, together.nick, invite.value);
}

async function leave() {
  await leaveRoom();
}
</script>
