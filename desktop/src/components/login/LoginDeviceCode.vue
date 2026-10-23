<template>
  <div aria-live="polite">
    <h2
      class="mb-[12px] mt-[16px] text-[28px] font-semibold leading-[1.15] tracking-[-0.035em] text-white"
    >
      Продолжи в браузере
    </h2>
    <p class="m-0 text-[15px] leading-[1.6] text-[#b3b3b3]">
      Войди в аккаунт Яндекса и введи код на открывшейся странице.
    </p>
    <div
      class="my-[24px] flex min-h-[84px] items-center gap-[8px] rounded-[10px] border border-solid border-[#5f5f5f] bg-[#1a1a1a] px-[12px] py-[16px] flex-nowrap"
    >
      <span
        class="min-w-0 flex-1 select-all break-all text-center text-[28px] font-semibold leading-[1.2] tabular-nums tracking-[3px] text-white sm:text-[32px]"
        >{{ userCode }}</span
      >
      <button
        type="button"
        class="grid h-[44px] w-[44px] flex-none cursor-pointer place-items-center rounded-[8px] border-0 border-none bg-[#292929] text-white transition-colors hover:bg-[#383838] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white motion-reduce:transition-none"
        :aria-label="copied ? 'Код скопирован' : 'Скопировать код'"
        :title="copied ? 'Скопировано' : 'Скопировать код'"
        @click="$emit('copy')"
      >
        <Icon :name="copied ? 'mingcute:check-line' : 'mingcute:copy-2-line'" :size="20" />
      </button>
    </div>
    <div
      role="status"
      class="flex items-center justify-center gap-[10px] text-[14px] text-[#b3b3b3] flex-nowrap"
    >
      <q-spinner
        size="16px"
        class="motion-reduce:animate-none motion-reduce:[&_*]:!animate-none"
      /><span>{{
        copied ? "Код скопирован. Ждём входа…" : "Ждём подтверждения входа…"
      }}</span>
    </div>
    <div v-if="verifyUrl" class="mt-[24px] rounded-[8px] bg-[#191919] p-[14px]">
      <p class="m-0 text-[14px] leading-[1.5] text-[#a3a3a3]">
        Если браузер не открылся, перейди по адресу:
      </p>
      <p
        class="mb-0 mt-[6px] select-text break-all text-[14px] leading-[1.5] text-white"
      >
        {{ verifyUrl }}
      </p>
    </div>
    <button
      type="button"
      class="mt-[24px] min-h-[44px] w-full cursor-pointer rounded-[8px] border border-solid border-[#5f5f5f] bg-transparent px-[16px] py-[10px] text-[14px] text-white transition-colors hover:bg-[#252525] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none"
      @click="$emit('cancel')"
    >
      Отменить вход
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ userCode: string; verifyUrl: string; copied: boolean }>();
defineEmits<{ copy: []; cancel: [] }>();
</script>
