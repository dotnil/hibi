<template lang='pug'>
li.task-item
  span.task-item__name {{ task.name }}
  .task-item__days
    DayCircle(
      v-for='(day, index) in 7'
      :key='index'
      :done='isDone(index)'
      @click='toggle(index)'
    )
</template>

<script setup>
// Один элемент списка — отдельная привычка или задача

import DayCircle from './DayCircle.vue'
import { useTasksStore } from '@/stores/tasks'
import { getDateForIndex } from '@/composables/useDateHelpers'

const props = defineProps({ task: Object })
const store = useTasksStore()

// Проверяем, выполнен ли день по индексу
function isDone(index) {
  const date = getDateForIndex(index)
  return props.task.history.some(h => h.date === date)
}

// Кликаем — отмечаем или убираем выполнение
function toggle(index) {
  const date = getDateForIndex(index)
  store.toggleDay(props.task.id, date)
}
</script>

<style>
.task-item
  display: flex
  justify-content: space-between
  align-items: center
  padding: 12px 0

.task-item__name
  font-family: "Montserrat"
  font-size: 1em

.task-item__days
  display: flex
  gap: 6px
</style>
