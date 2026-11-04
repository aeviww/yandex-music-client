<template>
  <div class="min-w-[152px] max-w-[220px] flex-none">
    <button
      type="button"
      class="flex h-[32px] w-full items-center gap-[8px] rounded-[calc(var(--radius)*0.8333)] border border-transparent bg-[var(--surface)] pr-[9px] pl-[12px] text-left text-[color:var(--fg)] text-[calc(12px*var(--text-scale,1))] outline-none cursor-pointer transition-[border-color,background] duration-[140ms] hover:bg-[var(--surface-2)]"
      :class="
        open
          ? 'border-[color:color-mix(in_srgb,var(--fg)_22%,transparent)] bg-[var(--surface-2)]'
          : ''
      "
      aria-haspopup="listbox"
      :aria-expanded="open"
    >
      <span class="min-w-0 flex-1 truncate">{{ current?.label ?? '' }}</span>
      <Icon
        name="mingcute:down-line"
        :size="14"
        class="flex-none text-[color:var(--fg-faint)] transition-transform duration-150"
        :class="open ? 'rotate-180' : ''"
      />

      <q-menu
        anchor="bottom start"
        self="top start"
        :offset="[0, 4]"
        class="overflow-hidden rounded-[calc(var(--radius)*0.8333)] border border-[color:var(--line)] bg-[var(--surface-2)] shadow-[var(--elev-1)]"
        @show="open = true"
        @hide="open = false"
      >
        <div
          class="max-h-[280px] min-w-[180px] overflow-y-auto overscroll-contain p-[4px]"
          role="listbox"
        >
          <button
            v-for="option in options"
            :key="option.value"
            type="button"
            class="flex h-[28px] w-full items-center gap-[8px] rounded-[calc(var(--radius)*0.5833)] border-0 bg-transparent px-[8px] text-left text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] cursor-pointer transition-[background,color] duration-[100ms] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]"
            :class="
              option.value === modelValue
                ? 'bg-[var(--hover)] text-[color:var(--fg)]'
                : ''
            "
            role="option"
            :aria-selected="option.value === modelValue"
            v-close-popup
            @click="pick(option.value)"
          >
            <span class="min-w-0 flex-1 truncate">{{ option.label }}</span>
            <Icon
              v-if="option.value === modelValue"
              name="mingcute:check-line"
              :size="13"
              class="flex-none text-[color:var(--accent)]"
            />
          </button>
        </div>
      </q-menu>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

interface FilterOption {
  value: string;
  label: string;
}

const props = defineProps<{ options: FilterOption[] }>();

const modelValue = defineModel<string>({ default: "" });

const open = ref(false);

const current = computed(() =>
  props.options.find((option) => option.value === modelValue.value),
);

function pick(value: string) {
  modelValue.value = value;
}
</script>
