<template>
  <div class="flex flex-wrap gap-[8px]">
    <div
      v-for="peer in peers"
      :key="peer.id"
      class="inline-flex items-center gap-[6px] px-[10px] py-[5px] rounded-full bg-[var(--surface-2,rgba(255,255,255,0.06))] text-[13px] [&_b]:opacity-60 [&_b]:font-medium [&_b]:text-[11px] [&_b]:uppercase [&_i]:opacity-75 [&_i]:not-italic [&_i]:text-[11px] [&_i]:uppercase [&_i]:text-[color:var(--accent,#ffcc00)]"
    >
      <span>{{ peer.nick }}</span>

      <b v-if="peer.id === hostId">хостит</b>
      <i v-if="waiting.includes(peer.id)">грузит</i>

      <button
        v-if="manage && peer.id !== hostId"
        class="p-0 border-0 bg-transparent text-inherit opacity-[0.55] text-[11px] cursor-pointer underline hover:opacity-[0.9]"
        type="button"
        title="Участник станет хостом, остальные переподключатся"
        @click="emit('handoff', peer.id)"
      >
        передать хост
      </button>
    </div>

    <p v-if="!peers.length" class="m-0 opacity-60 text-[13px]">Пока никого нет</p>
  </div>
</template>

<script setup lang="ts">
import type { TogetherPeer } from "@/api/together";

withDefaults(
  defineProps<{
    peers: TogetherPeer[];
    waiting?: number[];
    manage?: boolean;
    hostId?: number;
  }>(),
  {
    waiting: () => [],
    manage: false,
    hostId: 0,
  },
);

const emit = defineEmits<{ (e: "handoff", id: number): void }>();
</script>

