<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { formatBytes } from '@/package/vendors/archive/shared'
import { parseEdaFile, type EdaParseResult, type EdaStreamView } from './parser'

const props = defineProps<{
  data: ArrayBuffer;
  type: string;
  filename: string;
}>()

const parsed = ref<EdaParseResult | null>(null)
const loading = ref(true)
const error = ref('')
const selectedStream = ref<EdaStreamView | null>(null)
const filterText = ref('')

const filteredStreams = computed(() => {
  const keyword = filterText.value.trim().toLowerCase()
  const streams = parsed.value?.streams || []
  if (!keyword) {
    return streams
  }
  return streams.filter(stream => stream.path.toLowerCase().includes(keyword))
})

const parseFile = async () => {
  loading.value = true
  error.value = ''
  try {
    const nextParsed = await parseEdaFile(props.data, props.type)
    parsed.value = nextParsed
    selectedStream.value = nextParsed.streams.find(stream => stream.kind === 'text') || nextParsed.streams[0] || null
  } catch (nextError) {
    console.error(nextError)
    error.value = nextError instanceof Error ? nextError.message : String(nextError)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void parseFile()
})
</script>

<template>
  <section class="eda-viewer">
    <header class="eda-header">
      <div>
        <span>{{ parsed?.parser === 'cfb' ? 'CFB INSPECTOR' : 'BINARY INSPECTOR' }}</span>
        <h2>{{ filename }}</h2>
      </div>
      <dl v-if="parsed">
        <div>
          <dt>格式</dt>
          <dd>{{ parsed.type.toUpperCase() }}</dd>
        </div>
        <div>
          <dt>大小</dt>
          <dd>{{ formatBytes(parsed.byteLength) }}</dd>
        </div>
        <div>
          <dt>条目</dt>
          <dd>{{ parsed.streamCount }}</dd>
        </div>
      </dl>
    </header>

    <div v-if="parsed" class="eda-body">
      <aside class="eda-sidebar">
        <div class="eda-summary">
          <strong>{{ parsed.title }}</strong>
          <p>OLB / DRA 在线预览以结构、属性和可读字符串为主，复杂电气规则仍建议在 OrCAD / Allegro 中编辑。</p>
        </div>

        <div v-if="parsed.warnings.length" class="eda-warning">
          <p v-for="warning in parsed.warnings" :key="warning">{{ warning }}</p>
        </div>

        <input v-model="filterText" class="eda-search" type="search" placeholder="筛选内部条目" />

        <div class="eda-stream-list">
          <button
            v-for="stream in filteredStreams"
            :key="stream.path"
            type="button"
            class="eda-stream"
            :class="{ active: selectedStream?.path === stream.path }"
            @click="selectedStream = stream"
          >
            <span>{{ stream.kind }}</span>
            <strong>{{ stream.name || stream.path }}</strong>
            <em>{{ stream.path }}</em>
            <small>{{ formatBytes(stream.size) }}</small>
          </button>
        </div>
      </aside>

      <main class="eda-preview">
        <section class="eda-card">
          <div class="eda-card-head">
            <span>内部条目</span>
            <strong>{{ selectedStream?.path || '未选择' }}</strong>
          </div>
          <pre v-if="selectedStream?.sample">{{ selectedStream.sample }}</pre>
          <div v-else class="eda-empty">
            <strong>二进制条目</strong>
            <p>该条目没有可安全展示的文本片段，已保留大小和路径信息。</p>
          </div>
        </section>

        <section class="eda-card">
          <div class="eda-card-head">
            <span>可读字符串</span>
            <strong>{{ parsed.strings.length }} 项</strong>
          </div>
          <div class="eda-string-grid">
            <span v-for="item in parsed.strings" :key="item">{{ item }}</span>
          </div>
        </section>
      </main>
    </div>

    <div v-if="loading" class="eda-state">
      <span />
      <strong>正在解析 {{ type.toUpperCase() }}...</strong>
    </div>

    <div v-if="error" class="eda-error">
      <strong>EDA 预览提示</strong>
      <p>{{ error }}</p>
    </div>
  </section>
</template>

<style scoped>
.eda-viewer {
  position: relative;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #eef2f6;
  color: #172033;
}

.eda-header {
  min-height: 84px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 22px;
  border-bottom: 1px solid rgba(23, 32, 51, 0.08);
  background: #ffffff;
}

.eda-header span,
.eda-card-head span {
  color: #0d7884;
  font-size: 12px;
  font-weight: 900;
}

.eda-header h2 {
  margin: 4px 0 0;
  font-size: 22px;
  line-height: 1.2;
}

.eda-header dl {
  display: grid;
  grid-template-columns: repeat(3, minmax(72px, auto));
  gap: 10px;
  margin: 0;
}

.eda-header dt,
.eda-header dd {
  margin: 0;
}

.eda-header dt {
  color: #718096;
  font-size: 12px;
}

.eda-header dd {
  color: #172033;
  font-weight: 900;
}

.eda-body {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(280px, 34%) minmax(0, 1fr);
}

.eda-sidebar {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-right: 1px solid rgba(23, 32, 51, 0.08);
  background: rgba(255, 255, 255, 0.7);
}

.eda-summary,
.eda-warning,
.eda-card,
.eda-error {
  border-radius: 14px;
  background: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(23, 32, 51, 0.06);
}

.eda-summary,
.eda-warning {
  padding: 12px;
}

.eda-summary strong {
  display: block;
  color: #172033;
}

.eda-summary p,
.eda-warning p,
.eda-empty p {
  margin: 6px 0 0;
  color: #64748b;
  line-height: 1.55;
}

.eda-warning {
  background: #fff7e8;
  color: #8a4b00;
}

.eda-search {
  height: 42px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid rgba(23, 32, 51, 0.1);
  outline: none;
  font: inherit;
}

.eda-stream-list {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.eda-stream {
  min-height: 72px;
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  padding: 10px;
  border: 1px solid rgba(23, 32, 51, 0.08);
  border-radius: 13px;
  background: #ffffff;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.eda-stream:hover,
.eda-stream.active {
  border-color: rgba(13, 120, 132, 0.28);
  box-shadow: 0 10px 22px rgba(23, 32, 51, 0.08);
}

.eda-stream span {
  grid-row: span 2;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(13, 120, 132, 0.12);
  color: #0d7884;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
}

.eda-stream strong,
.eda-stream em {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.eda-stream em,
.eda-stream small {
  color: #718096;
  font-size: 12px;
  font-style: normal;
}

.eda-preview {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: minmax(220px, 1fr) minmax(180px, 40%);
  gap: 14px;
  padding: 16px;
  overflow: auto;
}

.eda-card {
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.eda-card-head {
  min-height: 54px;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(23, 32, 51, 0.08);
}

.eda-card-head strong {
  display: block;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.eda-card pre {
  flex: 1;
  min-height: 0;
  margin: 0;
  overflow: auto;
  padding: 16px;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.eda-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
}

.eda-string-grid {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  align-content: start;
  gap: 8px;
  padding: 14px;
}

.eda-string-grid span {
  min-width: 0;
  padding: 8px 10px;
  border-radius: 10px;
  background: #f6f9fb;
  color: #334155;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.eda-state {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(238, 242, 246, 0.9);
}

.eda-state span {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: 3px solid rgba(13, 120, 132, 0.16);
  border-top-color: #0d7884;
  animation: eda-spin 0.9s linear infinite;
}

.eda-error {
  position: absolute;
  right: 18px;
  bottom: 18px;
  width: min(440px, calc(100% - 36px));
  padding: 14px;
  background: #fff7e8;
  color: #8a4b00;
}

@keyframes eda-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 860px) {
  .eda-header,
  .eda-body {
    grid-template-columns: 1fr;
  }

  .eda-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .eda-body {
    display: flex;
    flex-direction: column;
  }

  .eda-sidebar {
    max-height: 42vh;
    border-right: 0;
    border-bottom: 1px solid rgba(23, 32, 51, 0.08);
  }
}
</style>
