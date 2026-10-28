<template>
  <div class="flex flex-col gap-[8px]">
    <div class="flex flex-col gap-[2px] [&_span]:opacity-[0.55] [&_span]:text-[11px] [&_span]:break-all">
      <b>Журнал</b>
      <span v-if="together.logPath">{{ together.logPath }}</span>
    </div>

    <pre ref="box" class="m-0 max-h-[220px] overflow-auto px-[12px] py-[10px] rounded-[10px] bg-[var(--surface-2,rgba(255,255,255,0.06))] text-[12px] leading-[1.5] whitespace-pre-wrap break-words">{{
      together.log.join("\n") || "Пока пусто"
    }}</pre>

    <div class="flex gap-[8px]">
      <button
        class="inline-flex items-center justify-center gap-[6px] h-[30px] px-[12px] py-0 border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] whitespace-nowrap cursor-pointer transition-[background,color,border-color] duration-[140ms] ease-[ease] hover:bg-[var(--hover)] hover:border-[color:color-mix(in_srgb,_var(--fg)_14%,_transparent)] hover:text-[color:var(--fg)]"
        type="button"
        @click="copy"
      >
        Скопировать
      </button>
      <button
        class="inline-flex items-center justify-center gap-[6px] h-[30px] px-[12px] py-0 border border-[color:color-mix(in_srgb,_#ff5d5d_45%,_var(--line))] rounded-[8px] text-[color:#ff8b8b] text-[calc(12px*var(--text-scale,1))] whitespace-nowrap cursor-pointer transition-[background,color,border-color] duration-[140ms] ease-[ease] hover:bg-[color-mix(in_srgb,_#ff5d5d_14%,_transparent)] hover:border-[color:#ff5d5d] hover:text-[color:#ff5d5d]"
        type="button"
        @click="together.clearLog()"
      >
        Очистить
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import { Notify } from "quasar";
import { useTogetherStore } from "@/stores/together/index";

const together = useTogetherStore();
const box = ref<HTMLElement | null>(null);

watch(
  () => together.log.length,
  async () => {
    await nextTick();
    if (box.value) box.value.scrollTop = box.value.scrollHeight;
  },
);

async function copy() {
  try {
    await navigator.clipboard.writeText(together.log.join("\n"));
    Notify.create({ message: "Журнал скопирован" });
  } catch {
    Notify.create({ message: "Не удалось скопировать" });
  }
}
</script>

