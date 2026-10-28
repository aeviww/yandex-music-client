<template>
  <button
    type="button"
    class="flex w-full items-center justify-between gap-[10px] px-[8px] py-[6px] border-none rounded-[8px] text-[color:var(--fg)] cursor-pointer text-[12px] text-left transition-[background] duration-[140ms] ease-[ease] hover:bg-[var(--hover)]"
    :class="{
      '[&>span:last-child]:bg-[color-mix(in_srgb,var(--accent)_55%,transparent)] [&>span>i]:translate-x-[12px] [&>span>i]:bg-[#fff] [&>span>i]:opacity-100': modelValue,
    }"
    @click="emit('update:modelValue', !modelValue)"
  >
    <span class="truncate">{{ label }}</span>
    <span class="relative w-[28px] h-[16px] flex-none rounded-full bg-[color-mix(in_srgb,var(--fg)_18%,transparent)] transition-[background] duration-[160ms] ease-[ease] [&>i]:absolute [&>i]:top-[3px] [&>i]:left-[3px] [&>i]:w-[10px] [&>i]:h-[10px] [&>i]:rounded-full [&>i]:bg-[var(--fg)] [&>i]:opacity-75 [&>i]:[transition:transform_0.16s_cubic-bezier(0.22,0.65,0.28,1),opacity_0.16s_ease]"><i /></span>
  </button>
</template>

<script setup lang="ts">
defineProps<{ label: string; modelValue: boolean }>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();
</script>
