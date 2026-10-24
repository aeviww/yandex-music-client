<template>
  <div
    v-if="neuro.item && barHidden"
    class="fixed z-[60] left-[max(14px,var(--neuro-left,14px))] bottom-[84px] flex max-w-[560px] min-w-0 items-center gap-3 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] p-[8px] pr-[10px] shadow-[0_18px_44px_-20px_rgba(0,0,0,0.65)]"
    :style="{
      '--neuro-left':
        typeof ui.settings.sidebarWidth === 'number'
          ? `${ui.settings.sidebarWidth + 14}px`
          : '14px',
    }"
  >
    <div
      class="relative h-[48px] w-[48px] flex-none overflow-hidden rounded-[10px] bg-[var(--surface-2)]"
    >
      <img
        v-if="neuro.stream?.cover_url"
        :src="neuro.stream.cover_url"
        alt=""
        class="h-full w-full object-cover"
      />
      <Icon
        v-else
        name="mingcute:sparkles-line"
        :size="22"
        class="absolute inset-0 m-auto text-[color:var(--fg-faint)]"
      />
    </div>

    <div class="min-w-0 flex-1">
      <div class="ellipsis text-[13px] font-semibold" style="color: var(--fg)">
        {{ neuro.stream?.title || neuro.item.title }}
      </div>
      <div class="ellipsis text-[11.5px] text-[color:var(--fg-faint)]">
        {{
          neuro.stream?.subtitle ||
          neuro.stream?.title ||
          "Нейромузыка Яндекса"
        }}
      </div>
    </div>

    <div v-if="neuro.loading" class="flex-none px-2">
      <Icon name="mingcute:loading-3-line" :size="20" class="spin text-[color:var(--fg-faint)]" />
    </div>
    <button
      v-else
      type="button"
      class="grid h-[36px] w-[36px] flex-none place-items-center rounded-full bg-white text-black transition-[background] duration-150 hover:bg-white/85"
      @click="togglePlay"
    >
      <Icon
        :name="neuro.playing ? 'mingcute:pause-fill' : 'mingcute:play-fill'"
        :size="18"
      />
    </button>

    <button
      type="button"
      class="icon-btn xs round h-[36px] w-[36px] flex-none text-[color:var(--fg-dim)] hover:bg-[color-mix(in_srgb,var(--fg)_8%,transparent)] hover:text-[color:var(--fg)]"
      title="Выключить нейромузыку"
      @click="stopNeuro"
    >
      <Icon name="mingcute:close-line" :size="16" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Icon from "@/boot/icons";
import { pauseNeuro, resumeNeuro, stopNeuro, neuro } from "@/lib/neuro";
import { usePanelsStore } from "@/stores/panels";
import { useUiStore } from "@/stores/ui/index";

const ui = useUiStore();
const panels = usePanelsStore();

const barHidden = computed(() => panels.mini || panels.hidden);

function togglePlay() {
  if (neuro.playing) {
    pauseNeuro();
  } else {
    resumeNeuro();
  }
}
</script>
