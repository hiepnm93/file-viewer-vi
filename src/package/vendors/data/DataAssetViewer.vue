<script setup lang="ts">
const props = defineProps<{
  title: string,
  type: string,
  summary: Array<{ label: string; value: string }>,
  rows?: Array<Record<string, unknown>>,
  text?: string,
  image?: string,
  fontFamily?: string
}>()

const sampleText = 'Flyfish Viewer 轻量预览 AaBbCc 1234567890'
</script>

<template>
  <div class="data-viewer">
    <section class="data-card">
      <header class="data-header">
        <span>{{ type.toUpperCase() }}</span>
        <h2>{{ title }}</h2>
      </header>
      <div class="data-summary">
        <div v-for="item in summary" :key="item.label">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </div>
      </div>
      <div v-if="fontFamily" class="font-preview" :style="{ fontFamily }">
        {{ sampleText }}
      </div>
      <div v-if="image" class="asset-image">
        <img :src="image" alt="资产预览" />
      </div>
      <pre v-if="text" class="asset-text">{{ text }}</pre>
      <div v-if="rows?.length" class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th v-for="key in Object.keys(rows[0])" :key="key">{{ key }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
              <td v-for="key in Object.keys(rows[0])" :key="key">{{ String(row[key] ?? '') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.data-viewer {
  min-height: 100%;
  padding: 28px;
  background: #eef1f4;
  color: #132235;
}

.data-card {
  max-width: 1080px;
  margin: 0 auto;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.12);
}

.data-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.data-header span {
  color: #0f766e;
  font-size: 12px;
  font-weight: 800;
}

.data-header h2 {
  margin: 6px 0 0;
  font-size: 24px;
}

.data-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1px;
  background: rgba(15, 23, 42, 0.08);
}

.data-summary div {
  min-width: 0;
  padding: 15px 18px;
  background: #f8fafc;
}

.data-summary span {
  display: block;
  color: #64748b;
  font-size: 12px;
}

.data-summary strong {
  display: block;
  margin-top: 5px;
  overflow: hidden;
  color: #132235;
  font-size: 15px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.font-preview {
  padding: 34px 28px;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
  font-size: 42px;
  line-height: 1.45;
  word-break: break-word;
}

.asset-image {
  padding: 24px;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
  background: #f8fafc;
  text-align: center;
}

.asset-image img {
  max-width: 100%;
  max-height: 70vh;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.16);
}

.asset-text {
  margin: 0;
  padding: 18px 24px;
  overflow: auto;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
  background: #111827;
  color: #e5e7eb;
  font-size: 13px;
  line-height: 1.7;
}

.data-table-wrap {
  max-height: 520px;
  overflow: auto;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table th,
.data-table td {
  max-width: 260px;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.data-table th {
  position: sticky;
  top: 0;
  background: #f8fafc;
  color: #64748b;
  z-index: 1;
}
</style>
