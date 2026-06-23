import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pluginDist = resolve(root, 'packages/presets/vite-plugin/dist/index.js')
const coreDist = resolve(root, 'packages/core/dist/index.js')

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

assert(
  existsSync(pluginDist),
  'packages/presets/vite-plugin/dist/index.js is missing; run pnpm --filter @file-viewer/vite-plugin build first.'
)
assert(
  existsSync(coreDist),
  'packages/core/dist/index.js is missing; run pnpm --filter @file-viewer/core build first.'
)

const plugin = await import(`${pathToFileURL(pluginDist).href}?t=${Date.now()}`)
const core = await import(`${pathToFileURL(coreDist).href}?t=${Date.now()}`)
const { resolveFileViewerRendererSelection } = plugin
const { DEFAULT_RENDERER_DEFINITIONS } = core

const expectedPackageByRendererId = new Map([
  ['pdf', '@file-viewer/renderer-pdf'],
  ['ofd', '@file-viewer/renderer-ofd'],
  ['typst', '@file-viewer/renderer-typst'],
  ['office-word-openxml', '@file-viewer/renderer-word'],
  ['office-word-binary', '@file-viewer/renderer-word'],
  ['open-document', '@file-viewer/renderer-word'],
  ['office-presentation', '@file-viewer/renderer-presentation'],
  ['spreadsheet-openxml', '@file-viewer/renderer-spreadsheet'],
  ['cad', '@file-viewer/renderer-cad'],
  ['model', '@file-viewer/renderer-3d'],
  ['drawing', '@file-viewer/renderer-drawing'],
  ['mindmap', '@file-viewer/renderer-mindmap'],
  ['geo', '@file-viewer/renderer-geo'],
  ['archive', '@file-viewer/renderer-archive'],
  ['email', '@file-viewer/renderer-email'],
  ['epub', '@file-viewer/renderer-ebook'],
  ['code', '@file-viewer/renderer-text'],
  ['markdown', '@file-viewer/renderer-text'],
  ['image', '@file-viewer/renderer-image'],
  ['audio', '@file-viewer/renderer-media'],
  ['video', '@file-viewer/renderer-media'],
  ['data-asset', '@file-viewer/renderer-data'],
  ['eda', '@file-viewer/renderer-eda'],
])

const checked = []
for (const definition of DEFAULT_RENDERER_DEFINITIONS) {
  const expectedPackage = expectedPackageByRendererId.get(definition.id)
  if (!expectedPackage) {
    continue
  }
  for (const extension of definition.extensions) {
    const selection = resolveFileViewerRendererSelection({ formats: [extension] }, root)
    assert(
      selection.packages.includes(expectedPackage),
      `${extension} (${definition.id}) should select ${expectedPackage}; got ${selection.packages.join(', ') || 'no packages'}`
    )
    checked.push(extension)
  }
}

for (const [rendererId, expectedPackage] of expectedPackageByRendererId) {
  const selection = resolveFileViewerRendererSelection({ renderers: [rendererId] }, root)
  assert(
    selection.packages.includes(expectedPackage),
    `renderer id ${rendererId} should select ${expectedPackage}; got ${selection.packages.join(', ') || 'no packages'}`
  )
}

console.log(
  `[vite-plugin-format-coverage] Verified ${checked.length} extracted renderer extensions and ${expectedPackageByRendererId.size} renderer ids against @file-viewer/core.`
)
