<template>
  <li
    ref="element"
    class="todo-item"
    :class="{
      'todo-item_placeholder': placeholder,
      'todo-item_overlay': overlay,
      'todo-item_draggable': !overlay && !editing,
    }"
    :aria-hidden="overlay || placeholder || undefined"
    :inert="overlay || placeholder"
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
      @blur="cancelEditing"
      @keyup.enter="saveName"
      @keyup.esc="cancelEditing"
    >
    <span
      v-else
      class="todo-item__name"
      :class="{ 'todo-item__name_completed': todo.done }"
    >{{ todo.name }}</span>
    <div
      class="todo-item__actions"
      @pointerdown.stop
    >
      <button
        v-if="!overlay && !placeholder"
        class="todo-item__actions-toggle"
        type="button"
        aria-label="Todo actions"
        :aria-expanded="actionsOpen"
        :aria-controls="actionsId"
        @click="emitToggleActions"
      >
        …
      </button>
      <span
        v-else
        class="todo-item__actions-toggle"
      >
        …
      </span>
      <div
        v-if="!overlay && !placeholder && actionsOpen"
        :id="actionsId"
        class="todo-item__actions-panel"
      >
        <button
          v-if="!editing"
          class="todo-item__edit"
          type="button"
          @click="startEditing"
        >
          Edit
        </button>
        <button
          class="todo-item__delete"
          type="button"
          @click="emitDeleteTask"
        >
          Delete
        </button>
      </div>
    </div>
  </li>
</template>

<script setup>
import { nextTick, ref, useTemplateRef } from 'vue'

const emit = defineEmits([
  'toggleTask',
  'deleteTask',
  'updateName',
  'toggleActions',
  'closeActions',
  'dragStart',
])

const props = defineProps({
  todo: { type: Object, required: true },
  placeholder: { type: Boolean, default: false },
  overlay: { type: Boolean, default: false },
  actionsOpen: { type: Boolean, default: false },
})

const element = useTemplateRef('element')
const nameInput = useTemplateRef('nameInput')
const editing = ref(false)
const draftName = ref('')
const actionsId = `todo-actions-${props.todo.id}`

function emitToggleTask() {
  if (props.overlay) { return }

  emit('toggleTask', props.todo.id)
}

function emitDeleteTask() {
  if (props.overlay) { return }

  emit('closeActions')
  emit('deleteTask', props.todo.id)
}

function emitToggleActions() {
  if (props.overlay || props.placeholder) { return }

  emit('toggleActions', props.todo.id)
}

async function startEditing() {
  if (props.overlay) { return }

  emit('closeActions')
  draftName.value = props.todo.name
  editing.value = true
  await nextTick()
  nameInput.value.focus()
}

function saveName() {
  if (!editing.value) { return }

  const name = draftName.value.trim()

  if (name.length > 0) { emit('updateName', props.todo.id, name) }
  editing.value = false
}

function cancelEditing() {
  if (!editing.value) { return }

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

.todo-item__actions {
  position: relative;
}

.todo-item__actions-panel {
  position: absolute;
  z-index: 1;
  top: 0;
  right: 100%;
  display: flex;
  flex-direction: column;
}
</style>
