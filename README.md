# JLPT N5 Japanese Grammar Trainer

Интерактивное приложение на `Vite + React + TypeScript` для изучения грамматики уровня **JLPT N5**.

## Что внутри

- 10 тем N5 с фиксированным порядком прохождения
- Структура каждого урока:
  - объяснение правила
  - необходимая лексика
  - тренировка (конструктор предложений или форма слова)
  - мини-текст с пропусками
- Финальная грамматическая часть JLPT N5 (открывается после всех тем)

## Локальный запуск

```bash
npm install
npm run dev
```

## Сборка

```bash
npm run build
npm run preview
```

## Деплой на GitHub Pages через Actions

Workflow уже добавлен: `.github/workflows/deploy.yml`.

Чтобы он заработал:

1. Запушь репозиторий в ветку `main`.
2. В GitHub открой `Settings -> Pages`.
3. Для `Build and deployment` выбери `Source: GitHub Actions`.
4. После пуша workflow `Deploy to GitHub Pages` соберет `dist` и опубликует сайт.

`vite.config.ts` уже настроен с `base: './'`, поэтому приложение корректно работает на GitHub Pages.

