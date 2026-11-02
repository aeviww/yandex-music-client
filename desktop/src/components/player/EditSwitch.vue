<template>
  <button
    type="button"
    class="flex w-full items-center justify-between gap-[10px] rounded-[7px] border-0 bg-transparent px-[6px] py-[4px] text-left text-[color:var(--fg-dim)] text-[11px] cursor-pointer transition-[color] duration-[120ms] hover:text-[color:var(--fg)]"
    :class="{
      'text-[color:var(--fg)] [&>span:last-child]:bg-[color-mix(in_srgb,var(--accent)_70%,transparent)] [&>span>i]:translate-x-[11px] [&>span>i]:bg-[#fff] [&>span>i]:opacity-100':
        modelValue,
    }"
    @click="emit('update:modelValue', !modelValue)"
  >
    <span class="truncate">{{ label }}</span>
    <span
      class="relative h-[14px] w-[25px] flex-none rounded-full bg-[color-mix(in_srgb,var(--fg)_16%,transparent)] transition-[background] duration-[160ms] ease-[ease] [&>i]:absolute [&>i]:top-[3px] [&>i]:left-[3px] [&>i]:h-[8px] [&>i]:w-[8px] [&>i]:rounded-full [&>i]:bg-[var(--fg)] [&>i]:opacity-70 [&>i]:[transition:transform_0.16s_cubic-bezier(0.22,0.65,0.28,1),opacity_0.16s_ease]"
      ><i
    /></span>
  </button>
</template>

<script setup lang="ts">
defineProps<{ label: string; modelValue: boolean }>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();
</script>
