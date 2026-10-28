<template>
  <div
    class="group flex items-center gap-[14px] h-[var(--track-height)] px-[12px] py-0 rounded-[var(--radius)] transition-[background] duration-[140ms] ease-[ease] max-[1180px]:gap-[11px] max-[900px]:gap-[10px] max-[900px]:px-[8px] hover:bg-[var(--surface)]"
    :class="[
      selected
        ? 'bg-[color-mix(in_srgb,var(--fg)_10%,transparent)] hover:bg-[color-mix(in_srgb,var(--fg)_14%,transparent)]'
        : dropTarget
          ? 'bg-[color-mix(in_srgb,var(--accent)_13%,var(--surface))]'
          : isCurrent
            ? 'bg-[var(--surface)] hover:bg-[var(--surface)]'
            : 'hover:bg-[var(--surface)]',
      dropTarget && '!shadow-[inset_0_2px_0_var(--accent)]',
      dragging && 'opacity-[0.36] scale-[0.99]',
      isDisliked &&
        'opacity-[0.42] grayscale-[0.6] hover:opacity-[0.75] hover:grayscale-0',
    ]"
    :data-track-index="index"
    @dblclick="emit('play')"
    @click="onRowClick"
  >
    <div
      v-if="reorderable"
      class="w-[26px] flex items-center justify-center text-transparent cursor-grab flex-none touch-none active:cursor-grabbing group-hover:text-[color:var(--fg-faint)]"
      @pointerdown.stop.prevent="emit('reorderStart', index, $event)"
    >
      <Icon name="mingcute:dots-line" :size="16" />
    </div>

    <button
      v-if="selectable"
      class="flex w-[16px] h-[16px] flex-none items-center justify-center border border-solid rounded-[5px] text-[color:#fff] group-hover:opacity-[1] active:scale-[0.82] [transition:opacity_0.14s_ease,background_0.12s_ease,border-color_0.12s_ease,transform_0.24s_cubic-bezier(0.34,1.56,0.64,1)]"
      :class="
        selected
          ? 'on border-[color:var(--accent)] bg-[var(--accent)] opacity-[1]'
          : 'border-[color:var(--line)] bg-[var(--surface-2)] opacity-[0.28]'
      "
      type="button"
      :title="selected ? 'Снять выделение' : 'Выделить трек'"
      @click.stop="emit('toggleSelect', $event)"
    >
      <Icon v-if="selected" name="mingcute:check-line" :size="13" />
    </button>

    <div style="width: 20px; text-align: center; flex: 0 0 auto">
      <div
        v-if="showIndex"
        class="text-[color:var(--fg-faint)] text-[calc(13px*var(--text-scale,1))] group-hover:hidden"
      >
        {{ index + 1 }}
      </div>
      <div
        class="hidden cursor-pointer text-[color:var(--fg)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-[0.78] group-hover:flex"
        @click.stop="onPlayClick"
      >
        <Icon
          :name="isCurrent && player.isPlaying ? 'mingcute:pause-fill' : 'mingcute:play-fill'"
          :size="16"
        />
      </div>
    </div>

    <div
      v-if="showCover"
      class="cover w-[38px] h-[38px] rounded-[10px] flex-none overflow-hidden bg-[var(--surface-2)] flex items-center justify-center [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block"
      style="width: 38px; height: 38px"
    >
      <img
        loading="lazy"
        decoding="async"
        v-if="track.cover_url"
        :src="track.cover_url"
      />
      <Icon
        v-else
        name="mingcute:music-line"
        :size="15"
        class="text-[color:var(--fg-faint)]"
      />
    </div>

    <div class="col" style="min-width: 0">
      <div class="flex items-center gap-[6px] min-w-0">
        <span
          class="truncate text-[calc(13px*var(--text-scale,1))] font-medium"
          >{{ displayTitle }}</span
        >
        <AiTag :show="isAi" />

        <Icon
          v-if="downloaded"
          name="mingcute:download-2-line"
          :size="13"
          class="text-[color:var(--fg-faint)] flex-none"
        />

        <div
          v-if="isDisliked"
          class="flex items-center text-[color:var(--fg-faint)]"
        >
          <Icon name="mingcute:heart-crack-line" :size="13" />
          <q-tooltip>Отмечен как «Не нравится»</q-tooltip>
        </div>

        <div
          class="flex w-[22px] h-[22px] flex-none items-center justify-center rounded-[6px] text-[color:var(--fg-faint)] cursor-pointer select-none opacity-0 hover:bg-[var(--hover)] hover:text-[color:var(--fg)] group-hover:opacity-[1] group-[.on]:opacity-[1] [transition:opacity_0.14s_ease,transform_0.24s_cubic-bezier(0.34,1.56,0.64,1)] active:scale-[0.85] p-0 border-0 appearance-none duration-[120ms]"
          @click.stop
        >
          <Icon name="mingcute:more-1-fill" :size="15" />
          <q-tooltip>Действия с треком</q-tooltip>
          <TrackMenu
            :track="track"
            :playlist-kind="playlistKind"
            @remove="emit('remove')"
          />
        </div>
      </div>
      <div
        class="text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] truncate"
      >
        <ArtistsLine :artists="track.artists" />
      </div>
    </div>

    <div
      v-if="showAlbum"
      class="text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] truncate gt-sm"
      style="width: 190px"
    >
      <span
        v-if="track.album_id"
        class="cursor-pointer hover:text-[color:var(--accent)] hover:underline"
        @click.stop="openAlbum(track.album_id)"
      >
        {{ track.album_title }}
      </span>
      <span v-else>{{ track.album_title }}</span>
    </div>

    <div class="flex w-[84px] items-center justify-end gap-[2px] flex-none invisible group-hover:visible">
      <div
        v-if="reorderable"
        class="flex w-[27px] h-[27px] items-center justify-center rounded-[7px] text-[color:var(--fg-faint)] cursor-pointer select-none transition-[background,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] p-0 border-0 appearance-none"
        @click.stop="emit('remove')"
      >
        <Icon name="mingcute:delete-2-line" :size="17" />
        <q-tooltip>Удалить из плейлиста</q-tooltip>
      </div>

      <div
        class="flex w-[27px] h-[27px] items-center justify-center rounded-[7px] cursor-pointer select-none transition-[background,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] text-[color:var(--fg-faint)] p-0 border-0 appearance-none hover:text-[color:var(--fg)]"
        :class="
          isLiked
            ? 'on text-[color:var(--accent)]'
            : 'text-[color:var(--fg-faint)] hover:text-[color:var(--fg)]'
        "
        @click.stop="library.toggleLike(track)"
      >
        <Icon :name="isLiked ? 'mingcute:heart-fill' : 'mingcute:heart-line'" :size="17" />
        <q-tooltip>{{
          isLiked ? "Убрать из «Мне нравится»" : "Нравится"
        }}</q-tooltip>
      </div>

      <div
        class="flex w-[27px] h-[27px] items-center justify-center rounded-[7px] text-[color:var(--fg-faint)] cursor-pointer select-none transition-[background,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] p-0 border-0 appearance-none"
        @click.stop
      >
        <Icon name="mingcute:more-1-fill" :size="17" />
        <TrackMenu
          :track="track"
          :playlist-kind="playlistKind"
          @remove="emit('remove')"
        />
      </div>
    </div>

    <div
      class="text-[color:var(--fg-faint)] text-[calc(12px*var(--text-scale,1))] w-[40px] text-right flex-none"
    >
      {{ formatDuration(track.duration_ms) }}
    </div>

    <TrackMenu
      :context-menu="true"
      :track="track"
      :playlist-kind="playlistKind"
      @remove="emit('remove')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useRouter } from "vue-router";
import ArtistsLine from "@/components/common/ArtistsLine.vue";
import AiTag from "@/components/common/AiTag.vue";
import TrackMenu from "@/components/common/TrackMenu.vue";
import type { Track } from "@/api/types";
import { formatDuration } from "@/lib/format";
import { ensureAiArtists, isAiArtist } from "@/lib/aiTag";
import { useLibraryStore } from "@/stores/library";
import { usePlayerStore } from "@/stores/player/index";

const props = withDefaults(
  defineProps<{
    track: Track;
    index: number;
    showCover?: boolean;
    showAlbum?: boolean;
    showIndex?: boolean;
    playlistKind?: number | string | null;
    dragging?: boolean;
    dropTarget?: boolean;
    selectable?: boolean;
    selected?: boolean;
    downloaded?: boolean;
  }>(),
  {
    showCover: true,
    showAlbum: true,
    showIndex: true,
    playlistKind: null,
    dragging: false,
    dropTarget: false,
    selectable: false,
    selected: false,
    downloaded: false,
  },
);

const emit = defineEmits<{
  play: [];
  remove: [];
  reorderStart: [number, PointerEvent];
  toggleSelect: [MouseEvent];
}>();

function onRowClick(event: MouseEvent) {
  if (!props.selectable) return;
  if (props.selected || event.ctrlKey || event.metaKey || event.shiftKey)
    emit("toggleSelect", event);
}

function onPlayClick() {
  if (isCurrent.value) {
    player.toggle();
    return;
  }
  emit("play");
}

const router = useRouter();
const player = usePlayerStore();
const library = useLibraryStore();

const primaryArtistId = computed(() => props.track.artists?.[0]?.id ?? null);
const isAi = computed(() => isAiArtist(primaryArtistId.value));
const displayTitle = computed(() => props.track.title);
watch(
  primaryArtistId,
  (id) => {
    if (id) ensureAiArtists([id]);
  },
  { immediate: true },
);

const isCurrent = computed(() => player.current?.id === props.track.id);
const isLiked = computed(() => library.liked(props.track.id));
const isDisliked = computed(() => library.disliked(props.track.id));
const reorderable = computed(
  () => props.playlistKind !== null && props.playlistKind !== undefined,
);

function openAlbum(id: string) {
  if (id) void router.push(`/album/${id}`);
}
</script>
