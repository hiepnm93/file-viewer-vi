<script setup lang='ts'>
import { marked } from 'marked'
import { computed } from 'vue'
import 'github-markdown-css/github-markdown.css'

const props = defineProps<{
  data: string
}>()

const html = computed(() => {
  return marked(props.data)
})
</script>

<template>
  <div class='markdown-body' v-html='html' />
</template>

<style scoped>
.markdown-body {
    background: white;
    border: 0.5px solid lightgrey;
    margin: 35px auto;
    box-sizing: border-box;
    min-width: 200px;
    max-width: 980px;
    padding: 45px;
}

@media (max-width: 767px) {
    .markdown-body {
        padding: 15px;
    }
}

</style>
