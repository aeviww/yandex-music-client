<template>
  <button
    type="button"
    class="flex w-full items-center justify-between gap-6 border-0 px-5 py-4 text-left transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--fg)_3%,transparent)]"
    role="switch"
    :aria-checked="modelValue"
    @click="emit('update:modelValue', !modelValue)"
  >
    <span class="min-w-0">
      <span
        class="block text-[calc(13px*var(--text-scale,1))] font-semibold leading-snug text-[var(--fg)]"
      >
        {{ label }}
      </span>
      <span
        class="mt-1 block text-[calc(11.5px*var(--text-scale,1))] leading-[1.45] text-[color:var(--fg-dim)]"
      >
        {{ description }}
      </span>
    </span>
    <span
      class="relative h-[22px] w-[38px] flex-none rounded-full transition-colors duration-150 border-0 cursor-pointer pointer-events-none"
      :class="
        modelValue
          ? '!bg-[var(--accent)]'
          : 'bg-[color-mix(in_srgb,var(--fg)_16%,transparent)]'
      "
    >
      <span
        class="absolute left-[3px] top-[3px] h-4 w-4 rounded-full bg-white transition-transform duration-150"
        :class="modelValue ? 'translate-x-4' : ''"
      />
    </span>
  </button>
</template>

<script setup lang="ts">
defineProps<{ label: string; description: string; modelValue: boolean }>();
const emit = defineEmits<{ "update:modelValue": [boolean] }>();
</script>
