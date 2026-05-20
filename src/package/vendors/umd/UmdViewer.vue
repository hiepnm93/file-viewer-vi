<script setup lang='ts'>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { parseUmdBook, type UmdBook, type UmdImage } from './parser'

const props = defineProps<{
  data: ArrayBuffer
}>()

const status = ref<'loading' | 'ready' | 'error'>('loading')
const errorMessage = ref('')
const tocOpen = ref(true)
const book = ref<UmdBook | null>(null)
const activeIndex = ref(0)
const stage = ref<HTMLElement | null>(null)
const imageUrls = new Map<string, string>()

const currentChapter = computed(() => {
  return book.value?.chapters[activeIndex.value]
})

const metaLine = computed(() => {
  if (!book.value) {
    return ''
  }
  return [
    book.value.author,
    book.value.category,
    book.value.publishedAt
  ].filter(Boolean).join(' / ')
})

const progressLabel = computed(() => {
  const total = book.value?.chapters.length || 0
  if (!total) {
    return '0/0'
  }
  return `${activeIndex.value + 1}/${total}`
})

const atStart = computed(() => activeIndex.value <= 0)
const atEnd = computed(() => {
  const total = book.value?.chapters.length || 0
  return total === 0 || activeIndex.value >= total - 1
})

const warningText = computed(() => {
  return book.value?.warnings.filter(Boolean).join('；') || ''
})

const toBlobPart = (image: UmdImage) => {
  const bytes = new Uint8Array(image.bytes.byteLength)
  bytes.set(image.bytes)
  return bytes.buffer
}

const getImageUrl = (image?: UmdImage) => {
  if (!image) {
    return ''
  }
  const existing = imageUrls.get(image.id)
  if (existing) {
    return existing
  }
  const url = URL.createObjectURL(new Blob([toBlobPart(image)], { type: image.mimeType }))
  imageUrls.set(image.id, url)
  return url
}

const coverUrl = computed(() => getImageUrl(book.value?.cover))

const chapterImages = computed(() => {
  return currentChapter.value?.images.map(image => ({
    image,
    url: getImageUrl(image)
  })) || []
})

const revokeImageUrls = () => {
  imageUrls.forEach(url => URL.revokeObjectURL(url))
  imageUrls.clear()
}

const scrollToTop = async () => {
  await nextTick()
  stage.value?.scrollTo({ top: 0 })
}

const selectChapter = async (index: number) => {
  activeIndex.value = index
  tocOpen.value = false
  await scrollToTop()
}

const goPrev = async () => {
  if (atStart.value) {
    return
  }
  activeIndex.value -= 1
  await scrollToTop()
}

const goNext = async () => {
  if (atEnd.value) {
    return
  }
  activeIndex.value += 1
  await scrollToTop()
}

const openBook = async () => {
  status.value = 'loading'
  errorMessage.value = ''
  revokeImageUrls()

  try {
    await nextTick()
    const parsed = parseUmdBook(props.data.slice(0))
    book.value = parsed
    activeIndex.value = 0
    status.value = 'ready'
  } catch (error) {
    console.error(error)
    errorMessage.value = error instanceof Error ? error.message : String(error)
    status.value = 'error'
  }
}

onMounted(openBook)

onBeforeUnmount(() => {
  revokeImageUrls()
})
</script>

<template>
  <div class='umd-viewer' :class="{ 'umd-viewer--toc-hidden': !tocOpen }">
    <div class='umd-toolbar'>
      <button
        type='button'
        class='umd-icon-button'
        :class="{ active: tocOpen }"
        title='目录'
        @click='tocOpen = !tocOpen'
      >
        <span />
      </button>
      <div class='umd-title'>
        <strong>{{ book?.title || 'UMD 电子书' }}</strong>
        <span>{{ metaLine || currentChapter?.title || '阅读中' }}</span>
      </div>
      <div class='umd-actions'>
        <button type='button' class='umd-button' :disabled='status !== "ready" || atStart' @click='goPrev'>
          上一章
        </button>
        <span class='umd-progress'>{{ progressLabel }}</span>
        <button type='button' class='umd-button' :disabled='status !== "ready" || atEnd' @click='goNext'>
          下一章
        </button>
      </div>
    </div>

    <div class='umd-body'>
      <aside v-if='tocOpen' class='umd-toc'>
        <div class='umd-toc-head'>
          <strong>目录</strong>
          <span>{{ book?.chapters.length || 0 }} 项</span>
        </div>
        <div class='umd-toc-list'>
          <button
            v-for='(item, index) in book?.chapters'
            :key='item.id'
            type='button'
            class='umd-toc-item'
            :class='{ active: index === activeIndex }'
            @click='selectChapter(index)'
          >
            {{ item.title }}
          </button>
        </div>
      </aside>

      <main class='umd-stage-wrap'>
        <article ref='stage' class='umd-stage'>
          <header v-if='book && (coverUrl || metaLine)' class='umd-book-head'>
            <img v-if='coverUrl' :src='coverUrl' :alt='book.title' />
            <div>
              <h1>{{ book.title }}</h1>
              <p v-if='metaLine'>{{ metaLine }}</p>
              <p v-if='book.publisher || book.vendor'>{{ [book.publisher, book.vendor].filter(Boolean).join(' / ') }}</p>
            </div>
          </header>

          <section v-if='currentChapter' class='umd-chapter'>
            <h2>{{ currentChapter.title }}</h2>
            <div v-if='chapterImages.length' class='umd-image-list'>
              <figure v-for='item in chapterImages' :key='item.image.id'>
                <img :src='item.url' :alt='currentChapter.title' />
              </figure>
            </div>
            <div v-if='currentChapter.content' class='umd-text' v-text='currentChapter.content' />
            <div v-else-if='!chapterImages.length' class='umd-empty'>未解析到正文内容</div>
          </section>

          <div v-if='warningText' class='umd-warning'>{{ warningText }}</div>
        </article>

        <div v-if='status === "loading"' class='umd-state'>正在解析 UMD...</div>
        <div v-else-if='status === "error"' class='umd-state error'>{{ errorMessage }}</div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.umd-viewer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #eef1f4;
  color: #172033;
}

.umd-toolbar {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.94);
}

.umd-title {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.umd-title strong,
.umd-title span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.umd-title strong {
  font-size: 14px;
}

.umd-title span {
  color: #64748b;
  font-size: 12px;
}

.umd-icon-button,
.umd-button {
  height: 36px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #ffffff;
  color: #172033;
  font: inherit;
  cursor: pointer;
}

.umd-icon-button {
  width: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.umd-icon-button span,
.umd-icon-button span::before,
.umd-icon-button span::after {
  width: 16px;
  height: 2px;
  display: block;
  border-radius: 999px;
  background: currentColor;
}

.umd-icon-button span {
  position: relative;
}

.umd-icon-button span::before,
.umd-icon-button span::after {
  content: '';
  position: absolute;
  left: 0;
}

.umd-icon-button span::before {
  top: -5px;
}

.umd-icon-button span::after {
  top: 5px;
}

.umd-icon-button.active {
  border-color: rgba(2, 132, 199, 0.24);
  background: rgba(2, 132, 199, 0.08);
  color: #0369a1;
}

.umd-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.umd-button {
  min-width: 68px;
  padding: 0 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
}

.umd-button:disabled {
  color: #94a3b8;
  cursor: not-allowed;
}

.umd-progress {
  min-width: 58px;
  color: #64748b;
  font-size: 12px;
  text-align: center;
}

.umd-body {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(180px, 240px) minmax(0, 1fr);
}

.umd-viewer--toc-hidden .umd-body {
  grid-template-columns: minmax(0, 1fr);
}

.umd-toc {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.82);
}

.umd-toc-head {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 12px;
  color: #172033;
  font-size: 13px;
}

.umd-toc-head span {
  color: #64748b;
}

.umd-toc-list {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 0 8px 10px;
}

.umd-toc-item {
  width: 100%;
  min-height: 34px;
  padding: 7px 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #475569;
  font: inherit;
  font-size: 12px;
  text-align: left;
  cursor: pointer;
}

.umd-toc-item:hover,
.umd-toc-item.active {
  background: rgba(2, 132, 199, 0.08);
  color: #0369a1;
}

.umd-stage-wrap {
  position: relative;
  min-width: 0;
  min-height: 0;
  padding: 18px;
  overflow: hidden;
}

.umd-stage {
  width: 100%;
  height: 100%;
  overflow: auto;
  border-radius: 8px;
  background: #fffef8;
  box-shadow:
    0 18px 45px rgba(15, 23, 42, 0.12),
    inset 0 0 0 1px rgba(15, 23, 42, 0.06);
}

.umd-book-head {
  display: flex;
  gap: 20px;
  max-width: 820px;
  margin: 0 auto;
  padding: 32px 34px 8px;
}

.umd-book-head img {
  width: 96px;
  max-height: 136px;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.16);
}

.umd-book-head div {
  min-width: 0;
}

.umd-book-head h1 {
  margin: 0;
  color: #111827;
  font-size: 24px;
  line-height: 1.3;
}

.umd-book-head p {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
}

.umd-chapter {
  max-width: 820px;
  margin: 0 auto;
  padding: 28px 34px 56px;
}

.umd-chapter h2 {
  margin: 0 0 22px;
  color: #111827;
  font-size: 22px;
  line-height: 1.35;
}

.umd-text {
  color: #1f2937;
  font-family: Georgia, 'Times New Roman', 'Songti SC', SimSun, serif;
  font-size: 17px;
  line-height: 1.86;
  white-space: pre-wrap;
  word-break: break-word;
}

.umd-image-list {
  display: grid;
  gap: 18px;
}

.umd-image-list figure {
  margin: 0;
  text-align: center;
}

.umd-image-list img {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
}

.umd-empty,
.umd-warning {
  color: #64748b;
  font-size: 14px;
  line-height: 1.7;
}

.umd-warning {
  max-width: 820px;
  margin: -28px auto 36px;
  padding: 0 34px;
  color: #b45309;
}

.umd-state {
  position: absolute;
  inset: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.92);
  color: #64748b;
  font-size: 14px;
}

.umd-state.error {
  color: #b42318;
}

@media (max-width: 720px) {
  .umd-toolbar {
    grid-template-columns: 40px minmax(0, 1fr);
  }

  .umd-actions {
    grid-column: 1 / -1;
    justify-content: space-between;
  }

  .umd-body {
    position: relative;
    grid-template-columns: minmax(0, 1fr);
  }

  .umd-toc {
    position: absolute;
    z-index: 5;
    top: 0;
    bottom: 0;
    left: 0;
    width: min(82vw, 280px);
    box-shadow: 18px 0 40px rgba(15, 23, 42, 0.16);
  }

  .umd-stage-wrap {
    padding: 12px;
  }

  .umd-book-head {
    padding: 24px 20px 0;
  }

  .umd-chapter {
    padding: 24px 20px 42px;
  }
}
</style>
