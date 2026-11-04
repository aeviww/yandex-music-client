<template>
  <div class="space-y-4">
    <div>
      <div class="flex items-center justify-between pb-2 px-1">
        <div class="flex items-center gap-2">
          <span class="text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--fg-faint)]">
            {{ activeTitle }}
          </span>
          <span
            class="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--surface-2)] text-[color:var(--fg-faint)] font-mono"
          >
            {{ activeItems.length }}
          </span>
        </div>

        <div
          v-if="isOrderChanged || isAppearanceChanged"
          class="flex items-center gap-2 text-[11px] text-[color:var(--fg-faint)]"
        >
          <button
            v-if="isOrderChanged"
            type="button"
            class="inline-flex items-center gap-1 text-[11px] text-[color:var(--fg-faint)] hover:text-[color:var(--fg)] cursor-pointer bg-transparent border-0 p-0 transition-colors"
            title="Вернуть стандартный порядок пунктов"
            @click="emit('resetOrder')"
          >
            <Icon name="mingcute:refresh-1-line" :size="12" />
            <span>Сбросить порядок</span>
          </button>

          <span v-if="isOrderChanged && isAppearanceChanged" class="opacity-40 select-none">·</span>

          <button
            v-if="isAppearanceChanged"
            type="button"
            class="inline-flex items-center gap-1 text-[11px] text-[color:var(--fg-faint)] hover:text-[color:var(--fg)] cursor-pointer bg-transparent border-0 p-0 transition-colors"
            :title="canEditIcon ? 'Вернуть стандартные названия и иконки' : 'Вернуть стандартные названия'"
            @click="emit('resetAppearance')"
          >
            <Icon name="mingcute:refresh-1-line" :size="12" />
            <span>{{ appearanceResetLabel }}</span>
          </button>
        </div>
      </div>

      <div
        class="flex flex-col gap-1.5 min-h-[44px] rounded-[calc(var(--radius)*0.8333)] p-1 border border-solid border-transparent transition-colors"
        :class="{
          'border-[color:var(--line)] bg-[var(--surface)]': activeItems.length === 0,
        }"
        @dragover.prevent="onActiveAreaDragOver"
        @drop.prevent="onActiveAreaDrop"
      >
        <div
          v-if="!activeItems.length"
          class="py-6 text-center text-[12px] text-[color:var(--fg-faint)]"
        >
          Все пункты скрыты. Перетащите сюда пункты из скрытых ниже или нажмите «+».
        </div>

        <div
          v-for="(item, index) in activeItems"
          :key="item.id"
          class="group relative flex items-center gap-3 px-3 py-2.5 rounded-[calc(var(--radius)*0.75)] bg-[var(--surface-2)] border border-solid transition-all select-none"
          :class="[
            draggingId === item.id
              ? 'opacity-30 border-dashed border-[var(--accent)]'
              : dropTargetId === item.id && dropPosition === 'before'
                ? 'border-t-[var(--accent)] border-t-2 border-r-[color:var(--line)] border-b-[color:var(--line)] border-l-[color:var(--line)]'
                : dropTargetId === item.id && dropPosition === 'after'
                  ? 'border-b-[var(--accent)] border-b-2 border-r-[color:var(--line)] border-t-[color:var(--line)] border-l-[color:var(--line)]'
                  : 'border-[color:var(--line)] hover:border-[color:rgba(255,255,255,0.18)]',
          ]"
          draggable="true"
          @dragstart="onDragStart($event, item.id, 'active')"
          @dragover.prevent="onItemDragOver($event, item.id)"
          @dragleave="onItemDragLeave(item.id)"
          @drop.prevent="onItemDrop($event, item.id)"
          @dragend="onDragEnd"
        >
          <div
            class="flex items-center justify-center text-[color:var(--fg-faint)] cursor-grab active:cursor-grabbing hover:text-[color:var(--fg)] p-0.5 -ml-1 transition-colors"
            title="Перетащите для изменения порядка"
          >
            <Icon name="mingcute:menu-line" :size="15" />
          </div>

          <div
            v-if="canEditIcon || item.icon"
            class="flex items-center justify-center w-[28px] h-[28px] rounded-[calc(var(--radius)*0.5833)] bg-[var(--surface)] text-[color:var(--fg)] flex-none border border-solid border-[color:var(--line)] shadow-sm"
          >
            <Icon :name="getItemIcon(item)" :size="16" />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-[13px] font-medium text-[color:var(--fg)] truncate">
                {{ getItemLabel(item) }}
              </span>
              <span
                v-if="isItemCustomized(item)"
                class="text-[9.5px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] text-[var(--accent)]"
                title="Имя или иконка изменены"
              >
                свой
              </span>
              <span
                v-if="item.locked"
                class="text-[10px] text-[color:var(--fg-faint)] flex items-center gap-0.5"
                title="Обязательный пункт навигации"
              >
                <Icon name="mingcute:lock-line" :size="11" />
              </span>
            </div>
            <div
              v-if="item.description"
              class="text-[11px] text-[color:var(--fg-faint)] truncate mt-0.5"
            >
              {{ item.description }}
            </div>
          </div>

          <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity max-[720px]:opacity-100">
            <button
              type="button"
              class="w-[24px] h-[24px] flex items-center justify-center rounded-[calc(var(--radius)*0.4167)] border-0 bg-transparent text-[color:var(--fg-faint)] hover:text-[color:var(--fg)] hover:bg-[var(--hover)] cursor-pointer disabled:opacity-20 disabled:pointer-events-none transition-colors"
              title="Переместить выше"
              :disabled="index === 0"
              @click="moveItem(index, index - 1)"
            >
              <Icon name="mingcute:up-line" :size="13" />
            </button>
            <button
              type="button"
              class="w-[24px] h-[24px] flex items-center justify-center rounded-[calc(var(--radius)*0.4167)] border-0 bg-transparent text-[color:var(--fg-faint)] hover:text-[color:var(--fg)] hover:bg-[var(--hover)] cursor-pointer disabled:opacity-20 disabled:pointer-events-none transition-colors"
              title="Переместить ниже"
              :disabled="index === activeItems.length - 1"
              @click="moveItem(index, index + 1)"
            >
              <Icon name="mingcute:down-line" :size="13" />
            </button>
          </div>

          <button
            v-if="canEditLabel || canEditIcon"
            type="button"
            class="w-[28px] h-[28px] flex items-center justify-center rounded-[calc(var(--radius)*0.5833)] border-0 bg-transparent text-[color:var(--fg-dim)] hover:text-[color:var(--fg)] hover:bg-[var(--hover)] cursor-pointer transition-colors"
            title="Настроить название и иконку"
            @click="openEditDialog(item)"
          >
            <Icon name="mingcute:pencil-line" :size="15" />
          </button>

          <button
            type="button"
            class="w-[28px] h-[28px] flex items-center justify-center rounded-[calc(var(--radius)*0.5833)] border-0 bg-transparent text-[color:var(--fg-faint)] hover:text-[color:var(--fg)] hover:bg-[var(--hover)] cursor-pointer transition-colors disabled:opacity-30 disabled:pointer-events-none"
            :title="item.locked ? 'Обязательный пункт нельзя скрыть' : 'Скрыть пункт'"
            :disabled="item.locked"
            @click="hideItem(item.id)"
          >
            <Icon name="mingcute:eye-close-line" :size="15" />
          </button>
        </div>
      </div>
    </div>

    <div v-if="hiddenItems.length || isDraggingActive">
      <div class="flex items-center justify-between pb-2 px-1">
        <div class="flex items-center gap-2">
          <span class="text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--fg-faint)]">
            {{ hiddenTitle }}
          </span>
          <span
            class="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--surface-2)] text-[color:var(--fg-faint)] font-mono"
          >
            {{ hiddenItems.length }}
          </span>
        </div>
      </div>

      <div
        class="flex flex-col gap-1.5 min-h-[48px] p-2 rounded-[calc(var(--radius)*0.8333)] border border-dashed transition-all"
        :class="[
          hiddenTrayOver
            ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]'
            : 'border-[color:var(--line)] bg-[color-mix(in_srgb,var(--surface)_60%,transparent)]',
        ]"
        @dragover.prevent="hiddenTrayOver = true"
        @dragleave="hiddenTrayOver = false"
        @drop.prevent="onDropHide"
      >
        <div
          v-if="!hiddenItems.length && !hiddenTrayOver"
          class="py-2 text-center text-[11.5px] text-[color:var(--fg-faint)]"
        >
          Все доступные пункты активны. Чтобы скрыть пункт, нажмите крестик или перетащите его сюда.
        </div>

        <div
          v-if="hiddenTrayOver && isDraggingActive"
          class="py-2 text-center text-[12px] font-medium text-[var(--accent)]"
        >
          Отпустите, чтобы скрыть пункт
        </div>

        <div
          v-for="item in hiddenItems"
          :key="item.id"
          class="flex items-center gap-3 px-3 py-2 rounded-[calc(var(--radius)*0.6667)] bg-[var(--surface)] border border-solid border-[color:var(--line)] opacity-85 hover:opacity-100 transition-all select-none"
          draggable="true"
          @dragstart="onDragStart($event, item.id, 'hidden')"
          @dragend="onDragEnd"
        >
          <div
            class="flex items-center justify-center text-[color:var(--fg-faint)] cursor-grab active:cursor-grabbing hover:text-[color:var(--fg)] p-0.5 -ml-1 transition-colors"
            title="Перетащите в активный список"
          >
            <Icon name="mingcute:menu-line" :size="14" />
          </div>

          <div
            v-if="canEditIcon || item.icon"
            class="flex items-center justify-center w-[26px] h-[26px] rounded-[calc(var(--radius)*0.5)] bg-[var(--surface-2)] text-[color:var(--fg-dim)] flex-none"
          >
            <Icon :name="getItemIcon(item)" :size="15" />
          </div>

          <div class="flex-1 min-w-0">
            <span class="text-[12.5px] text-[color:var(--fg-dim)] truncate block">
              {{ getItemLabel(item) }}
            </span>
          </div>

          <button
            type="button"
            class="inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-[calc(var(--radius)*0.5)] border border-solid border-[color:var(--line)] bg-[var(--surface-2)] text-[11.5px] text-[color:var(--fg-dim)] hover:text-[color:var(--fg)] hover:border-[var(--accent)] cursor-pointer transition-colors"
            @click="showItem(item.id)"
          >
            <Icon name="mingcute:add-line" :size="13" />
            <span>Добавить</span>
          </button>
        </div>
      </div>
    </div>

    <NavItemEditDialog
      v-model="editDialogOpen"
      :title="`Редактировать пункт: ${editingItem?.label ?? ''}`"
      :default-label="editingItem?.label ?? ''"
      :current-label="editingCurrentLabel"
      :default-icon="editingItem?.icon ?? 'mingcute:dots-line'"
      :current-icon="editingCurrentIcon"
      :can-edit-icon="canEditIcon"
      :can-edit-label="canEditLabel"
      @save="onSaveItemEdit"
    />
  </div>
</template>

<script setup lang="ts" generic="T extends string">
import { computed, ref, shallowRef } from "vue";
import NavItemEditDialog from "@/components/settings/NavItemEditDialog.vue";

export interface NavCatalogEntry<K extends string> {
  id: K;
  label: string;
  icon?: string;
  description?: string;
  locked?: boolean;
}

const props = withDefaults(
  defineProps<{
    items: T[];
    defaultItems?: readonly T[];
    catalog: NavCatalogEntry<T>[];
    customLabels?: Partial<Record<T, string>>;
    customIcons?: Partial<Record<T, string>>;
    canEditIcon?: boolean;
    canEditLabel?: boolean;
    activeTitle?: string;
    hiddenTitle?: string;
  }>(),
  {
    defaultItems: () => [],
    customLabels: () => ({}),
    customIcons: () => ({}),
    canEditIcon: true,
    canEditLabel: true,
    activeTitle: "Активные пункты",
    hiddenTitle: "Скрытые пункты",
  },
);

const emit = defineEmits<{
  (e: "update:items", items: T[]): void;
  (e: "updateLabel", id: T, label: string | undefined): void;
  (e: "updateIcon", id: T, icon: string | undefined): void;
  (e: "resetItem", id: T): void;
  (e: "resetOrder"): void;
  (e: "resetAppearance"): void;
  (e: "resetAll"): void;
}>();

const catalogMap = computed(() => {
  const map = new Map<T, NavCatalogEntry<T>>();
  for (const entry of props.catalog) {
    map.set(entry.id, entry);
  }
  return map;
});

const activeItems = computed(() => {
  const list: NavCatalogEntry<T>[] = [];
  for (const id of props.items) {
    const entry = catalogMap.value.get(id);
    if (entry) list.push(entry);
  }
  return list;
});

const hiddenItems = computed(() => {
  const activeSet = new Set(props.items);
  return props.catalog.filter((entry) => !activeSet.has(entry.id));
});

const isOrderChanged = computed(() => {
  if (!props.defaultItems || !props.defaultItems.length) return false;
  if (props.items.length !== props.defaultItems.length) return true;
  return props.items.some((id, idx) => id !== props.defaultItems![idx]);
});

const isAppearanceChanged = computed(() => {
  const hasLabels = Object.keys(props.customLabels || {}).length > 0;
  const hasIcons = Object.keys(props.customIcons || {}).length > 0;
  return hasLabels || hasIcons;
});

const appearanceResetLabel = computed(() => {
  return props.canEditIcon ? "Сбросить названия и иконки" : "Сбросить названия";
});

function getItemLabel(item: NavCatalogEntry<T>): string {
  return props.customLabels?.[item.id] || item.label;
}

function getItemIcon(item: NavCatalogEntry<T>): string {
  return props.customIcons?.[item.id] || item.icon || "mingcute:dots-line";
}

function isItemCustomized(item: NavCatalogEntry<T>): boolean {
  const labelCustom = Boolean(props.customLabels?.[item.id]);
  const iconCustom = Boolean(props.customIcons?.[item.id]);
  return labelCustom || iconCustom;
}

const draggingId = ref<T | null>(null);
const draggingFrom = ref<"active" | "hidden" | null>(null);
const dropTargetId = ref<T | null>(null);
const dropPosition = ref<"before" | "after" | null>(null);
const hiddenTrayOver = ref(false);

const isDraggingActive = computed(() => draggingFrom.value === "active");

function onDragStart(event: DragEvent, id: T, from: "active" | "hidden") {
  draggingId.value = id;
  draggingFrom.value = from;
  if (event.dataTransfer) {
    event.dataTransfer.setData("text/plain", JSON.stringify({ id, from }));
    event.dataTransfer.effectAllowed = "move";
  }
}

function onItemDragOver(event: DragEvent, targetId: T) {
  if (draggingId.value === targetId) return;

  dropTargetId.value = targetId;
  const targetEl = event.currentTarget as HTMLElement | null;
  if (targetEl) {
    const rect = targetEl.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    dropPosition.value = event.clientY < midY ? "before" : "after";
  } else {
    dropPosition.value = "before";
  }
}

function onItemDragLeave(targetId: T) {
  if (dropTargetId.value === targetId) {
    dropTargetId.value = null;
    dropPosition.value = null;
  }
}

function onItemDrop(event: DragEvent, targetId: T) {
  const raw = event.dataTransfer?.getData("text/plain");
  if (!raw) return;

  try {
    const data = JSON.parse(raw) as { id: T; from: "active" | "hidden" };
    const sourceId = data.id;
    if (!sourceId) return;

    const current = [...props.items];
    const sourceIndex = current.indexOf(sourceId);
    let targetIndex = current.indexOf(targetId);

    if (sourceIndex !== -1) {
      current.splice(sourceIndex, 1);
      targetIndex = current.indexOf(targetId);
    }

    const insertAt = dropPosition.value === "after" ? targetIndex + 1 : targetIndex;
    current.splice(insertAt, 0, sourceId);

    emit("update:items", current);
  } catch {}

  onDragEnd();
}

function onActiveAreaDragOver() {}

function onActiveAreaDrop(event: DragEvent) {
  if (props.items.length > 0) return;
  const raw = event.dataTransfer?.getData("text/plain");
  if (!raw) return;

  try {
    const data = JSON.parse(raw) as { id: T; from: "active" | "hidden" };
    if (data.id) {
      emit("update:items", [data.id]);
    }
  } catch {}
  onDragEnd();
}

function onDropHide(event: DragEvent) {
  hiddenTrayOver.value = false;
  const raw = event.dataTransfer?.getData("text/plain");
  if (!raw) return;

  try {
    const data = JSON.parse(raw) as { id: T; from: "active" | "hidden" };
    const entry = catalogMap.value.get(data.id);
    if (!entry || entry.locked) return;

    hideItem(data.id);
  } catch {}

  onDragEnd();
}

function onDragEnd() {
  draggingId.value = null;
  draggingFrom.value = null;
  dropTargetId.value = null;
  dropPosition.value = null;
  hiddenTrayOver.value = false;
}

function moveItem(fromIndex: number, toIndex: number) {
  if (toIndex < 0 || toIndex >= props.items.length) return;
  const next = [...props.items];
  const [removed] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, removed);
  emit("update:items", next);
}

function hideItem(id: T) {
  const entry = catalogMap.value.get(id);
  if (entry?.locked) return;
  emit("update:items", props.items.filter((item) => item !== id));
}

function showItem(id: T) {
  if (!props.items.includes(id)) {
    emit("update:items", [...props.items, id]);
  }
}

const editDialogOpen = ref(false);
const editingItem = shallowRef<NavCatalogEntry<T> | null>(null);

const editingId = computed(() => editingItem.value?.id as T | undefined);
const editingCurrentLabel = computed(() => {
  const id = editingId.value;
  return id ? (props.customLabels?.[id] ?? "") : "";
});
const editingCurrentIcon = computed(() => {
  const id = editingId.value;
  return id ? (props.customIcons?.[id] ?? "") : "";
});

function openEditDialog(item: NavCatalogEntry<T>) {
  editingItem.value = item;
  editDialogOpen.value = true;
}

function onSaveItemEdit(payload: { label?: string; icon?: string }) {
  const item = editingItem.value;
  if (!item) return;
  const id = item.id as T;
  emit("updateLabel", id, payload.label);
  if (props.canEditIcon) {
    emit("updateIcon", id, payload.icon);
  }
}
</script>
