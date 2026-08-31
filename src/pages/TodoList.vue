<template>
  <div class="todo-list">
    <header class="todo-list__header">
      <DateTimeHeader />
    </header>

    <form
      class="todo-list__add-form"
      aria-label="Add task"
      @submit.prevent="addTask"
    >
      <input
        v-model.trim="taskName"
        class="todo-list__add-input"
        placeholder="What needs to be done?"
        aria-label="Task name"
        :aria-describedby="taskNameError ? 'task-name-error' : undefined"
        :aria-invalid="Boolean(taskNameError)"
        @input="taskNameError = ''"
      >
      <button
        class="todo-list__add-button"
        type="submit"
        aria-label="Add task"
      >
        +
      </button>
    </form>
    <p
      id="task-name-error"
      class="todo-list__add-error"
      role="alert"
    >
      {{ taskNameError }}
    </p>
    <section
      class="todo-list__tasks"
      aria-label="Todo list"
    >
      <ul
        ref="dragContainer"
        class="todo-list__items"
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
            :actions-open="activeActionsTodoId === todo.id"
            @toggle-task="toggleTask"
            @delete-task="deleteTask"
            @update-name="updateName"
            @toggle-actions="toggleActions"
            @close-actions="activeActionsTodoId = null"
            @drag-start="startDrag"
          />
        </TransitionGroup>
      </ul>
    </section>
    <TodoItem
      v-if="activeTodo"
      :todo="activeTodo"
      :style="dragOverlayStyle"
      overlay
    />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import DateTimeHeader from '@/components/DateTimeHeader.vue'
import TodoItem from '@/components/TodoItem.vue'
import { getDragTargetIndex } from '@/utils/getDragTargetIndex'
import { moveItem } from '@/utils/moveItem'

const taskName = ref('')
const taskNameError = ref('')

const todos = ref([
  { name: 'Review pull request', done: true, id: crypto.randomUUID() },
  { name: 'Update project notes', done: false, id: crypto.randomUUID() },
  { name: 'Book dentist appointment', done: false, id: crypto.randomUUID() },
  { name: 'Plan weekend trip', done: false, id: crypto.randomUUID() },
  { name: 'Buy coffee beans', done: false, id: crypto.randomUUID() }
])

const dragSession = ref(null)
const activeActionsTodoId = ref(null)
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

function toggleActions(id) {
  activeActionsTodoId.value = activeActionsTodoId.value === id ? null : id
}

function closeActionsOutside(event) {
  if (activeActionsTodoId.value === null) { return }
  if (event.target instanceof Element && event.target.closest('.todo-item__actions')) { return }

  activeActionsTodoId.value = null
}

onMounted(() => {
  document.addEventListener('pointerdown', closeActionsOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', closeActionsOutside)
})

function deleteTask(id) {
  todos.value = todos.value.filter(todo => id !== todo.id)
}

function updateName(id, name) {
  const todo = todos.value.find(todo => id === todo.id)

  if (todo) { todo.name = name }
}

function addTask() {
  if (taskName.value.length === 0) {
    taskNameError.value = 'Enter a task name.'
    return
  }

  const newTask = {
    name: taskName.value,
    done: false,
    id: crypto.randomUUID()
  }

  todos.value.push(newTask)
  taskName.value = ''
  taskNameError.value = ''
}

</script>

<style>
.todo-list {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  flex: 1;
  min-height: 0;
  position: relative;
}

.todo-list__header {
  --header-gutter: clamp(2.25rem, 8vw, 7rem);
  --header-inset: clamp(2rem, 4vw, 3.5rem);
  min-width: 0;
}

.todo-list__items {
  margin: 0;
  padding: 0;
  overflow: visible;
}

.todo-list__tasks {
  min-width: 0;
  padding: clamp(2rem, 4vw, 3.5rem) clamp(2.25rem, 8vw, 7rem);
}

.todo-list-move {
  transition: transform 120ms ease;
}

.todo-list__add-form {
  display: flex;
  align-items: stretch;
  gap: clamp(1rem, 3vw, 2rem);
  min-width: 0;
  padding: clamp(2rem, 4vw, 3.5rem) clamp(2.25rem, 8vw, 7rem) 0;
  box-sizing: border-box;
  position: relative;
}

.todo-list__add-form::after {
  position: absolute;
  right: calc(clamp(2.25rem, 8vw, 7rem) - 0.5rem);
  bottom: 0;
  left: calc(clamp(2.25rem, 8vw, 7rem) - 0.5rem);
  height: 1px;
  background: rgba(206, 206, 206, 0.55);
  content: "";
  pointer-events: none;
}

.todo-list__add-form:focus-within::after {
  height: 2px;
  background: #cecece;
}

.todo-list__add-input {
  flex: 1;
  min-width: 0;
  font-size: clamp(1.375rem, 2.5vw, 1.5rem);
  font-family: inherit;
  color: #cecece;
  background: transparent;
  border: 0;
  outline: none;
}

.todo-list__add-error {
  box-sizing: border-box;
  min-height: 2rem;
  margin: 0;
  padding: 0.75rem clamp(2.25rem, 8vw, 7rem) 0;
  color: #b42318;
  font-size: 0.875rem;
}

.todo-list__add-input::placeholder {
  color: #d7d7d7;
  opacity: 0.1;
}

button.todo-list__add-button {
  all: unset;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  width: clamp(3.5rem, 5.3vw, 5rem);
  height: clamp(3.5rem, 5.3vw, 5rem);
  cursor: pointer;
  color: #fff;
  font-size: 2.5rem;
  font-weight: 300;
  border-radius: 6px;
}

button.todo-list__add-button:focus-visible {
  outline: 2px solid #000;
  outline-offset: 0.25rem;
}

</style>
