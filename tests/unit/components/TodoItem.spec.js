import { mount } from '@vue/test-utils'
import TodoItem from '@/components/TodoItem.vue'
import { expect, test, vi } from 'vitest'

const todo = { id: '1', name: 'buy milk', done: false }

function mountTodoItem() {
  return mount(TodoItem, { props: { todo } })
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

  await todoItem.find('.todo-item__edit').trigger('click')
  const input = todoItem.find('.todo-item__name-input')

  expect(input.element.value).toBe(todo.name)
  expect(document.activeElement).toBe(input.element)
  expect(todoItem.find('.todo-item__name').exists()).toBe(false)
  todoItem.unmount()
})

test('Emit @updateName with the trimmed name on enter', async () => {
  const todoItem = mountTodoItem()

  await todoItem.find('.todo-item__edit').trigger('click')
  const input = todoItem.find('.todo-item__name-input')
  await input.setValue('  get bread  ')
  await input.trigger('keyup.enter')

  expect(todoItem.emitted('updateName')).toEqual([[todo.id, 'get bread']])
  expect(todoItem.find('.todo-item__name').text()).toBe(todo.name)
})

test('Cancel editing on escape', async () => {
  const todoItem = mountTodoItem()

  await todoItem.find('.todo-item__edit').trigger('click')
  const input = todoItem.find('.todo-item__name-input')
  await input.setValue('get bread')
  await input.trigger('keyup.esc')

  expect(todoItem.emitted('updateName')).toBeUndefined()
  expect(todoItem.find('.todo-item__name').text()).toBe(todo.name)
})

test('Do not emit an empty name', async () => {
  const todoItem = mountTodoItem()

  await todoItem.find('.todo-item__edit').trigger('click')
  const input = todoItem.find('.todo-item__name-input')
  await input.setValue('   ')
  await input.trigger('keyup.enter')

  expect(todoItem.emitted('updateName')).toBeUndefined()
  expect(todoItem.find('.todo-item__name').text()).toBe(todo.name)
})

test('Emit @dragStart with card geometry from the drag handle', async () => {
  const todoItem = mountTodoItem()
  const dragHandle = todoItem.find('.todo-item__drag-handle')
  const cardRect = { left: 10, top: 20, width: 300, height: 40 }

  vi.spyOn(todoItem.element, 'getBoundingClientRect').mockReturnValue(cardRect)
  await dragHandle.trigger('pointerdown', { pointerId: 7 })

  expect(todoItem.emitted('dragStart')[0][0]).toBe(todo.id)
  expect(todoItem.emitted('dragStart')[0][1]).toBeInstanceOf(Event)
  expect(todoItem.emitted('dragStart')[0][2]).toBe(cardRect)
})

test('Do not emit drag lifecycle events after drag start', async () => {
  const todoItem = mountTodoItem()
  const dragHandle = todoItem.find('.todo-item__drag-handle')

  await dragHandle.trigger('pointermove', { pointerId: 7 })
  await dragHandle.trigger('pointerup', { pointerId: 7 })
  await dragHandle.trigger('pointercancel', { pointerId: 7 })

  expect(todoItem.emitted('dragMove')).toBeUndefined()
  expect(todoItem.emitted('dragEnd')).toBeUndefined()
  expect(todoItem.emitted('dragCancel')).toBeUndefined()
})

test('Do not start drag from task controls', async () => {
  const todoItem = mountTodoItem()

  await todoItem.find('.todo-item__checkbox').trigger('pointerdown')
  await todoItem.find('.todo-item__name').trigger('pointerdown')
  await todoItem.find('.todo-item__edit').trigger('pointerdown')
  await todoItem.find('.todo-item__delete').trigger('pointerdown')

  await todoItem.find('.todo-item__edit').trigger('click')
  await todoItem.find('.todo-item__name-input').trigger('pointerdown')

  expect(todoItem.emitted('dragStart')).toBeUndefined()
})

test('Keep the card structure without controls in overlay mode', async () => {
  const todoItem = mount(TodoItem, { props: { todo, overlay: true } })

  expect(todoItem.attributes('aria-hidden')).toBe('true')
  expect(todoItem.find('.todo-item__drag-handle').element.tagName).toBe('SPAN')
  expect(todoItem.find('.todo-item__delete').exists()).toBe(true)
  expect(todoItem.find('.todo-item__checkbox').exists()).toBe(false)
  expect(todoItem.find('.todo-item__edit').exists()).toBe(false)
  expect(todoItem.find('.todo-item__name-input').exists()).toBe(false)
  expect(todoItem.find('button').exists()).toBe(false)

  await todoItem.find('.todo-item__name').trigger('click')
  await todoItem.find('.todo-item__delete').trigger('click')

  expect(todoItem.emitted('toggleTask')).toBeUndefined()
  expect(todoItem.emitted('deleteTask')).toBeUndefined()
  expect(todoItem.emitted('updateName')).toBeUndefined()
  expect(todoItem.emitted('dragStart')).toBeUndefined()
})
