import type { HomeSectionId, NavItemId, TopbarLinkId } from "@/stores/ui/defaults";

export interface NavItemMeta {
  id: NavItemId;
  to: string;
  label: string;
  icon: string;
  description: string;
  locked?: boolean;
}

export interface TopbarLinkMeta {
  id: TopbarLinkId;
  to: string;
  label: string;
  icon: string;
  description: string;
  locked?: boolean;
}

export interface HomeSectionMeta {
  id: HomeSectionId;
  label: string;
  editorLabel: string;
  icon: string;
  description: string;
}

export const ALL_NAV_ITEMS: Record<NavItemId, NavItemMeta> = {
  home: {
    id: "home",
    to: "/",
    label: "Главное",
    icon: "mingcute:home-3-line",
    description: "Главная страница с персональными рекомендациями",
    locked: true,
  },
  search: {
    id: "search",
    to: "/search",
    label: "Поиск",
    icon: "mingcute:search-2-line",
    description: "Поиск по каталогу",
  },
  wave: {
    id: "wave",
    to: "/wave",
    label: "Моя волна",
    icon: "mingcute:wave-line",
    description: "Персональная радиостанция",
  },
  liked: {
    id: "liked",
    to: "/liked",
    label: "Мне нравится",
    icon: "mingcute:heart-line",
    description: "Треки с лайками",
  },
  playlists: {
    id: "playlists",
    to: "/playlists",
    label: "Коллекция",
    icon: "mingcute:book-2-line",
    description: "Плейлисты из Яндекс Музыки",
  },
  library: {
    id: "library",
    to: "/library",
    label: "Поиск в библиотеке",
    icon: "mingcute:filter-line",
    description: "Поиск и фильтры по локальной фонотеке",
  },
  concerts: {
    id: "concerts",
    to: "/concerts",
    label: "Концерты",
    icon: "mingcute:calendar-line",
    description: "Афиша предстоящих концертов",
  },
  stats: {
    id: "stats",
    to: "/stats",
    label: "Статистика",
    icon: "mingcute:chart-bar-line",
    description: "Статистика прослушиваний",
  },
};

export const navItemCatalog: NavItemMeta[] = Object.values(ALL_NAV_ITEMS);

export const ALL_PROFILE_LINKS: Record<TopbarLinkId, TopbarLinkMeta> = {
  liked: {
    id: "liked",
    to: "/liked",
    label: "Любимое",
    icon: "mingcute:heart-line",
    description: "Треки с лайками",
  },
  playlists: {
    id: "playlists",
    to: "/playlists",
    label: "Коллекция",
    icon: "mingcute:book-2-line",
    description: "Плейлисты из Яндекс Музыки",
  },
  stats: {
    id: "stats",
    to: "/stats",
    label: "Статистика",
    icon: "mingcute:chart-bar-line",
    description: "Статистика прослушиваний",
  },
  concerts: {
    id: "concerts",
    to: "/concerts",
    label: "Концерты",
    icon: "mingcute:calendar-line",
    description: "Афиша предстоящих концертов",
  },
  settings: {
    id: "settings",
    to: "/settings",
    label: "Настройки",
    icon: "mingcute:settings-5-line",
    description: "Параметры приложения (обязательный пункт)",
    locked: true,
  },
  wave: {
    id: "wave",
    to: "/wave",
    label: "Моя волна",
    icon: "mingcute:wave-line",
    description: "Персональная радиостанция",
  },
  library: {
    id: "library",
    to: "/library",
    label: "Поиск в библиотеке",
    icon: "mingcute:filter-line",
    description: "Поиск и фильтры по фонотеке",
  },
  search: {
    id: "search",
    to: "/search",
    label: "Поиск",
    icon: "mingcute:search-2-line",
    description: "Поиск по каталогу",
  },
};

export const topbarLinkCatalog: TopbarLinkMeta[] = Object.values(ALL_PROFILE_LINKS);

export const ALL_HOME_SECTIONS: Record<HomeSectionId, HomeSectionMeta> = {
  playlists: {
    id: "playlists",
    label: "для тебя",
    editorLabel: "Для тебя (плейлисты)",
    icon: "mingcute:playlist-2-line",
    description: "Ваши плейлисты из Яндекс Музыки",
  },
  waves: {
    id: "waves",
    label: "миксы для тебя",
    editorLabel: "Миксы для тебя (волны)",
    icon: "mingcute:wave-line",
    description: "Радиостанции по жанрам и настроению",
  },
  picks: {
    id: "picks",
    label: "новое для тебя",
    editorLabel: "Новое для тебя (подборки)",
    icon: "mingcute:sparkles-line",
    description: "Персональные рекомендации исполнителей и альбомов",
  },
  releases: {
    id: "releases",
    label: "новые релизы",
    editorLabel: "Новые релизы",
    icon: "mingcute:album-line",
    description: "Новые альбомы и синглы",
  },
  concerts: {
    id: "concerts",
    label: "концерты для вас",
    editorLabel: "Концерты для вас",
    icon: "mingcute:calendar-line",
    description: "Концерты артистов из вашей библиотеки",
  },
  neuro: {
    id: "neuro",
    label: "нейромузыка",
    editorLabel: "Нейромузыка",
    icon: "mingcute:headphone-line",
    description: "Звуки для работы и отдыха",
  },
  recent: {
    id: "recent",
    label: "недавно прослушанные",
    editorLabel: "Недавно прослушанные",
    icon: "mingcute:history-line",
    description: "Недавно прослушанные альбомы и треки",
  },
};

export const homeSectionCatalogList: HomeSectionMeta[] = Object.values(ALL_HOME_SECTIONS);
