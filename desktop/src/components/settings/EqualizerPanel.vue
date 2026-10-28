<template>
  <div
    class="flex flex-col gap-5 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5"
  >
    <div class="flex flex-wrap items-center gap-2.5">
      <button
        type="button"
        class="inline-flex h-8 items-center rounded-full border px-4 text-[calc(11.5px*var(--text-scale,1))] font-medium transition duration-150"
        :class="
          eq.enabled
            ? 'border-transparent bg-[var(--accent)] text-white'
            : 'border-[var(--line)] bg-[var(--surface-2)] text-[color:var(--fg-dim)] hover:text-[var(--fg)]'
        "
        @click="eq.toggle()"
      >
        {{ eq.enabled ? "Включён" : "Выключен" }}
      </button>

      <div class="flex flex-1 flex-wrap gap-1.5">
        <button
          v-for="preset in presets"
          :key="preset.id"
          type="button"
          class="h-7 rounded-full border px-3 text-[calc(11px*var(--text-scale,1))] transition duration-150"
          :class="
            eq.activePreset === preset.id
              ? 'border-[color-mix(in_srgb,var(--accent)_65%,transparent)] bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] text-[var(--fg)]'
              : 'border-[var(--line)] text-[color:var(--fg-dim)] hover:bg-[var(--hover)] hover:text-[var(--fg)]'
          "
          @click="eq.usePreset(preset.id)"
        >
          {{ preset.label }}
        </button>
      </div>

      <button
        type="button"
        class="border-0 bg-transparent text-[calc(11px*var(--text-scale,1))] text-[color:var(--fg-faint)] transition hover:text-[var(--fg)]"
        @click="eq.reset()"
      >
        Сбросить
      </button>
    </div>

    <div
      class="flex justify-between gap-1 rounded-xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_55%,var(--surface))] px-2.5 pb-1.5 pt-3.5 transition-opacity duration-150"
      :class="eq.enabled ? '' : 'opacity-40'"
    >
      <div
        v-for="(band, index) in eq.bands"
        :key="band"
        class="flex h-[200px] min-w-0 flex-1 flex-col items-center gap-2 max-[780px]:h-[160px]"
      >
        <span
          class="whitespace-nowrap text-[calc(9.5px*var(--text-scale,1))] tabular-nums text-[color:var(--fg-dim)]"
        >
          {{ formatGain(eq.gains[index] ?? 0) }}
        </span>
        <q-slider
          class="flex-1"
          :model-value="eq.gains[index] ?? 0"
          :min="-12"
          :max="12"
          :step="0.5"
          vertical
          reverse
          dense
          @update:model-value="eq.setBand(index, Number($event ?? 0))"
        />
        <span
          class="whitespace-nowrap text-[calc(9.5px*var(--text-scale,1))] text-[color:var(--fg-faint)] max-[780px]:[transform:rotate(-45deg)]"
        >
          {{ formatFreq(band) }}
        </span>
      </div>
    </div>

    <div
      class="grid grid-cols-[auto_minmax(0,1fr)_46px] items-center gap-3.5 text-[calc(11.5px*var(--text-scale,1))] text-[color:var(--fg-dim)]"
    >
      <span>Предусиление</span>
      <q-slider
        :model-value="eq.preamp"
        :min="-12"
        :max="12"
        :step="0.5"
        dense
        @update:model-value="eq.setPreamp(Number($event ?? 0))"
      />
      <code class="text-right tabular-nums text-[var(--fg)]">{{
        formatGain(eq.preamp)
      }}</code>
    </div>

    <div
      v-if="eq.unsupported"
      class="text-[calc(11px*var(--text-scale,1))] text-[var(--accent)]"
    >
      Эквалайзер недоступен для текущего потока. Попробуй перезапустить трек.
    </div>
  </div>
</template>

<script setup lang="ts">
import { eqPresets, useEqualizerStore } from "@/stores/equalizer";

const eq = useEqualizerStore();
const presets = eqPresets;

function formatFreq(value: number): string {
  return value >= 1000 ? `${value / 1000}k` : `${value}`;
}

function formatGain(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded > 0 ? "+" : ""}${rounded}`;
}
</script>
