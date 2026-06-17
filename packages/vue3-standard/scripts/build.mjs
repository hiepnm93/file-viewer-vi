import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = resolve(packageDir, 'dist')

await mkdir(distDir, { recursive: true })

await Promise.all([
  writeFile(resolve(distDir, 'index.js'), [
    "export { default } from '@flyfish-group/file-viewer3';",
    "export * from '@flyfish-group/file-viewer3';",
    ''
  ].join('\n')),
  writeFile(resolve(distDir, 'index.d.ts'), [
    "export { default } from '@flyfish-group/file-viewer3';",
    "export * from '@flyfish-group/file-viewer3';",
    ''
  ].join('\n')),
  writeFile(resolve(distDir, 'file-viewer3.css'), [
    "@import '@flyfish-group/file-viewer3/dist/file-viewer3.css';",
    ''
  ].join('\n'))
])
