<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type Hls from 'hls.js'

const props = defineProps<{
  data: ArrayBuffer,
  type: string,
  sourceUrl?: string
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
const objectUrl = ref('')
let hls: Hls | null = null

const normalizedType = computed(() => props.type.toLowerCase())
const displayType = computed(() => normalizedType.value.toUpperCase() || 'VIDEO')

const mimeType = computed(() => {
  const map: Record<string, string> = {
    m3u8: 'application/vnd.apple.mpegurl',
    mp4: 'video/mp4',
    webm: 'video/webm'
  }
  return map[normalizedType.value] || 'video/*'
})

const revokeObjectUrl = () => {
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value)
    objectUrl.value = ''
  }
}

const createLocalUrl = () => {
  revokeObjectUrl()
  objectUrl.value = URL.createObjectURL(new Blob([props.data], { type: mimeType.value }))
  return objectUrl.value
}

const getVideoSource = () => {
  // HLS 清单通常需要按原始 URL 继续加载同目录分片；本地单文件 m3u8
  // 只有在分片地址为绝对 URL 或 data URL 时才能完整播放。
  if (normalizedType.value === 'm3u8' && props.sourceUrl) {
    return props.sourceUrl
  }
  return createLocalUrl()
}

const mountVideo = async () => {
  const video = videoRef.value
  if (!video) {
    return
  }
  const source = getVideoSource()
  if (normalizedType.value === 'm3u8') {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source
      return
    }
    const { default: Hls } = await import('hls.js')
    if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: false })
      hls.loadSource(source)
      hls.attachMedia(video)
      return
    }
  }
  video.src = source
}

onMounted(mountVideo)

onBeforeUnmount(() => {
  hls?.destroy()
  hls = null
  revokeObjectUrl()
})
</script>

<template>
  <div class="video-viewer">
    <section class="video-shell">
      <div class="video-heading">
        <span>{{ displayType }}</span>
        <strong>视频预览</strong>
      </div>
      <video ref="videoRef" class="video-player" controls preload="metadata">
        当前浏览器不支持该视频格式。
      </video>
      <p v-if="normalizedType === 'm3u8'" class="video-hint">
        HLS 会优先使用原始 URL 加载分片；如果传入的是本地单文件清单，请确保分片地址可被浏览器访问。
      </p>
    </section>
  </div>
</template>

<style scoped>
.video-viewer {
  width: 100%;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  background: #eef1f4;
}

.video-shell {
  width: min(100%, 960px);
  border-radius: 8px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  background: #fff;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.14);
  overflow: hidden;
}

.video-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.video-heading span {
  color: #0f766e;
  font-size: 12px;
  font-weight: 800;
}

.video-heading strong {
  color: #132235;
  font-size: 16px;
}

.video-player {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #05070a;
}

.video-hint {
  margin: 0;
  padding: 12px 18px 16px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.7;
}
</style>
