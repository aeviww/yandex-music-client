<template>
  <q-layout
    view="hHh lpR fFf"
    class="bg-[var(--bg)]"
  >
    <q-header
      v-if="!panels.hidden && !panels.mini && ui.settings.topbarVisible"
      class="topbar relative z-[1] !border-b-0 !shadow-none transition-[background] duration-300"
      :class="!homeMode ? 'backdrop-blur-[18px] backdrop-saturate-[1.2]' : ''"
      :style="{
        background: homeMode ? 'transparent' : 'var(--topbar-gradient)',
      }"
    >
      <div
        class="titlebar relative flex h-[var(--topbar-height,46px)] select-none items-center pl-[14px]"
        @mousedown="startWindowDrag"
        @dblclick="toggleWindowMaximize"
      >
        <div
          v-if="ui.settings.topbarShowLogo || ui.settings.topbarLogoText"
          class="flex items-center gap-2.5 text-[16px] font-extrabold tracking-[-0.03em] whitespace-nowrap"
          :class="
            topbarEditMode
              ? 'rounded-[calc(var(--radius)*0.5833)] outline-dashed outline-1 outline-[color:color-mix(in_srgb,var(--accent)_55%,transparent)] outline-offset-[3px]'
              : ''
          "
        >
          <img
            v-if="ui.settings.topbarShowLogo"
            src="/icons/favicon-128x128.png"
            alt=""
            draggable="false"
            class="h-[var(--topbar-logo,24px)] w-[var(--topbar-logo,24px)] select-none rounded-[calc(var(--radius)*0.5)]"
          />
          <span v-if="ui.settings.topbarLogoText">mashiro</span>
        </div>

        <div
          class="absolute inset-0 flex items-center justify-center pointer-events-none"
          data-no-drag
        >
          <div
            v-if="ui.settings.topbarShowSearch"
            class="relative pointer-events-auto flex items-center justify-center w-[min(var(--search-width,460px),100%)]"
            :class="
              topbarEditMode
                ? 'rounded-[calc(var(--radius)*0.9167)] outline-dashed outline-1 outline-[color:color-mix(in_srgb,var(--accent)_55%,transparent)] outline-offset-[3px]'
                : ''
            "
          >
            <div
              class="flex h-[30px] w-full items-center gap-2.5 py-0 !rounded-[calc(var(--radius)*0.8333)] border !border-[color-mix(in_srgb,var(--fg)_7%,transparent)] !bg-[color-mix(in_srgb,var(--fg)_6%,transparent)] !px-[14px] shadow-none transition-[background,border-color] duration-150 hover:!bg-[color-mix(in_srgb,var(--fg)_9%,transparent)] hover:!border-[color-mix(in_srgb,var(--fg)_11%,transparent)] focus-within:!bg-[color-mix(in_srgb,var(--fg)_9%,transparent)] focus-within:!border-[color-mix(in_srgb,var(--fg)_20%,transparent)] focus-within:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--accent)_42%,transparent)]"
            >
              <Icon
                name="mingcute:search-2-line"
                :size="15"
                class="text-[color:var(--fg-faint)]"
              />
              <input
                v-model="query"
                placeholder="Найти трек, артиста или альбом"
                class="flex-1 min-w-0 border-0 bg-transparent text-[color:var(--fg)] outline-none placeholder:text-[color:var(--fg-faint)] !text-[calc(13.5px*var(--text-scale,1))]"
                @keydown="onSearchKeydown"
                @focus="onSearchFocus"
                @blur="closeSuggestSoon"
              />
              <div
                v-if="query"
                class="flex w-[22px] h-[22px] flex-none items-center justify-center rounded-[calc(var(--radius)*0.5)] text-[color:var(--fg-faint)] cursor-pointer transition-[background,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] p-0 border-0 appearance-none"
                @click="clearSearchQuery"
              >
                <Icon name="mingcute:close-line" :size="13" />
              </div>
            </div>

            <div
              v-if="suggestOpen && suggestions.length"
              class="absolute z-[50] top-[calc(100%_+_6px)] right-0 left-0 overflow-hidden p-[6px] border border-[color:var(--line)] rounded-[var(--radius)] bg-[color-mix(in_srgb,var(--surface-2)_95%,transparent)] shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur-[var(--glass-blur,24px)]"
            >
              <button
                v-for="(hint, index) in suggestions"
                :key="hint"
                class="flex w-full items-center px-[10px] py-[8px] border-0 rounded-[calc(var(--radius)*0.6667)] cursor-pointer text-[13px] gap-[9px] text-left font-[inherit] transition-[background,color] duration-[120ms] ease-[ease] bg-transparent"
                :class="[
                  selectedSuggestIndex === index
                    ? 'bg-[var(--hover)] text-[color:var(--fg)]'
                    : 'text-[color:var(--fg-dim)] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]',
                ]"
                type="button"
                @mouseenter="selectedSuggestIndex = index"
                @mousedown.prevent="pickSuggestion(hint)"
              >
                <Icon
                  name="mingcute:search-2-line"
                  :size="14"
                  class="text-[color:var(--fg-faint)]"
                />
                <span class="truncate">{{ hint }}</span>
              </button>
            </div>
          </div>
        </div>
        <div class="self-stretch min-w-0 flex-1" />

        <div
          v-if="ui.settings.topbarShowAccount"
          data-no-drag
          class="flex h-[34px] w-auto min-w-0 max-w-[172px] cursor-pointer items-center gap-2 rounded-[calc(var(--radius)*0.8333)] border border-transparent bg-[var(--surface)] pl-1 pr-3 pt-[3px] pb-[3px] transition-[background] duration-150 hover:border-[color:var(--line)] hover:bg-[color-mix(in_srgb,var(--fg)_7%,transparent)]"
          :class="
            topbarEditMode
              ? 'outline-dashed outline-1 outline-[color:color-mix(in_srgb,var(--accent)_60%,transparent)] [outline-offset:-2px]'
              : ''
          "
        >
          <div class="cover cover-round grid w-[var(--topbar-avatar,28px)] h-[var(--topbar-avatar,28px)] flex-none place-items-center overflow-hidden !rounded-full bg-[var(--surface-2)] text-[color:var(--fg-dim)] [&_img]:w-full [&_img]:h-full [&_img]:object-cover">
            <img
              v-if="avatarUrl"
              :src="avatarUrl"
              loading="lazy"
              decoding="async"
              referrerpolicy="no-referrer"
              @error="avatarError = true"
            />
            <span v-else class="font-semibold leading-none uppercase select-none text-[13px]">{{ accountInitial }}</span>
          </div>
          <span v-if="ui.settings.topbarAccountName" class="min-w-0 max-w-[98px] truncate text-[color:var(--fg)] font-semibold !text-[calc(13px*var(--text-scale,1))]">{{
            accountName
          }}</span>
          <Icon name="mingcute:down-line" :size="13" class="flex-none text-[color:var(--fg-faint)]" />
          <q-menu
            v-model="profileMenuOpen"
            class="select-none overflow-x-hidden max-w-[268px] !rounded-[var(--radius)] border border-[color:rgba(255,255,255,0.09)] bg-[color-mix(in_srgb,var(--surface-2)_90%,transparent)] shadow-[0_16px_40px_rgba(0,0,0,0.55)] backdrop-blur-[var(--glass-blur,24px)] backdrop-saturate-[1.35]"
            anchor="bottom right"
            self="top right"
          >
            <div class="w-[236px] p-[5px] min-w-[178px] max-w-[260px] overflow-x-hidden">
              <div class="flex min-w-0 items-center gap-[10px] pt-[7px] px-[8px] pb-[9px]">
                <div class="cover grid w-[36px] h-[36px] flex-none place-items-center overflow-hidden !rounded-[calc(var(--radius)*1)] bg-[var(--surface-2)] text-[color:var(--fg-dim)] [&_img]:w-full [&_img]:h-full [&_img]:object-cover">
                  <img
                    v-if="avatarUrl"
                    :src="avatarUrl"
                    loading="lazy"
                    decoding="async"
                    referrerpolicy="no-referrer"
                    @error="avatarError = true"
                  />
                  <span v-else class="font-semibold leading-none uppercase select-none text-[15px]">{{
                    accountInitial
                  }}</span>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="truncate text-[color:var(--fg)] font-[650] tracking-[-0.01em] leading-[1.2] text-[calc(13px*var(--text-scale,1))]">
                    {{ accountName }}
                  </div>
                </div>
              </div>

              <div class="h-[1px] mx-[6px] my-[4px] bg-[var(--line)]" />

              <div
                v-for="link in profileLinks"
                :key="link.id"
                class="group flex items-center gap-[8px] h-[32px] px-[8px] py-0 rounded-[calc(var(--radius)*0.75)] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap transition-[background,color] duration-100 hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:var(--fg)] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis select-none"
                :class="[
                  topbarEditMode
                    ? 'outline-dashed outline-1 outline-[color:color-mix(in_srgb,var(--accent)_34%,transparent)] cursor-grab active:cursor-grabbing'
                    : '',
                  topbarDragId === link.id ? 'opacity-40' : '',
                  topbarOver?.id === link.id && !topbarOver.after
                    ? 'shadow-[inset_0_2px_0_var(--accent)]'
                    : '',
                  topbarOver?.id === link.id && topbarOver.after
                    ? 'shadow-[inset_0_-2px_0_var(--accent)]'
                    : '',
                ]"
                :draggable="topbarEditMode"
                v-close-popup="!topbarEditMode"
                @dragstart="startTopbarDrag(link.id, $event)"
                @dragend="endTopbarDrag"
                @dragover="onTopbarDragOver(link.id, $event)"
                @dragleave="onTopbarDragLeave(link.id)"
                @drop="onTopbarDrop(link.id, $event)"
                @click="topbarEditMode ? undefined : router.push(link.to)"
              >
                <Icon
                  v-if="topbarEditMode"
                  name="mingcute:dots-line"
                  :size="14"
                />
                <Icon :name="link.icon" :size="17" />
                <span class="flex-1 truncate">{{ link.label }}</span>
                <span
                  v-if="topbarEditMode"
                  class="ml-auto flex flex-none items-center gap-[1px]"
                >
                  <button
                    type="button"
                    class="grid h-[20px] w-[20px] place-items-center rounded-[calc(var(--radius)*0.4167)] border-0 bg-transparent p-0 text-[color:var(--fg-faint)] cursor-pointer transition-colors hover:bg-[var(--surface-2)] hover:text-[color:var(--fg)]"
                    title="Переименовать или сменить иконку"
                    @click.stop="openTopbarDialog(link.id)"
                  >
                    <Icon name="mingcute:edit-2-line" :size="13" />
                  </button>
                  <button
                    v-if="!link.locked"
                    type="button"
                    class="grid h-[20px] w-[20px] place-items-center rounded-[calc(var(--radius)*0.4167)] border-0 bg-transparent p-0 text-[color:var(--fg-faint)] cursor-pointer transition-colors hover:bg-[var(--surface-2)] hover:text-[color:var(--fg)]"
                    title="Скрыть ссылку"
                    @click.stop="ui.toggleTopbarLink(link.id)"
                  >
                    <Icon name="mingcute:eye-close-line" :size="13" />
                  </button>
                </span>
              </div>

              <div
                v-if="topbarEditMode"
                class="mt-[5px] rounded-[calc(var(--radius)*0.6667)] border border-dashed border-[var(--line)] p-[6px]"
              >
                <div
                  class="mb-[4px] flex items-center gap-[4px] text-[10px] uppercase tracking-[0.06em] text-[color:var(--fg-faint)]"
                >
                  <Icon name="mingcute:eye-close-line" :size="11" />
                  Скрытые ссылки
                </div>
                <div class="flex min-h-[22px] flex-wrap items-center gap-[4px]">
                  <button
                    v-for="entry in hiddenTopbarLinks"
                    :key="entry.id"
                    type="button"
                    class="inline-flex items-center gap-[4px] px-[6px] py-[3px] border-0 rounded-[calc(var(--radius)*0.5)] bg-[var(--surface)] text-[color:var(--fg-dim)] text-[10.5px] cursor-pointer transition-colors hover:text-[color:var(--fg)]"
                    :title="`Вернуть «${entry.label}»`"
                    @click.stop="ui.toggleTopbarLink(entry.id)"
                  >
                    <Icon :name="entry.icon" :size="11" />
                    {{ entry.label }}
                  </button>
                  <span
                    v-if="!hiddenTopbarLinks.length"
                    class="text-[10.5px] text-[color:var(--fg-faint)]"
                  >
                    Все ссылки на месте
                  </span>
                </div>
              </div>

              <div class="h-[1px] mx-[6px] my-[4px] bg-[var(--line)]" />

              <div class="flex items-center gap-[8px] h-[32px] px-[8px] py-0 rounded-[calc(var(--radius)*0.75)] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap transition-[background,color] duration-100 hover:bg-[var(--hover)] hover:text-[color:#f87171] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:#f87171] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis select-none [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis" v-close-popup @click="doLogout">
                <Icon name="mingcute:exit-line" :size="17" />
                <span>Выйти из аккаунта</span>
              </div>

              <div
                v-if="topbarEditMode"
                class="mt-[4px] flex items-center justify-between gap-[6px] border-t border-[var(--line)] px-[6px] pt-[6px]"
              >
                <button
                  type="button"
                  class="h-[26px] px-[7px] border-0 rounded-[calc(var(--radius)*0.5)] bg-transparent text-[color:var(--fg-faint)] text-[11px] cursor-pointer transition-colors hover:bg-[var(--hover)] hover:text-[color:var(--fg)]"
                  @click="ui.resetTopbarCustomizations()"
                >
                  Сбросить
                </button>
                <div class="flex items-center gap-[2px]">
                  <button
                    type="button"
                    class="h-[26px] px-[7px] border-0 rounded-[calc(var(--radius)*0.5)] bg-transparent text-[color:var(--fg-dim)] text-[11px] cursor-pointer transition-colors hover:bg-[var(--hover)] hover:text-[color:var(--fg)]"
                    @click="ui.cancelEdit()"
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    class="h-[26px] px-[9px] border-0 rounded-[calc(var(--radius)*0.5)] bg-[var(--accent)] text-[color:#fff] text-[11px] font-[620] cursor-pointer transition-[filter] hover:brightness-110"
                    @click="ui.finishEdit()"
                  >
                    Готово
                  </button>
                </div>
              </div>
            </div>
          </q-menu>
        </div>

        <WindowControls
          v-if="ui.settings.topbarShowWindowControls"
          :show-minimize="ui.settings.windowShowMinimize"
          :show-maximize="ui.settings.windowShowMaximize"
          :show-close="ui.settings.windowShowClose"
        />
      </div>
    </q-header>

    <button
      v-if="!panels.hidden && !panels.mini && !ui.settings.topbarVisible"
      type="button"
      class="fixed right-2 top-2 z-[2500] grid h-[26px] w-[26px] place-items-center rounded-[calc(var(--radius)*0.6667)] border border-[var(--line)] bg-[var(--surface)] text-[color:var(--fg-faint)] opacity-60 cursor-pointer transition-[opacity,color,background] duration-150 hover:opacity-100 hover:bg-[var(--hover)] hover:text-[color:var(--fg)]"
      title="Показать верхнюю панель"
      @click="ui.set('topbarVisible', true)"
    >
      <Icon name="mingcute:layout-top-line" :size="14" />
    </button>

    <q-drawer
      v-if="!panels.hidden && !panels.mini"
      :model-value="true"
      show-if-above
      side="left"
      :width="ui.settings.sidebarWidth"
      :breakpoint="0"
      class="sidebar select-none !bg-[color-mix(in_srgb,var(--bg)_88%,var(--surface))] !border-r-0"
      content-class="overflow-x-hidden pt-[14px]"
    >
      <div
        class="column full-height relative"
        :class="{
          'outline-dashed outline-1 outline-[color:color-mix(in_srgb,var(--accent)_55%,transparent)] [outline-offset:-2px]':
            sidebarEditMode,
        }"
      >
        <div
          v-if="sidebarEditMode"
          class="absolute top-0 right-0 z-[22] h-full w-[6px] cursor-ew-resize bg-[color-mix(in_srgb,var(--accent)_55%,transparent)]"
          title="Тяни влево или вправо — ширина боковой панели"
          @pointerdown.stop="startChromeResize($event)"
          @contextmenu.prevent
        />
        <div class="pt-0.5 pb-1.5">
          <div
            v-for="item in nav"
            :key="item.to"
            class="flex h-[34px] cursor-pointer items-center mx-3 my-0.5 gap-3 overflow-hidden rounded-[calc(var(--radius)*0.8333)] px-3 text-[calc(12px*var(--text-scale,1))] font-medium text-[color:var(--fg-dim)] transition-[background,color,opacity] duration-150 hover:bg-[color-mix(in_srgb,var(--fg)_7%,transparent)] hover:text-[color:var(--fg)]"
            :class="[
              route.path === item.to
                ? 'bg-[color-mix(in_srgb,var(--fg)_8%,transparent)] font-semibold text-[color:var(--fg)]'
                : '',
              sidebarEditMode
                ? 'cursor-grab outline-dashed outline-1 outline-[color:color-mix(in_srgb,var(--accent)_38%,transparent)] active:cursor-grabbing'
                : '',
              sidebarDragId === item.id ? 'opacity-40' : '',
              sidebarOver?.id === item.id && !sidebarOver.after
                ? 'shadow-[inset_0_2px_0_var(--accent)]'
                : '',
              sidebarOver?.id === item.id && sidebarOver.after
                ? 'shadow-[inset_0_-2px_0_var(--accent)]'
                : '',
            ]"
            :title="sidebarEditMode ? 'Перетащи, чтобы поменять местами' : undefined"
            :draggable="sidebarEditMode"
            @dragstart="startSidebarDrag(item.id, $event)"
            @dragend="endSidebarDrag"
            @dragover="onSidebarDragOver(item.id, $event)"
            @dragleave="onSidebarDragLeave(item.id)"
            @drop="onSidebarDrop(item.id, $event)"
            @click="sidebarEditMode ? undefined : router.push(item.to)"
          >
            <Icon
              v-if="sidebarEditMode"
              name="mingcute:dots-line"
              :size="13"
              class="flex-none text-[color:var(--fg-faint)]"
            />
            <Icon :name="item.icon" :size="18" class="flex-none" />
            <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
            <span
              v-if="sidebarEditMode"
              class="ml-auto flex flex-none items-center gap-[1px]"
            >
              <button
                type="button"
                class="grid h-[20px] w-[20px] place-items-center rounded-[calc(var(--radius)*0.4167)] border-0 bg-transparent p-0 text-[color:var(--fg-faint)] cursor-pointer transition-colors hover:bg-[var(--surface-2)] hover:text-[color:var(--fg)]"
                title="Переименовать или сменить иконку"
                @click.stop="openSidebarDialog(item.id)"
              >
                <Icon name="mingcute:edit-2-line" :size="13" />
              </button>
              <button
                v-if="!item.locked"
                type="button"
                class="grid h-[20px] w-[20px] place-items-center rounded-[calc(var(--radius)*0.4167)] border-0 bg-transparent p-0 text-[color:var(--fg-faint)] cursor-pointer transition-colors hover:bg-[var(--surface-2)] hover:text-[color:var(--fg)]"
                title="Скрыть пункт"
                @click.stop="ui.toggleSidebarItem(item.id)"
              >
                <Icon name="mingcute:eye-close-line" :size="13" />
              </button>
            </span>
          </div>

          <div
            v-if="sidebarEditMode && hiddenNavItems.length"
            class="mx-3 mt-2 rounded-[calc(var(--radius)*0.6667)] border border-dashed border-[var(--line)] p-[6px]"
          >
            <div
              class="mb-[4px] flex items-center gap-[4px] text-[10px] uppercase tracking-[0.06em] text-[color:var(--fg-faint)]"
            >
              <Icon name="mingcute:eye-close-line" :size="11" />
              Скрытые
            </div>
            <div class="flex min-h-[22px] flex-wrap items-center gap-[4px]">
              <button
                v-for="entry in hiddenNavItems"
                :key="entry.id"
                type="button"
                class="inline-flex items-center gap-[4px] px-[6px] py-[3px] border-0 rounded-[calc(var(--radius)*0.5)] bg-[var(--surface)] text-[color:var(--fg-dim)] text-[10.5px] cursor-pointer transition-colors hover:text-[color:var(--fg)]"
                :title="`Вернуть «${entry.label}»`"
                @click.stop="ui.toggleSidebarItem(entry.id)"
              >
                <Icon :name="entry.icon" :size="11" />
                {{ entry.label }}
              </button>
            </div>
          </div>
        </div>

        <div
          class="mx-3 mt-1.5 mb-1 h-px bg-[color-mix(in_srgb,var(--fg)_6%,transparent)]"
        />

        <div
          class="flex items-center gap-2 px-5 pt-3 pb-2 text-[12px] font-semibold tracking-[-0.01em] text-[color:var(--fg-faint)]"
        >
          <span class="flex-1 min-w-0">Плейлисты</span>
          <span class="text-[color:var(--fg-faint)] text-[11px]">{{
            library.visiblePlaylists.length || ""
          }}</span>
        </div>

        <q-scroll-area class="min-h-0 flex-1">
          <div
            v-for="pl in sidebarPlaylists"
            :key="pl.kind"
            class="flex min-w-0 flex-none cursor-pointer items-center gap-2.5 mx-2 my-px rounded-[calc(var(--radius)*0.8333)] px-3 py-[5px] text-[calc(13px*var(--text-scale,1))] transition-[background] duration-150 hover:bg-[color-mix(in_srgb,var(--fg)_7%,transparent)]"
            :class="
              route.path === `/playlists/${pl.kind}`
                ? 'bg-[color-mix(in_srgb,var(--fg)_8%,transparent)]'
                : ''
            "
            @click="sidebarEditMode ? undefined : router.push(`/playlists/${pl.kind}`)"
          >
            <div
              class="cover flex items-center justify-center flex-none overflow-hidden rounded-[calc(var(--radius)*0.8333)] bg-[var(--surface-2)] [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block"
              style="width: 30px; height: 30px; border-radius: 7px"
            >
              <img
                loading="lazy"
                decoding="async"
                v-if="pl.cover_url"
                :src="pl.cover_url"
              />
              <Icon
                v-else
                name="mingcute:playlist-2-line"
                :size="14"
                class="text-[color:var(--fg-faint)]"
              />
            </div>
            <div class="col" style="min-width: 0">
              <div class="truncate text-[calc(13px*var(--text-scale,1))]">{{ pl.title }}</div>
            </div>
            <Icon
              v-if="library.isPinned(pl.kind)"
              name="mingcute:pin-2-line"
              :size="13"
              class="text-[color:var(--fg-faint)]"
            />
            <span v-else class="text-[color:var(--fg-faint)] text-[calc(11px*var(--text-scale,1))]">{{ pl.track_count }}</span>

            <q-menu context-menu touch-position class="select-none overflow-x-hidden max-w-[268px] !rounded-[var(--radius)] border border-[color:rgba(255,255,255,0.09)] bg-[color-mix(in_srgb,var(--surface-2)_90%,transparent)] shadow-[0_16px_40px_rgba(0,0,0,0.55)] backdrop-blur-[var(--glass-blur,24px)] backdrop-saturate-[1.35]">
              <div class="p-[4px] min-w-[178px] max-w-[260px] overflow-x-hidden" style="min-width: 196px">
                <div
                  class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[calc(var(--radius)*0.5833)] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap transition-[background,color] duration-100 hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:var(--fg)] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis select-none [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                  v-close-popup
                  @click="library.togglePin(pl.kind)"
                >
                  <Icon
                    :name="
                      library.isPinned(pl.kind)
                        ? 'gravity-ui:pin-slash'
                        : 'mingcute:pin-2-line'
                    "
                    :size="17"
                  />
                  <span>{{
                    library.isPinned(pl.kind) ? "Открепить" : "Закрепить"
                  }}</span>
                </div>
                <div
                  class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[calc(var(--radius)*0.5833)] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap transition-[background,color] duration-100 hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:var(--fg)] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis select-none [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                  v-close-popup
                  @click="sidebarEditMode ? undefined : router.push(`/playlists/${pl.kind}`)"
                >
                  <Icon name="mingcute:playlist-2-line" :size="17" />
                  <span>Открыть плейлист</span>
                </div>
                <div class="h-[1px] mx-[6px] my-[4px] bg-[var(--line)]" />
                <div
                  class="flex items-center gap-[8px] h-[26px] px-[7px] py-0 rounded-[calc(var(--radius)*0.5833)] text-[calc(12px*var(--text-scale,1))] leading-none text-[color:var(--fg-dim)] cursor-pointer whitespace-nowrap transition-[background,color] duration-100 hover:bg-[var(--hover)] hover:text-[color:var(--fg)] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-none [&_svg]:text-[color:var(--fg-faint)] [&_svg]:transition-colors hover:[&_svg]:text-[color:var(--fg)] [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:text-ellipsis select-none [&:hover_svg]:text-[color:var(--fg)] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis"
                  v-close-popup
                  @click="library.toggleHidden(pl.kind)"
                >
                  <Icon
                    :name="
                      library.isHidden(pl.kind)
                        ? 'mingcute:eye-2-line'
                        : 'mingcute:eye-close-line'
                    "
                    :size="17"
                  />
                  <span>{{
                    library.isHidden(pl.kind)
                      ? "Вернуть в коллекцию"
                      : "Скрыть плейлист"
                  }}</span>
                </div>
              </div>
            </q-menu>
          </div>

          <template v-if="library.hiddenPlaylists.length">
            <button
              type="button"
              class="flex w-[calc(100%-16px)] cursor-pointer flex-none items-center mx-2 mt-2.5 mb-0.5 gap-[9px] border-0 rounded-[calc(var(--radius)*0.75)] px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[color:var(--fg-faint)] transition-[background,color] duration-150 hover:bg-[var(--hover)] hover:text-[color:var(--fg-dim)]"
              @click="showHidden = !showHidden"
            >
              <span
                class="inline-flex items-center flex-none transition-transform duration-150"
                :class="{ 'rotate-90': showHidden }"
              >
                <Icon name="mingcute:right-line" :size="12" />
              </span>
              <span class="flex-1">Скрытые</span>
              <span
                class="flex-none rounded-[calc(var(--radius)*0.5833)] bg-[var(--surface-2)] px-1.5 text-[10px] font-semibold text-[color:var(--fg-dim)]"
                >{{ library.hiddenPlaylists.length }}</span
              >
            </button>

            <div
              v-for="pl in showHidden ? library.hiddenPlaylists : []"
              :key="`hidden-${pl.kind}`"
              class="opacity-60 flex min-w-0 flex-none cursor-pointer items-center gap-2.5 mx-2 my-px rounded-[calc(var(--radius)*0.8333)] px-3 py-[5px] text-[calc(13px*var(--text-scale,1))] transition-[background,opacity] duration-150 hover:bg-[color-mix(in_srgb,var(--fg)_7%,transparent)] hover:opacity-100"
              :class="
                route.path === `/playlists/${pl.kind}`
                  ? 'bg-[color-mix(in_srgb,var(--fg)_8%,transparent)]'
                  : ''
              "
              @click="sidebarEditMode ? undefined : router.push(`/playlists/${pl.kind}`)"
            >
              <div
                class="cover flex items-center justify-center flex-none overflow-hidden rounded-[calc(var(--radius)*0.8333)] bg-[var(--surface-2)] [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block"
                style="width: 30px; height: 30px; border-radius: 7px"
              >
                <img
                  loading="lazy"
                  decoding="async"
                  v-if="pl.cover_url"
                  :src="pl.cover_url"
                />
                <Icon
                  v-else
                  name="mingcute:playlist-2-line"
                  :size="14"
                  class="text-[color:var(--fg-faint)]"
                />
              </div>
              <div class="col" style="min-width: 0">
                <div class="truncate text-[calc(13px*var(--text-scale,1))]">{{ pl.title }}</div>
              </div>
              <button
                type="button"
                class="flex w-[22px] h-[22px] flex-none items-center justify-center rounded-[calc(var(--radius)*0.5)] border-0 p-0 text-[color:var(--fg-faint)] cursor-pointer appearance-none transition-[background,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]"
                title="Вернуть в коллекцию"
                @click.stop="library.toggleHidden(pl.kind)"
              >
                <Icon name="mingcute:eye-2-line" :size="14" />
              </button>
            </div>
          </template>

          <div
            v-if="!library.playlists.length"
            class="text-[color:var(--fg-faint)] text-[calc(12px*var(--text-scale,1))] q-px-lg q-py-sm"
          >
            Пусто
          </div>
        </q-scroll-area>
      </div>
    </q-drawer>

    <q-drawer
      v-if="!panels.hidden && !panels.mini"
      v-model="rightPanel"
      side="right"
      :width="300"
      :breakpoint="0"
      class="rightbar !bg-[var(--bg)] border-l border-[var(--line)]"
      content-class="overflow-x-hidden"
    >
      <div class="column full-height" style="overflow: hidden">
        <div
          class="flex-none px-4 pt-3.5 pb-1.5 text-[12px] font-semibold tracking-[-0.01em] text-[color:var(--fg-faint)]"
        >
          Сейчас играет
        </div>

        <div
          v-if="player.current"
          class="min-w-0 flex-none px-4 pt-0.5 pb-2.5"
        >
          <div
            class="cover flex items-center justify-center flex-none overflow-hidden rounded-[calc(var(--radius)*0.8333)] bg-[var(--surface-2)] [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block"
            style="width: 100%; height: 268px; border-radius: 12px"
          >
            <img
              loading="lazy"
              decoding="async"
              v-if="player.current.cover_url"
              :src="player.current.cover_url"
            />
            <Icon v-else name="mingcute:music-line" :size="30" class="text-[color:var(--fg-faint)]" />
          </div>
          <div class="q-mt-md text-[calc(15px*var(--text-scale,1))] font-semibold truncate">
            <TrackTitle :track="player.current" />
          </div>
          <div class="text-[color:var(--fg-dim)] text-[calc(13px*var(--text-scale,1))] overflow-hidden [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
            <ArtistsLine :artists="player.current.artists" :limit="2" />
          </div>
        </div>
        <div
          v-else
          class="flex-none px-4 pt-0.5 pb-2.5 text-[color:var(--fg-faint)] text-[12px]"
        >
          Очередь пуста
        </div>

        <div
          class="flex-none flex items-center gap-2 px-4 pt-3 pb-1.5 text-[12px] font-semibold tracking-[-0.01em] text-[color:var(--fg-faint)]"
        >
          <span class="flex-1 min-w-0">Очередь</span>
          <span
            v-if="queueItems.length"
            class="flex-none text-[color:var(--fg-faint)] text-[11px] tabular-nums"
          >
            {{ player.index + 1 }} / {{ queueItems.length }}
          </span>
          <button
            v-if="queueItems.length"
            type="button"
            class="inline-flex items-center justify-center flex-none w-[22px] h-[22px] p-0 border-0 rounded-[calc(var(--radius)*0.5)] cursor-pointer select-none transition-[background,color,opacity] duration-[140ms] ease-[ease] hover:bg-[var(--hover)]"
            :class="followCurrent ? 'text-[color:var(--fg-dim)] opacity-50' : 'text-[color:var(--accent,_#fa2d48)]'"
            title="Пролистать к текущему треку"
            @click="locateCurrent"
          >
            <Icon name="mingcute:playlist-2-line" :size="13" />
          </button>
        </div>

        <q-scroll-area
          ref="queueScroll"
          class="w-full min-w-0 min-h-0 flex-1 pb-2"
          @scroll="onQueueScroll"
        >
          <div
            v-for="item in queueItems"
            :key="`${item.track.id}-${item.index}`"
            class="flex min-w-0 max-w-full flex-none cursor-pointer items-center gap-2.5 mx-2 my-px rounded-[calc(var(--radius)*0.8333)] px-2 py-1.5 text-[calc(13px*var(--text-scale,1))] transition-[background,opacity] duration-150 hover:bg-[color-mix(in_srgb,var(--fg)_7%,transparent)]"
            :class="{
              'bg-[var(--surface-2)]': item.index === player.index,
              'opacity-50': item.index < player.index,
            }"
            :data-queue-current="item.index === player.index ? '1' : null"
            @click="jumpTo(item.index)"
          >
            <div
              class="cover flex items-center justify-center flex-none overflow-hidden rounded-[calc(var(--radius)*0.8333)] bg-[var(--surface-2)] [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block"
              style="width: 30px; height: 30px; border-radius: 7px"
            >
              <img
                loading="lazy"
                decoding="async"
                v-if="item.track.cover_url"
                :src="item.track.cover_url"
              />
              <Icon
                v-else
                name="mingcute:music-line"
                :size="14"
                class="text-[color:var(--fg-faint)]"
              />
            </div>
            <div class="flex-1 min-w-0">
              <div
                class="truncate text-[calc(13px*var(--text-scale,1))]"
                :class="
                  item.index === player.index
                    ? 'font-semibold text-[color:var(--accent)]'
                    : ''
                "
              >
                <TrackTitle :track="item.track" />
              </div>
              <div class="text-[color:var(--fg-faint)] text-[calc(11px*var(--text-scale,1))] truncate">
                <ArtistsLine :artists="item.track.artists" :limit="2" />
              </div>
            </div>
            <Icon
              v-if="item.index === player.index"
              :name="
                player.isPlaying ? 'mingcute:pause-fill' : 'mingcute:play-fill'
              "
              :size="13"
              class="text-[color:var(--accent)] flex-none"
            />
            <TrackMenu :context-menu="true" :track="item.track" />
          </div>

          <div v-if="!queueItems.length" class="text-[color:var(--fg-faint)] text-[calc(12px*var(--text-scale,1))] q-px-md q-py-sm">
            Очередь пуста
          </div>
        </q-scroll-area>
      </div>
    </q-drawer>

    <q-page-container
      v-if="!panels.hidden && !panels.mini"
      style="position: relative"
    >
      <router-view v-slot="{ Component, route: current }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="current.fullPath" />
        </Transition>
      </router-view>
      <LyricsPanel
        v-if="lyricsVisible"
        :style="player.lyricsFullscreen ? undefined : lyricsBox"
      />
    </q-page-container>

    <div v-if="panels.hidden" class="flex items-center justify-center h-screen text-[color:var(--fg-faint)] text-[13px]">Играет в фоновом режиме</div>

    <q-footer
      v-if="!panels.hidden && !panels.mini"
      :class="ui.settings.playerEditMode ? '!z-[2600]' : ''"
      style="background: var(--bg); border-top: 1px solid var(--line)"
    >
      <PlayerBar />
    </q-footer>

    <MiniPlayer v-if="panels.mini && !panels.hidden" />

    <NeuroPlayer />

    <TogetherDock />
    <FullscreenPlayer />
    <TrackLyricsDialog />
    <TrailerDialog />
    <AppDialog />
    <NavItemEditDialog
      v-model="navDialogOpen"
      title="Пункт боковой панели"
      :default-label="editingNav?.label || ''"
      :current-label="
        editingNavId ? ui.settings.sidebarLabels?.[editingNavId] || '' : ''
      "
      :default-icon="editingNav?.icon || 'mingcute:dots-line'"
      :current-icon="
        editingNavId ? ui.settings.sidebarIcons?.[editingNavId] || '' : ''
      "
      :can-edit-icon="true"
      :can-edit-label="true"
      @save="saveSidebarDialog"
    />
    <NavItemEditDialog
      v-model="topbarDialogOpen"
      title="Ссылка верхнего меню"
      :default-label="editingTopbar?.label || ''"
      :current-label="
        editingTopbarId ? ui.settings.topbarLabels?.[editingTopbarId] || '' : ''
      "
      :default-icon="editingTopbar?.icon || 'mingcute:dots-line'"
      :current-icon="
        editingTopbarId ? ui.settings.topbarIcons?.[editingTopbarId] || '' : ''
      "
      :can-edit-icon="true"
      :can-edit-label="true"
      @save="saveTopbarDialog"
    />
    <SidebarEditor v-if="sidebarEditMode" />
    <TopbarEditor v-if="topbarEditMode" />
    <HomeEditor v-if="homeEditMode" />
  </q-layout>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import ArtistsLine from "@/components/common/ArtistsLine.vue";
import TrackMenu from "@/components/common/TrackMenu.vue";
import TrackTitle from "@/components/common/TrackTitle.vue";
import HomeEditor from "@/components/layout/HomeEditor.vue";
import SidebarEditor from "@/components/layout/SidebarEditor.vue";
import TopbarEditor from "@/components/layout/TopbarEditor.vue";
import NavItemEditDialog from "@/components/settings/NavItemEditDialog.vue";
import FullscreenPlayer from "@/components/player/FullscreenPlayer.vue";
import LyricsPanel from "@/components/player/LyricsPanel.vue";
import MiniPlayer from "@/components/player/MiniPlayer.vue";
import NeuroPlayer from "@/components/player/NeuroPlayer.vue";
import PlayerBar from "@/components/player/PlayerBar.vue";
import TogetherDock from "@/components/together/TogetherDock.vue";
import TrackLyricsDialog from "@/components/player/TrackLyricsDialog.vue";
import TrailerDialog from "@/components/dialog/TrailerDialog.vue";
import AppDialog from "@/components/common/AppDialog.vue";
import WindowControls from "@/components/window/WindowControls.vue";
import { trackLyricsDialog, trailerDialog } from "@/lib/dialogs";
import {
  bindGlobalHotkeyEvents,
  bindLocalHotkeys,
  unbindGlobalHotkeyEvents,
  unbindLocalHotkeys,
} from "@/lib/hotkeys/runtime";
import { bindTrayEvents, setCloseToTray } from "@/lib/tray";
import {
  releaseStuckPointer,
  startWindowDrag,
  toggleWindowMaximize,
} from "@/lib/window";
import { useAuthStore } from "@/stores/auth";
import { useLibraryStore } from "@/stores/library";
import { useHotkeysStore } from "@/stores/hotkeys";
import { usePanelsStore } from "@/stores/panels";
import { usePlayerStore } from "@/stores/player/index";
import { useUiStore } from "@/stores/ui/index";
import type { NavItemId, TopbarLinkId } from "@/stores/ui/index";
import { ALL_NAV_ITEMS, ALL_PROFILE_LINKS } from "@/constants/navigation";
import { api } from "@/api/client";

const route = useRoute();
const router = useRouter();
const homeMode = computed(() => route.path === "/");
const auth = useAuthStore();
const player = usePlayerStore();
const library = useLibraryStore();
const ui = useUiStore();
const panels = usePanelsStore();
const hotkeys = useHotkeysStore();

const avatarError = ref(false);
watch(
  () => auth.profile?.avatar_url,
  () => {
    avatarError.value = false;
  },
);
const avatarUrl = computed(() =>
  avatarError.value ? null : auth.profile?.avatar_url || null,
);
const accountName = computed(
  () => auth.profile?.display_name || auth.profile?.login || "Профиль",
);
const accountInitial = computed(() => {
  const src = (auth.profile?.display_name || auth.profile?.login || "").trim();
  return src ? src.charAt(0).toUpperCase() : "☺";
});
const accountLogin = computed(() => {
  const login = auth.profile?.login;
  if (!login || login === auth.profile?.display_name) return "";
  return "@" + login;
});
const accountSub = computed(() =>
  auth.profile?.has_plus
    ? "Яндекс Плюс"
    : accountLogin.value || "Яндекс Музыка",
);

const profileLinks = computed(() =>
  (ui.settings.topbarLinks || [])
    .map((id) => {
      const base = ALL_PROFILE_LINKS[id];
      if (!base) return null;
      return {
        ...base,
        label: ui.settings.topbarLabels?.[id] || base.label,
        icon: ui.settings.topbarIcons?.[id] || base.icon,
      };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x)),
);

const showHidden = ref(false);
const sidebarPlaylists = computed(() => library.visiblePlaylists);

const query = ref("");
const suggestions = ref<string[]>([]);
const suggestOpen = ref(false);
const selectedSuggestIndex = ref(-1);
let suggestTimer: ReturnType<typeof setTimeout> | undefined;
let blurTimer: ReturnType<typeof setTimeout> | undefined;

function closeSuggest() {
  suggestOpen.value = false;
  selectedSuggestIndex.value = -1;
}

function closeSuggestSoon() {
  blurTimer = setTimeout(closeSuggest, 150);
}

function onSearchFocus() {
  if (suggestions.value.length) {
    suggestOpen.value = true;
  }
}

function clearSearchQuery() {
  query.value = "";
  suggestions.value = [];
  closeSuggest();
}

function pickSuggestion(hint: string) {
  clearTimeout(blurTimer);
  query.value = hint;
  suggestions.value = [];
  closeSuggest();
  submitSearch();
}

function onSearchKeydown(e: KeyboardEvent) {
  if (e.key === "ArrowDown") {
    if (!suggestOpen.value && suggestions.value.length) {
      suggestOpen.value = true;
      selectedSuggestIndex.value = 0;
      e.preventDefault();
      return;
    }
    if (suggestOpen.value && suggestions.value.length) {
      selectedSuggestIndex.value =
        (selectedSuggestIndex.value + 1) % suggestions.value.length;
      e.preventDefault();
    }
  } else if (e.key === "ArrowUp") {
    if (suggestOpen.value && suggestions.value.length) {
      selectedSuggestIndex.value =
        selectedSuggestIndex.value <= 0
          ? suggestions.value.length - 1
          : selectedSuggestIndex.value - 1;
      e.preventDefault();
    }
  } else if (e.key === "Enter") {
    if (
      suggestOpen.value &&
      selectedSuggestIndex.value >= 0 &&
      selectedSuggestIndex.value < suggestions.value.length
    ) {
      e.preventDefault();
      pickSuggestion(suggestions.value[selectedSuggestIndex.value]);
    } else {
      submitSearch();
    }
  } else if (e.key === "Escape") {
    closeSuggest();
  }
}

watch(query, (value) => {
  clearTimeout(suggestTimer);
  const q = value.trim();
  if (q.length < 2) {
    suggestions.value = [];
    selectedSuggestIndex.value = -1;
    return;
  }
  suggestTimer = setTimeout(() => {
    void api
      .searchSuggest(q)
      .then((list) => {
        suggestions.value = list.filter(
          (hint) => hint.toLowerCase() !== q.toLowerCase(),
        );
        selectedSuggestIndex.value = -1;
        if (suggestions.value.length) {
          suggestOpen.value = true;
        }
      })
      .catch(() => {
        suggestions.value = [];
        selectedSuggestIndex.value = -1;
      });
  }, 220);
});
const rightPanel = computed({
  get: () => panels.queueOpen,
  set: (value: boolean) => {
    panels.queueOpen = value;
  },
});

const queueRestore = ref(false);
let queueAuto = false;

watch(
  () => route.path,
  (to, from) => {
    const onSettings = to.startsWith("/settings");
    const wasSettings = (from ?? "").startsWith("/settings");
    if (onSettings === wasSettings) return;
    queueAuto = true;
    panels.queueLocked = onSettings;
    if (onSettings) {
      queueRestore.value = panels.queueOpen;
      panels.queueOpen = false;
    } else {
      panels.queueOpen = queueRestore.value;
    }
    void nextTick(() => {
      queueAuto = false;
    });
  },
  { immediate: true },
);

watch(
  () => panels.queueOpen,
  (value) => {
    if (queueAuto) return;
    if (route.path.startsWith("/settings")) queueRestore.value = value;
  },
);

watch(
  () => ui.settings.playerEditMode,
  (editing) => {
    if (editing) return;
    const path = ui.playerEditReturnPath;
    if (!path) return;
    ui.playerEditReturnPath = null;
    if (!route.path.startsWith("/settings")) void router.push(path);
  },
);

watch(
  () => [
    ui.settings.sidebarEditMode,
    ui.settings.topbarEditMode,
    ui.settings.homeEditMode,
  ],
  (modes) => {
    if (modes.some(Boolean)) return;
    const path = ui.chromeEditReturnPath;
    if (!path) return;
    ui.chromeEditReturnPath = null;
    if (!route.path.startsWith("/settings")) void router.push(path);
  },
);

const lyricsVisible = computed(() => player.showLyrics && !!player.current);

const lyricsBox = computed(() => ({
  top: ui.settings.topbarVisible ? "var(--topbar-height, 46px)" : "0px",
  bottom: "var(--player-height, 78px)",
  left: `${ui.settings.sidebarWidth}px`,
  right: rightPanel.value ? "300px" : "0px",
}));

const nav = computed(() =>
  (ui.settings.sidebarItems || [])
    .map((id) => {
      const base = ALL_NAV_ITEMS[id];
      if (!base) return null;
      return {
        ...base,
        label: ui.settings.sidebarLabels?.[id] || base.label,
        icon: ui.settings.sidebarIcons?.[id] || base.icon,
      };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x)),
);

const sidebarEditMode = computed(() => ui.settings.sidebarEditMode);
const topbarEditMode = computed(() => ui.settings.topbarEditMode);
const homeEditMode = computed(() => ui.settings.homeEditMode);

const hiddenNavItems = computed(() =>
  Object.values(ALL_NAV_ITEMS).filter(
    (item) => !ui.settings.sidebarItems.includes(item.id),
  ),
);

const hiddenTopbarLinks = computed(() =>
  Object.values(ALL_PROFILE_LINKS).filter(
    (link) => !ui.settings.topbarLinks.includes(link.id),
  ),
);

const profileMenuOpen = ref(false);

const sidebarDragId = ref<NavItemId | null>(null);
const sidebarOver = ref<{ id: NavItemId; after: boolean } | null>(null);

function startSidebarDrag(id: NavItemId, event: DragEvent) {
  if (!ui.settings.sidebarEditMode) {
    event.preventDefault();
    return;
  }
  sidebarDragId.value = id;
  if (event.dataTransfer) {
    event.dataTransfer.setData("text/plain", id);
    event.dataTransfer.effectAllowed = "move";
  }
}

function endSidebarDrag() {
  sidebarDragId.value = null;
  sidebarOver.value = null;
}

function onSidebarDragOver(id: NavItemId, event: DragEvent) {
  if (!sidebarDragId.value || sidebarDragId.value === id) return;
  event.preventDefault();
  const el = event.currentTarget as HTMLElement | null;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  sidebarOver.value = { id, after: event.clientY > rect.top + rect.height / 2 };
}

function onSidebarDragLeave(id: NavItemId) {
  if (sidebarOver.value?.id === id) sidebarOver.value = null;
}

function onSidebarDrop(id: NavItemId, event: DragEvent) {
  event.preventDefault();
  const drag = sidebarDragId.value;
  if (!drag) return;
  ui.moveSidebarItemAround(drag, id, sidebarOver.value?.after ?? false);
  endSidebarDrag();
}

const topbarDragId = ref<TopbarLinkId | null>(null);
const topbarOver = ref<{ id: TopbarLinkId; after: boolean } | null>(null);

function startTopbarDrag(id: TopbarLinkId, event: DragEvent) {
  if (!ui.settings.topbarEditMode) {
    event.preventDefault();
    return;
  }
  topbarDragId.value = id;
  if (event.dataTransfer) {
    event.dataTransfer.setData("text/plain", id);
    event.dataTransfer.effectAllowed = "move";
  }
}

function endTopbarDrag() {
  topbarDragId.value = null;
  topbarOver.value = null;
}

function onTopbarDragOver(id: TopbarLinkId, event: DragEvent) {
  if (!topbarDragId.value || topbarDragId.value === id) return;
  event.preventDefault();
  const el = event.currentTarget as HTMLElement | null;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  topbarOver.value = { id, after: event.clientY > rect.top + rect.height / 2 };
}

function onTopbarDragLeave(id: TopbarLinkId) {
  if (topbarOver.value?.id === id) topbarOver.value = null;
}

function onTopbarDrop(id: TopbarLinkId, event: DragEvent) {
  event.preventDefault();
  const drag = topbarDragId.value;
  if (!drag) return;
  ui.moveTopbarLinkAround(drag, id, topbarOver.value?.after ?? false);
  endTopbarDrag();
}

const navDialogOpen = ref(false);
const editingNavId = ref<NavItemId | null>(null);
const editingNav = computed(() =>
  editingNavId.value ? ALL_NAV_ITEMS[editingNavId.value] : null,
);

function openSidebarDialog(id: NavItemId) {
  editingNavId.value = id;
  navDialogOpen.value = true;
}

function saveSidebarDialog(payload: { label?: string; icon?: string }) {
  const id = editingNavId.value;
  if (!id) return;
  ui.setSidebarItemLabel(id, payload.label);
  ui.setSidebarItemIcon(id, payload.icon);
}

const topbarDialogOpen = ref(false);
const editingTopbarId = ref<TopbarLinkId | null>(null);
const editingTopbar = computed(() =>
  editingTopbarId.value ? ALL_PROFILE_LINKS[editingTopbarId.value] : null,
);

function openTopbarDialog(id: TopbarLinkId) {
  editingTopbarId.value = id;
  topbarDialogOpen.value = true;
}

function saveTopbarDialog(payload: { label?: string; icon?: string }) {
  const id = editingTopbarId.value;
  if (!id) return;
  ui.setTopbarLinkLabel(id, payload.label);
  ui.setTopbarLinkIcon(id, payload.icon);
}

function startChromeResize(event: PointerEvent) {
  event.preventDefault();
  const startX = event.clientX;
  const startWidth = ui.settings.sidebarWidth;
  const move = (e: PointerEvent) => {
    const next = Math.max(
      200,
      Math.min(320, Math.round(startWidth + e.clientX - startX)),
    );
    if (next !== ui.settings.sidebarWidth) ui.set("sidebarWidth", next);
  };
  const up = () => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
  };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
}

type ScrollAreaRef = {
  getScrollTarget: () => HTMLElement;
  setScrollPosition: (
    axis: "vertical" | "horizontal",
    offset: number,
    duration?: number,
  ) => void;
} | null;

const queueScroll = ref<ScrollAreaRef>(null);
const followCurrent = ref(true);
let autoScrolling = false;

const queueItems = computed(() =>
  (player.queue ?? []).map((track, index) => ({ track, index })),
);

function currentEl(): { target: HTMLElement; el: HTMLElement } | null {
  const area = queueScroll.value;
  if (!area?.getScrollTarget) return null;
  const target = area.getScrollTarget();
  const el = target?.querySelector<HTMLElement>('[data-queue-current="1"]');
  return target && el ? { target, el } : null;
}

async function scrollToCurrent(duration = 0) {
  await nextTick();
  const found = currentEl();
  const area = queueScroll.value;
  if (!found || !area) return;

  const { target, el } = found;
  const offset = el.offsetTop - target.clientHeight / 2 + el.clientHeight / 2;

  autoScrolling = true;
  area.setScrollPosition("vertical", Math.max(0, offset), duration);
  window.setTimeout(() => {
    autoScrolling = false;
  }, duration + 60);
}

function isCurrentVisible(): boolean {
  const found = currentEl();
  if (!found) return false;
  const { target, el } = found;
  const top = el.offsetTop - target.scrollTop;
  return top > -el.clientHeight && top < target.clientHeight;
}

function onQueueScroll() {
  if (autoScrolling) return;
  followCurrent.value = isCurrentVisible();
}

function locateCurrent() {
  followCurrent.value = true;
  void scrollToCurrent(220);
}

watch(
  () => panels.queueOpen,
  (open) => {
    if (!open) return;
    followCurrent.value = true;
    void scrollToCurrent(0);
  },
);

watch(
  () => player.index,
  () => {
    if (!panels.queueOpen || !followCurrent.value) return;
    void scrollToCurrent(260);
  },
);

function jumpTo(index: number) {
  player.index = index;
  followCurrent.value = true;
  void player.loadCurrent();
}

function submitSearch() {
  closeSuggest();
  if (!query.value.trim()) return;
  void router.push({ name: "search", query: { q: query.value.trim() } });
}

async function doLogout() {
  await auth.logout();
  void router.replace("/login");
}

const hotkeyHandlers = {
  toggle: () => player.toggle(),
  mute: () => player.toggleMute(),
  seekForward: () =>
    player.seek(Math.min(player.duration || 0, player.progress + 5)),
  seekBackward: () => player.seek(Math.max(0, player.progress - 5)),
  volumeUp: () =>
    player.setVolume(Math.round(Math.min(1, player.volume + 0.05) * 100) / 100),
  volumeDown: () =>
    player.setVolume(Math.round(Math.max(0, player.volume - 0.05) * 100) / 100),
  like: () => {
    void player.like();
  },
  dislike: () => {
    void player.dislike();
  },
  repeat: () => player.cycleRepeat(),
  shuffle: () => player.toggleShuffle(),
  next: () => {
    void player.next(false);
  },
  prev: () => {
    void player.prev();
  },
  lyrics: () => player.toggleLyrics(),
  queue: () => panels.toggleQueue(),
};

onMounted(() => {
  hotkeys.load();
  bindLocalHotkeys((signature) => hotkeys.resolve(signature), hotkeyHandlers);
  void bindGlobalHotkeyEvents(hotkeyHandlers);
  void hotkeys.applyGlobal();
  void library.init();
  void setCloseToTray(ui.settings.minimizeToTray);
  if (ui.settings.resumeLastSession) {
    void player.restoreSession(ui.settings.resumeAutoplay);
  }
  void bindTrayEvents({
    onToggle: () => player.toggle(),
    onNext: () => {
      void player.next(false);
    },
    onPrev: () => {
      void player.prev();
    },
    onLike: () => {
      void player.like();
    },
    onHidden: () => {
      panels.queueOpen = false;
      panels.hidden = true;
      player.releaseMemory();
    },
    onShown: () => {
      panels.hidden = false;
    },
  });
});

watch(
  () => ui.settings,
  () => {
    ui.apply();
    void player.syncPresence();
    void setCloseToTray(ui.settings.minimizeToTray);
  },
  { deep: true, immediate: true },
);

function onWindowFocus() {
  releaseStuckPointer();
}

watch(
  () => route.fullPath,
  () => {
    player.closeLyrics();
    trackLyricsDialog.open = false;
    if (trailerDialog.open) player.stopPreview();
    trailerDialog.open = false;
    document.documentElement.dataset.route = route.path.startsWith("/settings")
      ? "settings"
      : route.path.replace(/^\//, "").split("/")[0] || "home";
  },
  { immediate: true },
);

window.addEventListener("focus", onWindowFocus);

onBeforeUnmount(() => {
  clearTimeout(suggestTimer);
  clearTimeout(blurTimer);
  window.removeEventListener("focus", onWindowFocus);
  unbindLocalHotkeys();
  unbindGlobalHotkeyEvents();
});
</script>
