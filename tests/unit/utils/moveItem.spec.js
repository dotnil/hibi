import { expect, test } from 'vitest'
import { moveItem } from '@/utils/moveItem'

test('Move an item down to the next position', () => {
  expect(moveItem(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c'])
})

test('Move an item up to the previous position', () => {
  expect(moveItem(['a', 'b', 'c'], 2, 1)).toEqual(['a', 'c', 'b'])
})

test('Move an item down through several positions', () => {
  expect(moveItem(['a', 'b', 'c', 'd'], 0, 3)).toEqual(['b', 'c', 'd', 'a'])
})

test('Move an item up through several positions', () => {
  expect(moveItem(['a', 'b', 'c', 'd'], 3, 0)).toEqual(['d', 'a', 'b', 'c'])
})

test('Keep the same content when the position does not change', () => {
  expect(moveItem(['a', 'b', 'c'], 1, 1)).toEqual(['a', 'b', 'c'])
})

test('Do not mutate the input array', () => {
  const items = ['a', 'b', 'c']

  moveItem(items, 0, 2)

  expect(items).toEqual(['a', 'b', 'c'])
})
