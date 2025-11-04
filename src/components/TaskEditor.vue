<template lang='pug'>
.task-editor
  input.task-editor__input(
    v-model='name'
    placeholder='Новая привычка...'
    @keyup.enter='add'
  )
  select.task-editor__select(v-model='type')
    option(value='habit') привычка
    option(value='periodic') периодическая
  button.task-editor__button(@click='add') +
</template>

<script setup>
import { ref } from 'vue'
import { useTasksStore } from '@/stores/tasks'

const name = ref('')
const type = ref('habit')
const store = useTasksStore()

// Добавляем новую задачу
function add() {
  if (!name.value.trim()) return
  store.addTask({ name: name.value, type: type.value })
  name.value = ''
}
</script>

<style scoped>
.task-editor
  display: flex
  gap: 8px
  margin-top: 24px

.task-editor__input
  flex: 1
  border: none
  border-bottom: 1px solid #aaa
  background: none
  font-family: 'Montserrat'
  font-size: 1em

.task-editor__button
  all: unset
  cursor: pointer
  font-size: 1.5em
  width: 32px
  text-align: center

.task-editor__button:hover
  color: #8f0000
</style>
