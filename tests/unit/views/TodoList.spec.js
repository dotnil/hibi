import { mount } from '@vue/test-utils'
import TodoList from '@/views/TodoList.vue'
import { expect, test } from 'vitest'

import { Crypto } from '@peculiar/webcrypto'
Object.defineProperty(globalThis, 'crypto', {
  value: new Crypto(),
  configurable: true
})

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
