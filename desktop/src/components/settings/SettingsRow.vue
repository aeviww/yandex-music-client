<template>
  <component
    :is="as"
    class="flex flex-wrap gap-x-6 gap-y-3 px-5 py-4 text-left"
    :class="
      column
        ? 'flex-col items-stretch'
        : 'items-center justify-between transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--fg)_3%,transparent)]'
    "
  >
    <div class="min-w-0 flex-1">
      <div
        v-if="label"
        class="text-[13px] font-semibold leading-snug text-[var(--fg)]"
      >
        {{ label }}
      </div>
      <p
        v-if="description"
        class="mb-0 mt-1 text-[11.5px] leading-[1.45] text-[color:var(--fg-dim)]"
      >
        {{ description }}
      </p>
      <slot name="copy" />
    </div>
    <slot />
  </component>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string;
    description?: string;
    column?: boolean;
    as?: string;
  }>(),
  { as: "div", column: false },
);
</script>
