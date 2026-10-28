<template>
  <div class="flex w-full items-center justify-between min-h-[50px] box-border gap-[20px] px-[10px] py-[9px] rounded-[10px] m-0 text-inherit text-left transition-[background] duration-[120ms] ease-[ease] hover:bg-[color-mix(in_srgb,_var(--fg)_3.5%,_transparent)]">
    <div class="flex min-w-0 flex-col gap-[3px] [&_b]:text-[color:var(--fg)] [&_b]:text-[calc(13px*var(--text-scale,1))] [&_b]:font-semibold [&_span]:text-[color:var(--fg-dim)] [&_span]:text-[calc(11.5px*var(--text-scale,1))] [&_span]:leading-[1.4]">
      <b>Своя комната</b>
      <span>
        Поднимает комнату на вашем компьютере. Остальные подключаются к вашему
        адресу и следуют за вашим плеером.
      </span>
    </div>

    <div class="flex items-center gap-[8px]">
      <input
        v-model.number="port"
        class="w-[92px] px-[10px] py-[7px] rounded-[8px] border border-[color:var(--border,rgba(255,255,255,0.12))] bg-transparent text-inherit"
        type="number"
        min="1024"
        max="65535"
        :disabled="together.active"
      />

      <button
        v-if="!together.isHost"
        class="inline-flex items-center justify-center gap-[6px] h-[30px] px-[12px] py-0 border border-[color:var(--line)] rounded-[8px] text-[color:var(--fg-dim)] text-[calc(12px*var(--text-scale,1))] whitespace-nowrap cursor-pointer transition-[background,color,border-color] duration-[140ms] ease-[ease] hover:bg-[var(--hover)] hover:border-[color:color-mix(in_srgb,_var(--fg)_14%,_transparent)] hover:text-[color:var(--fg)]"
        type="button"
        :disabled="together.busy || together.active"
        @click="together.host(port)"
      >
        Создать
      </button>

      <button
        v-else
        class="inline-flex items-center justify-center gap-[6px] h-[30px] px-[12px] py-0 border border-[color:color-mix(in_srgb,_#ff5d5d_45%,_var(--line))] rounded-[8px] text-[color:#ff8b8b] text-[calc(12px*var(--text-scale,1))] whitespace-nowrap cursor-pointer transition-[background,color,border-color] duration-[140ms] ease-[ease] hover:bg-[color-mix(in_srgb,_#ff5d5d_14%,_transparent)] hover:border-[color:#ff5d5d] hover:text-[color:#ff5d5d]"
        type="button"
        :disabled="together.busy"
        @click="together.leave()"
      >
        Закрыть
      </button>
    </div>
  </div>

  <div
    v-if="together.isHost"
    class="flex flex-col gap-[6px] px-[14px] py-[12px] rounded-[10px] bg-[var(--surface-2,rgba(255,255,255,0.06))] [&_span]:opacity-[0.65] [&_span]:text-[12px]"
  >
    <b>Адрес для друзей</b>

    <div
      class="flex items-center gap-[8px] [&_code]:flex-auto [&_code]:overflow-hidden [&_code]:text-[15px] [&_code]:truncate [&_code]:cursor-pointer [&_code:hover]:text-[color:var(--accent,inherit)]"
    >
      <code
        :title="
          visible ? 'Нажмите, чтобы скопировать' : 'Наведите, чтобы увидеть'
        "
        @mouseenter="hover = true"
        @mouseleave="hover = false"
        @click="copyInvite"
        >{{ visible ? invite : mask }}</code
      >

      <button
        class="inline-flex flex-none p-[5px] border-0 rounded-[7px] text-[color:var(--fg-dim,inherit)] cursor-pointer hover:bg-[var(--hover,rgba(255,255,255,0.08))] hover:text-[color:var(--fg,inherit)]"
        type="button"
        :title="shown ? 'Скрыть адрес' : 'Показать адрес'"
        @click="shown = !shown"
      >
        <Icon :name="shown ? 'mingcute:eye-close-line' : 'mingcute:eye-2-line'" :size="14" />
      </button>

      <button
        class="inline-flex flex-none p-[5px] border-0 rounded-[7px] text-[color:var(--fg-dim,inherit)] cursor-pointer hover:bg-[var(--hover,rgba(255,255,255,0.08))] hover:text-[color:var(--fg,inherit)]"
        type="button"
        title="Скопировать адрес"
        @click="copyInvite"
      >
        <Icon name="mingcute:copy-2-line" :size="14" />
      </button>
    </div>

    <span>
      Это адрес в обычной локалке. Если сидите через radmin vpn, hamachi,
      zerotier или tailscale, возьмите адрес из окна самой программы и тот же
      порт.
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { copyText } from "@/lib/clipboard";
import { useTogetherStore } from "@/stores/together/index";

const together = useTogetherStore();
const port = ref(together.port);
const shown = ref(false);
const hover = ref(false);

const mask = "•".repeat(14);
const visible = computed(() => shown.value || hover.value);
const invite = computed(() => together.invite || `ваш-ip:${together.port}`);

function copyInvite() {
  void copyText(
    together.invite,
    "Адрес скопирован",
    "Адрес ещё не определился",
  );
}
</script>

