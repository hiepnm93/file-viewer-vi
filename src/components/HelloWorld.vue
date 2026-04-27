<script setup lang='ts'>
import { computed, onMounted, ref } from 'vue'
import { listenForFile } from '@/components/utils'
import type { FileRef } from '@/package/common/type'

const hidden = ref(false)
const input = ref(true)
const filename = ref('')
const file = ref<FileRef | undefined>()
const url = ref('/example/word.docx')
const preview = ref('')

const presetFiles = [
  { name: 'DOC', url: '/example/test.doc' },
  { name: 'Word', url: '/example/word.docx' },
  { name: 'Excel', url: '/example/excel.xlsx' },
  { name: 'PPT', url: '/example/ppt.pptx' },
  { name: 'PNG', url: '/example/pic.png' },
  { name: 'PDF', url: '/example/pdf.pdf' },
  { name: '视频', url: '/example/video.mp4' }
]

const activePreset = computed(() => {
  return presetFiles.find(item => item.url === url.value)
})

const displayMode = computed(() => {
  return file.value ? '本地上传' : '链接预览'
})

const displayName = computed(() => {
  if (file.value && filename.value) {
    return filename.value
  }
  if (preview.value) {
    const name = preview.value.split('/').pop() || preview.value
    return decodeURIComponent(name)
  }
  return activePreset.value?.name || '未选择文件'
})

const displayPath = computed(() => {
  if (file.value && filename.value) {
    return filename.value
  }
  return preview.value || url.value || ''
})

const previewType = computed(() => {
  const name = displayName.value
  const dotIndex = name.lastIndexOf('.')
  if (dotIndex === -1) {
    return 'AUTO'
  }
  return name.slice(dotIndex + 1).toUpperCase()
})

listenForFile((body, target) => {
  hidden.value = true
  if (body) {
    filename.value = body.name && decodeURIComponent(body.name) || ''
    file.value = body
  }
  if (target) {
    url.value = target
    preview.value = target
  }
})

onMounted(() => {
  openUrlPreview(url.value)
})

function openUrlPreview(nextUrl = url.value) {
  input.value = true
  file.value = undefined
  preview.value = nextUrl
}

function handlePresetChange(e: Event) {
  const target = e.target as HTMLSelectElement
  url.value = target.value
  openUrlPreview(target.value)
}

async function handleChange(e: Event) {
  const target = e.target as HTMLInputElement
  const value = target.files?.item(0)
  if (!value) {
    return
  }
  input.value = false
  filename.value = value.name && decodeURIComponent(value.name) || ''
  file.value = value
}

function selectPreset(nextUrl: string) {
  url.value = nextUrl
  openUrlPreview(nextUrl)
}
</script>

<template>
  <div class='demo-shell' :class='{ hidden }'>
    <main class='workspace'>
      <div v-if='!hidden' class='layout-shell'>
        <aside class='control-panel'>
          <div class='panel-head'>
            <div class='brand'>
              <span class='brand-mark'>FV</span>
              <div class='brand-copy'>
                <h1>文件预览</h1>
                <p>整页固定，文档内部滚动。</p>
              </div>
            </div>

            <div class='mode-switch'>
              <button
                type='button'
                class='mode-button'
                :class='{ active: input }'
                @click='input = true'
              >
                链接
              </button>
              <button
                type='button'
                class='mode-button'
                :class='{ active: !input }'
                @click='input = false'
              >
                上传
              </button>
            </div>
          </div>

          <div class='panel-body'>
            <template v-if='input'>
              <div class='field-group'>
                <label class='field-label'>示例文件</label>
                <select v-model='url' class='compact-field compact-select' @change='handlePresetChange'>
                  <option v-for='item in presetFiles' :key='item.url' :value='item.url'>
                    {{ item.name }}
                  </option>
                </select>
              </div>

              <div class='field-group'>
                <label class='field-label'>文件地址</label>
                <input
                  v-model='url'
                  class='compact-field'
                  type='text'
                  placeholder='http:// 或 /example/*.ext'
                  @keyup.enter='openUrlPreview()'
                />
              </div>

              <button type='button' class='primary-button' @click='openUrlPreview()'>
                打开预览
              </button>
            </template>

            <template v-else>
              <label class='upload-card'>
                <input type='file' @change='handleChange' />
                <span class='upload-title'>选择本地文件</span>
                <strong>{{ filename || '支持 doc、docx、xlsx、pptx、pdf、图片和视频' }}</strong>
              </label>
            </template>

            <div class='preset-section'>
              <span class='field-label'>快捷入口</span>
              <div class='preset-row'>
                <button
                  v-for='item in presetFiles'
                  :key='item.url'
                  type='button'
                  class='preset-chip'
                  :class='{ active: !file && url === item.url }'
                  @click='selectPreset(item.url)'
                >
                  {{ item.name }}
                </button>
              </div>
            </div>
          </div>
        </aside>

        <section class='viewer-panel'>
          <div class='viewer-toolbar'>
            <div class='viewer-copy'>
              <span class='viewer-label'>{{ displayMode }}</span>
              <strong>{{ previewType }}</strong>
            </div>
            <div class='viewer-path'>{{ displayPath }}</div>
          </div>

          <div class='viewport'>
            <file-viewer :file='file' :url='preview' />
          </div>
        </section>
      </div>

      <section v-else class='viewer-panel standalone'>
        <div class='viewport'>
          <file-viewer :file='file' :url='preview' />
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.demo-shell {
  height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at top right, rgba(33, 163, 102, 0.1), transparent 26%),
    linear-gradient(180deg, #f7f7f1 0%, #edf1ee 100%);
  color: #16283b;
}

.workspace {
  height: 100%;
  padding: 18px;
}

.layout-shell {
  height: 100%;
  display: grid;
  grid-template-columns: minmax(280px, 332px) minmax(0, 1fr);
  gap: 16px;
}

.control-panel,
.viewer-panel {
  min-height: 0;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.78);
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 16px 40px rgba(13, 29, 45, 0.08);
  backdrop-filter: blur(16px);
}

.control-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-head {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px 18px 14px;
  border-bottom: 1px solid rgba(22, 40, 59, 0.06);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-mark {
  display: inline-flex;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: linear-gradient(135deg, #1a7f58 0%, #25ab6f 100%);
  color: #ffffff;
  font-weight: 800;
  letter-spacing: 0.04em;
  box-shadow: 0 12px 24px rgba(33, 163, 102, 0.18);
}

.brand-copy h1 {
  margin: 0;
  font-size: 28px;
  line-height: 1.05;
  letter-spacing: -0.04em;
}

.brand-copy p {
  margin: 6px 0 0;
  color: #6a7d90;
  font-size: 14px;
}

.mode-switch {
  display: inline-grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding: 4px;
  border-radius: 16px;
  background: rgba(22, 40, 59, 0.06);
}

.mode-button,
.compact-field,
.primary-button,
.preset-chip {
  font: inherit;
}

.mode-button,
.primary-button,
.preset-chip {
  border: 0;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.mode-button:hover,
.primary-button:hover,
.preset-chip:hover {
  transform: translateY(-1px);
}

.mode-button {
  min-height: 38px;
  border-radius: 12px;
  background: transparent;
  color: #6a7d90;
  font-weight: 600;
}

.mode-button.active {
  background: #ffffff;
  color: #16283b;
  box-shadow: 0 8px 18px rgba(18, 35, 55, 0.08);
}

.panel-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  color: #6a7d90;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.compact-field {
  min-height: 46px;
  padding: 0 14px;
  border-radius: 16px;
  border: 1px solid rgba(22, 40, 59, 0.08);
  background: rgba(247, 249, 248, 0.98);
  color: #16283b;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.compact-field:focus {
  border-color: rgba(33, 163, 102, 0.36);
  box-shadow: 0 0 0 4px rgba(33, 163, 102, 0.1);
}

.primary-button {
  min-height: 46px;
  border-radius: 16px;
  background: linear-gradient(135deg, #21a366 0%, #28bb7b 100%);
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 12px 24px rgba(33, 163, 102, 0.18);
}

.upload-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border-radius: 18px;
  border: 1px dashed rgba(33, 163, 102, 0.3);
  background: rgba(247, 249, 248, 0.96);
  overflow: hidden;
  cursor: pointer;
}

.upload-card input[type='file'] {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.upload-title {
  color: #1a8254;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.upload-card strong {
  color: #16283b;
  font-size: 14px;
  line-height: 1.6;
}

.preset-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preset-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preset-chip {
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(22, 40, 59, 0.06);
  color: #6a7d90;
}

.preset-chip.active {
  background: rgba(33, 163, 102, 0.14);
  color: #1a8254;
}

.viewer-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.viewer-toolbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border-bottom: 1px solid rgba(22, 40, 59, 0.06);
}

.viewer-copy {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.viewer-label {
  color: #6a7d90;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.viewer-copy strong {
  font-size: 16px;
  line-height: 1;
}

.viewer-path {
  min-width: 0;
  color: #6a7d90;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.viewport {
  flex: 1;
  min-height: 0;
  padding: 12px;
}

.viewport :deep(.file-viewer) {
  height: 100%;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(22, 40, 59, 0.06);
}

.standalone {
  height: 100%;
}

.hidden .workspace {
  height: 100%;
  padding: 0;
}

.hidden .viewer-panel {
  height: 100%;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  background: #ffffff;
}

.hidden .viewport {
  padding: 0;
}

.hidden .viewport :deep(.file-viewer) {
  border-radius: 0;
  box-shadow: none;
}

@media (max-width: 1100px) {
  .layout-shell {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
  }

  .control-panel {
    max-height: 42vh;
  }
}

@media (max-width: 720px) {
  .workspace {
    padding: 12px;
  }

  .viewer-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .viewer-path {
    width: 100%;
  }
}
</style>
