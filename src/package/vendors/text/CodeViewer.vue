<script setup lang='ts'>
defineProps<{
  // 值
  value: string
}>()
</script>

<template>
  <pre class="code-area">
    {{ value }}
  </pre>
</template>

<style scoped>
.code-area {
  display: block;
  margin: 0 auto;
  font-size: 12px;
  width: 1000px;
  min-height: 500px;
  background: #1f1f1f;
  word-break: break-word;
  white-space: break-spaces;
  color: #5af117
}
</style>
