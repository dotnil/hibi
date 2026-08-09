<template>
  <main class="app">
    <TodoList />
  </main>
</template>

<script setup>
import TodoList from '@/views/TodoList.vue'
</script>

<style>
@font-face {
  font-family: "Montserrat";
  src: url('assets/montserrat-regular.woff2') format("woff2");
}

@font-face {
  font-family: "Vensfolk";
  src: url('assets/vensfolk.otf') format('opentype');
}

body {
  margin: 0;
  background-image: linear-gradient(35deg, #fdfcfb 0%, #e2d1c3 100%);
}

.app {
  font-family: "Montserrat";
  min-height: 100vh;
  color: #2c3e50;
  box-sizing: border-box;
}

</style>
