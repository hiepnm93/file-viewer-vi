import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))

const workerBuilds = [
  {
    label: 'docx',
    entry: resolve(root, 'packages/core/src/renderers/wordDocx.worker.ts'),
    outDir: resolve(root, 'dist/vendor/docx'),
    fileName: 'docx.worker.js'
  },
  {
    label: 'spreadsheet',
    entry: resolve(root, 'packages/core/src/renderers/spreadsheet/worker/sheetjs/sheet.worker.ts'),
    outDir: resolve(root, 'dist/vendor/xlsx'),
    fileName: 'sheet.worker.js'
  }
]

for (const worker of workerBuilds) {
  await mkdir(worker.outDir, { recursive: true })
  await build({
    configFile: false,
    publicDir: false,
    logLevel: 'warn',
    build: {
      emptyOutDir: false,
      minify: true,
      codeSplitting: false,
      outDir: worker.outDir,
      target: 'es2019',
      lib: {
        entry: worker.entry,
        formats: ['es'],
        fileName: () => worker.fileName
      },
      rollupOptions: {}
    }
  })
  console.log(`[file-viewer] Built ${worker.label} worker to ${worker.outDir}/${worker.fileName}`)
}
