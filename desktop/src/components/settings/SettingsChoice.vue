<template>
  <div
    class="flex flex-wrap items-center gap-1 rounded-lg border border-[var(--line)] bg-[color-mix(in_srgb,var(--fg)_5%,transparent)] p-1 flex-none"
  >
    <button
      v-for="option in options"
      :key="String(option.value)"
      type="button"
      class="h-7 whitespace-nowrap rounded-md border-0 px-3 text-[calc(12px*var(--text-scale,1))] font-medium transition duration-150"
      :class="
        option.value === modelValue
          ? '!bg-[var(--surface)] font-semibold text-[var(--fg)]'
          : 'bg-transparent text-[color:var(--fg-dim)] hover:text-[var(--fg)]'
      "
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts" generic="T extends string | number | boolean">
defineProps<{
  modelValue: T;
  options: Array<{ value: T; label: string }>;
}>();

const emit = defineEmits<{ "update:modelValue": [T] }>();
</script>
