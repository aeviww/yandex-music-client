<template>
  <label
    class="flex h-9 min-w-[130px] cursor-pointer items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] py-0 pl-1.5 pr-2.5 text-[calc(10px*var(--text-scale,1))] text-[color:var(--fg-dim)] transition hover:border-[color-mix(in_srgb,var(--fg)_14%,var(--line))] pt-0 pb-0 [&_input]:w-[22px] [&_input]:h-[22px] [&_input]:p-0 [&_input]:border-0 [&_input]:rounded-[calc(var(--radius)*0.55)] [&_input]:overflow-hidden [&_input]:bg-transparent [&_input]:cursor-pointer [&_code]:ml-auto [&_code]:text-[color:var(--fg-faint)] [&_code]:text-[calc(9.5px*var(--text-scale,1))]"
  >
    <input
      type="color"
      class="h-6 w-6 cursor-pointer overflow-hidden rounded-md border-0 bg-transparent p-0"
      :value="value"
      @input="onInput"
    />
    <span class="whitespace-nowrap">{{ label }}</span>
    <code
      class="ml-auto text-[calc(9.5px*var(--text-scale,1))] text-[color:var(--fg-faint)]"
      >{{ value.toUpperCase() }}</code
    >
  </label>
</template>

<script setup lang="ts">
defineProps<{ label: string; value: string }>();
const emit = defineEmits<{ change: [string] }>();

function onInput(event: Event) {
  emit("change", (event.target as HTMLInputElement).value);
}
</script>
