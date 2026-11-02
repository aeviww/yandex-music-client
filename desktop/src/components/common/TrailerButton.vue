<template>
  <button
    v-if="available"
    class="btn inline-flex h-[32px] items-center justify-center px-[14px] py-0 border border-solid border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] cursor-pointer text-[calc(12px*var(--text-scale,1))] font-medium gap-[7px] select-none whitespace-nowrap transition-[background,border-color,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]"
    type="button"
    :title="heading"
    @click="openDialog"
  >
    <Icon name="mingcute:video-line" :size="15" />
    <span class="btn_span">Трейлер</span>
  </button>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { openTrailerDialog } from "@/lib/dialogs";
import { fetchTrailer, type TrailerKind } from "@/lib/trailer";

const props = defineProps<{
  kind: TrailerKind;
  id: string;
  uid?: number | null;
  heading: string;
  subtitle?: string;
  cover?: string | null;
  playFull?: () => unknown;
}>();

const available = ref(false);
let seq = 0;

async function check() {
  const ticket = ++seq;
  available.value = false;
  if (!props.id) return;

  const found = await fetchTrailer(props.kind, props.id, props.uid ?? null);
  if (ticket !== seq) return;
  available.value = Boolean(found);
}

function openDialog() {
  openTrailerDialog({
    kind: props.kind,
    id: props.id,
    uid: props.uid ?? null,
    heading: props.heading,
    subtitle: props.subtitle,
    cover: props.cover,
    playFull: props.playFull,
  });
}

onMounted(check);
watch(() => [props.kind, props.id, props.uid ?? null], check);
onBeforeUnmount(() => {
  seq += 1;
});
</script>
