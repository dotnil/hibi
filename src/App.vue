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
  font-family: "Inter";
  src: url('assets/inter-cyrillic.woff2') format("woff2");
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}

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
  font-family: "Urbanist", "Inter", sans-serif;
  width: 100%;
  min-width: 20rem;
  max-width: 100%;
  min-height: 100vh;
  color: #202020;
  box-sizing: border-box;
}

</style>
