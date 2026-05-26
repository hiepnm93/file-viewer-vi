<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { formatBytes } from '@/package/vendors/archive/shared'
import {
  parseEdaFile,
  type EdaDomainRole,
  type EdaEntity,
  type EdaParseResult,
  type EdaStreamView,
  type EdaTreeNode
} from './parser'

const props = defineProps<{
  data: ArrayBuffer;
  type: string;
  filename: string;
}>()

interface TreeRow extends EdaTreeNode {
  depth: number;
}

const parsed = ref<EdaParseResult | null>(null)
const loading = ref(true)
const error = ref('')
const selectedStream = ref<EdaStreamView | null>(null)
const filterText = ref('')

const roleLabels: Record<EdaDomainRole, string> = {
  root: '根',
  library: '库',
  symbol: '元件符号',
  footprint: '封装',
  padstack: 'Padstack',
  drawing: '图纸',
  metadata: '元数据',
  property: '属性',
  geometry: '几何',
  net: '网络',
  unknown: '未知'
}

const confidenceLabels: Record<EdaParseResult['stats']['confidence'], string> = {
  high: '高',
  medium: '中',
  low: '低'
}

const roleLabel = (role: EdaDomainRole) => roleLabels[role] || role

const kindLabel = (kind: EdaStreamView['kind']) => {
  return kind === 'storage' ? '目录' : kind === 'text' ? '文本' : '二进制'
}

const normalizePath = (value: string) => value.replace(/^\/+/, '').toLowerCase()

const statsCards = computed(() => {
  if (!parsed.value) {
    return []
  }
  const stats = parsed.value.stats
  return [
    { label: '文本流', value: stats.textStreams },
    { label: '二进制流', value: stats.binaryStreams },
    { label: '目录', value: stats.storageEntries },
    { label: '属性', value: stats.propertyCount },
    { label: '符号', value: stats.symbolCount },
    { label: '封装', value: stats.footprintCount },
    { label: 'Padstack', value: stats.padstackCount },
    { label: '可信度', value: confidenceLabels[stats.confidence] }
  ]
})

const entityGroups = computed(() => {
  const entities = parsed.value?.entities || []
  const groups: Array<{ role: EdaDomainRole; label: string; items: EdaEntity[] }> = [
    { role: 'symbol', label: '元件符号', items: [] },
    { role: 'footprint', label: '封装图形', items: [] },
    { role: 'padstack', label: 'Padstack', items: [] },
    { role: 'drawing', label: '图纸信息', items: [] }
  ]
  groups.forEach(group => {
    group.items = entities.filter(entity => entity.role === group.role)
  })
  return groups.filter(group => group.items.length)
})

const filteredStreams = computed(() => {
  const keyword = filterText.value.trim().toLowerCase()
  const streams = parsed.value?.streams || []
  if (!keyword) {
    return streams
  }
  return streams.filter(stream => {
    const propertyText = stream.properties.map(property => `${property.key}=${property.value}`).join('\n')
    const text = `${stream.path}\n${stream.name}\n${stream.kind}\n${stream.role}\n${stream.sample || ''}\n${stream.strings.join('\n')}\n${propertyText}`.toLowerCase()
    return text.includes(keyword)
  })
})

const flattenTree = (nodes: EdaTreeNode[], depth = 0): TreeRow[] => {
  return nodes.flatMap(node => [
    { ...node, depth },
    ...flattenTree(node.children, depth + 1)
  ])
}

const treeRows = computed(() => flattenTree(parsed.value?.tree || []))

const selectedProperties = computed(() => selectedStream.value?.properties || [])
const selectedStrings = computed(() => selectedStream.value?.strings || [])
const selectedPreview = computed(() => selectedStream.value?.sample || selectedStream.value?.hex || '')

const selectStream = (stream: EdaStreamView) => {
  selectedStream.value = stream
}

const selectTreeRow = (row: TreeRow) => {
  const target = normalizePath(row.path)
  const stream = parsed.value?.streams.find(item => normalizePath(item.path) === target)
  if (stream) {
    selectedStream.value = stream
  }
}

const selectEntity = (entity: EdaEntity) => {
  const target = normalizePath(entity.path)
  const stream = parsed.value?.streams.find(item => {
    const streamPath = normalizePath(item.path)
    return streamPath === target || streamPath.startsWith(`${target}/`)
  })
  if (stream) {
    selectedStream.value = stream
  }
}

const parseFile = async () => {
  loading.value = true
  error.value = ''
  try {
    const nextParsed = await parseEdaFile(props.data, props.type)
    parsed.value = nextParsed
    selectedStream.value = nextParsed.streams.find(stream => stream.properties.length)
      || nextParsed.streams.find(stream => stream.kind === 'text')
      || nextParsed.streams[0]
      || null
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
        <span>{{ parsed?.parser === 'cfb' ? 'CFB STRUCTURE VIEWER' : 'BINARY STRUCTURE VIEWER' }}</span>
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
        <div>
          <dt>可信度</dt>
          <dd>{{ confidenceLabels[parsed.stats.confidence] }}</dd>
        </div>
      </dl>
    </header>

    <div v-if="parsed" class="eda-body">
      <aside class="eda-sidebar">
        <div class="eda-summary">
          <strong>{{ parsed.title }}</strong>
          <p>OLB / DRA 属于 OrCAD / Allegro 生态的私有设计数据。预览器优先解析 CFB 结构、对象候选、属性和可读文本，并在纯前端安全退化。</p>
        </div>

        <div class="eda-mini-grid">
          <div v-for="item in statsCards.slice(0, 4)" :key="item.label">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </div>
        </div>

        <div v-if="parsed.warnings.length" class="eda-warning">
          <p v-for="warning in parsed.warnings" :key="warning">{{ warning }}</p>
        </div>

        <input v-model="filterText" class="eda-search" type="search" placeholder="筛选路径、角色、属性或文本" />

        <div class="eda-stream-list">
          <button
            v-for="stream in filteredStreams"
            :key="stream.path"
            type="button"
            class="eda-stream"
            :class="{ active: selectedStream?.path === stream.path }"
            @click="selectStream(stream)"
          >
            <span :data-role="stream.role">{{ roleLabel(stream.role) }}</span>
            <strong>{{ stream.name || stream.path }}</strong>
            <em>{{ stream.path }}</em>
            <small>{{ kindLabel(stream.kind) }} · {{ formatBytes(stream.size) }}</small>
          </button>
        </div>
      </aside>

      <main class="eda-preview">
        <section class="eda-panel eda-panel--compact">
          <div class="eda-panel-head">
            <span>解析概览</span>
            <strong>{{ parsed.parser.toUpperCase() }} · {{ formatBytes(parsed.totalStreamBytes) }}</strong>
          </div>
          <div class="eda-stat-grid">
            <div v-for="item in statsCards" :key="item.label">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
        </section>

        <section class="eda-topology">
          <div class="eda-panel">
            <div class="eda-panel-head">
              <span>结构树</span>
              <strong>{{ treeRows.length }} 节点</strong>
            </div>
            <div class="eda-tree">
              <button
                v-for="row in treeRows"
                :key="row.id"
                type="button"
                :class="{ active: normalizePath(selectedStream?.path || '') === normalizePath(row.path) }"
                @click="selectTreeRow(row)"
              >
                <span :style="{ paddingLeft: `${row.depth * 14}px` }">{{ row.children.length ? '▸' : '•' }}</span>
                <strong>{{ row.name }}</strong>
                <em>{{ roleLabel(row.role) }}</em>
                <small>{{ row.size ? formatBytes(row.size) : kindLabel(row.kind) }}</small>
              </button>
            </div>
          </div>

          <div class="eda-panel">
            <div class="eda-panel-head">
              <span>EDA 对象</span>
              <strong>{{ parsed.entities.length }} 项</strong>
            </div>
            <div v-if="entityGroups.length" class="eda-entities">
              <div v-for="group in entityGroups" :key="group.role" class="eda-entity-group">
                <h3>{{ group.label }}</h3>
                <button
                  v-for="entity in group.items"
                  :key="entity.id"
                  type="button"
                  @click="selectEntity(entity)"
                >
                  <strong>{{ entity.name }}</strong>
                  <span>{{ formatBytes(entity.byteLength) }} · {{ entity.streamCount }} 条目</span>
                  <p v-if="entity.description">{{ entity.description }}</p>
                  <dl>
                    <div v-if="entity.footprint">
                      <dt>Footprint</dt>
                      <dd>{{ entity.footprint }}</dd>
                    </div>
                    <div v-if="entity.pins.length">
                      <dt>Pins</dt>
                      <dd>{{ entity.pins.join(', ') }}</dd>
                    </div>
                    <div v-if="entity.layers.length">
                      <dt>Layers</dt>
                      <dd>{{ entity.layers.join(', ') }}</dd>
                    </div>
                    <div v-if="entity.keywords.length">
                      <dt>Keywords</dt>
                      <dd>{{ entity.keywords.join(', ') }}</dd>
                    </div>
                  </dl>
                </button>
              </div>
            </div>
            <div v-else class="eda-empty">
              <strong>没有明确对象候选</strong>
              <p>仍可从结构树、属性和字符串索引中查看可读内容。</p>
            </div>
          </div>
        </section>

        <section class="eda-panel">
          <div class="eda-panel-head">
            <span>当前条目</span>
            <strong>{{ selectedStream?.path || '未选择' }}</strong>
          </div>
          <div v-if="selectedStream" class="eda-selected-meta">
            <span>{{ roleLabel(selectedStream.role) }}</span>
            <span>{{ kindLabel(selectedStream.kind) }}</span>
            <span>{{ formatBytes(selectedStream.size) }}</span>
          </div>
          <div v-if="selectedProperties.length" class="eda-property-grid">
            <div v-for="property in selectedProperties" :key="`${property.source}-${property.key}-${property.value}`">
              <span>{{ property.key }}</span>
              <strong>{{ property.value }}</strong>
            </div>
          </div>
          <pre v-if="selectedPreview">{{ selectedPreview }}</pre>
          <div v-else class="eda-empty">
            <strong>目录条目</strong>
            <p>该节点用于组织下级流，没有可直接展示的文本或十六进制片段。</p>
          </div>
        </section>

        <section class="eda-bottom">
          <div class="eda-panel">
            <div class="eda-panel-head">
              <span>可读字符串</span>
              <strong>{{ parsed.strings.length }} 项</strong>
            </div>
            <div class="eda-string-grid">
              <span v-for="(item, index) in parsed.strings" :key="`${item}-${index}`">{{ item }}</span>
            </div>
          </div>

          <div class="eda-panel">
            <div class="eda-panel-head">
              <span>诊断</span>
              <strong>{{ parsed.diagnostics.length }} 条</strong>
            </div>
            <div class="eda-diagnostics">
              <p
                v-for="diagnostic in parsed.diagnostics"
                :key="`${diagnostic.code}-${diagnostic.message}`"
                :data-level="diagnostic.level"
              >
                <span>{{ diagnostic.level }}</span>
                {{ diagnostic.message }}
              </p>
            </div>
            <div v-if="selectedStrings.length" class="eda-local-strings">
              <strong>当前条目字符串</strong>
              <span v-for="(item, index) in selectedStrings" :key="`${item}-${index}`">{{ item }}</span>
            </div>
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
  background: #edf1f5;
  color: #172033;
}

.eda-header {
  min-height: 84px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 176px 18px 22px;
  border-bottom: 1px solid rgba(23, 32, 51, 0.08);
  background: #ffffff;
}

.eda-header span,
.eda-panel-head span {
  color: #0b7480;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0;
}

.eda-header h2 {
  margin: 4px 0 0;
  font-size: 22px;
  line-height: 1.2;
}

.eda-header dl {
  display: grid;
  grid-template-columns: repeat(4, minmax(70px, auto));
  gap: 10px;
  margin: 0;
}

.eda-header dt,
.eda-header dd,
.eda-entity-group dl,
.eda-entity-group dt,
.eda-entity-group dd {
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
  grid-template-columns: minmax(300px, 32%) minmax(0, 1fr);
}

.eda-sidebar {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-right: 1px solid rgba(23, 32, 51, 0.08);
  background: rgba(255, 255, 255, 0.74);
}

.eda-summary,
.eda-warning,
.eda-panel,
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
.eda-empty p,
.eda-entity-group p {
  margin: 6px 0 0;
  color: #64748b;
  line-height: 1.55;
}

.eda-mini-grid,
.eda-stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.eda-mini-grid div,
.eda-stat-grid div {
  min-width: 0;
  padding: 10px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(23, 32, 51, 0.06);
}

.eda-mini-grid span,
.eda-stat-grid span {
  display: block;
  color: #718096;
  font-size: 12px;
}

.eda-mini-grid strong,
.eda-stat-grid strong {
  display: block;
  margin-top: 4px;
  overflow: hidden;
  color: #172033;
  font-size: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  background: #ffffff;
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
  min-height: 78px;
  display: grid;
  grid-template-columns: 74px minmax(0, 1fr);
  gap: 8px 10px;
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
.eda-stream.active,
.eda-tree button:hover,
.eda-tree button.active,
.eda-entity-group button:hover {
  border-color: rgba(11, 116, 128, 0.3);
  box-shadow: 0 10px 22px rgba(23, 32, 51, 0.08);
}

.eda-stream span {
  grid-row: span 3;
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  border-radius: 10px;
  background: rgba(11, 116, 128, 0.12);
  color: #0b7480;
  font-size: 11px;
  font-weight: 900;
}

.eda-stream span[data-role='symbol'] {
  background: rgba(34, 134, 90, 0.14);
  color: #1d7a52;
}

.eda-stream span[data-role='footprint'],
.eda-stream span[data-role='padstack'] {
  background: rgba(111, 87, 190, 0.14);
  color: #5c47a5;
}

.eda-stream strong,
.eda-stream em,
.eda-tree strong,
.eda-tree em,
.eda-tree small,
.eda-entity-group strong,
.eda-entity-group span,
.eda-entity-group dd {
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
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
}

.eda-panel {
  min-height: 0;
  overflow: hidden;
}

.eda-panel-head {
  min-height: 54px;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(23, 32, 51, 0.08);
}

.eda-panel-head strong {
  display: block;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.eda-panel--compact .eda-panel-head {
  min-height: auto;
}

.eda-stat-grid {
  padding: 14px;
}

.eda-stat-grid div {
  background: #f6f9fb;
}

.eda-topology,
.eda-bottom {
  min-height: 300px;
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
  gap: 14px;
}

.eda-topology > .eda-panel {
  min-height: 360px;
  max-height: min(58vh, 620px);
  display: flex;
  flex-direction: column;
}

.eda-tree,
.eda-entities,
.eda-diagnostics,
.eda-string-grid {
  min-height: 0;
  max-height: 380px;
  overflow: auto;
  overscroll-behavior: contain;
}

.eda-tree {
  flex: 1;
  max-height: none;
  padding: 10px;
}

.eda-entities {
  flex: 1;
  max-height: none;
}

.eda-tree button {
  width: 100%;
  min-height: 42px;
  display: grid;
  grid-template-columns: minmax(22px, auto) minmax(0, 1fr) minmax(72px, auto) minmax(72px, auto);
  gap: 8px;
  align-items: center;
  margin-bottom: 6px;
  padding: 8px;
  border: 1px solid rgba(23, 32, 51, 0.06);
  border-radius: 10px;
  background: #f8fafc;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.eda-tree span {
  color: #0b7480;
  font-weight: 900;
}

.eda-tree em,
.eda-tree small {
  color: #718096;
  font-size: 12px;
  font-style: normal;
}

.eda-entities {
  padding: 12px;
}

.eda-entity-group + .eda-entity-group {
  margin-top: 16px;
}

.eda-entity-group h3 {
  margin: 0 0 8px;
  color: #172033;
  font-size: 14px;
}

.eda-entity-group button {
  width: 100%;
  display: block;
  margin-bottom: 8px;
  padding: 12px;
  border: 1px solid rgba(23, 32, 51, 0.08);
  border-radius: 12px;
  background: #f8fafc;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.eda-entity-group button > span {
  display: block;
  margin-top: 4px;
  color: #718096;
  font-size: 12px;
}

.eda-entity-group dl {
  display: grid;
  gap: 6px;
  margin-top: 10px;
}

.eda-entity-group dl div {
  min-width: 0;
  display: grid;
  grid-template-columns: 90px minmax(0, 1fr);
  gap: 8px;
  color: #475569;
  font-size: 12px;
}

.eda-entity-group dt {
  color: #718096;
  font-weight: 800;
}

.eda-selected-meta,
.eda-property-grid,
.eda-local-strings {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 14px 0;
}

.eda-selected-meta span,
.eda-property-grid div,
.eda-local-strings span {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  background: #eef6f7;
  color: #0b7480;
  font-size: 12px;
  font-weight: 800;
}

.eda-selected-meta span,
.eda-local-strings span {
  padding: 6px 10px;
}

.eda-property-grid div {
  max-width: 100%;
  padding: 6px 10px;
}

.eda-property-grid span {
  color: #64748b;
  font-weight: 700;
}

.eda-property-grid strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.eda-panel pre {
  min-height: 220px;
  max-height: 440px;
  margin: 12px 0 0;
  overflow: auto;
  padding: 16px;
  border-top: 1px solid rgba(23, 32, 51, 0.08);
  background: #101725;
  color: #d9e7ff;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.eda-empty {
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
}

.eda-string-grid {
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

.eda-diagnostics {
  padding: 14px;
}

.eda-diagnostics p {
  margin: 0 0 8px;
  padding: 10px;
  border-radius: 10px;
  background: #f6f9fb;
  color: #475569;
  line-height: 1.5;
}

.eda-diagnostics p[data-level='warning'] {
  background: #fff7e8;
  color: #8a4b00;
}

.eda-diagnostics span {
  display: inline-flex;
  margin-right: 8px;
  color: #0b7480;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
}

.eda-local-strings {
  padding-bottom: 14px;
}

.eda-local-strings strong {
  width: 100%;
  color: #172033;
  font-size: 13px;
}

.eda-state {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(237, 241, 245, 0.9);
}

.eda-state span {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: 3px solid rgba(11, 116, 128, 0.16);
  border-top-color: #0b7480;
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

@media (max-width: 980px) {
  .eda-header,
  .eda-body,
  .eda-topology,
  .eda-bottom {
    grid-template-columns: 1fr;
  }

  .eda-header {
    align-items: flex-start;
    flex-direction: column;
    padding-right: 22px;
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

@media (max-width: 640px) {
  .eda-header dl,
  .eda-mini-grid,
  .eda-stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .eda-tree button {
    grid-template-columns: minmax(22px, auto) minmax(0, 1fr);
  }

  .eda-tree em,
  .eda-tree small {
    display: none;
  }
}
</style>
