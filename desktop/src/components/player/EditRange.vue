<template>
  <label class="block select-none">
    <span class="mb-[2px] flex items-baseline justify-between gap-[8px]">
      <span class="text-[color:var(--fg-dim)] text-[11px]">{{ label }}</span>
      <span class="text-[color:var(--fg)] text-[10.5px] tabular-nums opacity-[0.6]"
        >{{ modelValue }}{{ suffix }}</span
      >
    </span>
    <input
      class="block h-[14px] w-full cursor-pointer appearance-none border-0 bg-transparent p-0 [&::-moz-range-thumb]:h-[10px] [&::-moz-range-thumb]:w-[10px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-[var(--accent)] [&::-moz-range-track]:h-[2px] [&::-moz-range-track]:rounded-[2px] [&::-moz-range-track]:bg-[color-mix(in_srgb,var(--fg)_15%,transparent)] [&::-webkit-slider-runnable-track]:h-[2px] [&::-webkit-slider-runnable-track]:rounded-[2px] [&::-webkit-slider-runnable-track]:bg-[color-mix(in_srgb,var(--fg)_15%,transparent)] [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-thumb]:h-[10px] [&::-webkit-slider-thumb]:w-[10px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-none [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:[transition:transform_0.12s_ease] hover:[&::-webkit-slider-thumb]:scale-[1.2]"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      @input="onInput"
    />
  </label>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    modelValue: number;
    min: number;
    max: number;
    step?: number;
    suffix?: string;
  }>(),
  { step: 1, suffix: "" },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: number): void;
}>();

function onInput(event: Event) {
  const raw = Number((event.target as HTMLInputElement).value);
  if (Number.isFinite(raw)) emit("update:modelValue", raw);
}
</script>
