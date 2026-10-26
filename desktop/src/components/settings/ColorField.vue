<template>
  <label
    class="flex h-9 min-w-[130px] cursor-pointer items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] py-0 pl-1.5 pr-2.5 text-[10px] text-[color:var(--fg-dim)] transition hover:border-[color-mix(in_srgb,var(--fg)_14%,var(--line))]"
  >
    <input
      type="color"
      class="h-6 w-6 cursor-pointer overflow-hidden rounded-md border-0 bg-transparent p-0"
      :value="value"
      @input="onInput"
    />
    <span class="whitespace-nowrap">{{ label }}</span>
    <code class="ml-auto text-[9.5px] text-[color:var(--fg-faint)]">{{
      value.toUpperCase()
    }}</code>
  </label>
</template>

<script setup lang="ts">
defineProps<{ label: string; value: string }>();
const emit = defineEmits<{ change: [string] }>();

function onInput(event: Event) {
  emit("change", (event.target as HTMLInputElement).value);
}
</script>
