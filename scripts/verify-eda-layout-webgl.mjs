import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distEntry = resolve(root, 'packages/renderers/eda-layout/dist/index.js')

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

assert(
  existsSync(distEntry),
  'packages/renderers/eda-layout/dist/index.js is missing; run pnpm --filter @file-viewer/eda-layout build first.'
)

const { createEdaLayoutWebglBatch } = await import(`${pathToFileURL(distEntry).href}?t=${Date.now()}`)

const batch = createEdaLayoutWebglBatch({
  format: 'gdsii',
  libraryName: 'smoke',
  structureCount: 1,
  structures: ['TOP'],
  bounds: { minX: 0, minY: 0, maxX: 100, maxY: 100 },
  warnings: [],
  elements: [
    {
      kind: 'boundary',
      structure: 'TOP',
      layer: 1,
      xy: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
        { x: 0, y: 0 }
      ]
    },
    {
      kind: 'path',
      structure: 'TOP',
      layer: 2,
      xy: [
        { x: 10, y: 10 },
        { x: 90, y: 90 }
      ]
    },
    {
      kind: 'text',
      structure: 'TOP',
      layer: 3,
      text: 'LABEL',
      xy: [{ x: 50, y: 50 }]
    }
  ]
})

assert(batch.format === 'gdsii', 'WebGL batch should keep the GDSII format marker.')
assert(batch.triangleVertices instanceof Float32Array, 'triangleVertices must be a Float32Array.')
assert(batch.lineVertices instanceof Float32Array, 'lineVertices must be a Float32Array.')
assert(batch.pointVertices instanceof Float32Array, 'pointVertices must be a Float32Array.')
assert(batch.triangleVertices.length === 30, `expected two polygon triangles, got ${batch.triangleVertices.length} floats.`)
assert(batch.lineVertices.length >= 50, `expected boundary/path line vertices, got ${batch.lineVertices.length} floats.`)
assert(batch.pointVertices.length === 5, `expected one label anchor point, got ${batch.pointVertices.length} floats.`)
assert(batch.labels.length === 1 && batch.labels[0].text === 'LABEL', 'expected one text label in the WebGL overlay.')

console.log('[eda-layout-webgl] Verified GDSII WebGL triangle, line, point, and label batches.')
