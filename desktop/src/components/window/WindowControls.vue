<template>
  <div class="flex h-full items-stretch" @mousedown.stop @dblclick.stop>
    <button
      v-for="b in buttons"
      :key="b.key"
      type="button"
      :aria-label="b.label"
      :title="b.label"
      class="grid w-[44px] cursor-pointer place-items-center border-0 bg-transparent p-0 text-[color:var(--fg-faint)] transition-[background,color] duration-[120ms] ease-[ease] focus-visible:outline focus-visible:outline-[1.5px] focus-visible:-outline-offset-[3px] focus-visible:outline-[color:var(--accent)]"
      :class="
        b.key === 'close'
          ? 'hover:bg-[#e5484d] hover:text-white active:bg-[#c93c40]'
          : 'hover:bg-[var(--hover)] hover:text-[color:var(--fg)] active:bg-[color-mix(in_srgb,var(--fg)_12%,transparent)]'
      "
      @click="b.action"
    >
      <Icon :name="b.icon" :size="b.size" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
const maximized = ref(false);

type AppWindow = {
  minimize: () => Promise<void>;
  toggleMaximize: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
  close: () => Promise<void>;
};

async function appWindow(): Promise<AppWindow | null> {
  try {
    const mod = await import("@tauri-apps/api/window");
    return mod.getCurrentWindow() as unknown as AppWindow;
  } catch {
    return null;
  }
}

async function minimize() {
  const win = await appWindow();
  await win?.minimize();
}

async function toggleMaximize() {
  const win = await appWindow();
  if (!win) return;
  await win.toggleMaximize();
  maximized.value = await win.isMaximized();
}

async function close() {
  const win = await appWindow();
  await win?.close();
}

const buttons = computed(() => [
  {
    key: "minimize",
    label: "Свернуть",
    icon: "mingcute:minimize-line",
    size: 14,
    action: minimize,
  },
  {
    key: "maximize",
    label: maximized.value ? "Восстановить" : "Развернуть",
    icon: maximized.value ? "mingcute:restore-line" : "mingcute:square-line",
    size: 12,
    action: toggleMaximize,
  },
  {
    key: "close",
    label: "Закрыть",
    icon: "mingcute:close-line",
    size: 14,
    action: close,
  },
]);

onMounted(async () => {
  const win = await appWindow();
  if (win) maximized.value = await win.isMaximized();
});
</script>
