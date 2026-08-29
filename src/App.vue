<template>
  <TodoList />
</template>

<script setup>
import TodoList from '@/pages/TodoList.vue'
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
  min-height: 100vh;
  min-height: 100dvh;
  margin: 0;
  padding: clamp(2.5rem, 6vw, 5rem);
  box-sizing: border-box;
  display: flex;
  background-color: #202020;
  background-image: url('./assets/paper-grain.svg');
  background-repeat: repeat;
  color: #f2f2f2;
}

#app {
  font-family: "Urbanist", "Inter", sans-serif;
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  max-width: 1254px;
  margin-inline: auto;
  border: 4px solid rgba(206, 206, 206, 0.75);
  color: #1e1e1e;
  box-sizing: border-box;
}

@media (min-width: 48rem) {
  #app {
    min-width: 400px;
  }
}

@media (max-width: 47.999rem) {
  body {
    padding: 0;
  }
}

</style>
