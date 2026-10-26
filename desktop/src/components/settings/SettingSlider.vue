<template>
  <div
    class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4 transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--fg)_3%,transparent)]"
  >
    <div class="min-w-0 flex-1">
      <div class="text-[13px] font-semibold leading-snug text-[var(--fg)]">
        {{ label }}
      </div>
      <p class="mb-0 mt-1 text-[11.5px] leading-[1.45] text-[color:var(--fg-dim)]">
        {{ description }}
      </p>
    </div>
    <div
      class="grid flex-none grid-cols-[56px_minmax(150px,240px)] items-center gap-3"
    >
      <span
        class="text-right text-[12px] tabular-nums text-[color:var(--fg-dim)]"
      >
        {{ displayValue }}
      </span>
      <q-slider
        :model-value="modelValue"
        :min="min"
        :max="max"
        :step="step"
        @update:model-value="
          emit('update:modelValue', Number($event ?? modelValue))
        "
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  label: string;
  description: string;
  modelValue: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
}>();
const emit = defineEmits<{ "update:modelValue": [number] }>();
const displayValue = computed(() => `${props.modelValue}${props.suffix || ""}`);
</script>
