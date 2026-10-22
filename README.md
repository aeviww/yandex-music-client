<div align="center">

<img src="assets/icon.png" width="120" alt="mashiro" />

# mashiro

неофициальный десктопный клиент яндекс музыки на vue и tauri.

</div>

> **v2 в разработке**
>
> переписывание приложения займёт немало времени, так что конкретных сроков пока нет.
>
> если хотите просто пользоваться приложением, лучше скачайте стабильный релиз из ветки `main`.

## запуск и сборка

### режим разработки

после клонирования репозитория переключись на ветку v2:

```bash
git switch v2
cd desktop
npm install
npm run tauri:dev
```

### сборка

из папки `desktop`:

```bash
npm run tauri:build
```

готовые пакеты появятся в:

```text
desktop/src-tauri/target/release/bundle/
```

## лицензия

GPL-3.0.
