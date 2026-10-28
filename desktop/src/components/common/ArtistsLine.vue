<template>
  <span class="min-w-0">
    <span v-for="(a, i) in shown" :key="a.id || a.name">
      <span
        class="cursor-pointer hover:text-[color:var(--accent)] hover:underline"
        @click.stop="open(a.id)"
        >{{ a.name }}</span
      >
      <span v-if="i < shown.length - 1">, </span>
    </span>
    <span
      v-if="hidden > 0"
      class="inline-flex items-center p-0 border-0 bg-transparent text-[color:var(--fg-faint)] cursor-pointer text-[12px] gap-[4px] whitespace-nowrap appearance-none transition-colors duration-[120ms] ease-[ease] hover:text-[color:var(--fg)]"
      @click.stop
    >
      &nbsp;ещё {{ hidden }}
      <q-menu
        class="select-none bg-[color-mix(in_srgb,var(--surface-2)_90%,transparent)] border border-solid border-[rgba(255,255,255,0.09)] rounded-[var(--radius)] overflow-x-hidden max-w-[268px] shadow-[0_16px_40px_rgba(0,0,0,0.55)] [backdrop-filter:blur(var(--glass-blur,24px))_saturate(1.35)]"
        anchor="bottom start"
        self="top start"
        @show="loadAvatars"
      >
        <div
          class="p-[4px] min-w-[178px] max-w-[260px] overflow-x-hidden select-none"
          style="min-width: 200px; max-height: 320px; overflow-y: auto"
        >
          <div
            v-for="a in artists"
            :key="a.id || a.name"
            class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[7px] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap select-none transition-[background,color] duration-[100ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:w-[15px] [&_svg]:h-[15px] [&_svg]:text-[color:var(--fg-faint)] [&_svg]:flex-none [&_svg]:[transition:color_0.1s_ease] [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
            v-close-popup
            @click="open(a.id)"
          >
            <div
              class="cover cover-round w-[26px] h-[26px] rounded-full flex-none overflow-hidden bg-[var(--surface-2)] flex items-center justify-center [&_img]:block [&_img]:w-full [&_img]:h-full [&_img]:object-cover"
            >
              <img
                v-if="avatars[a.id]"
                :src="avatars[a.id] as string"
                loading="lazy"
                decoding="async"
              />
              <Icon
                v-else
                name="mingcute:mic-line"
                :size="14"
                class="text-[color:var(--fg-faint)]"
              />
            </div>
            <span class="truncate">{{ a.name }}</span>
          </div>
        </div>
      </q-menu>
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import type { Artist } from "@/api/types";
import { cachedAvatar, fetchAvatars } from "@/lib/artistAvatar";

const props = withDefaults(
  defineProps<{ artists: Artist[]; limit?: number }>(),
  {
    limit: 3,
  },
);

const router = useRouter();

const artists = computed(() => props.artists);
const shown = computed(() => props.artists.slice(0, props.limit));
const hidden = computed(() => Math.max(0, props.artists.length - props.limit));

const avatars = ref<Record<string, string | null>>({});

async function loadAvatars() {
  const ids = props.artists.map((a) => a.id).filter(Boolean);
  const local: Record<string, string | null> = { ...avatars.value };
  for (const id of ids) {
    const cached = cachedAvatar(id);
    if (cached) local[id] = cached;
  }
  avatars.value = local;

  const missing = ids.filter((id) => !local[id]);
  if (!missing.length) return;
  const loaded = await fetchAvatars(missing);
  avatars.value = { ...avatars.value, ...loaded };
}

function open(id: string) {
  if (id) void router.push(`/artist/${id}`);
}
</script>
