<script setup lang='ts'>
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <HelloWorld />
</template>

<style>
html {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #081522;
  font-family: Aptos, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  height: 100%;
  background: #081522;
  overflow: hidden;
}

body,
#app {
  width: 100%;
  height: 100%;
}

#app {
  isolation: isolate;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}
</style>
