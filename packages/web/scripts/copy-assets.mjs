#!/usr/bin/env node
import { cp, mkdir, readdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptFile = fileURLToPath(import.meta.url)
const packageDir = resolve(dirname(scriptFile), '..')
const sourceDir = resolve(packageDir, 'viewer')
const isPostinstall = process.argv.includes('--postinstall')
const explicitTarget = process.argv.slice(2).find(arg => !arg.startsWith('--'))
const targetDir = resolve(
  process.env.FILE_VIEWER_PUBLIC_DIR ||
  explicitTarget ||
  resolve(process.env.INIT_CWD || process.cwd(), 'public/file-viewer')
)

const skip = process.env.FILE_VIEWER_SKIP_ASSET_COPY === '1' ||
  process.env.FILE_VIEWER_SKIP_ASSET_COPY === 'true'

if (skip) {
  process.exit(0)
}

// Workspace installs should not mutate the repository automatically.
if (isPostinstall && !packageDir.includes('node_modules')) {
  process.exit(0)
}

if (!existsSync(resolve(sourceDir, 'index.html'))) {
  const message = `[file-viewer-web] 缺少 viewer 构建产物: ${sourceDir}`
  if (isPostinstall) {
    console.warn(message)
    process.exit(0)
  }
  console.error(message)
  process.exit(1)
}

const removeMacMetadata = async dir => {
  const entries = await readdir(dir, { withFileTypes: true })
  await Promise.all(entries.map(entry => {
    const path = resolve(dir, entry.name)
    if (entry.name === '.DS_Store') {
      return rm(path, { force: true })
    }
    if (entry.isDirectory()) {
      return removeMacMetadata(path)
    }
    return undefined
  }))
}

await rm(targetDir, { force: true, recursive: true })
await mkdir(targetDir, { recursive: true })
await cp(sourceDir, targetDir, { recursive: true })
await removeMacMetadata(targetDir)

console.log(`[file-viewer-web] viewer assets copied to ${targetDir}`)
