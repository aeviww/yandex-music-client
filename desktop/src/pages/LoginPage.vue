<template>
  <q-layout
    view="hHh Lpr fFf"
    class="bg-[var(--bg)] text-white [color-scheme:dark]"
    style="
      --bg: #090909;
      --surface: #121212;
      --surface-2: #1b1b1b;
      --hover: #252525;
      --line: #303030;
      --fg: #ffffff;
      --fg-dim: #b3b3b3;
      --fg-faint: #a3a3a3;
      --accent: #ffffff;
    "
  >
    <q-header class="border-0 bg-[var(--bg)] text-white shadow-none">
      <div
        class="flex h-[48px] select-none items-center justify-between pl-[20px] flex-nowrap"
        @mousedown="startWindowDrag"
        @dblclick="toggleWindowMaximize"
      >
        <span
          class="text-[14px] font-semibold tracking-[-0.02em] text-[#a3a3a3]"
          >mashiro</span
        >
        <WindowControls />
      </div>
    </q-header>
    <q-page-container>
      <q-page
        :style-fn="
          (offset, height) => ({
            height: `${height - offset}px`,
            minHeight: '0px',
          })
        "
        class="flex flex-col items-center overflow-y-auto px-[20px] py-[24px] sm:px-[40px] sm:py-[48px] flex-nowrap"
      >
        <main
          class="my-auto grid w-full flex-none max-w-[1040px] gap-[24px] sm:gap-[32px] lg:grid-cols-[minmax(0,1fr)_400px] lg:items-center lg:gap-x-[80px] lg:gap-y-[36px]"
          aria-label="Добро пожаловать в Mashiro"
        >
          <section
            class="mx-auto w-full max-w-[440px] lg:mx-0"
            aria-labelledby="welcome-title"
          >
            <img
              src="/icons/favicon-128x128.png"
              alt=""
              width="80"
              height="80"
              draggable="false"
              class="mb-[20px] block h-[48px] w-[48px] sm:mb-[28px] rounded-[14px] sm:h-[80px] sm:w-[80px]"
            />
            <h1
              id="welcome-title"
              class="m-0 text-[36px] font-semibold leading-[1.04] tracking-[-0.055em] text-white sm:text-[56px]"
            >
              Привет,<br />это Mashiro.
            </h1>
          </section>

          <section
            class="mx-auto w-full max-w-[440px] min-w-0 lg:max-w-none lg:self-center lg:relative lg:top-[24px]"
            aria-label="Вход в аккаунт"
            :aria-busy="starting || auth.loading"
          >
            <LoginDeviceCode
              v-if="waiting"
              :user-code="userCode"
              :verify-url="verifyUrl"
              :copied="copied"
              @copy="copyCode"
              @cancel="cancelAuto"
            />
            <LoginTokenForm
              v-else-if="manual"
              v-model="raw"
              :loading="auth.loading"
              @submit="submitManual"
              @back="
                manual = false;
                autoError = '';
              "
            />
            <LoginWelcome
              v-else
              :loading="starting || auth.loading"
              @login="loginAuto"
              @manual="manual = true"
            />
            <div
              v-if="autoError || auth.error"
              role="alert"
              class="mt-[20px] rounded-[8px] border border-solid border-[#686868] bg-[#1b1b1b] p-[14px] text-[14px] leading-[1.5] text-white"
            >
              <p class="mb-[4px] mt-0 font-semibold">Не удалось войти</p>
              {{ autoError || auth.error }}
            </div>

          </section>
        </main>
      </q-page>
    </q-page-container>
    <q-footer class="border-0 bg-[var(--bg)] text-[#a3a3a3] shadow-none">
      <div
        class="mx-auto flex min-h-[56px] w-full max-w-[1120px] flex-nowrap items-center px-[20px] py-[12px] sm:px-[40px]"
      >
        <p class="m-1 text-[14px] leading-[1.5]">
          mashiro - неофициальный клиент Я.Музыки.<br></br>ООО "Яндекс" к проекту
          отношения не имеет.
        </p>
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import LoginWelcome from "@/components/login/LoginWelcome.vue";
import LoginDeviceCode from "@/components/login/LoginDeviceCode.vue";
import LoginTokenForm from "@/components/login/LoginTokenForm.vue";
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
const starting = ref(false);
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
  if (starting.value || waiting.value || auth.loading) return;
  starting.value = true;
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
    autoError.value =
      "Не удалось открыть вход через браузер. Можно войти с токеном.";
    manual.value = true;
  } finally {
    starting.value = false;
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
  if (auth.loading || !raw.value.trim()) return;
  autoError.value = "";
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
