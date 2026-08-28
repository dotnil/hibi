<template>
  <time
    :class="[
      'date-time-header',
      { 'date-time-header--collapsed': isCollapsed }
    ]"
    :datetime="dateTime"
  >
    <span
      v-show="!isCollapsed"
      class="date-time-header__date"
    >
      <span class="date-time-header__day">{{ day }}</span>
      <span class="date-time-header__details">
        <span class="date-time-header__month">{{ month }}</span>
        <span class="date-time-header__weekday">{{ weekday }}</span>
      </span>
    </span>
    <span
      v-show="!isCollapsed"
      class="date-time-header__time"
    >{{ formattedTime }}</span>
    <span
      class="date-time-header__dash"
      aria-hidden="true"
    />
    <button
      class="date-time-header__toggle"
      type="button"
      :aria-expanded="!isCollapsed"
      :aria-label="isCollapsed ? 'Show date and time' : 'Hide date and time'"
      @click="isCollapsed = !isCollapsed"
    >
      <span class="date-time-header__toggle-label">
        {{ isCollapsed ? 'Show' : 'Hide' }}
      </span>
      <span
        class="date-time-header__dot"
        aria-hidden="true"
      />
    </button>
  </time>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short' })
const weekdayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long' })
const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})
const now = ref(new Date())
const isCollapsed = ref(false)
let minuteTimeout
let minuteInterval

const day = computed(() => String(now.value.getDate()).padStart(2, '0'))
const month = computed(() => monthFormatter.format(now.value))
const weekday = computed(() => weekdayFormatter.format(now.value))
const formattedTime = computed(() => timeFormatter.format(now.value))
const dateTime = computed(() => now.value.toISOString())

function updateNow() {
  now.value = new Date()
}

minuteTimeout = window.setTimeout(() => {
  updateNow()
  minuteInterval = window.setInterval(updateNow, 60_000)
}, 60_000 - (now.value.getSeconds() * 1000 + now.value.getMilliseconds()))

onBeforeUnmount(() => {
  window.clearTimeout(minuteTimeout)
  window.clearInterval(minuteInterval)
})
</script>

<style>
.date-time-header {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  min-height: clamp(8rem, calc(3.84rem + 8.66vw), 12rem);
  padding: var(--header-inset) var(--header-gutter);
  box-sizing: border-box;
  color: #cecece;
  transition: min-height 180ms ease;
}

.date-time-header--collapsed {
  min-height: calc(2 * var(--header-inset) + 1rem);
}

.date-time-header__date {
  display: flex;
  column-gap: clamp(1rem, 2vw, 1.5rem);
  align-self: end;
  min-width: 0;
}

.date-time-header__dash {
  position: absolute;
  top: var(--header-inset);
  left: var(--header-gutter);
  width: 1rem;
  height: 0.125rem;
  background: currentColor;
}

.date-time-header__day {
  font-family: "Libre Bodoni", serif;
  font-size: clamp(5rem, 10vw, 6.5rem);
  font-weight: 400;
  line-height: 0.8;
}

.date-time-header__details {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  font-size: clamp(1rem, 2vw, 1.5rem);
  font-weight: 600;
}

.date-time-header__time {
  align-self: start;
  font-size: clamp(1.125rem, 2vw, 1.5rem);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  font-weight: 600;
}

.date-time-header__toggle {
  position: absolute;
  right: var(--header-gutter);
  bottom: var(--header-inset);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 4rem;
  height: 2rem;
  padding: 0 0.25rem;
  border: 1px solid transparent;
  background: transparent;
  color: inherit;
  cursor: pointer;
  transform: translate(0.5rem, 0.5rem);
}

.date-time-header__toggle:hover {
  border-color: #cecece;
  border-radius: 20px;
}

.date-time-header__toggle:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 0.2rem;
}

.date-time-header__toggle-label {
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 600;
}

.date-time-header__dot {
  width: 1rem;
  aspect-ratio: 1;
  border-radius: 50%;
  background: currentColor;
}

@media (prefers-reduced-motion: reduce) {
  .date-time-header {
    transition: none;
  }
}

</style>
