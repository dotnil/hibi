<template>
  <li
    class="todo-item"
    :class="{
      'todo-item_placeholder': placeholder,
      'todo-item_overlay': overlay,
    }"
    :aria-hidden="overlay || undefined"
  >
    <button
      v-if="!overlay"
      class="todo-item__drag-handle"
      type="button"
      aria-label="Move task"
      @pointerdown="startDrag"
      @pointermove="moveDrag"
      @pointerup="endDrag"
      @pointercancel="cancelDrag"
    >
      ⋮⋮
    </button>
    <span
      class="todo-item__name"
      :class="{ 'todo-item__name_completed': todo.done }"
      @click="emitToggleTask"
    >{{ todo.name }}</span>
    <div
      v-if="!overlay"
      class="todo-item__delete"
      @click="emitDeleteTask"
    />
  </li>
</template>

<script setup>
const emit = defineEmits([
  'toggleTask',
  'deleteTask',
  'dragStart',
  'dragMove',
  'dragEnd',
  'dragCancel',
])

const props = defineProps({
  todo: { type: Object, required: true },
  placeholder: { type: Boolean, default: false },
  overlay: { type: Boolean, default: false },
})

function emitToggleTask() {
  emit('toggleTask', props.todo.id)
}

function emitDeleteTask() {
  emit('deleteTask', props.todo.id)
}

function startDrag(event) {
  event.currentTarget.setPointerCapture(event.pointerId)
  emit('dragStart', props.todo.id, event)
}

function moveDrag(event) {
  emit('dragMove', props.todo.id, event)
}

function endDrag(event) {
  emit('dragEnd', props.todo.id, event)
}

function cancelDrag(event) {
  emit('dragCancel', props.todo.id, event)
}
</script>

<style>
.todo-item {
  display: flex;
  justify-content: space-between;
  height: 40px;
}

.todo-item__drag-handle {
  border: none;
  background: none;
  color: inherit;
  cursor: grab;
  touch-action: none;
}

.todo-item_placeholder {
  visibility: hidden;
}

.todo-item_overlay {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
  box-sizing: border-box;
  pointer-events: none;
}

.todo-item__name {
  cursor: pointer;
}

.todo-item__name_completed {
  text-decoration: line-through;
  color: #9a8c98;
}

.todo-item__delete {
  display: initial;
  width: 30px;
  cursor: pointer;
  text-decoration: none;
  color: #5a0700;
  mask: url("@/assets/icons/close.svg") no-repeat center;
  background: black;
}

.todo-item__delete:hover {
  background: #8F0000;
}
</style>
