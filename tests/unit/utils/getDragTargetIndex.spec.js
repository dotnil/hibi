import { expect, test } from 'vitest'
import { getDragTargetIndex } from '@/utils/getDragTargetIndex'

const geometry = {
  slotOriginTop: 0,
  slotStep: 40,
  itemCount: 5,
}

function getTargetIndex(currentIndex, draggedTop) {
  return getDragTargetIndex({ currentIndex, draggedTop, ...geometry })
}

test('Keep the current index exactly at the next center', () => {
  expect(getTargetIndex(1, 80)).toBe(1)
})

test('Move down after crossing the next center', () => {
  expect(getTargetIndex(1, 81)).toBe(2)
})

test('Move down through several positions', () => {
  expect(getTargetIndex(0, 161)).toBe(4)
})

test('Keep the current index exactly at the previous center', () => {
  expect(getTargetIndex(1, 0)).toBe(1)
})

test('Move up after crossing the previous center', () => {
  expect(getTargetIndex(1, -1)).toBe(0)
})

test('Move up through several positions', () => {
  expect(getTargetIndex(4, -1)).toBe(0)
})

test('Reverse only after crossing the previous center of the updated index', () => {
  const movedDownIndex = getTargetIndex(1, 81)

  expect(movedDownIndex).toBe(2)
  expect(getTargetIndex(movedDownIndex, 40)).toBe(2)
  expect(getTargetIndex(movedDownIndex, 39)).toBe(1)
})

test('Limit the result to the first index', () => {
  expect(getTargetIndex(2, -1000)).toBe(0)
})

test('Limit the result to the last index', () => {
  expect(getTargetIndex(2, 1000)).toBe(4)
})

test('Use the provided slot step', () => {
  expect(getDragTargetIndex({
    currentIndex: 1,
    draggedTop: 141,
    slotOriginTop: 0,
    slotStep: 56,
    itemCount: 4,
  })).toBe(2)
})
