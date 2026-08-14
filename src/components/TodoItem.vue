<template>
  <li
    ref="element"
    class="todo-item"
    :class="{
      'todo-item_placeholder': placeholder,
      'todo-item_overlay': overlay,
      'todo-item_draggable': !overlay && !editing,
    }"
    :aria-hidden="overlay || undefined"
    :inert="overlay"
    @pointerdown="startDrag"
  >
    <input
      class="todo-item__checkbox"
      type="checkbox"
      :checked="todo.done"
      :aria-label="todo.name"
      @pointerdown.stop
      @change="emitToggleTask"
    >
    <input
      v-if="editing && !overlay"
      ref="nameInput"
      v-model="draftName"
      class="todo-item__name-input"
      aria-label="Task name"
      @pointerdown.stop
      @keyup.enter="saveName"
      @keyup.esc="cancelEditing"
    >
    <span
      v-else
      class="todo-item__name"
      :class="{ 'todo-item__name_completed': todo.done }"
    >{{ todo.name }}</span>
    <button
      v-if="!editing"
      class="todo-item__edit"
      type="button"
      :aria-label="`Edit ${todo.name}`"
      @pointerdown.stop
      @click="startEditing"
    >
      Edit
    </button>
    <div
      class="todo-item__delete"
      @pointerdown.stop
      @click="!overlay && emitDeleteTask()"
    />
  </li>
</template>

<script setup>
import { nextTick, ref, useTemplateRef } from 'vue'

const emit = defineEmits([
  'toggleTask',
  'deleteTask',
  'updateName',
  'dragStart',
])

const props = defineProps({
  todo: { type: Object, required: true },
  placeholder: { type: Boolean, default: false },
  overlay: { type: Boolean, default: false },
})

const element = useTemplateRef('element')
const nameInput = useTemplateRef('nameInput')
const editing = ref(false)
const draftName = ref('')

function emitToggleTask() {
  if (props.overlay) { return }

  emit('toggleTask', props.todo.id)
}

function emitDeleteTask() {
  if (props.overlay) { return }

  emit('deleteTask', props.todo.id)
}

async function startEditing() {
  if (props.overlay) { return }

  draftName.value = props.todo.name
  editing.value = true
  await nextTick()
  nameInput.value.focus()
}

function saveName() {
  const name = draftName.value.trim()

  if (name.length > 0) { emit('updateName', props.todo.id, name) }
  editing.value = false
}

function cancelEditing() {
  editing.value = false
}

function startDrag(event) {
  if (props.overlay || editing.value) { return }

  emit('dragStart', props.todo.id, event, element.value.getBoundingClientRect())
}
</script>

<style>
.todo-item {
  display: flex;
  justify-content: space-between;
  height: 40px;
}

.todo-item_draggable {
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

.todo-item__name_completed {
  text-decoration: line-through;
  color: #9a8c98;
}

.todo-item__name {
  user-select: none;
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
