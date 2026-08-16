<template>
  <time
    class="date-time-header"
    :datetime="dateTime"
  >
    <span>{{ formattedDate }}</span>
    <span>{{ formattedTime }}</span>
  </time>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})
const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
})
const now = ref(new Date())
let minuteTimeout
let minuteInterval

const formattedDate = computed(() => dateFormatter.format(now.value))
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
  font-family: "Montserrat";
  font-size: 0.5em;
}
</style>
