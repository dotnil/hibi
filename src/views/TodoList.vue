<template>
  <div class="todo-list__wrapper">
    <input
      v-model="title"
      class="todo-list__title"
    >

    <ul
      ref="dragContainer"
      class="todo-list__container"
      @pointermove="moveDrag"
      @pointerup="finishDrag"
      @pointercancel="finishDrag"
    >
      <TransitionGroup name="todo-list">
        <TodoItem
          v-for="todo in todos"
          :key="todo.id"
          :todo="todo"
          :placeholder="dragSession?.todoId === todo.id"
          @toggle-task="toggleTask"
          @delete-task="deleteTask"
          @drag-start="startDrag"
        />
      </TransitionGroup>
    </ul>
    <TodoItem
      v-if="activeTodo"
      :todo="activeTodo"
      :style="dragOverlayStyle"
      overlay
    />
    <div class="todo-list__call-to-action">
      <input
        v-model.trim="taskName"
        class="todo-list__new-item"
        @keyup.enter="addTask"
      >
      <button
        class="todo-list__button"
        @click="addTask"
      >
        +
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, useTemplateRef } from 'vue'
import TodoItem from '@/components/TodoItem.vue'
import { getDragTargetIndex } from '@/utils/getDragTargetIndex'
import { moveItem } from '@/utils/moveItem'

const taskName = ref('')

const title = ref('Todo')

const todos = ref([
  { name: 'function', done: false, id: crypto.randomUUID() },
  { name: 'take a rest', done: false, id: crypto.randomUUID() }
])

const dragSession = ref(null)
const dragContainer = useTemplateRef('dragContainer')

const activeTodo = computed(() => {
  return todos.value.find(todo => todo.id === dragSession.value?.todoId)
})

const dragOverlayStyle = computed(() => {
  if (!dragSession.value) { return }

  return {
    width: `${dragSession.value.width}px`,
    height: `${dragSession.value.height}px`,
    transform: `translate3d(${dragSession.value.left}px, ${dragSession.value.top}px, 0)`,
  }
})

function isActivePointer(pointerId) {
  return dragSession.value?.pointerId === pointerId
}

function startDrag(todoId, event, cardRect) {
  if (dragSession.value) { return }

  const initialIndex = todos.value.findIndex(todo => todo.id === todoId)

  dragContainer.value.setPointerCapture(event.pointerId)

  dragSession.value = {
    todoId,
    pointerId: event.pointerId,
    pointerOffsetX: event.clientX - cardRect.left,
    pointerOffsetY: event.clientY - cardRect.top,
    left: cardRect.left,
    top: cardRect.top,
    width: cardRect.width,
    height: cardRect.height,
    slotOriginTop: cardRect.top - initialIndex * cardRect.height,
  }
}

function moveDrag(event) {
  if (event.target !== event.currentTarget || !isActivePointer(event.pointerId)) { return }

  dragSession.value.left = event.clientX - dragSession.value.pointerOffsetX
  dragSession.value.top = event.clientY - dragSession.value.pointerOffsetY

  const currentIndex = todos.value.findIndex(todo => todo.id === dragSession.value.todoId)
  const targetIndex = getDragTargetIndex({
    currentIndex,
    draggedTop: dragSession.value.top,
    slotOriginTop: dragSession.value.slotOriginTop,
    slotStep: dragSession.value.height,
    itemCount: todos.value.length,
  })

  if (targetIndex !== currentIndex) {
    todos.value = moveItem(todos.value, currentIndex, targetIndex)
  }
}

function finishDrag(event) {
  if (event.target !== event.currentTarget || !isActivePointer(event.pointerId)) { return }

  dragSession.value = null
}

function toggleTask(id) {
  const todo = todos.value.find(todo => id === todo.id)

  if (todo) { todo.done = !todo.done }
}

function deleteTask(id) {
  todos.value = todos.value.filter(todo => id !== todo.id)
}

function addTask() {
  if (taskName.value.length === 0) { return }

  const newTask = {
    name: taskName.value,
    done: false,
    id: crypto.randomUUID()
  }

  todos.value.push(newTask)
  taskName.value = ''
}

</script>

<style>
.todo-list__wrapper {
  box-sizing: border-box;
  height: 100vh;
  display: grid;
  grid-template-areas:
    'title-list title-list'
    'todos      todos     '
    'new-task   submit    ';
  grid-template-columns: 2fr;
  grid-template-rows: 160px auto 80px;
  font-size: 40px;
  position: relative;
}

.todo-list__title {
  grid-area: title-list;
  font-family: "Vensfolk";
  border: none;
  background: none;
  color: inherit;
  display: block;
  font-size: 3em;
  width: 100vw;
  padding: 0;
}

.todo-list__title:focus {
  outline: none;
}

.todo-list__container {
  grid-area: todos;
  margin: 0;
  padding: 30px;
  overflow: hidden;
  font-family: "Montserrat";
}

.todo-list-move {
  transition: transform 150ms ease;
}

.todo-list__call-to-action {
  grid-area: new-task;
  display: contents;
  align-self: end;
  box-sizing: border-box;
}

.todo-list__new-item {
  grid-area: new-task;
  width: 100%;
  background: none;
  border: none;
  box-shadow: 0 5px 30px rgba(55, 63, 81, 0.1);
  background-color: #FAF7F5;
}

button.todo-list__button {
  all: unset;
  grid-area: submit;
  display: flex;
  justify-content: center;
  cursor: pointer;
  background-color: #FAF7F5;
  width: 80px;
  font-size: 60px;
  align-items: center;
}

button.todo-list__button:hover {
  background-color: #FAF7F5;
}
</style>
