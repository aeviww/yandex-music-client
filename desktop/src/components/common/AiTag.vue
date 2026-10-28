<template>
  <span
    v-if="show"
    class="inline-flex items-center ml-[6px] px-[5px] py-0 border border-solid border-[#ef4444] rounded-[4px] bg-[rgba(239,68,68,0.12)] text-[#ef4444] text-[10px] font-semibold leading-[1.5] tracking-[0.02em] align-middle flex-none cursor-default"
  >
    AI
    <q-tooltip>Помечено как AI-музыка (данные Slopless)</q-tooltip>
  </span>
</template>

<script setup lang="ts">
defineProps<{ show?: boolean }>();
</script>
