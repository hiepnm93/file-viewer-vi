<script setup lang="ts">
defineProps<{
  type: string,
  title: string,
  pages: Array<{ title: string; blocks: string[] }>
}>()
</script>

<template>
  <div class="odf-viewer">
    <section class="odf-shell">
      <header>
        <span>{{ type.toUpperCase() }}</span>
        <h2>{{ title }}</h2>
      </header>
      <article v-for="(page, index) in pages" :key="index" class="odf-page">
        <h3>{{ page.title }}</h3>
        <p v-for="(block, blockIndex) in page.blocks" :key="blockIndex">{{ block }}</p>
      </article>
    </section>
  </div>
</template>

<style scoped>
.odf-viewer {
  min-height: 100%;
  padding: 28px;
  overflow: auto;
  background: #dfe5eb;
}

.odf-shell {
  width: min(100%, 980px);
  margin: 0 auto;
}

.odf-shell > header {
  margin-bottom: 18px;
  padding: 18px 22px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.1);
}

.odf-shell > header span {
  color: #0f766e;
  font-size: 12px;
  font-weight: 800;
}

.odf-shell > header h2 {
  margin: 6px 0 0;
  color: #132235;
  font-size: 24px;
}

.odf-page {
  min-height: 360px;
  margin: 0 auto 18px;
  padding: 42px 48px;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 16px 38px rgba(15, 23, 42, 0.12);
  color: #1f2937;
}

.odf-page h3 {
  margin: 0 0 20px;
  color: #334155;
  font-size: 18px;
}

.odf-page p {
  margin: 0 0 12px;
  font-size: 15px;
  line-height: 1.85;
  white-space: pre-wrap;
}
</style>
