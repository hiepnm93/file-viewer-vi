import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { extname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const sourceRoots = [
  'packages/core/src',
  'packages/components/vue3/src',
  'packages/components/vue2.7/src',
  'packages/components/vue2.6/src',
  'packages/components/react/src',
  'packages/components/react-legacy/src',
  'packages/components/web/src',
  'packages/components/jquery/src',
  'packages/components/svelte/src',
  'packages/compat/vue3/src',
  'packages/compat/vue2/src',
  'packages/compat/web/src',
  'apps/viewer-demo/src',
  'apps/component-demo/src',
].map(path => resolve(root, path))

const allowedExtensions = new Set([
  '.css',
  '.html',
  '.js',
  '.jsx',
  '.mjs',
  '.svelte',
  '.ts',
  '.tsx',
  '.vue',
])
const ignoredDirectories = new Set([
  '.git',
  '.turbo',
  'coverage',
  'dist',
  'node_modules',
  'viewer',
])

const urlPattern = /https?:\/\/[^\s'"`<>)]+/gi
const deniedHostFragments = [
  'cdn.jsdelivr.net',
  'cdnjs.cloudflare.com',
  'esm.sh',
  'googleapis.com',
  'gstatic.com',
  'npm.onmicrosoft.cn',
  'unpkg.com',
  'viewer.diagrams.net',
]
const allowedUrlPrefixes = [
  'http://localhost/',
  'http://127.0.0.1',
  'http://www.w3.org/',
  'https://www.w3.org/',
  'http://schemas.openxmlformats.org/',
  'http://schemas.microsoft.com/',
  'http://purl.oclc.org/',
  'http://www.idpf.org/',
  'http://www.daisy.org/',
  'http://www.apache.org/licenses/LICENSE-2.0',
  'https://demo.file-viewer.app',
]

const findFiles = async dir => {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) {
      continue
    }

    const path = resolve(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await findFiles(path))
      continue
    }

    if (entry.isFile() && allowedExtensions.has(extname(entry.name))) {
      files.push(path)
    }
  }

  return files
}

const isAllowedUrl = url => {
  if (allowedUrlPrefixes.some(prefix => url.startsWith(prefix))) {
    return true
  }

  try {
    const parsed = new URL(url)
    return parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1'
  } catch {
    return false
  }
}

const isDeniedUrl = url => {
  const normalized = url.toLowerCase()
  return deniedHostFragments.some(fragment => normalized.includes(fragment))
}

const violations = []
let scannedFiles = 0

for (const sourceRoot of sourceRoots) {
  if (!existsSync(sourceRoot)) {
    continue
  }

  const files = await findFiles(sourceRoot)
  for (const file of files) {
    scannedFiles += 1
    const content = await readFile(file, 'utf8')
    const lines = content.split('\n')

    lines.forEach((line, lineIndex) => {
      const urls = line.match(urlPattern) || []
      urls.forEach(url => {
        const cleanUrl = url.replace(/[.,;]+$/, '')
        if (isAllowedUrl(cleanUrl) && !isDeniedUrl(cleanUrl)) {
          return
        }
        violations.push({
          file: relative(root, file),
          line: lineIndex + 1,
          url: cleanUrl,
        })
      })
    })
  }
}

if (violations.length) {
  console.error('[file-viewer] Offline runtime asset verification failed.')
  for (const violation of violations) {
    console.error(`- ${violation.file}:${violation.line} ${violation.url}`)
  }
  console.error('\nRuntime preview code must not depend on public CDN or third-party online assets.')
  process.exit(1)
}

console.log(`[file-viewer] Offline runtime asset verification passed (${scannedFiles} source files scanned).`)
