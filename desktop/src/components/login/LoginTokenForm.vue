<template>
  <form @submit.prevent="$emit('submit')">
    <button
      type="button"
      :disabled="loading"
      class="-ml-[8px] mb-[20px] flex min-h-[44px] cursor-pointer items-center gap-[4px] rounded-[6px] border-0 border-none bg-transparent px-[8px] py-[8px] text-[14px] text-[#b3b3b3] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white disabled:opacity-50 flex-nowrap"
      @click="$emit('back')"
    >
      <Icon name="chevronLeft" :size="18" />К входу через Яндекс
    </button>
    <h2
      class="mb-[12px] mt-0 text-[28px] font-semibold leading-[1.15] tracking-[-0.035em] text-white"
    >
      Войти с токеном
    </h2>

    <label
      for="login-token"
      class="mb-[8px] mt-[24px] block text-[14px] font-medium text-white"
      >Токен Яндекс Музыки</label
    >
    <div
      class="flex min-h-[48px] items-center gap-[8px] rounded-[8px] border border-solid border-[#686868] bg-[#1b1b1b] pl-[14px] pr-[4px] transition-colors focus-within:border-white motion-reduce:transition-none flex-nowrap"
    >
      <input
        id="login-token"
        v-model="token"
        :type="reveal ? 'text' : 'password'"
        :disabled="loading"
        required
        autocomplete="off"
        autocapitalize="off"
        :spellcheck="false"
        placeholder="y0_Ag… или ссылка с токеном"
        class="min-w-0 flex-1 border-0 border-none bg-transparent py-[12px] text-[14px] text-white [outline:none] placeholder:text-[#a3a3a3]"
      />
      <button
        type="button"
        :aria-label="reveal ? 'Скрыть токен' : 'Показать токен'"
        :aria-pressed="reveal"
        class="grid h-[44px] w-[44px] flex-none cursor-pointer place-items-center rounded-[6px] border-0 border-none bg-transparent text-[#b3b3b3] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        @click="reveal = !reveal"
      >
        <Icon :name="reveal ? 'eyeOff' : 'eye'" :size="18" />
      </button>
    </div>

    <button
      type="submit"
      :disabled="loading || !token.trim()"
      class="mt-[24px] flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-[10px] rounded-[10px] border-0 border-none bg-white px-[16px] py-[12px] text-[15px] font-semibold text-black transition-colors hover:bg-[#dedede] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-default disabled:opacity-40 motion-reduce:transition-none flex-nowrap"
    >
      <q-spinner
        v-if="loading"
        size="18px"
        class="text-black motion-reduce:animate-none motion-reduce:[&_*]:!animate-none"
      />{{ loading ? "Проверяем токен…" : "Войти в Mashiro" }}
    </button>
    <p class="mb-0 mt-[16px] text-[14px] leading-[1.5] text-[#a3a3a3]">
      Для прослушивания нужен Яндекс Плюс.
    </p>
  </form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Icon from "@/components/Icon.vue";
defineProps<{ loading: boolean }>();
defineEmits<{ submit: []; back: [] }>();
const token = defineModel<string>({ required: true });
const reveal = ref(false);
</script>
