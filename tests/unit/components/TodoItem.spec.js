import { mount } from '@vue/test-utils'
import TodoItem from '@/components/TodoItem.vue'
import { expect, test } from 'vitest'

test('Render value', () => {
  const wrapper = mount(
    TodoItem, { props: { todo: { id: '1', name: 'buy milk', done: true } } }
  )

  expect(wrapper.text()).toContain('buy milk')
})

test('Emit @toggleTask', async () => {
  const todo = { id: '1', name: 'buy milk', done: false }
  const todoItem = mount(TodoItem, { props: { todo } })

  await todoItem.find('.todo-item__name').trigger('click')

  expect(todoItem.emitted('toggleTask')).toEqual([[todo.id]])
})
