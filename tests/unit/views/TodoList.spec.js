import { mount } from '@vue/test-utils'
import TodoItem from '@/components/TodoItem.vue'
import TodoList from '@/views/TodoList.vue'
import { expect, test } from 'vitest'

function createPointerEvent(pointerId, clientX = 0, clientY = 0) {
  const event = new Event('pointermove')

  Object.defineProperty(event, 'pointerId', { value: pointerId })
  Object.defineProperty(event, 'clientX', { value: clientX })
  Object.defineProperty(event, 'clientY', { value: clientY })

  return event
}

function startDrag(todoList, pointerId = 7, clientX = 30, clientY = 50) {
  const todoItem = todoList.findComponent(TodoItem)
  const event = createPointerEvent(pointerId, clientX, clientY)
  const cardRect = {
    left: 10,
    top: 20,
    width: 300,
    height: 40,
  }

  todoItem.vm.$emit('dragStart', todoItem.props('todo').id, event, cardRect)

  return todoItem
}

test('Add a new task with the save button', async () => {
  const todoList = mount(TodoList)

  const input = todoList.find('.todo-list__new-item')
  await input.setValue('feed the cat')

  const saveButton = todoList.find('.todo-list__button')
  await saveButton.trigger('click')

  expect(todoList.text()).toContain('feed the cat')
})

test('Add a new task by pressing the "enter" key', async () => {
  const todoList = mount(TodoList)

  const input = todoList.find('.todo-list__new-item')
  await input.setValue('feed the cat')

  await input.trigger('keyup.enter')

  expect(todoList.text()).toContain('feed the cat')
})

test('Complete the task', async () => {
  const todoList = mount(TodoList)
  const input = todoList.find('.todo-list__new-item')
  await input.setValue('feed the cat')
  await input.trigger('keyup.enter')
  const task = todoList
    .findAll('.todo-item__name')
    .filter(task => task.text() === 'feed the cat')[0]

  expect(task.classes()).not.toContain('todo-item__name_completed')
  await task.trigger('click')
  expect(task.classes()).toContain('todo-item__name_completed')
})

test('Delete the task', async () => {
  const todoList = mount(TodoList)
  const input = todoList.find('.todo-list__new-item')
  await input.setValue('feed the cat')
  await input.trigger('keyup.enter')
  const task = todoList
    .findAll('.todo-item')
    .filter(task => task.text().includes('feed the cat'))[0]

  expect(todoList.text()).toContain('feed the cat')
 
  const deleteButton = task.find('.todo-item__delete')
  await deleteButton.trigger('click')
  expect(todoList.text()).not.toContain('feed the cat')
})

test('Start one drag session with todo and pointer identity', () => {
  const todoList = mount(TodoList)
  const todoItem = startDrag(todoList)

  expect(todoList.vm.dragSession).toEqual({
    todoId: todoItem.props('todo').id,
    pointerId: 7,
    pointerOffsetX: 20,
    pointerOffsetY: 30,
    left: 10,
    top: 20,
    width: 300,
    height: 40,
  })
})

test('Do not replace an active drag session', () => {
  const todoList = mount(TodoList)
  const todoItems = todoList.findAllComponents(TodoItem)
  startDrag(todoList)
  todoItems[1].vm.$emit(
    'dragStart',
    todoItems[1].props('todo').id,
    createPointerEvent(8),
    { left: 0, top: 0, width: 100, height: 40 }
  )

  expect(todoList.vm.dragSession.todoId).toBe(todoItems[0].props('todo').id)
  expect(todoList.vm.dragSession.pointerId).toBe(7)
})

test('Show an overlay at the card position and keep the original as placeholder', async () => {
  const todoList = mount(TodoList)
  const todoItem = startDrag(todoList)

  await todoList.vm.$nextTick()

  const overlay = todoList.find('.todo-item_overlay')
  expect(overlay.exists()).toBe(true)
  expect(overlay.attributes('style')).toContain('translate3d(10px, 20px, 0)')
  expect(overlay.attributes('style')).toContain('width: 300px')
  expect(overlay.attributes('aria-hidden')).toBe('true')
  expect(overlay.find('.todo-item__drag-handle').exists()).toBe(false)
  expect(overlay.find('.todo-item__delete').exists()).toBe(false)
  expect(todoItem.classes()).toContain('todo-item_placeholder')
})

test('Move the overlay with the active pointer while preserving the grab point', async () => {
  const todoList = mount(TodoList)
  const todoItem = startDrag(todoList)
  const todoId = todoItem.props('todo').id

  todoItem.vm.$emit('dragMove', todoId, createPointerEvent(7, 80, 100))
  await todoList.vm.$nextTick()

  expect(todoList.find('.todo-item_overlay').attributes('style'))
    .toContain('translate3d(60px, 70px, 0)')
})

test('Do not move the overlay for a foreign pointer', async () => {
  const todoList = mount(TodoList)
  const todoItem = startDrag(todoList)
  const todoId = todoItem.props('todo').id

  todoItem.vm.$emit('dragMove', todoId, createPointerEvent(8, 80, 100))
  await todoList.vm.$nextTick()

  expect(todoList.find('.todo-item_overlay').attributes('style'))
    .toContain('translate3d(10px, 20px, 0)')
})

test.each(['dragEnd', 'dragCancel'])(
  'Clear the session on active %s but ignore a foreign pointer',
  async (dragEvent) => {
    const todoList = mount(TodoList)
    const todoItem = todoList.findComponent(TodoItem)
    const todoId = todoItem.props('todo').id

    startDrag(todoList)
    todoItem.vm.$emit(dragEvent, todoId, createPointerEvent(8))
    await todoList.vm.$nextTick()
    expect(todoList.find('.todo-item_overlay').exists()).toBe(true)

    todoItem.vm.$emit(dragEvent, todoId, createPointerEvent(7))
    await todoList.vm.$nextTick()
    expect(todoList.find('.todo-item_overlay').exists()).toBe(false)
  }
)
