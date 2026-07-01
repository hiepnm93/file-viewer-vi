import { existsSync } from 'node:fs'
import { readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { extname, join } from 'node:path'

const textAssetExtensions = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.mjs',
  '.svg',
  '.txt',
  '.xml'
])

const replacements = [
  {
    pattern: /https:\/\/cdn\.jsdelivr\.net\/npm\/@mathjax/g,
    replacement: '[mathjax]/fonts',
    reason: 'MathJax font path must resolve from vendored Draw.io assets'
  },
  {
    pattern: /https:\/\/cdn\.jsdelivr\.net/g,
    replacement: 'file-viewer-offline-cdn',
    reason: 'runtime CDN fallback markers are forbidden in release assets'
  },
  {
    pattern: /https:\/\/unpkg\.com/g,
    replacement: 'file-viewer-offline-cdn',
    reason: 'runtime CDN fallback markers are forbidden in release assets'
  },
  {
    pattern: /\bunpkg\.com\b/g,
    replacement: 'file-viewer-offline-cdn',
    reason: 'runtime CDN fallback markers are forbidden in release assets'
  },
  {
    pattern: /http:\/\/localhost\//g,
    replacement: 'https://file-viewer.app/',
    reason: 'runtime fallback base URL must not be localhost'
  },
  {
    pattern: /http:\/\/127\.0\.0\.1(?::\d+)?\/?/g,
    replacement: 'https://file-viewer.app/',
    reason: 'runtime fallback base URL must not be loopback'
  },
  {
    pattern: /http:\/\/0\.0\.0\.0(?::\d+)?\/?/g,
    replacement: 'https://file-viewer.app/',
    reason: 'runtime fallback base URL must not be loopback'
  }
]

async function collectTextFiles(root, files = []) {
  if (!existsSync(root)) {
    return files
  }
  const info = await stat(root)
  if (info.isFile()) {
    if (textAssetExtensions.has(extname(root))) {
      files.push(root)
    }
    return files
  }
  if (!info.isDirectory()) {
    return files
  }
  for (const entry of await readdir(root, { withFileTypes: true })) {
    await collectTextFiles(join(root, entry.name), files)
  }
  return files
}

export async function sanitizeOfflineViewerAssetTree(root) {
  const files = await collectTextFiles(root)
  const touchedFiles = []
  let replacementCount = 0

  for (const file of files) {
    let text = await readFile(file, 'utf8')
    const original = text
    for (const item of replacements) {
      text = text.replace(item.pattern, () => {
        replacementCount += 1
        return item.replacement
      })
    }
    if (text !== original) {
      await writeFile(file, text, 'utf8')
      touchedFiles.push(file)
    }
  }

  return {
    root,
    checkedFiles: files.length,
    touchedFiles,
    replacementCount
  }
}
