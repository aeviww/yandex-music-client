<template>
  <q-dialog :model-value="modelValue" @update:model-value="onDialogUpdate">
    <div
      class="flex w-[480px] max-w-[95vw] flex-col p-[22px] border border-solid border-[color:var(--line)] rounded-[var(--radius,12px)] bg-[var(--surface)] text-[color:var(--fg)] gap-[16px] shadow-[0_24px_50px_-20px_rgba(0,0,0,0.6)]"
      @keydown.esc.stop="close"
    >
      <div class="flex items-center justify-between">
        <div class="text-[16px] font-semibold tracking-[-0.01em]">
          {{ title || "Редактировать пункт" }}
        </div>
        <button
          type="button"
          class="flex items-center justify-center w-[28px] h-[28px] rounded-[7px] border-0 bg-transparent text-[color:var(--fg-dim)] cursor-pointer hover:bg-[var(--hover)] hover:text-[color:var(--fg)] transition-colors"
          @click="close"
        >
          <Icon name="mingcute:close-line" :size="16" />
        </button>
      </div>

      <div
        class="flex items-center gap-[12px] p-[12px] rounded-[10px] bg-[var(--surface-2)] border border-solid border-[color:var(--line)]"
      >
        <div
          v-if="canEditIcon"
          class="flex items-center justify-center w-[38px] h-[38px] rounded-[8px] bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] text-[var(--accent)] flex-none"
        >
          <Icon :name="previewIcon" :size="20" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-[13.5px] font-medium truncate text-[color:var(--fg)]">
            {{ previewLabel || defaultLabel }}
          </div>
          <div class="text-[11px] text-[color:var(--fg-faint)]">
            {{ isCustomized ? "Пользовательские настройки" : "По умолчанию" }}
          </div>
        </div>
        <span
          v-if="isCustomized"
          class="text-[10px] uppercase font-semibold tracking-wider px-[6px] py-[2px] rounded bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] text-[var(--accent)]"
        >
          Изменено
        </span>
      </div>

      <div v-if="canEditLabel" class="flex flex-col gap-[6px]">
        <label class="text-[11.5px] font-medium text-[color:var(--fg-dim)]">
          Название
        </label>
        <div
          class="flex items-center gap-[8px] h-[36px] px-[10px] rounded-[8px] bg-[var(--surface-2)] border border-solid border-[color:var(--line)] transition-colors focus-within:border-[var(--accent)]"
        >
          <input
            v-model="inputLabel"
            type="text"
            spellcheck="false"
            :placeholder="defaultLabel"
            class="flex-1 min-w-0 bg-transparent border-0 outline-none text-[13px] text-[color:var(--fg)] placeholder:text-[color:var(--fg-faint)]"
            @keyup.enter="save"
          />
          <button
            v-if="inputLabel"
            type="button"
            class="p-0 border-0 bg-transparent text-[color:var(--fg-faint)] hover:text-[color:var(--fg)] cursor-pointer"
            title="Очистить"
            @click="inputLabel = ''"
          >
            <Icon name="mingcute:close-circle-fill" :size="14" />
          </button>
        </div>
        <span class="text-[10.5px] text-[color:var(--fg-faint)]">
          Оставьте пустым, чтобы использовать дефолтное название: «{{ defaultLabel }}»
        </span>
      </div>

      <div v-if="canEditIcon" class="flex flex-col gap-[6px]">
        <div class="flex items-center justify-between">
          <label class="text-[11.5px] font-medium text-[color:var(--fg-dim)]">
            Иконка
          </label>
          <span class="text-[10.5px] text-[color:var(--fg-faint)]">
            Текущая: {{ selectedIcon }}
          </span>
        </div>

        <div
          class="flex items-center gap-[8px] h-[34px] px-[10px] rounded-[8px] bg-[var(--surface-2)] border border-solid border-[color:var(--line)] transition-colors focus-within:border-[var(--accent)]"
        >
          <Icon
            name="mingcute:search-2-line"
            :size="14"
            class="text-[color:var(--fg-faint)] flex-none"
          />
          <input
            v-model="iconQuery"
            type="text"
            placeholder="Поиск по названию или теме (дом, волна, нота...)"
            class="flex-1 min-w-0 bg-transparent border-0 outline-none text-[12.5px] text-[color:var(--fg)] placeholder:text-[color:var(--fg-faint)]"
          />
          <button
            v-if="iconQuery"
            type="button"
            class="p-0 border-0 bg-transparent text-[color:var(--fg-faint)] hover:text-[color:var(--fg)] cursor-pointer"
            @click="iconQuery = ''"
          >
            <Icon name="mingcute:close-circle-fill" :size="13" />
          </button>
        </div>

        <div
          class="grid grid-cols-8 gap-[6px] max-h-[175px] overflow-y-auto p-[4px] rounded-[8px] border border-solid border-[color:var(--line)] bg-[var(--surface)] [scrollbar-width:thin]"
        >
          <button
            v-for="item in filteredIcons"
            :key="item.id"
            type="button"
            :title="`${item.name} (${item.id})`"
            class="flex items-center justify-center h-[36px] rounded-[6px] border border-solid transition-all cursor-pointer relative"
            :class="[
              selectedIcon === item.id
                ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_20%,transparent)] text-[var(--accent)] ring-1 ring-[var(--accent)]'
                : 'border-transparent bg-transparent text-[color:var(--fg-dim)] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]',
            ]"
            @click="selectedIcon = item.id"
          >
            <Icon :name="item.id" :size="18" />
          </button>
          <div
            v-if="!filteredIcons.length"
            class="col-span-8 py-[18px] text-center text-[12px] text-[color:var(--fg-faint)]"
          >
            Иконки не найдены. Вы можете ввести имя иконки (например: mingcute:music-line) в поиск.
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between pt-[4px] border-t border-solid border-[color:var(--line)]">
        <button
          type="button"
          class="inline-flex h-[32px] items-center px-[10px] border border-solid border-[color:var(--line)] rounded-[7px] bg-transparent text-[11.5px] text-[color:var(--fg-faint)] hover:text-[color:var(--fg)] hover:bg-[var(--hover)] transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
          :disabled="!isCustomized"
          @click="resetToDefault"
        >
          Сбросить
        </button>

        <div class="flex items-center gap-[8px]">
          <button
            type="button"
            class="inline-flex h-[32px] items-center px-[13px] border border-solid border-[color:var(--line)] rounded-[7px] bg-transparent text-[12px] text-[color:var(--fg-dim)] hover:text-[color:var(--fg)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
            @click="close"
          >
            Отмена
          </button>
          <button
            type="button"
            class="inline-flex h-[32px] items-center px-[16px] border-0 rounded-[7px] bg-[var(--accent)] text-[#fff] text-[12px] font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            @click="save"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { searchNavIcons } from "@/components/settings/navIcons";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    defaultLabel: string;
    currentLabel?: string;
    defaultIcon?: string;
    currentIcon?: string;
    canEditIcon?: boolean;
    canEditLabel?: boolean;
  }>(),
  {
    title: "",
    currentLabel: "",
    defaultIcon: "mingcute:dots-line",
    currentIcon: "",
    canEditIcon: true,
    canEditLabel: true,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "save", payload: { label?: string; icon?: string }): void;
}>();

const inputLabel = ref("");
const selectedIcon = ref("");
const iconQuery = ref("");

watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) return;
    inputLabel.value = props.currentLabel || "";
    selectedIcon.value = props.currentIcon || props.defaultIcon || "mingcute:dots-line";
    iconQuery.value = "";
  },
  { immediate: true },
);

const previewLabel = computed(() => inputLabel.value.trim());
const previewIcon = computed(() => selectedIcon.value || props.defaultIcon || "mingcute:dots-line");

const filteredIcons = computed(() => searchNavIcons(iconQuery.value));

const isCustomized = computed(() => {
  const labelChanged = Boolean(previewLabel.value && previewLabel.value !== props.defaultLabel);
  const iconChanged = Boolean(
    props.canEditIcon &&
      selectedIcon.value &&
      selectedIcon.value !== props.defaultIcon,
  );
  return labelChanged || iconChanged;
});

function onDialogUpdate(val: boolean) {
  emit("update:modelValue", val);
}

function close() {
  emit("update:modelValue", false);
}

function resetToDefault() {
  inputLabel.value = "";
  selectedIcon.value = props.defaultIcon || "mingcute:dots-line";
}

function save() {
  const finalLabel = previewLabel.value && previewLabel.value !== props.defaultLabel
    ? previewLabel.value
    : undefined;

  const finalIcon = props.canEditIcon && selectedIcon.value !== props.defaultIcon
    ? selectedIcon.value
    : undefined;

  emit("save", {
    label: finalLabel,
    icon: finalIcon,
  });
  close();
}
</script>
