import { spawnSync } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = resolve(packageDir, 'dist')
const require = createRequire(import.meta.url)
const tscBin = require.resolve('typescript/bin/tsc')

await mkdir(distDir, { recursive: true })

const result = spawnSync(process.execPath, [tscBin, '-b', 'tsconfig.json'], {
  cwd: packageDir,
  stdio: 'inherit'
})

if (result.status !== 0) {
  throw new Error(`TypeScript build failed for @file-viewer/vue3 with exit code ${result.status ?? 'unknown'}.`)
}

await writeFile(resolve(distDir, 'file-viewer3.css'), [
  '.ff-file-viewer-vue3 {',
  '  width: 100%;',
  '  height: 100%;',
  '  min-height: 0;',
  '}',
  ''
].join('\n'))
