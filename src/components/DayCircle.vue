<template lang='pug'>
button.day-circle(
  :class="{ done }"
  @click="$emit('click')"
)
</template>

<script setup>
// Компонент "круг-день".
// При клике эмитит событие наверх.

const props = defineProps({
  done: Boolean
})
</script>

<style scoped>
.day-circle
  width: 28px
  height: 28px
  border-radius: 50%
  border: 2px solid #bbb
  background: none
  cursor: pointer
  transition: all 0.2s ease

.day-circle.done
  background: #8f0000
  border-color: #8f0000
</style>
