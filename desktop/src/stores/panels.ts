import { defineStore } from "pinia";
import { Notify } from "quasar";
import { api } from "@/api/client";

const MINI_KEY = "panels.mini";
const MAIN_MIN_WIDTH = 940;
const MAIN_MIN_HEIGHT = 600;

function clearMiniFlag(): void {
  try {
    localStorage.removeItem(MINI_KEY);
  } catch {}
}

function writeMiniFlag(value: boolean): void {
  try {
    if (value) localStorage.setItem(MINI_KEY, "1");
    else clearMiniFlag();
  } catch {}
}

function windowLooksMini(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.innerWidth < MAIN_MIN_WIDTH && window.innerHeight < MAIN_MIN_HEIGHT
  );
}

function initialMini(): boolean {
  const small = windowLooksMini();
  if (small) return true;
  writeMiniFlag(false);
  return false;
}

export const usePanelsStore = defineStore("panels", {
  state: () => ({
    queueOpen: false,
    queueLocked: false,
    hidden: false,
    mini: initialMini(),
    miniBusy: false,
  }),

  actions: {
    toggleQueue() {
      if (this.queueLocked) return;
      this.queueOpen = !this.queueOpen;
    },

    openQueue() {
      if (this.queueLocked) return;
      this.queueOpen = true;
    },

    closeQueue() {
      this.queueOpen = false;
    },

    async enterMini() {
      if (this.miniBusy || this.mini) return;
      this.miniBusy = true;
      try {
        const { useUiStore } = await import("@/stores/ui/index");
        const ui = useUiStore();
        await api.enterMiniPlayer(
          ui.settings.miniWidth,
          ui.settings.miniHeight,
        );
        this.mini = true;
        writeMiniFlag(true);
      } catch (e) {
        this.mini = false;
        clearMiniFlag();
        Notify.create({
          type: "negative",
          message:
            e instanceof Error ? e.message : "Не удалось включить мини-плеер",
        });
      } finally {
        this.miniBusy = false;
      }
    },

    async exitMini() {
      this.miniBusy = true;
      this.mini = false;
      clearMiniFlag();
      try {
        await api.exitMiniPlayer();
      } catch {
      } finally {
        this.mini = false;
        this.miniBusy = false;
      }
    },

    async toggleMini() {
      if (this.mini) await this.exitMini();
      else await this.enterMini();
    },
  },
});
