# todo-vue [![CI](https://github.com/dotnil/todo-vue/actions/workflows/ci.yml/badge.svg)](https://github.com/dotnil/todo-vue/actions/workflows/ci.yml)

[Live demo](https://dotnil.github.io/todo-vue/) · [Архитектура](./ARCHITECTURE.md)

Небольшое приложение на Vue 3 для работы со списком задач.
Основной акцент — разделение состояния списка, браузерного взаимодействия, вычисления позиции и изменения данных по отдельным ответственностям.

## Возможности

* добавление задач;
* отметка выполненных задач;
* inline-редактирование (редактирование прямо в списке) названия;
* удаление через меню действий;
* изменение порядка задач перетаскиванием;
* отображение текущих даты и времени;
* адаптивный интерфейс.

## Технологии

* Vue 3;
* Vite;
* Vitest;
* Vue Test Utils;
* ESLint;
* jsdom.

## Локальный запуск

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

