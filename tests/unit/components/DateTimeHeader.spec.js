import { mount } from '@vue/test-utils'
import DateTimeHeader from '@/components/DateTimeHeader.vue'
import { afterEach, expect, test, vi } from 'vitest'

afterEach(() => {
  vi.useRealTimers()
})

test('Render the current English date, time, and ISO datetime', () => {
  vi.useFakeTimers()
  const now = new Date(2026, 7, 6, 14, 24, 42)
  vi.setSystemTime(now)

  const header = mount(DateTimeHeader)

  expect(header.text()).toContain('06')
  expect(header.text()).toContain('Aug')
  expect(header.text()).toContain('Thursday')
  expect(header.text()).toContain('14:24')
  expect(header.text()).not.toMatch(/AM|PM/)
  expect(header.attributes('datetime')).toBe(now.toISOString())
})

test('Update at the next minute boundary', async () => {
  vi.useFakeTimers()
  const now = new Date('2026-08-16T14:37:42.500Z')
  vi.setSystemTime(now)
  const header = mount(DateTimeHeader)
  const nextMinute = new Date('2026-08-16T14:38:00.000Z')

  await vi.advanceTimersByTimeAsync(17_500)

  expect(header.attributes('datetime')).toBe(nextMinute.toISOString())
  expect(header.text()).toContain(new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(nextMinute))
})

test('Clear timers on unmount', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-08-16T14:37:42.500Z'))
  const header = mount(DateTimeHeader)

  expect(vi.getTimerCount()).toBe(1)
  header.unmount()
  expect(vi.getTimerCount()).toBe(0)
})
