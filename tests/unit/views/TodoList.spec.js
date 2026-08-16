import { mount } from '@vue/test-utils'
import { TransitionGroup } from 'vue'
import DateTimeHeader from '@/components/DateTimeHeader.vue'
import TodoItem from '@/components/TodoItem.vue'
import TodoList from '@/views/TodoList.vue'
import { expect, test, vi } from 'vitest'

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

test('Render the date and time header without the editable title', () => {
  const todoList = mount(TodoList)
  const header = todoList.find('header')

  expect(header.findComponent(DateTimeHeader).exists()).toBe(true)
  expect(todoList.find('.todo-list__title').exists()).toBe(false)
})

test('Add a new task by submitting the form', async () => {
  const todoList = mount(TodoList)

  await addTask(todoList, 'feed the cat')

  expect(todoList.text()).toContain('feed the cat')
})

test('Render keyed todos inside the list transition group', () => {
  const todoList = mount(TodoList)
  const transitionGroup = todoList.findComponent(TransitionGroup)

  expect(transitionGroup.exists()).toBe(true)
  expect(transitionGroup.props('name')).toBe('todo-list')
  expect(getTodoList(todoList).element.tagName).toBe('UL')
  expect(transitionGroup.findAllComponents(TodoItem)).toHaveLength(2)
  expect(todoList.find('.todo-item_overlay').exists()).toBe(false)
})

test('Complete the task', async () => {
  const todoList = mount(TodoList)
  await addTask(todoList, 'feed the cat')
  const todoItem = getTodoItems(todoList)
    .find(item => item.props('todo').name === 'feed the cat')
  const taskName = todoItem.find('.todo-item__name')

  expect(taskName.classes()).not.toContain('todo-item__name_completed')
  await todoItem.find('.todo-item__checkbox').trigger('change')
  expect(taskName.classes()).toContain('todo-item__name_completed')
})

test('Delete the task', async () => {
  const todoList = mount(TodoList)
  await addTask(todoList, 'feed the cat')
  const task = todoList
    .findAll('.todo-item')
    .filter(task => task.text().includes('feed the cat'))[0]

  expect(todoList.text()).toContain('feed the cat')
 
  const deleteButton = task.find('.todo-item__delete')
  await deleteButton.trigger('click')
  expect(todoList.text()).not.toContain('feed the cat')
})

test('Edit the selected task name', async () => {
  const todoList = mount(TodoList)
  const todoItems = getTodoItems(todoList)

  await todoItems[1].find('.todo-item__edit').trigger('click')
  const input = todoItems[1].find('.todo-item__name-input')
  await input.setValue('  take a walk  ')
  await input.trigger('keyup.enter')

  expect(getTodoNames(todoList)).toEqual(['function', 'take a walk'])
})

test('Start one drag session with todo and pointer identity', () => {
  const todoList = mount(TodoList)
  const dragContainer = getTodoList(todoList).element
  dragContainer.setPointerCapture = vi.fn()
  const todoItem = startDrag(todoList)

  expect(dragContainer.setPointerCapture).toHaveBeenCalledWith(7)
  expect(todoList.vm.dragSession).toEqual({
    todoId: todoItem.props('todo').id,
    pointerId: 7,
    pointerOffsetX: 20,
    pointerOffsetY: 30,
    left: 10,
    top: 20,
    width: 300,
    height: 40,
    slotOriginTop: 20,
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
  expect(overlay.attributes()).toHaveProperty('inert')
  expect(overlay.find('.todo-item__drag-handle').exists()).toBe(false)
  expect(overlay.find('.todo-item__delete').exists()).toBe(true)
  expect(overlay.find('.todo-item__checkbox').exists()).toBe(true)
  expect(overlay.find('.todo-item__edit').exists()).toBe(true)
  expect(overlay.find('.todo-item__name-input').exists()).toBe(false)
  expect(overlay.find('.todo-item__checkbox').element.tagName).toBe('INPUT')
  expect(overlay.find('.todo-item__edit').element.tagName).toBe('BUTTON')
  expect(todoItem.classes()).toContain('todo-item_placeholder')
})

test('Move the overlay with the active pointer while preserving the grab point', async () => {
  const todoList = mount(TodoList)
  startDrag(todoList)

  await getTodoList(todoList).trigger('pointermove', {
    pointerId: 7,
    clientX: 80,
    clientY: 100,
  })
  await todoList.vm.$nextTick()

  expect(todoList.find('.todo-item_overlay').attributes('style'))
    .toContain('translate3d(60px, 70px, 0)')
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

  expect(getTodoNames(todoList)).toEqual(['take a rest', 'function'])
})

test('Move a todo up to the previous position during drag', async () => {
  const todoList = mount(TodoList)
  startDrag(todoList, 1, 7, 30, 90)

  await getTodoList(todoList).trigger('pointermove', {
    pointerId: 7,
    clientX: 30,
    clientY: 29,
  })
  await todoList.vm.$nextTick()

  expect(getTodoNames(todoList)).toEqual(['take a rest', 'function'])
})

test('Move a todo through several positions in one pointer move', async () => {
  const todoList = mount(TodoList)
  await addTask(todoList, 'third')
  await addTask(todoList, 'fourth')
  startDrag(todoList)

  await getTodoList(todoList).trigger('pointermove', {
    pointerId: 7,
    clientX: 30,
    clientY: 191,
  })
  await todoList.vm.$nextTick()

  expect(getTodoNames(todoList)).toEqual(['take a rest', 'third', 'fourth', 'function'])
})

test('Reverse a previous live reorder after crossing the opposite boundary', async () => {
  const todoList = mount(TodoList)
  startDrag(todoList)
  const dragContainer = getTodoList(todoList)

  await dragContainer.trigger('pointermove', { pointerId: 7, clientX: 30, clientY: 111 })
  await dragContainer.trigger('pointermove', { pointerId: 7, clientX: 30, clientY: 49 })
  await todoList.vm.$nextTick()

  expect(getTodoNames(todoList)).toEqual(['function', 'take a rest'])
  expect(todoList.find('.todo-item_overlay').attributes('style'))
    .toContain('translate3d(10px, 19px, 0)')
})

test('Do not reorder when the dragged center is exactly at the boundary', async () => {
  const todoList = mount(TodoList)
  startDrag(todoList)

  await getTodoList(todoList).trigger('pointermove', {
    pointerId: 7,
    clientX: 30,
    clientY: 90,
  })
  await todoList.vm.$nextTick()

  expect(getTodoNames(todoList)).toEqual(['function', 'take a rest'])
})

test('Do not move the overlay for a foreign pointer', async () => {
  const todoList = mount(TodoList)
  startDrag(todoList)

  await getTodoList(todoList).trigger('pointermove', {
    pointerId: 8,
    clientX: 80,
    clientY: 100,
  })
  await todoList.vm.$nextTick()

  expect(todoList.find('.todo-item_overlay').attributes('style'))
    .toContain('translate3d(10px, 20px, 0)')
  expect(getTodoNames(todoList)).toEqual(['function', 'take a rest'])
})

test('Keep the live order after drag end', async () => {
  const todoList = mount(TodoList)
  startDrag(todoList)
  const dragContainer = getTodoList(todoList)

  await dragContainer.trigger('pointermove', { pointerId: 7, clientX: 30, clientY: 111 })
  await dragContainer.trigger('pointerup', { pointerId: 7 })
  await todoList.vm.$nextTick()

  expect(getTodoNames(todoList)).toEqual(['take a rest', 'function'])
  expect(todoList.find('.todo-item_overlay').exists()).toBe(false)
})

test.each(['pointerup', 'pointercancel'])(
  'Clear the session on active %s but ignore a foreign pointer',
  async (pointerEvent) => {
    const todoList = mount(TodoList)
    const dragContainer = getTodoList(todoList)

    startDrag(todoList)
    await dragContainer.trigger(pointerEvent, { pointerId: 8 })
    await todoList.vm.$nextTick()
    expect(todoList.find('.todo-item_overlay').exists()).toBe(true)

    await dragContainer.trigger(pointerEvent, { pointerId: 7 })
    await todoList.vm.$nextTick()
    expect(todoList.find('.todo-item_overlay').exists()).toBe(false)
  }
)

test('Ignore pointer movement dispatched by another todo card', async () => {
  const todoList = mount(TodoList)
  const todoItems = getTodoItems(todoList)

  startDrag(todoList)
  await todoItems[1].trigger('pointermove', {
    pointerId: 7,
    clientX: 30,
    clientY: 111,
  })
  await todoList.vm.$nextTick()

  expect(getTodoNames(todoList)).toEqual(['function', 'take a rest'])
  expect(todoList.find('.todo-item_overlay').attributes('style'))
    .toContain('translate3d(10px, 20px, 0)')
})
