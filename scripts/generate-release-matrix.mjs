import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildReleaseMatrix,
  stableStringify
} from './lib/release-matrix.mjs'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const sourceRoot = resolve(scriptDir, '..')
const matrixPath = join(sourceRoot, 'ecosystem', 'release-matrix.json')
const args = process.argv.slice(2)
const check = args.includes('--check')

const matrix = await buildReleaseMatrix(sourceRoot)
const nextContent = stableStringify(matrix)

if (check) {
  let currentContent = ''
  try {
    currentContent = await readFile(matrixPath, 'utf8')
  } catch {
    throw new Error('ecosystem/release-matrix.json is missing. Run `pnpm generate:release-matrix`.')
  }
  if (currentContent !== nextContent) {
    throw new Error('ecosystem/release-matrix.json is out of date. Run `pnpm generate:release-matrix`.')
  }
  console.log(`[release-matrix] Verified ${matrix.counts.packages} package rows and ${matrix.counts.exhaustiveComponentRenderTargets} component render targets.`)
} else {
  await writeFile(matrixPath, nextContent, 'utf8')
  console.log(`[release-matrix] Wrote ecosystem/release-matrix.json with ${matrix.counts.packages} package rows and ${matrix.counts.exhaustiveComponentRenderTargets} component render targets.`)
}
