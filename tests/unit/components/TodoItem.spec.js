import { mount } from '@vue/test-utils'
import TodoItem from '@/components/TodoItem.vue'
import { expect, test, vi } from 'vitest'

const todo = { id: '1', name: 'buy milk', done: false }

function mountTodoItem() {
  return mount(TodoItem, { props: { todo } })
}

test('Render value', () => {
  const wrapper = mount(
    TodoItem, { props: { todo: { id: '1', name: 'buy milk', done: true } } }
  )

  expect(wrapper.text()).toContain('buy milk')
})

test('Emit @toggleTask', async () => {
  const todoItem = mountTodoItem()

  await todoItem.find('.todo-item__name').trigger('click')

  expect(todoItem.emitted('toggleTask')).toEqual([[todo.id]])
})

test('Capture the pointer and emit @dragStart from the drag handle', async () => {
  const todoItem = mountTodoItem()
  const dragHandle = todoItem.find('.todo-item__drag-handle')
  const setPointerCapture = vi.fn()
  const cardRect = { left: 10, top: 20, width: 300, height: 40 }

  dragHandle.element.setPointerCapture = setPointerCapture
  vi.spyOn(todoItem.element, 'getBoundingClientRect').mockReturnValue(cardRect)
  await dragHandle.trigger('pointerdown', { pointerId: 7 })

  expect(setPointerCapture).toHaveBeenCalledWith(7)
  expect(todoItem.emitted('dragStart')[0][0]).toBe(todo.id)
  expect(todoItem.emitted('dragStart')[0][1]).toBeInstanceOf(Event)
  expect(todoItem.emitted('dragStart')[0][2]).toBe(cardRect)
})

test.each([
  ['pointermove', 'dragMove'],
  ['pointerup', 'dragEnd'],
  ['pointercancel', 'dragCancel'],
])('Emit @%s interaction as @%s', async (pointerEvent, componentEvent) => {
  const todoItem = mountTodoItem()

  await todoItem.find('.todo-item__drag-handle').trigger(pointerEvent, { pointerId: 7 })

  expect(todoItem.emitted(componentEvent)[0][0]).toBe(todo.id)
  expect(todoItem.emitted(componentEvent)[0][1]).toBeInstanceOf(Event)
})

test('Do not start drag from task controls', async () => {
  const todoItem = mountTodoItem()

  await todoItem.find('.todo-item__name').trigger('pointerdown')
  await todoItem.find('.todo-item__delete').trigger('pointerdown')

  expect(todoItem.emitted('dragStart')).toBeUndefined()
})
