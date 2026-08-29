import { mount } from '@vue/test-utils'
import TodoItem from '@/components/TodoItem.vue'
import TodoList from '@/views/TodoList.vue'
import { expect, test, vi } from 'vitest'

const defaultTodoNames = [
  'Review pull request',
  'Update project notes',
  'Book dentist appointment',
  'Plan weekend trip',
  'Buy coffee beans',
]

function createPointerEvent(pointerId, clientX = 0, clientY = 0) {
  const event = new Event('pointermove')

  Object.defineProperty(event, 'pointerId', { value: pointerId })
  Object.defineProperty(event, 'clientX', { value: clientX })
  Object.defineProperty(event, 'clientY', { value: clientY })

  return event
}

function getTodoItems(todoList) {
  return todoList.findAllComponents(TodoItem).filter(todoItem => !todoItem.props('overlay'))
}

function getTodoNames(todoList) {
  return getTodoItems(todoList).map(todoItem => todoItem.props('todo').name)
}

function getAddForm(todoList) {
  return todoList.find('form[aria-label="Add task"]')
}

function getTodoList(todoList) {
  return todoList.find('section[aria-label="Todo list"] ul')
}

async function addTask(todoList, name) {
  const form = getAddForm(todoList)
  const input = form.find('input')

  await input.setValue(name)
  await form.trigger('submit')
}

function startDrag(todoList, index = 0, pointerId = 7, clientX = 30, clientY = 50) {
  const todoItem = getTodoItems(todoList)[index]
  const dragContainer = getTodoList(todoList).element
  const event = createPointerEvent(pointerId, clientX, clientY)
  const cardRect = {
    left: 10,
    top: 20 + index * 40,
    width: 300,
    height: 40,
  }

  dragContainer.setPointerCapture ??= vi.fn()
  todoItem.vm.$emit('dragStart', todoItem.props('todo').id, event, cardRect)

  return todoItem
}

test('Add a new task by submitting the form', async () => {
  const todoList = mount(TodoList)

  await addTask(todoList, 'feed the cat')

  expect(todoList.text()).toContain('feed the cat')
})

test('Complete the task', async () => {
  const todoList = mount(TodoList)
  await addTask(todoList, 'feed the cat')
  const todoItem = getTodoItems(todoList)
    .find(item => item.props('todo').name === 'feed the cat')
  const taskName = todoItem.find('.todo-item__name')

  expect(taskName.classes()).not.toContain('todo-item__name--completed')
  await todoItem.find('.todo-item__checkbox').trigger('change')
  expect(taskName.classes()).toContain('todo-item__name--completed')
})

test('Delete the task', async () => {
  const todoList = mount(TodoList)
  await addTask(todoList, 'feed the cat')
  const task = todoList
    .findAll('.todo-item')
    .filter(task => task.text().includes('feed the cat'))[0]

  expect(todoList.text()).toContain('feed the cat')

  await task.find('[aria-label="Todo actions"]').trigger('click')
  await task.find('.todo-item__edit').trigger('click')
  await task.find('[aria-label="Todo actions"]').trigger('click')
  expect(task.find('.todo-item__edit').exists()).toBe(false)
  const deleteButton = task.find('.todo-item__delete')
  await deleteButton.trigger('click')
  expect(todoList.text()).not.toContain('feed the cat')
})

test('Edit the selected task name', async () => {
  const todoList = mount(TodoList)
  const todoItems = getTodoItems(todoList)

  await todoItems[1].find('[aria-label="Todo actions"]').trigger('click')
  await todoItems[1].find('.todo-item__edit').trigger('click')
  const input = todoItems[1].find('.todo-item__name-input')
  await input.setValue('  take a walk  ')
  await input.trigger('keyup.enter')

  expect(getTodoNames(todoList)).toEqual([
    defaultTodoNames[0],
    'take a walk',
    ...defaultTodoNames.slice(2),
  ])
})

test('Keep one actions menu open and close it outside', async () => {
  const todoList = mount(TodoList, { attachTo: document.body })
  const todoItems = getTodoItems(todoList)

  await todoItems[0].find('[aria-label="Todo actions"]').trigger('click')
  expect(todoItems[0].find('.todo-item__actions-panel').exists()).toBe(true)

  await todoItems[1].find('[aria-label="Todo actions"]').trigger('click')
  expect(todoItems[0].find('.todo-item__actions-panel').exists()).toBe(false)
  expect(todoItems[1].find('.todo-item__actions-panel').exists()).toBe(true)

  document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
  await todoList.vm.$nextTick()
  expect(todoItems[1].find('.todo-item__actions-panel').exists()).toBe(false)
  todoList.unmount()
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

  const overlay = todoList.find('.todo-item--overlay')
  expect(overlay.exists()).toBe(true)
  expect(overlay.attributes('style')).toContain('translate3d(10px, 20px, 0)')
  expect(overlay.attributes('style')).toContain('width: 300px')
  expect(overlay.attributes('aria-hidden')).toBe('true')
  expect(overlay.attributes()).toHaveProperty('inert')
  expect(overlay.find('.todo-item__drag-handle').exists()).toBe(false)
  expect(overlay.find('.todo-item__checkbox').exists()).toBe(true)
  expect(overlay.find('.todo-item__name-input').exists()).toBe(false)
  expect(overlay.find('.todo-item__checkbox').element.tagName).toBe('INPUT')
  expect(overlay.find('[aria-label="Todo actions"]').exists()).toBe(false)
  expect(overlay.find('.todo-item__actions-toggle').element.tagName).toBe('SPAN')
  expect(overlay.find('.todo-item__actions-panel').exists()).toBe(false)
  expect(todoItem.classes()).toContain('todo-item--placeholder')
})

test('Move a todo down to the next position during drag', async () => {
  const todoList = mount(TodoList)
  startDrag(todoList)

  await getTodoList(todoList).trigger('pointermove', {
    pointerId: 7,
    clientX: 30,
    clientY: 111,
  })
  await todoList.vm.$nextTick()

  expect(getTodoNames(todoList)).toEqual([
    defaultTodoNames[1],
    defaultTodoNames[0],
    ...defaultTodoNames.slice(2),
  ])
})

test('Keep the live order after drag end', async () => {
  const todoList = mount(TodoList)
  startDrag(todoList)
  const dragContainer = getTodoList(todoList)

  await dragContainer.trigger('pointermove', { pointerId: 7, clientX: 30, clientY: 111 })
  await dragContainer.trigger('pointerup', { pointerId: 7 })
  await todoList.vm.$nextTick()

  expect(getTodoNames(todoList)).toEqual([
    defaultTodoNames[1],
    defaultTodoNames[0],
    ...defaultTodoNames.slice(2),
  ])
  expect(todoList.find('.todo-item--overlay').exists()).toBe(false)
})

test.each(['pointerup', 'pointercancel'])(
  'Clear the session on active %s but ignore a foreign pointer',
  async (pointerEvent) => {
    const todoList = mount(TodoList)
    const dragContainer = getTodoList(todoList)

    startDrag(todoList)
    await dragContainer.trigger(pointerEvent, { pointerId: 8 })
    await todoList.vm.$nextTick()
    expect(todoList.find('.todo-item--overlay').exists()).toBe(true)

    await dragContainer.trigger(pointerEvent, { pointerId: 7 })
    await todoList.vm.$nextTick()
    expect(todoList.find('.todo-item--overlay').exists()).toBe(false)
  }
)
