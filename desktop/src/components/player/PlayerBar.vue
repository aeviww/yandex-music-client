<template>
  <div
    class="relative grid h-[var(--player-height,_76px)] items-center gap-[16px] max-[1360px]:gap-[12px] max-[1120px]:!gap-[10px] px-[var(--player-pad,_18px)] py-0 grid-cols-[minmax(0,var(--player-meta-width,260px))_minmax(320px,1.35fr)_auto] max-[760px]:grid-cols-[minmax(0,1fr)_auto]"
    :class="{
      'outline-dashed outline-1 outline-[color:color-mix(in_srgb,var(--accent)_60%,transparent)] [outline-offset:-2px]':
        editMode,
    }"
    @contextmenu.prevent="toggleEdit"
  >
    <template v-if="editMode">
      <div
        class="absolute z-[14] top-0 left-0 w-full h-[5px] cursor-ns-resize bg-[color-mix(in_srgb,var(--accent)_55%,transparent)]"
        title="Тяни вверх или вниз — высота плеера"
        @pointerdown="startResize('height', $event)"
      />
      <div
        class="absolute z-[14] top-[20%] left-[var(--player-meta-width,260px)] w-[5px] h-[60%] rounded-[3px] cursor-ew-resize bg-[color-mix(in_srgb,var(--accent)_55%,transparent)]"
        title="Тяни влево или вправо — ширина блока с треком"
        @pointerdown="startResize('meta', $event)"
      />

      <PlayerEditor />
    </template>
    <canvas
      v-if="ui.settings.playerVisualizer"
      ref="vizCanvas"
      class="absolute inset-0 w-full h-full z-[0] pointer-events-none opacity-[0.5]"
    />

    <div class="relative z-[1] flex min-w-0 items-center gap-[12px]">
      <div
        class="cover group relative flex items-center justify-center flex-none w-[var(--player-cover,_48px)] h-[var(--player-cover,_48px)] max-[900px]:w-[40px] max-[900px]:h-[40px] overflow-hidden rounded-[10px] bg-[var(--surface-2)] cursor-pointer [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block"
        @click="onCoverClick"
        @contextmenu.prevent="openAlbum"
      >
        <div
          class="absolute inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.55)] text-[color:#fff] opacity-0 transition-opacity duration-[140ms] ease-[ease] group-hover:opacity-100"
        >
          <Icon name="mingcute:fullscreen-line" :size="16" />
        </div>
        <Transition name="pb-cover">
          <img
            v-if="coverSrc"
            :key="coverSrc"
            loading="lazy"
            decoding="async"
            :src="coverSrc"
          />
          <Icon
            v-else
            name="mingcute:music-line"
            :size="18"
            class="text-[color:var(--fg-faint)]"
          />
        </Transition>
      </div>

      <div class="flex min-w-0 flex-auto flex-col">
        <div class="flex min-w-0 items-center gap-[6px]">
          <div class="group/title flex min-w-0 items-center">
            <Transition name="pb-swap" mode="out-in">
              <span
                :key="displayTitle"
                class="min-w-0 truncate text-[calc(13px*var(--text-scale,1))] font-semibold"
                :class="{
                  'cursor-pointer hover:underline hover:underline-offset-2':
                    !neuroActive && Boolean(trackTarget),
                }"
                :title="neuroActive ? neuroSub : trackTargetHint"
                @click="openTrackSource"
              >
                {{ displayTitle }}
              </span>
            </Transition>

            <span
              class="flex min-w-0 flex-[0_1_auto] items-center max-w-0 overflow-hidden opacity-0 -translate-x-[4px] transition-[max-width,opacity,transform] duration-[180ms] ease-[ease] group-hover/title:max-w-[260px] group-hover/title:opacity-100 group-hover/title:translate-x-0 motion-reduce:transition-none"
            >
              <span
                v-if="neuroActive"
                class="inline-block min-w-0 flex-[0_1_auto] truncate ml-[6px] px-[5px] py-0 border border-[color:var(--accent,#fa2d48)] rounded-[4px] bg-[rgba(250,45,72,0.12)] text-[color:var(--accent,#fa2d48)] text-[10px] font-semibold leading-[1.5] tracking-[0.02em] whitespace-nowrap align-middle cursor-default"
              >
                нейромузыка
              </span>

              <span v-else class="inline-flex flex-none ml-[6px]">
                <AiTag :show="isAiCurrent" />
              </span>

              <span
                v-if="!neuroActive && showCensorBadge"
                class="inline-block min-w-0 flex-[0_1_auto] truncate ml-[6px] px-[5px] py-0 border border-[color:var(--accent,#fa2d48)] rounded-[4px] bg-[rgba(250,45,72,0.12)] text-[color:var(--accent,#fa2d48)] text-[10px] font-semibold leading-[1.5] tracking-[0.02em] whitespace-nowrap align-middle cursor-default"
              >
                {{ replacementLabel }}
                <q-tooltip>
                  Играет заменённая версия: {{ replacementLabel }}
                </q-tooltip>
              </span>

              <span
                v-else-if="!neuroActive && showOriginalBadge"
                class="inline-block min-w-0 flex-[0_1_auto] truncate ml-[6px] px-[5px] py-0 border border-[color:var(--line)] rounded-[4px] bg-[rgba(255,255,255,0.06)] text-[color:var(--fg-dim)] text-[10px] font-semibold leading-[1.5] tracking-[0.02em] whitespace-nowrap align-middle cursor-default"
              >
                с цензурой
                <q-tooltip>
                  Играет версия с Яндекс Музыки. Версию без цензуры можно
                  вернуть в меню трека.
                </q-tooltip>
              </span>
            </span>
          </div>
          <button
            v-if="!neuroActive && player.current"
            type="button"
            class="inline-flex flex-none items-center justify-center w-[20px] h-[20px] mt-0 mr-0 mb-0 ml-[4px] p-0 border-0 rounded-none text-[color:var(--fg)] cursor-pointer appearance-none visible opacity-[0.45] [background:none] [-webkit-appearance:none] [transition:none] [transform:none] hover:opacity-[0.75] hover:[background:none] active:opacity-[0.75] active:[transform:none] [&_svg]:block [&_svg]:w-[16px] [&_svg]:h-[16px] [&_svg]:fill-[currentColor]"
            aria-label="Действия с треком"
          >
            <Icon name="mingcute:more-1-fill" :size="18" />
            <q-tooltip>Действия с треком</q-tooltip>
            <TrackMenu :track="player.current" />
          </button>
        </div>
        <div
          class="text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] truncate"
        >
          <Transition name="pb-swap" mode="out-in">
            <span v-if="neuroActive" :key="neuroSub">{{ neuroSub }}</span>
            <ArtistsLine
              v-else-if="player.current"
              :key="player.current.id"
              :artists="player.current.artists"
              :limit="2"
            />
          </Transition>
        </div>
      </div>

      <div
        v-if="leftButtons.length || editMode"
        class="flex items-center gap-[var(--player-gap,_6px)] flex-none ml-[4px] max-[1024px]:hidden [&_svg]:w-[var(--player-icon,_18px)] [&_svg]:h-[var(--player-icon,_18px)]"
        :class="{ [editZoneClass]: editMode }"
        :data-zone-label="editMode ? 'Слева' : null"
        @dragover.prevent="onZoneOver('left', $event)"
        @dragleave="onZoneLeave($event)"
        @drop.prevent="onZoneDrop('left', $event)"
      >
        <template v-for="(id, index) in leftButtons" :key="id">
          <i
            v-if="caretAt('left', index)"
            class="w-[2px] h-[22px] flex-[0_0_2px] self-center rounded-[2px] bg-[var(--accent)] shadow-[0_0_6px_color-mix(in_srgb,var(--accent)_55%,transparent)] pointer-events-none"
          />
          <span
            class="pe-item inline-flex items-center"
            :class="{
              [editItemClass]: editMode,
              'opacity-[0.4]': dragId === id,
            }"
            :draggable="editMode"
            @dragstart="startDrag(id, $event)"
            @dragend="endDrag()"
          >
            <PlayerButton :id="id" />
          </span>
        </template>
        <i
          v-if="caretAt('left', leftButtons.length)"
          class="w-[2px] h-[22px] flex-[0_0_2px] self-center rounded-[2px] bg-[var(--accent)] shadow-[0_0_6px_color-mix(in_srgb,var(--accent)_55%,transparent)] pointer-events-none"
        />
      </div>
    </div>

    <div
      class="relative z-[1] flex min-w-0 flex-col items-center justify-center gap-[4px]"
    >
      <div
        class="flex items-center gap-[calc(var(--player-gap,_6px)_+_4px)] [&_svg]:w-[var(--player-icon,_18px)] [&_svg]:h-[var(--player-icon,_18px)]"
        :class="{
          [editZoneClass]: editMode,
          'px-[10px] py-[3px] !rounded-full bg-[color-mix(in_srgb,var(--bg)_42%,transparent)] backdrop-blur-[5px]':
            ui.settings.playerVisualizer,
        }"
        :data-zone-label="editMode ? 'Центр' : null"
        @dragover.prevent="onZoneOver('center', $event)"
        @dragleave="onZoneLeave($event)"
        @drop.prevent="onZoneDrop('center', $event)"
      >
        <template v-for="(id, index) in centerButtons" :key="id">
          <i
            v-if="caretAt('center', index)"
            class="w-[2px] h-[22px] flex-[0_0_2px] self-center rounded-[2px] bg-[var(--accent)] shadow-[0_0_6px_color-mix(in_srgb,var(--accent)_55%,transparent)] pointer-events-none"
          />
          <span
            class="pe-item inline-flex items-center"
            :class="{
              [editItemClass]: editMode,
              'opacity-[0.4]': dragId === id,
            }"
            :draggable="editMode"
            @dragstart="startDrag(id, $event)"
            @dragend="endDrag()"
          >
            <PlayerButton :id="id" />
          </span>
        </template>
        <i
          v-if="caretAt('center', centerButtons.length)"
          class="w-[2px] h-[22px] flex-[0_0_2px] self-center rounded-[2px] bg-[var(--accent)] shadow-[0_0_6px_color-mix(in_srgb,var(--accent)_55%,transparent)] pointer-events-none"
        />
      </div>

      <div
        v-if="neuroActive"
        class="flex w-[var(--player-progress-width,_100%)] items-center gap-[10px] flex-nowrap"
      >
        <div
          class="flex flex-1 items-center justify-center gap-[10px] text-[color:var(--fg-faint)] text-[11px] tracking-[0.05em] lowercase"
        >
          <span>прямой эфир</span>
        </div>
      </div>
      <div
        v-else
        class="flex w-[var(--player-progress-width,_100%)] items-center gap-[10px] flex-nowrap"
      >
        <div
          class="text-[color:var(--fg-faint)] text-[calc(11px*var(--text-scale,1))] w-[36px] flex-none tabular-nums first:text-right max-[900px]:hidden"
        >
          {{ formatDuration(seekValue * 1000) }}
        </div>
        <q-slider
          class="col"
          :model-value="seekValue"
          :min="0"
          :max="Math.max(player.duration, 1)"
          :step="1"
          :track-size="`${ui.settings.playerProgressThickness}px`"
          dense
          color="primary"
          @update:model-value="onSeekInput"
          @change="onSeekCommit"
        />
        <div
          class="text-[color:var(--fg-faint)] text-[calc(11px*var(--text-scale,1))] w-[36px] flex-none tabular-nums first:text-right max-[900px]:hidden"
        >
          {{ formatDuration(player.duration * 1000) }}
        </div>
      </div>
    </div>

    <div
      class="relative z-[1] flex min-w-0 items-center justify-end gap-[var(--player-gap,_6px)] max-[760px]:hidden [&_svg]:w-[var(--player-icon,_18px)] [&_svg]:h-[var(--player-icon,_18px)]"
      :class="{ [editZoneClass]: editMode }"
      :data-zone-label="editMode ? 'Справа' : null"
      @dragover.prevent="onZoneOver('right', $event)"
      @dragleave="onZoneLeave($event)"
      @drop.prevent="onZoneDrop('right', $event)"
    >
      <template v-for="(id, index) in rightButtons" :key="id">
        <i
          v-if="caretAt('right', index)"
          class="w-[2px] h-[22px] flex-[0_0_2px] self-center rounded-[2px] bg-[var(--accent)] shadow-[0_0_6px_color-mix(in_srgb,var(--accent)_55%,transparent)] pointer-events-none"
        />
        <span
          class="pe-item inline-flex items-center"
          :class="{ [editItemClass]: editMode, 'opacity-[0.4]': dragId === id }"
          :draggable="editMode"
          @dragstart="startDrag(id, $event)"
          @dragend="endDrag()"
        >
          <PlayerButton :id="id" />
        </span>
      </template>
      <i
        v-if="caretAt('right', rightButtons.length)"
        class="w-[2px] h-[22px] flex-[0_0_2px] self-center rounded-[2px] bg-[var(--accent)] shadow-[0_0_6px_color-mix(in_srgb,var(--accent)_55%,transparent)] pointer-events-none"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import ArtistsLine from "@/components/common/ArtistsLine.vue";
import AiTag from "@/components/common/AiTag.vue";
import PlayerButton from "@/components/player/PlayerButton.vue";
import PlayerEditor from "@/components/player/PlayerEditor.vue";
import TrackMenu from "@/components/common/TrackMenu.vue";
import { useVisualizer } from "@/composables/useVisualizer";
import { formatDuration } from "@/lib/format";
import { ensureAiArtists, isAiArtist } from "@/lib/aiTag";
import { neuro } from "@/lib/neuro";
import { useLibraryStore } from "@/stores/library";
import { usePlayerStore } from "@/stores/player/index";
import type { PlayerButtonId, PlayerZone } from "@/stores/ui/index";
import { useUiStore } from "@/stores/ui/index";

const router = useRouter();
const player = usePlayerStore();
const library = useLibraryStore();
const ui = useUiStore();

const vizCanvas = ref<HTMLCanvasElement | null>(null);
useVisualizer(vizCanvas, () => ui.settings.playerVisualizer, { bars: 72 });

const neuroActive = computed(() => Boolean(neuro.item));
const neuroSub = computed(
  () => neuro.stream?.subtitle || neuro.stream?.title || "нейромузыка Яндекса",
);
const coverSrc = computed(() =>
  neuroActive.value
    ? neuro.stream?.cover_url || neuro.item?.cover_url || ""
    : player.current?.cover_url || "",
);

const primaryArtistId = computed(
  () => player.current?.artists?.[0]?.id ?? null,
);
const isAiCurrent = computed(() => isAiArtist(primaryArtistId.value));
const displayTitle = computed(() =>
  neuroActive.value
    ? neuro.stream?.title || neuro.item?.title || "Нейромузыка"
    : player.current?.title || "Ничего не играет",
);
const replacementLabel = computed(
  () => player.replacementLabel || "FckCensorData",
);
const showCensorBadge = computed(
  () => ui.settings.censorBadge && player.censorReplaced,
);

const showOriginalBadge = computed(
  () =>
    ui.settings.censorBadge && !player.censorReplaced && player.censorAvailable,
);

const trackTarget = computed(() => {
  const track = player.current;
  if (!track) return null;
  if (track.album_id) return `/album/${track.album_id}`;
  const artistId = track.artists?.[0]?.id;
  return artistId ? `/artist/${artistId}/tracks` : null;
});

const trackTargetHint = computed(() => {
  if (!trackTarget.value) return "";
  return player.current?.album_id
    ? "Перейти к альбому"
    : "Перейти к трекам артиста";
});

function openTrackSource() {
  if (neuroActive.value) return;
  if (trackTarget.value) void router.push(trackTarget.value);
}

function onCoverClick() {
  if (neuroActive.value) return;
  player.openFullscreen();
}

const scrubbing = ref<number | null>(null);
const seekValue = computed(() => scrubbing.value ?? player.progress);

function onSeekInput(value: number | null) {
  scrubbing.value = Number(value ?? 0);
}

function onSeekCommit(value: number | null) {
  const target = Number(value ?? 0);
  scrubbing.value = null;
  player.seek(target);
}

const handledDislike = new Set<string>();

watch(
  () => player.current?.id,
  (id) => {
    if (!id) return;
    if (primaryArtistId.value) ensureAiArtists([primaryArtistId.value]);
  },
  { immediate: true },
);

watch(
  () => [player.current?.id ?? null, isAiCurrent.value] as const,
  ([id, ai]) => {
    if (!id || !ai) return;
    const action = ui.settings.aiTrackAction;
    if (action === "none") return;
    if (handledDislike.has(id)) return;
    handledDislike.add(id);
    if (action === "dislike") void player.dislike();
    else void player.next(true);
  },
);

const leftButtons = computed(() => ui.playerZoneButtons("left"));
const centerButtons = computed(() => ui.playerZoneButtons("center"));
const rightButtons = computed(() => ui.playerZoneButtons("right"));

const editMode = computed(() => ui.settings.playerEditMode);
const editZoneClass =
  "relative min-w-[42px] min-h-[34px] border border-dashed border-[color:color-mix(in_srgb,var(--accent)_45%,transparent)] rounded-[12px] before:absolute before:top-[-9px] before:left-[8px] before:px-[4px] before:py-0 before:rounded-[4px] before:bg-[var(--surface)] before:text-[color:var(--fg-faint)] before:[content:attr(data-zone-label)] before:text-[9px] before:tracking-[0.04em] before:uppercase";
const editItemClass =
  "rounded-[10px] cursor-grab transition-[background,opacity] duration-[140ms] ease-[ease] hover:bg-[var(--hover)] [&>*]:pointer-events-none";
const dragId = ref<PlayerButtonId | null>(null);
const overZone = ref<PlayerZone | null>(null);
const overIndex = ref(-1);

function toggleEdit() {
  ui.togglePlayerEdit();
}

function zoneList(zone: PlayerZone): PlayerButtonId[] {
  if (zone === "left") return leftButtons.value;
  if (zone === "center") return centerButtons.value;
  if (zone === "right") return rightButtons.value;
  return [];
}

function slotAt(container: HTMLElement, clientX: number): number {
  const items = Array.from(container.querySelectorAll<HTMLElement>(".pe-item"));
  let slot = 0;
  for (const el of items) {
    const box = el.getBoundingClientRect();
    if (clientX >= box.left + box.width / 2) slot += 1;
  }
  return slot;
}

function caretAt(zone: PlayerZone, index: number): boolean {
  return editMode.value && overZone.value === zone && overIndex.value === index;
}

function startDrag(id: PlayerButtonId, event: DragEvent) {
  dragId.value = id;
  event.dataTransfer?.setData("text/plain", id);
  if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
}

function endDrag() {
  dragId.value = null;
  overZone.value = null;
  overIndex.value = -1;
}

function onZoneOver(zone: PlayerZone, event: DragEvent) {
  if (!editMode.value) return;
  const box = event.currentTarget as HTMLElement | null;
  if (!box) return;
  if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
  overZone.value = zone;
  overIndex.value = slotAt(box, event.clientX);
}

function onZoneLeave(event: DragEvent) {
  const box = event.currentTarget as HTMLElement | null;
  const to = event.relatedTarget as Node | null;
  if (box && to && box.contains(to)) return;
  overZone.value = null;
  overIndex.value = -1;
}

function onZoneDrop(zone: PlayerZone, event: DragEvent) {
  const dropped = event.dataTransfer?.getData("text/plain") as
    PlayerButtonId | undefined;
  const id = dragId.value ?? (dropped || null);
  const list = zoneList(zone);
  const box = event.currentTarget as HTMLElement | null;
  const slot = box ? slotAt(box, event.clientX) : list.length;
  endDrag();
  if (!id) return;

  const from = list.indexOf(id);
  ui.movePlayerButton(id, zone, from >= 0 && from < slot ? slot - 1 : slot);
}

type ResizeKind = "height" | "meta";

let resizeKind: ResizeKind | null = null;
let startPos = 0;
let startValue = 0;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function onResizeMove(event: PointerEvent) {
  if (resizeKind === "height") {
    ui.set(
      "playerHeight",
      clamp(startValue + (startPos - event.clientY), 60, 140),
    );
  } else if (resizeKind === "meta") {
    ui.set(
      "playerMetaWidth",
      clamp(startValue + (event.clientX - startPos), 150, 460),
    );
  }
}

function onResizeUp() {
  resizeKind = null;
  window.removeEventListener("pointermove", onResizeMove);
  window.removeEventListener("pointerup", onResizeUp);
}

function startResize(kind: ResizeKind, event: PointerEvent) {
  event.preventDefault();
  resizeKind = kind;
  startPos = kind === "height" ? event.clientY : event.clientX;
  startValue =
    kind === "height" ? ui.settings.playerHeight : ui.settings.playerMetaWidth;
  window.addEventListener("pointermove", onResizeMove);
  window.addEventListener("pointerup", onResizeUp);
}

onBeforeUnmount(onResizeUp);

function openAlbum() {
  if (neuroActive.value) return;
  const id = player.current?.album_id;
  if (id) void router.push(`/album/${id}`);
}

function onGlobalKeydown(event: KeyboardEvent) {
  if (event.key !== "Escape" || !editMode.value) return;
  event.preventDefault();
  event.stopPropagation();
  ui.finishEdit();
}

onMounted(() => {
  player.bind();
  void library.init();
  window.addEventListener("keydown", onGlobalKeydown, true);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onGlobalKeydown, true);
});
</script>
