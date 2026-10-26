<template>
  <SettingsSection
    id="settings-hotkeys"
    title="Горячие клавиши"
    description="Сочетания внутри приложения и глобальные, работающие в фоне."
    icon="mingcute:key-2-line"
  >
    <div class="space-y-4">
      <SettingsCard>
        <SettingToggle
          label="Горячие клавиши в приложении"
          description="Управление плеером с клавиатуры, пока окно активно"
          :model-value="hotkeys.enabled"
          @update:model-value="hotkeys.setEnabled($event)"
        />

        <SettingToggle
          label="Глобальные горячие клавиши"
          description="Работают в любых приложениях, даже когда Mashiro в трее"
          :model-value="hotkeys.globalEnabled"
          @update:model-value="onGlobalEnabled"
        />

        <div
          v-if="hotkeys.failed.length"
          class="flex items-start gap-2 px-5 py-3 text-[11.5px] leading-relaxed text-[#f5c26b]"
        >
          <Icon name="mingcute:warning-line" :size="15" class="mt-0.5 flex-none" />
          <span>
            Система не отдала эти сочетания (их занял кто-то другой):
            {{ hotkeys.failed.join(", ") }}
          </span>
        </div>
      </SettingsCard>

      <SettingsCard>
        <div
          class="grid grid-cols-[minmax(0,1fr)_170px_190px] items-center gap-3 bg-[color-mix(in_srgb,var(--fg)_4%,transparent)] px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[color:var(--fg-faint)]"
        >
          <span>Действие</span>
          <span>В приложении</span>
          <span>Глобально</span>
        </div>

        <div
          v-for="row in hotkeys.rows"
          :key="row.action"
          class="grid grid-cols-[minmax(0,1fr)_170px_190px] items-center gap-3 px-4 py-2.5 transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--fg)_3%,transparent)]"
        >
          <span class="min-w-0 truncate text-[13px] text-[var(--fg)]">{{
            row.label
          }}</span>

          <div class="flex flex-wrap items-center gap-1.5">
            <button
              v-for="(key, i) in row.keys"
              :key="`${key}-${i}`"
              type="button"
              class="inline-flex h-[30px] min-w-[34px] items-center justify-center whitespace-nowrap rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-2.5 text-[12px] text-[var(--fg)] transition hover:border-[var(--accent)]"
              @click="startCapture(row.action, i, false)"
              @contextmenu.prevent="hotkeys.clearLocal(row.action, i)"
            >
              {{ capturingLabel(row.action, i, false) }}
            </button>
            <button
              type="button"
              class="inline-flex h-[30px] min-w-[34px] items-center justify-center whitespace-nowrap rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-2.5 text-[12px] text-[color:var(--fg-faint)] transition hover:border-[var(--accent)]"
              @click="startCapture(row.action, row.keys.length, false)"
            >
              {{ capturingLabel(row.action, row.keys.length, false) || "+" }}
            </button>
          </div>

          <div class="flex items-center gap-1.5">
            <button
              type="button"
              class="inline-flex h-[30px] min-w-[34px] flex-1 items-center justify-center whitespace-nowrap rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-2.5 text-[12px] text-[var(--fg)] transition hover:border-[var(--accent)]"
              @click="startCapture(row.action, 0, true)"
              @contextmenu.prevent="clearGlobal(row.action)"
            >
              {{ globalLabel(row) }}
            </button>
            <div
              class="grid h-6 w-6 flex-none place-items-center rounded-md text-[color:var(--fg-dim)] transition hover:bg-[var(--hover)] hover:text-[var(--fg)]"
            >
              <Icon name="mingcute:more-2-fill" :size="14" />
              <q-menu class="menu">
                <div class="menu-body">
                  <div
                    v-for="preset in MEDIA_PRESETS"
                    :key="preset.value"
                    class="menu-item"
                    v-close-popup
                    @click="hotkeys.setGlobal(row.action, preset.value)"
                  >
                    <span>{{ preset.label }}</span>
                  </div>
                  <div
                    class="menu-item danger"
                    v-close-popup
                    @click="clearGlobal(row.action)"
                  >
                    <span>Убрать</span>
                  </div>
                </div>
              </q-menu>
            </div>
          </div>
        </div>
      </SettingsCard>

      <div
        class="flex flex-wrap items-center justify-between gap-3 text-[11.5px] leading-relaxed text-[color:var(--fg-faint)]"
      >
        <p class="mb-0 max-w-[620px]">
          Нажмите на клавишу, чтобы задать новую. Правый клик - убрать. Для
          глобальных сочетаний используйте модификатор: Ctrl, Alt или Shift.
        </p>
        <button :class="BUTTON" type="button" @click="hotkeys.reset()">
          Вернуть стандартные
        </button>
      </div>
    </div>
  </SettingsSection>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import { Notify } from "quasar";
import SettingToggle from "@/components/settings/SettingToggle.vue";
import SettingsCard from "@/components/settings/SettingsCard.vue";
import SettingsSection from "@/components/settings/SettingsSection.vue";
import { BUTTON } from "@/components/settings/classes";
import type { HotkeyAction } from "@/lib/hotkeys/defaults";
import {
  displayAcceleratorParts,
  displayParts,
  eventSignature,
  isModifierEvent,
  toAccelerator,
} from "@/lib/hotkeys/keys";
import { useHotkeysStore } from "@/stores/hotkeys";

const hotkeys = useHotkeysStore();

async function onGlobalEnabled(enabled: boolean) {
  await hotkeys.setGlobalEnabled(enabled);
  if (enabled && hotkeys.failed.length) {
    Notify.create({
      type: "warning",
      message: `Система не отдала: ${hotkeys.failed.join(", ")}`,
    });
  }
}

const MEDIA_PRESETS = [
  { label: "Медиа: Play / Pause", value: "MediaPlayPause" },
  { label: "Медиа: следующий трек", value: "MediaTrackNext" },
  { label: "Медиа: предыдущий трек", value: "MediaTrackPrevious" },
  { label: "Медиа: стоп", value: "MediaStop" },
];

const capture = ref<{
  action: HotkeyAction;
  index: number;
  global: boolean;
} | null>(null);

function capturingLabel(
  action: HotkeyAction,
  index: number,
  global: boolean,
): string {
  const active = capture.value;
  if (
    active &&
    active.action === action &&
    active.index === index &&
    active.global === global
  )
    return "Жду…";
  if (global) return "";
  const key = (hotkeys.local[action] || [])[index];
  return key ? displayParts(key).join(" + ") : "";
}

function globalLabel(row: { action: HotkeyAction; accelerator: string }) {
  const active = capture.value;
  if (active && active.action === row.action && active.global) return "Жду…";
  if (!row.accelerator) return "Не задано";
  return displayAcceleratorParts(row.accelerator).join(" + ");
}

function startCapture(action: HotkeyAction, index: number, global: boolean) {
  capture.value = { action, index, global };
  window.addEventListener("keydown", onCapture, true);
}

function stopCapture() {
  capture.value = null;
  window.removeEventListener("keydown", onCapture, true);
}

function onCapture(event: KeyboardEvent) {
  if (isModifierEvent(event)) return;
  event.preventDefault();
  event.stopPropagation();
  const active = capture.value;
  if (!active) return;
  if (event.key === "Escape") {
    stopCapture();
    return;
  }
  const signature = eventSignature(event);
  if (active.global) {
    const accelerator = toAccelerator(signature);
    if (!accelerator.includes("+")) {
      Notify.create({
        type: "negative",
        message:
          "Для глобальной клавиши нужен модификатор: Ctrl, Alt или Shift",
      });
      stopCapture();
      return;
    }
    void hotkeys.setGlobal(active.action, accelerator);
  } else {
    const conflict = hotkeys.conflictLabel(signature, active.action);
    hotkeys.setLocal(active.action, active.index, signature);
    if (conflict) Notify.create({ message: `Клавиша снята с «${conflict}»` });
  }
  stopCapture();
}

function clearGlobal(action: HotkeyAction) {
  void hotkeys.setGlobal(action, "");
}

onBeforeUnmount(stopCapture);
</script>
