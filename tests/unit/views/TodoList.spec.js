import { mount } from '@vue/test-utils'
import TodoItem from '@/components/TodoItem.vue'
import TodoList from '@/views/TodoList.vue'
import { expect, test } from 'vitest'

function createPointerEvent(pointerId) {
  const event = new Event('pointermove')

  Object.defineProperty(event, 'pointerId', { value: pointerId })

  return event
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
  const todoItem = todoList.findComponent(TodoItem)
  const event = createPointerEvent(7)

  todoItem.vm.$emit('dragStart', todoItem.props('todo').id, event)

  expect(todoList.vm.dragSession).toEqual({
    todoId: todoItem.props('todo').id,
    pointerId: 7,
  })
})

test('Do not replace an active drag session', () => {
  const todoList = mount(TodoList)
  const todoItems = todoList.findAllComponents(TodoItem)
  const activeEvent = createPointerEvent(7)

  todoItems[0].vm.$emit('dragStart', todoItems[0].props('todo').id, activeEvent)
  todoItems[1].vm.$emit('dragStart', todoItems[1].props('todo').id, createPointerEvent(8))

  expect(todoList.vm.dragSession).toEqual({
    todoId: todoItems[0].props('todo').id,
    pointerId: 7,
  })
})

test('Accept movement only from the active pointer', () => {
  const todoList = mount(TodoList)
  const todoItem = todoList.findComponent(TodoItem)
  const todoId = todoItem.props('todo').id

  todoItem.vm.$emit('dragStart', todoId, createPointerEvent(7))

  expect(todoList.vm.moveDrag(todoId, createPointerEvent(8))).toBe(false)
  expect(todoList.vm.moveDrag(todoId, createPointerEvent(7))).toBe(true)
})

test.each(['dragEnd', 'dragCancel'])(
  'Clear the session on active %s but ignore a foreign pointer',
  (dragEvent) => {
    const todoList = mount(TodoList)
    const todoItem = todoList.findComponent(TodoItem)
    const todoId = todoItem.props('todo').id

    todoItem.vm.$emit('dragStart', todoId, createPointerEvent(7))
    todoItem.vm.$emit(dragEvent, todoId, createPointerEvent(8))
    expect(todoList.vm.dragSession).not.toBeNull()

    todoItem.vm.$emit(dragEvent, todoId, createPointerEvent(7))
    expect(todoList.vm.dragSession).toBeNull()
  }
)
