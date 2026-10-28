<template>
  <q-layout view="lHh Lpr lFf" class="bg-[var(--bg)]">
    <q-page-container>
      <q-page class="flex flex-center column">
        <div class="text-[calc(30px*var(--text-scale,1))] font-semibold tracking-[-0.03em] leading-[1.15]">404</div>
        <div class="q-mt-sm text-[color:var(--fg-dim)] text-[calc(13px*var(--text-scale,1))]">Такой страницы нет</div>
        <div class="q-mt-lg inline-flex items-center justify-center gap-[7px] h-[34px] px-[18px] py-0 border-0 rounded-[8px] bg-[var(--accent)] text-white text-[calc(12px*var(--text-scale,1))] font-medium cursor-pointer transition-opacity duration-[120ms] hover:opacity-[0.85] disabled:cursor-default disabled:opacity-[0.45] disabled:pointer-events-none" @click="router.replace('/')">
          На главную
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();
</script>
