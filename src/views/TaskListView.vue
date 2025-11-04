<template lang='pug'>
.task-list
  h1.task-list__title Hibi

  ul.task-list__container
    TaskItem(
      v-for='task in tasks'
      :key='task.id'
      :task='task'
    )

  TaskEditor
</template>

<script setup>
import { useTasksStore } from '@/stores/tasks'
import TaskItem from '@/components/TaskItem.vue'
import TaskEditor from '@/components/TaskEditor.vue'

const store = useTasksStore()
const tasks = store.tasks
</script>

<style>
.task-list
  display: grid
  gap: 16px
  padding: 32px
  max-width: 600px
  margin: 0 auto

.task-list__title
  font-family: "Vensfolk"
  text-align: center
  margin-bottom: 12px
</style>
