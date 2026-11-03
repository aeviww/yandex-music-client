export interface NavIconItem {
  id: string;
  name: string;
  category: string;
  tags: string[];
}

export const NAV_ICONS: NavIconItem[] = [
  { id: "mingcute:home-3-line", name: "Дом 3", category: "Навигация", tags: ["главное", "дом", "старт", "home"] },
  { id: "mingcute:home-1-line", name: "Дом 1", category: "Навигация", tags: ["главное", "дом", "home"] },
  { id: "mingcute:home-2-line", name: "Дом 2", category: "Навигация", tags: ["главное", "дом", "home"] },
  { id: "mingcute:home-4-line", name: "Дом 4", category: "Навигация", tags: ["главное", "дом", "home"] },
  { id: "mingcute:home-5-line", name: "Дом 5", category: "Навигация", tags: ["главное", "дом", "home"] },
  { id: "mingcute:home-6-line", name: "Дом 6", category: "Навигация", tags: ["главное", "дом", "home"] },
  { id: "mingcute:compass-line", name: "Компас", category: "Навигация", tags: ["навигация", "обзор", "исследовать", "compass"] },
  { id: "mingcute:compass-2-line", name: "Компас 2", category: "Навигация", tags: ["навигация", "компас"] },
  { id: "mingcute:planet-line", name: "Планета", category: "Навигация", tags: ["мир", "космос", "планета", "planet"] },
  { id: "mingcute:earth-2-line", name: "Земля", category: "Навигация", tags: ["мир", "земля", "earth", "глобус"] },
  { id: "mingcute:navigation-line", name: "Стрелка навигации", category: "Навигация", tags: ["навигация", "направление"] },
  { id: "mingcute:rocket-line", name: "Ракета", category: "Навигация", tags: ["ракета", "быстро", "rocket"] },

  { id: "mingcute:search-2-line", name: "Поиск 2", category: "Поиск", tags: ["поиск", "найти", "search"] },
  { id: "mingcute:search-line", name: "Поиск 1", category: "Поиск", tags: ["поиск", "найти", "search"] },
  { id: "mingcute:search-3-line", name: "Поиск 3", category: "Поиск", tags: ["поиск", "найти", "search"] },
  { id: "mingcute:filter-line", name: "Фильтр 1", category: "Поиск", tags: ["фильтр", "библиотека", "filter"] },
  { id: "mingcute:filter-2-line", name: "Фильтр 2", category: "Поиск", tags: ["фильтр", "воронка", "filter"] },
  { id: "mingcute:filter-3-line", name: "Фильтр 3", category: "Поиск", tags: ["фильтр", "filter"] },
  { id: "mingcute:scan-line", name: "Скан", category: "Поиск", tags: ["сканирование", "скан", "scan"] },
  { id: "mingcute:radar-line", name: "Радар", category: "Поиск", tags: ["радар", "поиск", "радио"] },
  { id: "mingcute:sparkles-line", name: "Искры", category: "Поиск", tags: ["новое", "рекомендации", "магия", "sparkles"] },
  { id: "mingcute:fire-line", name: "Огонь", category: "Поиск", tags: ["хиты", "популярное", "огонь", "fire", "тренд"] },

  { id: "mingcute:wave-line", name: "Волна", category: "Музыка", tags: ["волна", "радио", "поток", "wave"] },
  { id: "mingcute:music-line", name: "Нота", category: "Музыка", tags: ["музыка", "нота", "песня", "music"] },
  { id: "mingcute:music-2-line", name: "Ноты 2", category: "Музыка", tags: ["музыка", "ноты", "music"] },
  { id: "mingcute:music-3-line", name: "Плейлист нот", category: "Музыка", tags: ["музыка", "треки", "music"] },
  { id: "mingcute:headphone-line", name: "Наушники 1", category: "Музыка", tags: ["наушники", "звук", "headphones"] },
  { id: "mingcute:headphone-2-line", name: "Наушники 2", category: "Музыка", tags: ["наушники", "headphone"] },
  { id: "mingcute:disc-line", name: "Диск", category: "Музыка", tags: ["диск", "винил", "альбом", "disc"] },
  { id: "mingcute:album-line", name: "Альбом 1", category: "Музыка", tags: ["альбом", "обложка", "винил", "album"] },
  { id: "mingcute:album-2-line", name: "Альбом 2", category: "Музыка", tags: ["альбом", "пластинка", "album"] },
  { id: "mingcute:mic-line", name: "Микрофон 1", category: "Музыка", tags: ["микрофон", "текст", "артист", "вокал", "mic"] },
  { id: "mingcute:mic-2-line", name: "Микрофон 2", category: "Музыка", tags: ["микрофон", "подкаст", "mic"] },
  { id: "mingcute:radio-line", name: "Радио", category: "Музыка", tags: ["радио", "волна", "станция", "radio"] },
  { id: "mingcute:antenna-line", name: "Антенна", category: "Музыка", tags: ["радио", "приемник", "антенна", "сигнал", "radio", "antenna"] },
  { id: "mingcute:signal-line", name: "Радиосигнал", category: "Музыка", tags: ["радио", "приемник", "сигнал", "волны", "radio", "signal"] },
  { id: "mingcute:sound-line-line", name: "Эквалайзер", category: "Музыка", tags: ["звук", "модуль", "частоты", "эквалайзер", "спектр", "equalizer"] },
  { id: "mingcute:audio-waveform-line", name: "Аудиоволна", category: "Музыка", tags: ["звук", "волна", "аудио", "трек", "waveform"] },
  { id: "mingcute:speaker-line", name: "Колонка", category: "Музыка", tags: ["колонка", "динамик", "speaker"] },
  { id: "mingcute:volume-line", name: "Громкость", category: "Музыка", tags: ["громкость", "звук", "volume"] },

  { id: "mingcute:book-2-line", name: "Книга 2", category: "Коллекции", tags: ["коллекция", "книга", "библиотека", "book"] },
  { id: "mingcute:book-5-line", name: "Книга 5", category: "Коллекции", tags: ["коллекция", "книги"] },
  { id: "mingcute:book-6-line", name: "Книга 6", category: "Коллекции", tags: ["коллекция", "книги"] },
  { id: "mingcute:playlist-line", name: "Плейлист 1", category: "Коллекции", tags: ["плейлист", "список", "playlist"] },
  { id: "mingcute:playlist-2-line", name: "Плейлист 2", category: "Коллекции", tags: ["плейлист", "сборник", "playlist"] },
  { id: "mingcute:folder-line", name: "Папка", category: "Коллекции", tags: ["папка", "каталог", "folder"] },
  { id: "mingcute:folder-open-line", name: "Открытая папка", category: "Коллекции", tags: ["папка", "библиотека", "folder"] },
  { id: "mingcute:archive-line", name: "Архив", category: "Коллекции", tags: ["архив", "хранилище", "archive"] },
  { id: "mingcute:box-line", name: "Коробка", category: "Коллекции", tags: ["коробка", "бокс", "хранилище"] },
  { id: "mingcute:layers-line", name: "Слои", category: "Коллекции", tags: ["слои", "стек", "подборки", "layers"] },
  { id: "mingcute:grid-line", name: "Сетка", category: "Коллекции", tags: ["сетка", "каталог", "плитка", "grid"] },
  { id: "mingcute:list-check-line", name: "Чеклист", category: "Коллекции", tags: ["список", "очередь", "треки"] },

  { id: "mingcute:heart-line", name: "Сердце (контур)", category: "Избранное", tags: ["мне нравится", "любимое", "лайк", "сердце", "heart", "like"] },
  { id: "mingcute:heart-fill", name: "Сердце (заливка)", category: "Избранное", tags: ["мне нравится", "сердце", "лайк", "heart"] },
  { id: "mingcute:star-line", name: "Звезда (контур)", category: "Избранное", tags: ["звезда", "топ", "избранное", "star"] },
  { id: "mingcute:star-fill", name: "Звезда (заливка)", category: "Избранное", tags: ["звезда", "star"] },
  { id: "mingcute:thumb-up-line", name: "Палец вверх", category: "Избранное", tags: ["лайк", "класс", "нравится", "thumb"] },
  { id: "mingcute:award-line", name: "Награда", category: "Избранное", tags: ["награда", "медаль", "топ", "award"] },
  { id: "mingcute:trophy-line", name: "Кубок", category: "Избранное", tags: ["кубок", "лидер", "победа", "trophy"] },
  { id: "mingcute:bookmark-line", name: "Закладка", category: "Избранное", tags: ["закладка", "сохранить", "bookmark"] },

  { id: "mingcute:chart-bar-line", name: "Гистограмма", category: "Статистика", tags: ["статистика", "график", "диаграмма", "stats", "chart"] },
  { id: "mingcute:chart-pie-line", name: "Круговая диаграмма", category: "Статистика", tags: ["статистика", "доли", "pie"] },
  { id: "mingcute:chart-line-line", name: "График тренда", category: "Статистика", tags: ["статистика", "рост", "динамика", "график", "тренд", "chart"] },
  { id: "mingcute:time-line", name: "Часы", category: "Статистика", tags: ["время", "часы", "таймер", "time"] },
  { id: "mingcute:history-line", name: "История", category: "Статистика", tags: ["история", "недавнее", "повтор", "history"] },
  { id: "mingcute:calendar-line", name: "Календарь", category: "Статистика", tags: ["календарь", "дата", "день", "calendar"] },
  { id: "mingcute:dashboard-line", name: "Дашборд", category: "Статистика", tags: ["дашборд", "панель", "сводка"] },

  { id: "mingcute:user-2-line", name: "Пользователь 2", category: "Профиль", tags: ["профиль", "аккаунт", "пользователь", "user"] },
  { id: "mingcute:user-1-line", name: "Пользователь 1", category: "Профиль", tags: ["профиль", "user"] },
  { id: "mingcute:user-3-line", name: "Пользователь 3", category: "Профиль", tags: ["профиль", "user"] },
  { id: "mingcute:user-4-line", name: "Пользователь 4", category: "Профиль", tags: ["профиль", "user"] },
  { id: "mingcute:group-line", name: "Группа", category: "Профиль", tags: ["группа", "сообщество", "вместе", "together"] },

  { id: "mingcute:settings-5-line", name: "Шестеренка 5", category: "Настройки", tags: ["настройки", "параметры", "опции", "settings"] },
  { id: "mingcute:settings-1-line", name: "Шестеренка 1", category: "Настройки", tags: ["настройки", "settings"] },
  { id: "mingcute:settings-2-line", name: "Шестеренка 2", category: "Настройки", tags: ["настройки", "settings"] },
  { id: "mingcute:settings-3-line", name: "Шестеренка 3", category: "Настройки", tags: ["настройки", "settings"] },
  { id: "mingcute:settings-6-line", name: "Шестеренка 6", category: "Настройки", tags: ["настройки", "параметры", "ползунки", "settings"] },
  { id: "mingcute:tool-line", name: "Инструменты", category: "Настройки", tags: ["инструменты", "утилиты", "tool"] },
  { id: "mingcute:hammer-line", name: "Молоток", category: "Настройки", tags: ["инструменты", "ремонт", "настройка", "ключ", "молоток", "hammer"] },
  { id: "mingcute:file-sliders-line", name: "Ползунки", category: "Настройки", tags: ["ползунки", "параметры", "настройки", "sliders"] },
  { id: "mingcute:layout-left-line", name: "Панель слева", category: "Настройки", tags: ["интерфейс", "раскладка", "боковая панель", "layout"] },

  { id: "mingcute:lightning-line", name: "Молния", category: "Символы", tags: ["молния", "быстро", "энергия", "lightning"] },
  { id: "mingcute:sun-line", name: "Солнце", category: "Символы", tags: ["солнце", "свет", "день", "sun"] },
  { id: "mingcute:moon-line", name: "Луна", category: "Символы", tags: ["луна", "ночь", "темнота", "moon"] },
  { id: "mingcute:notification-line", name: "Колокольчик", category: "Символы", tags: ["уведомления", "звонок", "колокольчик", "bell", "notification"] },
  { id: "mingcute:bell-ringing-line", name: "Звонок", category: "Символы", tags: ["уведомления", "звонок", "колокольчик", "bell"] },
  { id: "mingcute:gift-line", name: "Подарок", category: "Символы", tags: ["подарок", "бонус", "gift"] },
  { id: "mingcute:pin-2-line", name: "Пин", category: "Символы", tags: ["закрепить", "булавка", "pin"] },
  { id: "mingcute:share-2-line", name: "Поделиться", category: "Символы", tags: ["поделиться", "ссылка", "share"] },
];

export function searchNavIcons(query: string): NavIconItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return NAV_ICONS;

  const matches = NAV_ICONS.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q)),
  );

  if (q.includes(":") && !matches.some((m) => m.id.toLowerCase() === q)) {
    return [
      {
        id: q,
        name: `Своя иконка (${q})`,
        category: "Пользовательская",
        tags: [q],
      },
      ...matches,
    ];
  }

  return matches;
}
