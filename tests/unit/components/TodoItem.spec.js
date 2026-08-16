import { mount } from '@vue/test-utils'
import TodoItem from '@/components/TodoItem.vue'
import { expect, test, vi } from 'vitest'

const todo = { id: '1', name: 'buy milk', done: false }

function mountTodoItem() {
  return mount(TodoItem, { props: { todo } })
}

async function openActions(todoItem) {
  await todoItem.find('[aria-label="Todo actions"]').trigger('click')
}

test('Render value and checked state', () => {
  const wrapper = mount(
    TodoItem, { props: { todo: { id: '1', name: 'buy milk', done: true } } }
  )

  expect(wrapper.text()).toContain('buy milk')
  const checkbox = wrapper.find('.todo-item__checkbox')
  expect(checkbox.element.checked).toBe(true)
  expect(checkbox.attributes('aria-label')).toBe('buy milk')
})

test('Emit @toggleTask from the checkbox', async () => {
  const todoItem = mountTodoItem()

  await todoItem.find('.todo-item__checkbox').trigger('change')

  expect(todoItem.emitted('toggleTask')).toEqual([[todo.id]])
})

test('Do not emit @toggleTask from the task name', async () => {
  const todoItem = mountTodoItem()

  await todoItem.find('.todo-item__name').trigger('click')

  expect(todoItem.emitted('toggleTask')).toBeUndefined()
})

test('Edit the current name and focus the input', async () => {
  const todoItem = mount(TodoItem, { props: { todo }, attachTo: document.body })

  await openActions(todoItem)
  await todoItem.find('.todo-item__edit').trigger('click')
  const input = todoItem.find('.todo-item__name-input')

  expect(todoItem.find('.todo-item__actions-panel').exists()).toBe(false)
  expect(input.element.value).toBe(todo.name)
  expect(document.activeElement).toBe(input.element)
  expect(todoItem.find('.todo-item__name').exists()).toBe(false)
  todoItem.unmount()
})

test('Emit @updateName with the trimmed name on enter', async () => {
  const todoItem = mountTodoItem()

  await openActions(todoItem)
  await todoItem.find('.todo-item__edit').trigger('click')
  const input = todoItem.find('.todo-item__name-input')
  await input.setValue('  get bread  ')
  await input.trigger('keyup.enter')
  await input.trigger('blur')

  expect(todoItem.emitted('updateName')).toEqual([[todo.id, 'get bread']])
  expect(todoItem.find('.todo-item__name').text()).toBe(todo.name)
})

test('Cancel editing on blur', async () => {
  const todoItem = mountTodoItem()

  await openActions(todoItem)
  await todoItem.find('.todo-item__edit').trigger('click')
  const input = todoItem.find('.todo-item__name-input')
  await input.setValue('get bread')
  await input.trigger('blur')

  expect(todoItem.emitted('updateName')).toBeUndefined()
  expect(todoItem.find('.todo-item__name').text()).toBe(todo.name)
  expect(todoItem.find('.todo-item__name-input').exists()).toBe(false)
})

test('Cancel editing on escape', async () => {
  const todoItem = mountTodoItem()

  await openActions(todoItem)
  await todoItem.find('.todo-item__edit').trigger('click')
  const input = todoItem.find('.todo-item__name-input')
  await input.setValue('get bread')
  await input.trigger('keyup.esc')

  expect(todoItem.emitted('updateName')).toBeUndefined()
  expect(todoItem.find('.todo-item__name').text()).toBe(todo.name)
})

test('Do not emit an empty name', async () => {
  const todoItem = mountTodoItem()

  await openActions(todoItem)
  await todoItem.find('.todo-item__edit').trigger('click')
  const input = todoItem.find('.todo-item__name-input')
  await input.setValue('   ')
  await input.trigger('keyup.enter')

  expect(todoItem.emitted('updateName')).toBeUndefined()
  expect(todoItem.find('.todo-item__name').text()).toBe(todo.name)
})

test('Emit @dragStart with card geometry from the task name', async () => {
  const todoItem = mountTodoItem()
  const cardRect = { left: 10, top: 20, width: 300, height: 40 }

  vi.spyOn(todoItem.element, 'getBoundingClientRect').mockReturnValue(cardRect)
  await todoItem.find('.todo-item__name').trigger('pointerdown', { pointerId: 7 })

  expect(todoItem.emitted('dragStart')[0][0]).toBe(todo.id)
  expect(todoItem.emitted('dragStart')[0][1]).toBeInstanceOf(Event)
  expect(todoItem.emitted('dragStart')[0][2]).toBe(cardRect)
})

test('Do not emit drag lifecycle events after drag start', async () => {
  const todoItem = mountTodoItem()

  await todoItem.trigger('pointermove', { pointerId: 7 })
  await todoItem.trigger('pointerup', { pointerId: 7 })
  await todoItem.trigger('pointercancel', { pointerId: 7 })

  expect(todoItem.emitted('dragMove')).toBeUndefined()
  expect(todoItem.emitted('dragEnd')).toBeUndefined()
  expect(todoItem.emitted('dragCancel')).toBeUndefined()
})

test('Do not start drag from task controls', async () => {
  const todoItem = mountTodoItem()

  await todoItem.find('.todo-item__checkbox').trigger('pointerdown')
  await todoItem.find('[aria-label="Todo actions"]').trigger('pointerdown')
  await openActions(todoItem)
  await todoItem.find('.todo-item__edit').trigger('pointerdown')
  await todoItem.find('.todo-item__delete').trigger('pointerdown')

  await todoItem.find('.todo-item__edit').trigger('click')
  await todoItem.find('.todo-item__name-input').trigger('pointerdown')

  expect(todoItem.emitted('dragStart')).toBeUndefined()
})

test('Disable card drag while editing and restore it after cancel', async () => {
  const todoItem = mountTodoItem()

  await openActions(todoItem)
  await todoItem.find('.todo-item__edit').trigger('click')
  await todoItem.trigger('pointerdown', { pointerId: 7 })
  expect(todoItem.emitted('dragStart')).toBeUndefined()

  await openActions(todoItem)
  expect(todoItem.find('.todo-item__edit').exists()).toBe(false)
  expect(todoItem.find('.todo-item__delete').exists()).toBe(true)
  await todoItem.find('[aria-label="Todo actions"]').trigger('click')

  await todoItem.find('.todo-item__name-input').trigger('keyup.esc')
  await todoItem.trigger('pointerdown', { pointerId: 7 })
  expect(todoItem.emitted('dragStart')).toHaveLength(1)
})

test('Toggle the todo actions panel', async () => {
  const todoItem = mountTodoItem()
  const toggle = todoItem.find('[aria-label="Todo actions"]')

  expect(toggle.attributes('aria-expanded')).toBe('false')
  await toggle.trigger('click')
  expect(toggle.attributes('aria-expanded')).toBe('true')
  expect(todoItem.find('.todo-item__actions-panel').exists()).toBe(true)

  await toggle.trigger('click')
  expect(toggle.attributes('aria-expanded')).toBe('false')
  expect(todoItem.find('.todo-item__actions-panel').exists()).toBe(false)
})

test('Keep the non-interactive card structure in overlay mode', async () => {
  const regularItem = mountTodoItem()
  const todoItem = mount(TodoItem, { props: { todo, overlay: true } })
  const structuralClasses = [
    '.todo-item__checkbox',
    '.todo-item__name',
    '.todo-item__actions',
  ]

  expect(todoItem.attributes('aria-hidden')).toBe('true')
  expect(todoItem.attributes()).toHaveProperty('inert')
  expect(todoItem.find('.todo-item__drag-handle').exists()).toBe(false)
  expect(structuralClasses.map(selector => regularItem.find(selector).exists()))
    .toEqual([true, true, true])
  expect(structuralClasses.map(selector => todoItem.find(selector).exists()))
    .toEqual([true, true, true])
  expect(structuralClasses.map(selector => regularItem.find(selector).element.tagName))
    .toEqual(['INPUT', 'SPAN', 'DIV'])
  expect(structuralClasses.map(selector => todoItem.find(selector).element.tagName))
    .toEqual(['INPUT', 'SPAN', 'DIV'])
  expect(todoItem.find('.todo-item__name-input').exists()).toBe(false)
  expect(todoItem.find('[aria-label="Todo actions"]').exists()).toBe(false)
  expect(todoItem.find('.todo-item__actions-toggle').element.tagName).toBe('SPAN')
  expect(todoItem.find('.todo-item__actions-panel').exists()).toBe(false)

  await todoItem.trigger('pointerdown', { pointerId: 7 })
  await todoItem.find('.todo-item__checkbox').trigger('change')
  await todoItem.find('.todo-item__name').trigger('click')
  await todoItem.find('.todo-item__actions-toggle').trigger('click')

  expect(todoItem.find('.todo-item__name-input').exists()).toBe(false)
  expect(todoItem.emitted('toggleTask')).toBeUndefined()
  expect(todoItem.emitted('deleteTask')).toBeUndefined()
  expect(todoItem.emitted('updateName')).toBeUndefined()
  expect(todoItem.emitted('dragStart')).toBeUndefined()
})
