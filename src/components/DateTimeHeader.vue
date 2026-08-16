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
  </time>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long' })
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
  display: flex;
  justify-content: space-between;
  min-width: 0;
  font-family: "Montserrat";
  font-size: 0.5em;
}

.date-time-header__date {
  display: flex;
  column-gap: 1rem;
  min-width: 0;
}

.date-time-header__details {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.date-time-header__time {
  white-space: nowrap;
}
</style>
