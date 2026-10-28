<template>
  <Teleport to="body">
    <transition name="viewer-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[4000] flex items-center justify-center bg-[rgba(0,0,0,0.82)] backdrop-blur-[8px]"
        @click.self="close"
      >
        <button
          class="absolute top-[18px] right-[20px] w-[40px] h-[40px] rounded-full border-0 bg-[rgba(255,255,255,0.12)] text-[color:#fff] cursor-pointer flex items-center justify-center hover:bg-[rgba(255,255,255,0.22)]"
          type="button"
          title="Закрыть"
          @click="close"
        >
          <Icon name="mingcute:close-line" :size="20" />
        </button>

        <button
          v-if="images.length > 1"
          class="absolute top-1/2 -translate-y-1/2 left-[24px] w-[46px] h-[46px] rounded-full border-0 bg-[rgba(255,255,255,0.12)] text-[color:#fff] cursor-pointer flex items-center justify-center hover:bg-[rgba(255,255,255,0.22)]"
          type="button"
          title="Предыдущее"
          @click.stop="prev"
        >
          <Icon name="mingcute:left-line" :size="24" />
        </button>

        <div
          class="flex flex-col items-center gap-[14px] max-w-[82vw] max-h-[84vh]"
          @click.self="close"
        >
          <img
            :src="images[cur]"
            :alt="title"
            class="max-w-[82vw] max-h-[72vh] rounded-[12px] object-contain shadow-[0_24px_60px_rgba(0,0,0,0.55)] select-none"
          />
          <div class="flex items-center gap-[14px]">
            <span
              v-if="images.length > 1"
              class="text-[13px] text-[rgba(255,255,255,0.75)]"
            >
              {{ cur + 1 }} / {{ images.length }}
            </span>
            <button
              class="inline-flex h-[32px] items-center justify-center gap-[7px] px-[14px] py-0 border border-solid border-[color:var(--line)] rounded-[8px] text-[color:#fff] text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer select-none transition-[background,border-color,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:#fff] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
              type="button"
              :disabled="saving"
              @click.stop="download"
            >
              <Icon name="mingcute:download-2-line" :size="15" />
              <span>{{ saving ? "Сохранение…" : "Скачать" }}</span>
            </button>
          </div>
        </div>

        <button
          v-if="images.length > 1"
          class="absolute top-1/2 -translate-y-1/2 right-[24px] w-[46px] h-[46px] rounded-full border-0 bg-[rgba(255,255,255,0.12)] text-[color:#fff] cursor-pointer flex items-center justify-center hover:bg-[rgba(255,255,255,0.22)]"
          type="button"
          title="Следующее"
          @click.stop="next"
        >
          <Icon name="mingcute:right-line" :size="24" />
        </button>

        <div
          v-if="images.length > 1"
          class="absolute bottom-[18px] left-1/2 -translate-x-1/2 flex gap-[8px] max-w-[80vw] overflow-x-auto p-[6px]"
          @click.stop
        >
          <button
            v-for="(img, i) in images"
            :key="i"
            class="w-[52px] h-[52px] rounded-[8px] overflow-hidden border-2 border-solid border-transparent p-0 cursor-pointer bg-transparent flex-none [&_img]:w-full [&_img]:h-full [&_img]:object-cover"
            :class="{ 'border-[#fff]': i === cur }"
            type="button"
            @click="cur = i"
          >
            <img :src="img" :alt="`${title} ${i + 1}`" />
          </button>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onUnmounted, ref, watch } from "vue";
import { Notify } from "quasar";
import { api } from "@/api/client";

const props = withDefaults(
  defineProps<{
    open: boolean;
    images: string[];
    title?: string;
    initialIndex?: number;
  }>(),
  { title: "", initialIndex: 0 },
);

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
}>();

const cur = ref(props.initialIndex);
const saving = ref(false);

function close() {
  emit("update:open", false);
}

function prev() {
  if (!props.images.length) return;
  cur.value = (cur.value - 1 + props.images.length) % props.images.length;
}

function next() {
  if (!props.images.length) return;
  cur.value = (cur.value + 1) % props.images.length;
}

async function download() {
  const url = props.images[cur.value];
  if (!url) return;
  saving.value = true;
  try {
    const suffix = props.images.length > 1 ? ` ${cur.value + 1}` : "";
    const path = await api.downloadImage(
      url,
      `${props.title || "cover"}${suffix}`,
    );
    Notify.create({ message: `Сохранено: ${path}` });
  } catch {
    Notify.create({ message: "Не удалось скачать изображение" });
  } finally {
    saving.value = false;
  }
}

function onKey(e: KeyboardEvent) {
  if (!props.open) return;
  if (e.key === "Escape") close();
  else if (e.key === "ArrowLeft" && props.images.length > 1) prev();
  else if (e.key === "ArrowRight" && props.images.length > 1) next();
}

watch(
  () => props.open,
  (v) => {
    if (v) {
      const max = Math.max(props.images.length - 1, 0);
      cur.value = Math.min(props.initialIndex, max);
      window.addEventListener("keydown", onKey);
    } else {
      window.removeEventListener("keydown", onKey);
    }
  },
);

onUnmounted(() => window.removeEventListener("keydown", onKey));
</script>

<style scoped>
.viewer-fade-enter-active,
.viewer-fade-leave-active {
  transition: opacity 0.18s ease;
}
.viewer-fade-enter-from,
.viewer-fade-leave-to {
  opacity: 0;
}
</style>
