<template>
  <time
    class="date-time-header"
    :datetime="dateTime"
  >
    <span class="date-time-header__date">
      <span class="date-time-header__day">{{ day }}</span>
      <span class="date-time-header__details">
        <span class="date-time-header__month">{{ month }}</span>
        <span class="date-time-header__weekday">{{ weekday }}</span>
      </span>
    </span>
    <span class="date-time-header__time">{{ formattedTime }}</span>
    <span
      class="date-time-header__dash"
      aria-hidden="true"
    />
    <span
      class="date-time-header__dot"
      aria-hidden="true"
    />
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
  align-items: start;
  min-width: 0;
  min-height: clamp(8rem, calc(3.84rem + 8.66vw), 12rem);
  padding: clamp(1.25rem, 2.1vw, 2rem) clamp(1.25rem, 6vw, 5rem);
}

.date-time-header__date {
  display: flex;
  align-items: stretch;
  column-gap: clamp(1rem, 2vw, 1.5rem);
  align-self: end;
  min-width: 0;
}

.date-time-header__dash {
  position: absolute;
  top: clamp(1.25rem, 2.1vw, 2rem);
  left: clamp(1.25rem, 6vw, 5rem);
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
  min-width: 0;
  font-size: clamp(1rem, 2vw, 1.5rem);
  line-height: 1.5;
  font-weight: 600;
}

.date-time-header__time {
  font-size: clamp(1.125rem, 2vw, 1.5rem);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  font-weight: 600;
}

.date-time-header__dot {
  position: absolute;
  right: clamp(1.25rem, 6vw, 5rem);
  bottom: clamp(1.25rem, 2.1vw, 2rem);
  width: 1rem;
  aspect-ratio: 1;
  border-radius: 50%;
  background: currentColor;
}

</style>
