<template>
  <section :id="id" class="scroll-mt-8">
    <div class="mb-5 flex items-start gap-3.5">
      <span
        class="grid h-9 w-9 flex-none place-items-center rounded-lg border border-[var(--line)] bg-transparent text-[color:var(--fg-dim)]"
      >
        <Icon :name="icon" :size="17" />
      </span>
      <div class="min-w-0 pt-0.5">
        <h2
          class="m-0 text-[calc(18px*var(--text-scale,1))] font-semibold leading-tight tracking-[-0.02em] text-[var(--fg)]"
        >
          {{ title }}
        </h2>
        <p
          v-if="description"
          class="mb-0 mt-1 max-w-[680px] text-[calc(12.5px*var(--text-scale,1))] leading-relaxed text-[color:var(--fg-faint)]"
        >
          {{ description }}
        </p>
      </div>
    </div>
    <slot />
  </section>
</template>

<script setup lang="ts">
defineProps<{
  id: string;
  title: string;
  description?: string;
  icon: string;
}>();
</script>
