<template>
  <li
    ref="element"
    class="todo-item"
    :class="{
      'todo-item--placeholder': placeholder,
      'todo-item--overlay': overlay,
      'todo-item--draggable': !overlay && !editing,
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
      :class="{ 'todo-item__name--completed': todo.done }"
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
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  column-gap: clamp(1rem, 3vw, 2rem);
  box-sizing: border-box;
  min-height: clamp(3.5rem, 5.3vw, 5rem);
  padding: 0 clamp(1rem, 3vw, 2rem);
  color: #cecece;
  background: transparent;
  border: 0;
  border-bottom: 1px solid rgba(206, 206, 206, 0.12);
}

.todo-item--draggable {
  cursor: grab;
  touch-action: none;
}

.todo-item:last-child {
  border-bottom: 0;
}

.todo-item--placeholder {
  visibility: hidden;
}
.todo-item--overlay {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
  box-sizing: border-box;
  pointer-events: none;
}

.todo-item__name--completed {
  text-decoration: line-through;
  opacity: 0.42;
}

.todo-item__name,
.todo-item__name-input {
  min-width: 0;
  font-size: 1.375rem;
}

.todo-item__name {
  overflow-wrap: anywhere;
  user-select: none;
}

.todo-item__name-input {
  box-sizing: border-box;
  width: 100%;
}

.todo-item__checkbox {
  appearance: none;
  box-sizing: border-box;
  width: clamp(1.5rem, 2.5vw, 2rem);
  height: clamp(1.5rem, 2.5vw, 2rem);
  margin: 0;
  border: 1px solid rgba(206, 206, 206, 0.65);
  background: transparent;
  border-radius: 4px;
}

.todo-item__checkbox:checked {
  padding: clamp(0.25rem, 0.5vw, 0.35rem);
  background: #cecece;
  background-clip: content-box;
  border-radius: 4px;
}

.todo-item__checkbox:focus-visible {
  outline: 2px solid #000;
  outline-offset: 0.2rem;
}

.todo-item__actions {
  position: relative;
}

.todo-item__actions-toggle {
  display: grid;
  place-items: center;
  box-sizing: border-box;
  width: 3rem;
  height: 3rem;
  padding: 0;
  border: 0;
  background: transparent;
  font-family: inherit;
  font-size: 1.7rem;
  line-height: 1.2;
  color: #cecece;
  transform: translateY(-0.3em);
}

button.todo-item__actions-toggle {
  cursor: pointer;
}

button.todo-item__actions-toggle:focus-visible,
.todo-item__actions-panel button:focus-visible {
  outline: 2px solid #000;
  outline-offset: 0.2rem;
}

.todo-item__actions-panel {
  position: absolute;
  z-index: 1;
  top: 0;
  right: 100%;
  display: flex;
  gap: 0.25rem;
  padding: 0.25rem;
  border: 1px solid #d7d7d7;
  background: #fff;
  font-size: 1rem;
}

.todo-item__actions-panel button {
  padding: 0.5rem 0.75rem;
  border: 1px solid transparent;
  background: transparent;
  color: #000;
  font: inherit;
  cursor: pointer;
}

.todo-item__actions-panel button:hover {
  border: 1px solid #d7d7d7;
}

</style>
