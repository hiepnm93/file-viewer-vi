<script setup lang='ts'>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  data: ArrayBuffer,
  type: string
}>()

const audioRef = ref<HTMLAudioElement | null>(null)
const sourceUrl = ref('')
const currentTime = ref(0)
const duration = ref(0)
const playable = ref(false)

const AUDIO_MIME_MAP: Record<string, string> = {
  aac: 'audio/aac',
  flac: 'audio/flac',
  m4a: 'audio/mp4',
  mp3: 'audio/mpeg',
  mpeg: 'audio/mpeg',
  oga: 'audio/ogg',
  ogg: 'audio/ogg',
  opus: 'audio/ogg; codecs=opus',
  wav: 'audio/wav',
  weba: 'audio/webm'
}

const normalizedType = computed(() => props.type.trim().toLowerCase())
const mimeType = computed(() => AUDIO_MIME_MAP[normalizedType.value] || 'audio/*')
const displayType = computed(() => normalizedType.value.toUpperCase() || 'AUDIO')
const progress = computed(() => {
  if (!Number.isFinite(duration.value) || duration.value <= 0) {
    return 0
  }
  return Math.min(100, Math.max(0, currentTime.value / duration.value * 100))
})

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '00:00'
  }
  const minutes = Math.floor(seconds / 60)
  const rest = Math.floor(seconds % 60)
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
}

const revokeSource = () => {
  if (sourceUrl.value) {
    URL.revokeObjectURL(sourceUrl.value)
    sourceUrl.value = ''
  }
}

const createSource = () => {
  revokeSource()
  currentTime.value = 0
  duration.value = 0
  playable.value = false
  // 音频预览只依赖浏览器原生解码能力，避免为常见媒体文件额外引入运行时。
  sourceUrl.value = URL.createObjectURL(new Blob([props.data], { type: mimeType.value }))
}

const handleLoadedMetadata = () => {
  duration.value = audioRef.value?.duration || 0
  playable.value = true
}

const handleTimeUpdate = () => {
  currentTime.value = audioRef.value?.currentTime || 0
}

onMounted(createSource)

watch(() => [props.data, props.type], createSource)

onBeforeUnmount(revokeSource)
</script>

<template>
  <div class='audio-viewer'>
    <section class='audio-card'>
      <div class='audio-art'>
        <span />
        <i />
      </div>
      <div class='audio-copy'>
        <span class='audio-kicker'>{{ displayType }}</span>
        <strong>音频预览</strong>
        <p>使用浏览器原生播放器打开，兼容性取决于当前浏览器支持的音频编码。</p>
      </div>
      <div class='audio-meter'>
        <span>{{ formatTime(currentTime) }}</span>
        <div class='audio-progress' aria-hidden='true'>
          <i :style='{ width: `${progress}%` }' />
        </div>
        <span>{{ playable ? formatTime(duration) : '--:--' }}</span>
      </div>
      <audio
        ref='audioRef'
        class='audio-control'
        :src='sourceUrl'
        controls
        preload='metadata'
        @loadedmetadata='handleLoadedMetadata'
        @timeupdate='handleTimeUpdate'
      >
        当前浏览器不支持音频播放。
      </audio>
    </section>
  </div>
</template>

<style scoped>
.audio-viewer {
  width: 100%;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  background:
    linear-gradient(135deg, rgba(14, 116, 144, 0.1), transparent 34%),
    linear-gradient(180deg, #f5f8fb 0%, #edf2f7 100%);
}

.audio-card {
  width: min(100%, 640px);
  display: grid;
  grid-template-columns: 86px minmax(0, 1fr);
  gap: 18px;
  align-items: center;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 20px 52px rgba(15, 23, 42, 0.13);
}

.audio-art {
  position: relative;
  width: 86px;
  height: 86px;
  border-radius: 8px;
  background: linear-gradient(135deg, #0f766e, #2dd4bf);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.24);
}

.audio-art span {
  position: absolute;
  inset: 18px;
  border-radius: 999px;
  border: 8px solid rgba(255, 255, 255, 0.88);
}

.audio-art i {
  position: absolute;
  right: 18px;
  bottom: 20px;
  width: 18px;
  height: 36px;
  border-radius: 10px 10px 4px 4px;
  background: rgba(255, 255, 255, 0.9);
}

.audio-copy {
  min-width: 0;
}

.audio-kicker {
  color: #0f766e;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0;
}

.audio-copy strong {
  display: block;
  margin-top: 5px;
  color: #132235;
  font-size: 23px;
  line-height: 1.15;
}

.audio-copy p {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.7;
}

.audio-meter {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) 48px;
  align-items: center;
  gap: 10px;
  color: #64748b;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.audio-progress {
  height: 6px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(15, 118, 110, 0.12);
}

.audio-progress i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #0f766e, #2dd4bf);
  transition: width 0.18s ease;
}

.audio-control {
  grid-column: 1 / -1;
  width: 100%;
  height: 42px;
}

@media (max-width: 560px) {
  .audio-viewer {
    padding: 16px;
  }

  .audio-card {
    grid-template-columns: 1fr;
  }

  .audio-art {
    width: 72px;
    height: 72px;
  }
}
</style>
