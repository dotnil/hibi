<template lang='pug'>
.app
  router-view
</template>

<script setup>
// Корневой компонент — просто "контейнер"
// Здесь рендерится текущая страница
</script>

<style>
@font-face
  font-family: "Montserrat"
  src: url('@/assets/montserrat-regular.woff2') format("woff2")

@font-face
  font-family: "Vensfolk"
  src: url('@/assets/vensfolk.otf') format('opentype')

body
  margin: 0
  background: linear-gradient(35deg, #fdfcfb 0%, #e2d1c3 100%)
  font-family: "Montserrat"

.app
  min-height: 100vh
  box-sizing: border-box
  color: #2c3e50
</style>
