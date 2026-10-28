<template>
  <div
    class="flex w-full items-center justify-between min-h-[50px] box-border gap-[20px] px-[10px] py-[9px] rounded-[10px] m-0 text-inherit text-left transition-[background] duration-[120ms] ease-[ease] hover:bg-[color-mix(in_srgb,_var(--fg)_3.5%,_transparent)]"
    :class="{ 'border-t border-[color:var(--line)]': !together.isHost }"
  >
    <div class="flex min-w-0 flex-col gap-[3px] [&_b]:text-[color:var(--fg)] [&_b]:text-[calc(13px*var(--text-scale,1))] [&_b]:font-semibold [&_span]:text-[color:var(--fg-dim)] [&_span]:text-[calc(11.5px*var(--text-scale,1))] [&_span]:leading-[1.4]">
      <b>Подключиться к комнате</b>
      <span>
        Адрес хоста в виде ip или ip:порт. Ваш плеер начнёт повторять трек и
        позицию хоста.
      </span>
    </div>

    <div class="flex items-center gap-[8px]">
      <input
        v-model="address"
        class="w-[190px] px-[10px] py-[7px] rounded-[8px] border border-[color:var(--border,rgba(255,255,255,0.12))] bg-transparent text-inherit"
        type="text"
        placeholder="26.13.4.7:7331"
        :disabled="together.active"
        @keyup.enter="connect"
      />

      <button
        v-if="together.mode !== 'guest'"
        class="inline-flex items-center justify-center gap-[6px] h-[30px] px-[12px] py-0 border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] whitespace-nowrap cursor-pointer transition-[background,color,border-color] duration-[140ms] ease-[ease] hover:bg-[var(--hover)] hover:border-[color:color-mix(in_srgb,_var(--fg)_14%,_transparent)] hover:text-[color:var(--fg)]"
        type="button"
        :disabled="together.busy || together.active || !address.trim()"
        @click="connect"
      >
        Подключиться
      </button>

      <button
        v-else
        class="inline-flex items-center justify-center gap-[6px] h-[30px] px-[12px] py-0 border border-[color:color-mix(in_srgb,_#ff5d5d_45%,_var(--line))] rounded-[8px] text-[color:#ff8b8b] text-[calc(12px*var(--text-scale,1))] whitespace-nowrap cursor-pointer transition-[background,color,border-color] duration-[140ms] ease-[ease] hover:bg-[color-mix(in_srgb,_#ff5d5d_14%,_transparent)] hover:border-[color:#ff5d5d] hover:text-[color:#ff5d5d]"
        type="button"
        :disabled="together.busy"
        @click="together.leave()"
      >
        Отключиться
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useTogetherStore } from "@/stores/together/index";

const together = useTogetherStore();
const address = ref("");

function connect() {
  const value = address.value.trim();
  if (!value || together.busy || together.active) return;
  void together.join(value);
}
</script>

