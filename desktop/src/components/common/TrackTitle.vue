<template>
  <span
    :class="
      albumId
        ? 'cursor-pointer hover:text-[color:var(--accent)] hover:underline'
        : ''
    "
    :title="albumId ? 'Перейти к альбому' : undefined"
    @click.stop="open"
    >{{ track.title }}</span
  >
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import type { Track } from "@/api/types";

const props = defineProps<{ track: Track }>();

const router = useRouter();
const albumId = computed(() => props.track.album_id ?? null);

function open() {
  if (albumId.value) void router.push(`/album/${albumId.value}`);
}
</script>
