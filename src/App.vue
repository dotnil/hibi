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
  font-family: "Urbanist";
  src: url('assets/urbanist-regular.woff2') format("woff2");
}

@font-face {
  font-family: "Libre Bodoni";
  src: url('assets/libre-bodoni-regular.woff2') format("woff2");
  font-style: normal;
  font-weight: 400;
  font-display: swap;
}

body {
  margin: 0;
}

.app {
  font-family: "Urbanist";
  width: 100%;
  min-width: 0;
  max-width: 100%;
  min-height: 100vh;
  color: #202020;
  box-sizing: border-box;
}

</style>
