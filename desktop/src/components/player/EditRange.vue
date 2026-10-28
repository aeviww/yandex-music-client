<template>
  <label class="block select-none">
    <span class="flex items-baseline justify-between gap-[8px] mb-[4px]">
      <span class="text-[11.5px] text-[color:var(--fg-dim)]">{{ label }}</span>
      <span
        class="text-[11.5px] tabular-nums text-[color:var(--fg)] opacity-[0.85]"
        >{{ modelValue }}{{ suffix }}</span
      >
    </span>
    <input
      class="block w-full h-[16px] m-0 p-0 cursor-pointer bg-transparent appearance-none [&::-webkit-slider-runnable-track]:h-[3px] [&::-webkit-slider-runnable-track]:rounded-[3px] [&::-webkit-slider-runnable-track]:bg-[color-mix(in_srgb,var(--fg)_16%,transparent)] [&::-moz-range-track]:h-[3px] [&::-moz-range-track]:rounded-[3px] [&::-moz-range-track]:bg-[color-mix(in_srgb,var(--fg)_16%,transparent)] [&::-webkit-slider-thumb]:w-[12px] [&::-webkit-slider-thumb]:h-[12px] [&::-webkit-slider-thumb]:mt-[-4.5px] [&::-webkit-slider-thumb]:border-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:transition-[transform] [&::-webkit-slider-thumb]:duration-[120ms] [&::-webkit-slider-thumb]:ease-[ease] [&::-moz-range-thumb]:w-[12px] [&::-moz-range-thumb]:h-[12px] [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--accent)] hover:[&::-webkit-slider-thumb]:scale-[1.18]"
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
