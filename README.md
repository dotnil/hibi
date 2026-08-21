# todo-vue [![CI](https://github.com/dotnil/todo-vue/actions/workflows/ci.yml/badge.svg)](https://github.com/dotnil/todo-vue/actions/workflows/ci.yml)

[Live demo](https://dotnil.github.io/todo-vue/)

Небольшое todo-приложение на Vue 3 с локальным состоянием и собственным drag&drop без сторонней DnD-библиотеки.

## Возможности

* Добавление задач.
* Checkbox для изменения `done`.
* Inline-редактирование имени задачи.
* Удаление через actions menu.
* Перестановка задач через drag&drop.
* Отображение текущих даты и времени.
* Responsive UI.

## Технические особенности

* Pointer Events для drag&drop.
* Live reorder во время перетаскивания.
* Fixed drag overlay и layout placeholder.
* Чистые helper-функции для определения target index и перестановки массива.
* Локальное Vue state без store, router и API.

## Stack

* Vue 3
* Vite
* Vitest
* Vue Test Utils
* ESLint
* jsdom

## Local development

```bash
npm install
npm run dev
```

## Проверки

```bash
npm test
npm run lint
npm run build
npm run coverage
```
