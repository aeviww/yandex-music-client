<template>
  <q-layout view="lHh Lpr lFf" class="bg-[var(--bg)]">
    <div
      class="flex h-[40px] select-none items-center justify-end gap-[4px] pl-[8px] [html[data-mode=light]_&]:bg-[color-mix(in_srgb,var(--surface)_88%,var(--bg))]"
      @mousedown="startWindowDrag"
      @dblclick="toggleWindowMaximize"
    >
      <WindowControls />
    </div>

    <q-page-container>
      <q-page class="flex items-center justify-center">
        <div
          class="w-[352px] max-w-[calc(100vw-48px)] rounded-[14px] border border-solid border-[color:var(--line)] bg-[var(--surface)] p-[20px] [html[data-mode=light]_&]:text-[color:var(--fg)] [html[data-mode=light]_&]:shadow-[0_12px_32px_var(--shadow-soft)]"
        >
          <div class="flex items-center gap-[10px]">
            <div
              class="grid h-[36px] w-[36px] flex-none place-items-center rounded-[10px] bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[color:var(--accent)]"
            >
              <Icon name="wave" :size="18" />
            </div>
            <div>
              <div
                class="text-[length:calc(16px*var(--text-scale,1))] font-semibold leading-[1.15] tracking-[-0.02em] text-[color:var(--fg)]"
              >
                Mashiro
              </div>
              <div
                class="text-[length:calc(12px*var(--text-scale,1))] leading-[1.3] text-[color:var(--fg-faint)]"
              >
                Клиент Яндекс Музыки
              </div>
            </div>
          </div>

          <template v-if="!waiting">
            <p
              class="mx-0 mb-[14px] mt-[14px] text-[length:calc(13px*var(--text-scale,1))] leading-[1.5] text-[color:var(--fg-dim)]"
            >
              Войди через аккаунт Яндекса — откроется браузер. Токен приложение
              получит само, копировать ничего не нужно.
            </p>

            <button
              type="button"
              class="flex h-[40px] w-full cursor-pointer items-center justify-center rounded-[10px] border-0 bg-[var(--accent)] text-[13.5px] font-semibold text-[#0b0b0d] transition-[filter,opacity] duration-[120ms] ease-[ease] hover:brightness-[1.06] active:brightness-[0.96] focus-visible:outline focus-visible:outline-[1.5px] focus-visible:outline-offset-[2px] focus-visible:outline-[color:var(--accent)] disabled:cursor-default disabled:opacity-60"
              :disabled="auth.loading"
              @click="loginAuto"
            >
              <q-spinner v-if="auth.loading" size="16px" color="dark" />
              <span v-else>Войти через Яндекс</span>
            </button>
          </template>

          <div v-else class="mt-[14px]">
            <p
              class="mx-0 mb-[10px] mt-0 text-[length:calc(13px*var(--text-scale,1))] leading-[1.5] text-[color:var(--fg-dim)]"
            >
              В браузере открылась страница входа Яндекса. Введи там этот код:
            </p>
            <div class="flex gap-[6px]">
              <div
                class="flex h-[46px] flex-1 items-center justify-center rounded-[10px] bg-[var(--surface-2)] text-[22px] font-semibold tabular-nums tracking-[4px] text-[color:var(--fg)] select-all"
              >
                {{ userCode }}
              </div>
              <button
                type="button"
                class="grid h-[46px] w-[46px] flex-none cursor-pointer place-items-center rounded-[10px] border-0 bg-[var(--surface-2)] text-[color:var(--fg-dim)] transition-colors duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] focus-visible:outline focus-visible:outline-[1.5px] focus-visible:outline-offset-[2px] focus-visible:outline-[color:var(--accent)]"
                :title="copied ? 'Скопировано' : 'Скопировать код'"
                @click="copyCode"
              >
                <Icon :name="copied ? 'check' : 'copy'" :size="16" />
              </button>
            </div>
            <div class="mt-[10px] flex items-center gap-[8px]">
              <q-spinner size="13px" />
              <span
                class="text-[length:calc(12px*var(--text-scale,1))] text-[color:var(--fg-dim)]"
                >Ждём подтверждения…</span
              >
              <button
                type="button"
                class="ml-auto flex-none cursor-pointer border-0 bg-transparent px-[2px] py-0 text-[11.5px] text-[color:var(--fg-faint)] transition-colors duration-[120ms] ease-[ease] hover:text-[color:var(--fg)]"
                @click="cancelAuto"
              >
                Отмена
              </button>
            </div>
            <p
              class="mx-0 mb-0 mt-[8px] break-all text-[length:calc(11px*var(--text-scale,1))] leading-[1.45] text-[color:var(--fg-faint)]"
            >
              Если браузер не открылся, зайди вручную на {{ verifyUrl }}
            </p>
          </div>

          <div
            v-if="autoError"
            class="mt-[8px] text-[length:calc(12px*var(--text-scale,1))] text-[#f87171]"
          >
            {{ autoError }}
          </div>

          <button
            type="button"
            class="mt-[14px] flex w-full cursor-pointer items-center gap-[8px] border-0 bg-transparent p-0 text-[12.5px] text-[color:var(--fg-dim)] transition-colors duration-[120ms] ease-[ease] hover:text-[color:var(--fg)]"
            @click="manual = !manual"
          >
            <Icon name="key" :size="14" />
            <span>Ввести токен вручную</span>
            <Icon
              name="chevronDown"
              :size="14"
              class="ml-auto transition-transform duration-[160ms] ease-[ease]"
              :class="{ 'rotate-180': manual }"
            />
          </button>

          <div v-if="manual" class="mt-[10px]">
            <div
              class="flex h-[34px] items-center gap-[8px] rounded-[10px] border border-solid border-[color:var(--line)] bg-[var(--surface-2)] px-[12px] py-0 transition-[border-color] duration-[140ms] ease-[ease] focus-within:border-[color-mix(in_srgb,var(--accent)_55%,transparent)]"
            >
              <input
                v-model="raw"
                class="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-[color:var(--fg)] [outline:none] placeholder:text-[color:var(--fg-faint)]"
                :type="reveal ? 'text' : 'password'"
                placeholder="Токен y0_Ag… или ссылка с access_token"
                @keyup.enter="submitManual"
              />
              <button
                type="button"
                class="flex-none cursor-pointer border-0 bg-transparent px-[2px] py-0 text-[11.5px] text-[color:var(--fg-faint)] transition-colors duration-[120ms] ease-[ease] hover:text-[color:var(--fg)]"
                @click="reveal = !reveal"
              >
                {{ reveal ? "Скрыть" : "Показать" }}
              </button>
            </div>
            <button
              type="button"
              class="mt-[8px] inline-flex h-[32px] w-full cursor-pointer items-center justify-center rounded-[10px] border border-solid border-[color:var(--line)] bg-transparent px-[14px] py-0 text-[length:calc(12px*var(--text-scale,1))] font-medium text-[color:var(--fg-dim)] transition-[background,border-color,color] duration-[120ms] ease-[ease] hover:border-[color:var(--fg-faint)] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:pointer-events-none disabled:opacity-[0.45] [html[data-mode=light]_&]:text-[color:var(--fg)]"
              :disabled="auth.loading || !raw.trim()"
              @click="submitManual"
            >
              Войти с токеном
            </button>
            <p
              class="mx-0 mb-0 mt-[8px] text-[length:calc(11px*var(--text-scale,1))] leading-[1.45] text-[color:var(--fg-faint)]"
            >
              Токен можно взять из адресной строки после входа — вставь целиком,
              нужная часть извлечётся сама.
            </p>
          </div>

          <div
            v-if="auth.error"
            class="mt-[8px] text-[length:calc(12px*var(--text-scale,1))] text-[#f87171]"
          >
            {{ auth.error }}
          </div>

          <div class="mx-0 mb-[12px] mt-[16px] h-px bg-[var(--line)]" />

          <div
            class="text-[length:calc(11px*var(--text-scale,1))] leading-[1.45] text-[color:var(--fg-faint)]"
          >
            Токен хранится только на твоём компьютере и используется лишь для
            API Яндекс Музыки.
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import Icon from "@/components/Icon.vue";
import WindowControls from "@/components/WindowControls.vue";
import { startWindowDrag, toggleWindowMaximize } from "@/lib/window";
import { onBeforeUnmount, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import type { UnlistenFn } from "@tauri-apps/api/event";

type DeviceInfo = { user_code: string; verification_url: string };

const router = useRouter();
const auth = useAuthStore();

const raw = ref("");
const reveal = ref(false);
const manual = ref(false);
const waiting = ref(false);
const autoError = ref("");
const userCode = ref("");
const verifyUrl = ref("");
const copied = ref(false);
let unlisteners: UnlistenFn[] = [];

function extractToken(value: string): string {
  const s = value.trim();
  const match = s.match(/access_token=([^&#\s]+)/i);
  if (match?.[1]) return decodeURIComponent(match[1]);
  return s;
}

async function finish(token: string): Promise<void> {
  const clean = extractToken(token);
  if (!clean) return;
  const ok = await auth.login(clean);
  if (ok) void router.replace("/");
}

async function stopWaiting(): Promise<void> {
  waiting.value = false;
  userCode.value = "";
  copied.value = false;
  for (const off of unlisteners) off();
  unlisteners = [];
}

async function loginAuto(): Promise<void> {
  autoError.value = "";
  try {
    const [{ invoke }, { listen }] = await Promise.all([
      import("@tauri-apps/api/core"),
      import("@tauri-apps/api/event"),
    ]);
    unlisteners.push(
      await listen<string>("oauth-token", async (event) => {
        await stopWaiting();
        await finish(event.payload);
      }),
    );
    unlisteners.push(
      await listen<string>("oauth-error", async (event) => {
        await stopWaiting();
        autoError.value = event.payload || "Вход не завершён. Попробуй снова.";
      }),
    );
    const info = await invoke<DeviceInfo>("oauth_device_start");
    userCode.value = info.user_code;
    verifyUrl.value = info.verification_url;
    waiting.value = true;
  } catch {
    await stopWaiting();
    autoError.value = "Не удалось начать вход. Введи токен вручную ниже.";
    manual.value = true;
  }
}

async function cancelAuto(): Promise<void> {
  await stopWaiting();
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    await invoke("oauth_cancel");
  } catch {}
}

async function submitManual(): Promise<void> {
  if (!raw.value.trim()) return;
  await finish(raw.value);
}

async function copyCode(): Promise<void> {
  if (!userCode.value) return;
  try {
    await navigator.clipboard.writeText(userCode.value);
    copied.value = true;
    window.setTimeout(() => (copied.value = false), 1500);
  } catch {}
}

onBeforeUnmount(() => {
  void stopWaiting();
});
</script>
