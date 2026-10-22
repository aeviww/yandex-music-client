<template>
  <div>
    <h2
      class="mb-[32px] mt-0 text-[28px] font-semibold leading-[1.15] tracking-[-0.035em] text-white sm:text-[32px]"
    >
      Войти в Mashiro
    </h2>
    <button
      type="button"
      :disabled="loading"
      aria-describedby="login-plus-note"
      class="flex min-h-[52px] w-full flex-nowrap cursor-pointer items-center justify-between gap-[16px] rounded-[10px] border-0 border-none bg-white px-[20px] py-[14px] text-left text-[16px] font-semibold text-black transition-colors hover:bg-[#dedede] active:bg-[#c9c9c9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none"
      @click="$emit('login')"
    >
      <span>{{ loading ? "Открываем браузер…" : "Войти через Яндекс" }}</span>
      <q-spinner
        v-if="loading"
        size="18px"
        class="flex-none text-black motion-reduce:animate-none motion-reduce:[&_*]:!animate-none"
      />
      <Icon v-else name="chevronRight" :size="20" class="flex-none" />
    </button>
    <p
      id="login-plus-note"
      class="mb-0 mt-[12px] text-[14px] leading-[1.5] text-[#a3a3a3]"
    >
      Для прослушивания нужен Яндекс Плюс.
    </p>
    <button
      type="button"
      :disabled="loading"
      class="mt-[28px] inline-flex min-h-[44px] cursor-pointer items-center gap-[10px] rounded-[6px] border-0 border-none bg-transparent p-0 text-[14px] text-[#a3a3a3] transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-wait disabled:opacity-50 motion-reduce:transition-none"
      @click="$emit('manual')"
    >
      <Icon name="key" :size="17" />
      <span>Войти с токеном</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import Icon from "@/components/Icon.vue";
defineProps<{ loading: boolean }>();
defineEmits<{ login: []; manual: [] }>();
</script>
