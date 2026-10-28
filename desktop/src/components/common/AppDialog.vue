<template>
  <q-dialog v-model="open" persistent>
    <div
      class="flex w-[400px] max-w-[92vw] flex-col p-[22px] border border-solid border-[color:var(--line)] rounded-[var(--radius)] bg-[var(--surface)] gap-[12px]"
    >
      <div
        class="text-[color:var(--fg)] text-[16px] font-semibold tracking-[-0.01em]"
      >
        {{ appDialog.title }}
      </div>
      <div
        v-if="appDialog.message"
        class="text-[color:var(--fg-dim)] text-[13px] leading-[1.5]"
      >
        {{ appDialog.message }}
      </div>

      <div
        v-if="appDialog.kind === 'prompt'"
        class="flex items-center gap-[8px] h-[38px] mt-[2px] px-[12px] py-0 rounded-[10px] bg-[var(--surface)] border border-solid border-transparent transition-[border-color,background] duration-[140ms] ease-[ease] focus-within:border-[color:rgba(255,255,255,0.16)] focus-within:bg-[var(--surface-2)] [&_input]:flex-1 [&_input]:min-w-0 [&_input]:bg-transparent [&_input]:outline-none [&_input]:text-[color:var(--fg)] [&_input]:text-[13px] [&_input]:border-0 [&_input::placeholder]:text-[color:var(--fg-faint)] [&_select]:w-full [&_select]:border-0 [&_select]:bg-transparent [&_select]:outline-none [&_select]:text-[color:var(--fg)] [&_select]:text-[13px] [&_select]:cursor-pointer"
      >
        <input
          ref="input"
          v-model="value"
          type="text"
          spellcheck="false"
          :placeholder="appDialog.placeholder"
          @keyup.enter="confirm"
        />
      </div>

      <div class="flex justify-end mt-[6px] gap-[8px]">
        <button
          class="inline-flex h-[32px] items-center justify-center px-[14px] py-0 border border-solid border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] cursor-pointer text-[calc(12px*var(--text-scale,1))] font-medium gap-[7px] select-none transition-[background,border-color,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
          type="button"
          @click="cancel"
        >
          {{ appDialog.cancelLabel }}
        </button>
        <button
          class="inline-flex h-[34px] items-center justify-center px-[18px] py-0 border-0 rounded-[8px] !bg-[var(--accent)] text-[color:#fff] cursor-pointer text-[calc(12px*var(--text-scale,1))] font-medium gap-[7px] select-none transition-opacity duration-[120ms] ease-[ease] hover:opacity-[0.85] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none"
          :class="{ '!bg-[#e5484d] !text-[color:#fff]': appDialog.danger }"
          type="button"
          :disabled="!ready"
          @click="confirm"
        >
          {{ appDialog.okLabel }}
        </button>
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { appDialog, resolveAppDialog } from "@/lib/dialogs";

const input = ref<HTMLInputElement | null>(null);
const value = ref("");

const open = computed({
  get: () => appDialog.open,
  set: (next: boolean) => {
    if (!next) resolveAppDialog(null);
  },
});

const ready = computed(
  () => appDialog.kind !== "prompt" || value.value.trim().length > 0,
);

watch(
  () => appDialog.open,
  (isOpen) => {
    if (!isOpen) return;
    value.value = appDialog.value;
    void nextTick(() => {
      input.value?.focus();
      input.value?.select();
    });
  },
);

function cancel() {
  resolveAppDialog(null);
}

function confirm() {
  if (!ready.value) return;
  resolveAppDialog(appDialog.kind === "prompt" ? value.value : "");
}
</script>
