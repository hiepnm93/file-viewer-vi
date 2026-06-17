<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  data: ArrayBuffer
}>()

interface MidiTrackSummary {
  name: string;
  instrument: string;
  channel: number;
  notes: number;
  duration: number;
}

const loading = ref(true)
const error = ref('')
const name = ref('MIDI 文件')
const duration = ref(0)
const ppq = ref(0)
const tracks = ref<MidiTrackSummary[]>([])

const formatDuration = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '00:00'
  }
  const minutes = Math.floor(seconds / 60)
  const rest = Math.round(seconds % 60)
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
}

const totalNotes = computed(() => tracks.value.reduce((sum, track) => sum + track.notes, 0))

const parseMidi = async () => {
  loading.value = true
  error.value = ''
  try {
    const { Midi } = await import('@tonejs/midi')
    const midi = new Midi(props.data)
    name.value = midi.name || 'MIDI 文件'
    duration.value = midi.duration
    ppq.value = midi.header.ppq
    tracks.value = midi.tracks.map((track, index) => ({
      name: track.name || `Track ${index + 1}`,
      instrument: track.instrument?.name || track.instrument?.family || 'Unknown',
      channel: track.channel,
      notes: track.notes.length,
      duration: track.duration
    }))
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'MIDI 解析失败'
  } finally {
    loading.value = false
  }
}

watch(() => props.data, parseMidi, { immediate: true })
</script>

<template>
  <div class="midi-viewer">
    <section class="midi-card">
      <header>
        <span>MIDI</span>
        <strong>{{ name }}</strong>
      </header>
      <div v-if="loading" class="midi-state">正在解析 MIDI 轨道...</div>
      <div v-else-if="error" class="midi-state midi-error">{{ error }}</div>
      <template v-else>
        <div class="midi-stats">
          <div>
            <span>时长</span>
            <strong>{{ formatDuration(duration) }}</strong>
          </div>
          <div>
            <span>PPQ</span>
            <strong>{{ ppq }}</strong>
          </div>
          <div>
            <span>轨道</span>
            <strong>{{ tracks.length }}</strong>
          </div>
          <div>
            <span>音符</span>
            <strong>{{ totalNotes }}</strong>
          </div>
        </div>
        <div class="midi-table-wrap">
          <table class="midi-table">
            <thead>
              <tr>
                <th>轨道</th>
                <th>乐器</th>
                <th>通道</th>
                <th>音符数</th>
                <th>时长</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="track in tracks" :key="`${track.name}-${track.channel}`">
                <td>{{ track.name }}</td>
                <td>{{ track.instrument }}</td>
                <td>{{ track.channel + 1 }}</td>
                <td>{{ track.notes }}</td>
                <td>{{ formatDuration(track.duration) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </section>
  </div>
</template>

<style scoped>
.midi-viewer {
  min-height: 100%;
  padding: 28px;
  background: #eef1f4;
}

.midi-card {
  max-width: 960px;
  margin: 0 auto;
  border-radius: 8px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #fff;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.12);
  overflow: hidden;
}

.midi-card header {
  padding: 18px 22px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.midi-card header span {
  display: block;
  color: #0f766e;
  font-size: 12px;
  font-weight: 800;
}

.midi-card header strong {
  display: block;
  margin-top: 6px;
  color: #132235;
  font-size: 22px;
}

.midi-state {
  padding: 28px 22px;
  color: #64748b;
}

.midi-error {
  color: #b42318;
}

.midi-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  background: rgba(15, 23, 42, 0.08);
}

.midi-stats div {
  padding: 16px;
  background: #f8fafc;
}

.midi-stats span {
  display: block;
  color: #64748b;
  font-size: 12px;
}

.midi-stats strong {
  display: block;
  margin-top: 4px;
  color: #132235;
  font-size: 20px;
}

.midi-table-wrap {
  overflow: auto;
}

.midi-table {
  width: 100%;
  border-collapse: collapse;
  color: #132235;
  font-size: 14px;
}

.midi-table th,
.midi-table td {
  padding: 12px 16px;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
  text-align: left;
}

.midi-table th {
  color: #64748b;
  background: #f8fafc;
  font-weight: 700;
}

@media (max-width: 700px) {
  .midi-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
