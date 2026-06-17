<script setup lang="ts">
import { computed } from 'vue'

type Position = [number, number, ...number[]]
type Geometry =
  | { type: 'Point'; coordinates: Position }
  | { type: 'MultiPoint'; coordinates: Position[] }
  | { type: 'LineString'; coordinates: Position[] }
  | { type: 'MultiLineString'; coordinates: Position[][] }
  | { type: 'Polygon'; coordinates: Position[][] }
  | { type: 'MultiPolygon'; coordinates: Position[][][] }
  | { type: 'GeometryCollection'; geometries: Geometry[] }

interface Feature {
  type: 'Feature';
  geometry: Geometry | null;
  properties?: Record<string, unknown>;
}

interface FeatureCollection {
  type: 'FeatureCollection';
  features: Feature[];
}

const props = defineProps<{
  collection: FeatureCollection,
  type: string
}>()

const width = 960
const height = 620
const padding = 36

const features = computed(() => props.collection.features || [])

const walkPositions = (geometry: Geometry | null, visit: (position: Position) => void) => {
  if (!geometry) return
  switch (geometry.type) {
    case 'Point':
      visit(geometry.coordinates)
      break
    case 'MultiPoint':
    case 'LineString':
      geometry.coordinates.forEach(visit)
      break
    case 'MultiLineString':
    case 'Polygon':
      geometry.coordinates.forEach(line => line.forEach(visit))
      break
    case 'MultiPolygon':
      geometry.coordinates.forEach(polygon => polygon.forEach(line => line.forEach(visit)))
      break
    case 'GeometryCollection':
      geometry.geometries.forEach(item => walkPositions(item, visit))
      break
  }
}

const bounds = computed(() => {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  features.value.forEach(feature => {
    walkPositions(feature.geometry, position => {
      const [x, y] = position
      if (!Number.isFinite(x) || !Number.isFinite(y)) return
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    })
  })
  if (!Number.isFinite(minX) || !Number.isFinite(minY)) {
    return null
  }
  return { minX, minY, maxX, maxY }
})

const project = (position: Position) => {
  const box = bounds.value
  if (!box) return [width / 2, height / 2]
  const xRange = Math.max(1e-9, box.maxX - box.minX)
  const yRange = Math.max(1e-9, box.maxY - box.minY)
  const scale = Math.min((width - padding * 2) / xRange, (height - padding * 2) / yRange)
  const xOffset = (width - xRange * scale) / 2
  const yOffset = (height - yRange * scale) / 2
  const x = xOffset + (position[0] - box.minX) * scale
  const y = height - (yOffset + (position[1] - box.minY) * scale)
  return [Number(x.toFixed(2)), Number(y.toFixed(2))]
}

const pathLine = (positions: Position[], close = false) => {
  const points = positions
    .filter(position => Number.isFinite(position[0]) && Number.isFinite(position[1]))
    .map(project)
  if (!points.length) return ''
  const [first, ...rest] = points
  const body = [`M${first[0]} ${first[1]}`, ...rest.map(point => `L${point[0]} ${point[1]}`)]
  if (close) body.push('Z')
  return body.join(' ')
}

const renderGeometry = (geometry: Geometry | null): string[] => {
  if (!geometry) return []
  switch (geometry.type) {
    case 'Point': {
      const [x, y] = project(geometry.coordinates)
      return [`<circle cx="${x}" cy="${y}" r="4" />`]
    }
    case 'MultiPoint':
      return geometry.coordinates.flatMap(position => renderGeometry({ type: 'Point', coordinates: position }))
    case 'LineString':
      return [`<path d="${pathLine(geometry.coordinates)}" />`]
    case 'MultiLineString':
      return geometry.coordinates.map(line => `<path d="${pathLine(line)}" />`)
    case 'Polygon':
      return geometry.coordinates.map(line => `<path class="geo-polygon" d="${pathLine(line, true)}" />`)
    case 'MultiPolygon':
      return geometry.coordinates.flatMap(polygon => polygon.map(line => `<path class="geo-polygon" d="${pathLine(line, true)}" />`))
    case 'GeometryCollection':
      return geometry.geometries.flatMap(renderGeometry)
  }
}

const svgContent = computed(() => {
  return features.value
    .flatMap(feature => renderGeometry(feature.geometry))
    .join('')
})

const geometryCounts = computed(() => {
  const counts: Record<string, number> = {}
  features.value.forEach(feature => {
    const key = feature.geometry?.type || 'Null'
    counts[key] = (counts[key] || 0) + 1
  })
  return Object.entries(counts)
})

const boundsLabel = computed(() => {
  const box = bounds.value
  if (!box) return '-'
  return `${box.minX.toFixed(5)}, ${box.minY.toFixed(5)} -> ${box.maxX.toFixed(5)}, ${box.maxY.toFixed(5)}`
})
</script>

<template>
  <div class="geo-viewer">
    <aside class="geo-panel">
      <span>{{ type.toUpperCase() }}</span>
      <h2>地理数据预览</h2>
      <dl>
        <div>
          <dt>要素数</dt>
          <dd>{{ features.length }}</dd>
        </div>
        <div>
          <dt>范围</dt>
          <dd>{{ boundsLabel }}</dd>
        </div>
      </dl>
      <div class="geo-counts">
        <strong>几何类型</strong>
        <p v-for="[name, count] in geometryCounts" :key="name">{{ name }}: {{ count }}</p>
      </div>
    </aside>
    <main class="geo-map">
      <svg :viewBox="`0 0 ${width} ${height}`" role="img" aria-label="地理数据 SVG 预览">
        <rect :width="width" :height="height" rx="8" />
        <g v-html="svgContent" />
      </svg>
    </main>
  </div>
</template>

<style scoped>
.geo-viewer {
  min-height: 100%;
  display: grid;
  grid-template-columns: minmax(240px, 320px) minmax(0, 1fr);
  background: #eef1f4;
  color: #132235;
}

.geo-panel {
  padding: 24px;
  border-right: 1px solid rgba(15, 23, 42, 0.08);
  background: #fff;
}

.geo-panel > span {
  color: #0f766e;
  font-size: 12px;
  font-weight: 800;
}

.geo-panel h2 {
  margin: 8px 0 22px;
  font-size: 24px;
}

.geo-panel dl {
  display: grid;
  gap: 12px;
  margin: 0;
}

.geo-panel dt,
.geo-counts strong {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.geo-panel dd {
  margin: 4px 0 0;
  word-break: break-all;
  font-size: 14px;
}

.geo-counts {
  margin-top: 24px;
}

.geo-counts p {
  margin: 8px 0 0;
  font-size: 14px;
}

.geo-map {
  padding: 28px;
  overflow: auto;
}

.geo-map svg {
  display: block;
  width: min(100%, 1200px);
  min-width: 640px;
  height: auto;
  margin: 0 auto;
  overflow: visible;
}

.geo-map rect {
  fill: #f8fafc;
  stroke: rgba(15, 23, 42, 0.08);
}

.geo-map :deep(path) {
  fill: none;
  stroke: #0f766e;
  stroke-width: 2.2;
  vector-effect: non-scaling-stroke;
}

.geo-map :deep(.geo-polygon) {
  fill: rgba(45, 212, 191, 0.18);
}

.geo-map :deep(circle) {
  fill: #2563eb;
  stroke: #fff;
  stroke-width: 1.5;
  vector-effect: non-scaling-stroke;
}

@media (max-width: 860px) {
  .geo-viewer {
    grid-template-columns: 1fr;
  }

  .geo-panel {
    border-right: 0;
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  }
}
</style>
