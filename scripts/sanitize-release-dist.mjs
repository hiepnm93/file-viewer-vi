import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sanitizeOfflineViewerAssetTree } from './lib/offline-asset-sanitize.mjs'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const sourceRoot = resolve(scriptDir, '..')
const roots = [
  'apps/viewer-demo/dist',
  'apps/component-demo/dist',
  'packages/components/web/viewer',
  'packages/compat/web/viewer',
  'packages/components/web-full/dist'
]

let checkedFiles = 0
let touchedFiles = 0
let replacementCount = 0

for (const root of roots) {
  const absoluteRoot = resolve(sourceRoot, root)
  if (!existsSync(absoluteRoot)) {
    continue
  }
  const result = await sanitizeOfflineViewerAssetTree(absoluteRoot)
  checkedFiles += result.checkedFiles
  touchedFiles += result.touchedFiles.length
  replacementCount += result.replacementCount
}

console.log(
  `[release-dist-sanitize] Checked ${checkedFiles} runtime dist assets; touched ${touchedFiles} files with ${replacementCount} offline fallback replacements.`
)
