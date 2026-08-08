<template lang='pug'>
li.todo-item
  span.todo-item__name(
    :class="{ 'todo-item__name_completed': todo.done }"
    @click="emitToggleTask"
  ) {{ todo.name }}
  .todo-item__delete(@click="emitDeleteTask")
</template>

<script setup>
const emit = defineEmits(['toggleTask', 'deleteTask'])

const props = defineProps({
  todo: { type: Object, required: true },
})

function emitToggleTask() {
  emit('toggleTask', props.todo.id)
}

function emitDeleteTask() {
  emit('deleteTask', props.todo.id)
}
</script>

<style>
.todo-item
  display: flex
  justify-content: space-between
  height: 40px

.todo-item:hover
  font-size: larger

.todo-item:hover
  list-style-type: disc

.todo-item__name
  cursor: pointer

.todo-item__name_completed
  text-decoration: line-through
  color: #9a8c98

.todo-item__delete
  display: initial
  width: 30px
  cursor: pointer
  text-decoration: none
  color: #5a0700
  mask: url("@/assets/icons/close.svg") no-repeat center
  background: black

.todo-item__delete:hover
  background: #8F0000
</style>
