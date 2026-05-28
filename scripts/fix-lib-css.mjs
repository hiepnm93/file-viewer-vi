import { readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const distDir = resolve(process.cwd(), 'dist')
const files = []

async function collectFiles(dir) {
  const entries = await readdir(dir)
  for (const entry of entries) {
    const filePath = join(dir, entry)
    const fileStat = await stat(filePath)
    if (fileStat.isDirectory()) {
      await collectFiles(filePath)
      continue
    }
    files.push(filePath)
  }
}

await collectFiles(distDir)

const cssAssets = []
for (const filePath of files) {
  if (!filePath.endsWith('.css')) {
    continue
  }
  const source = await readFile(filePath, 'utf8')
  if (source.trim().length > 0) {
    cssAssets.push({ filePath, source })
  }
}

if (!cssAssets.length) {
  process.exit(0)
}

cssAssets.sort((a, b) => b.source.length - a.source.length)
const cssAsset = cssAssets[0]
const cssDataUrl = `data:text/css;base64,${Buffer.from(cssAsset.source).toString('base64')}`

for (const filePath of files) {
  if (!/\.(mjs|js)$/.test(filePath)) {
    continue
  }

  const source = await readFile(filePath, 'utf8')
  let rewritten = source
  const cssHref = JSON.stringify(cssDataUrl)

  rewritten = rewritten.replace(
    /const\s+([A-Za-z_$][\w$]*)\s*=\s*"data:text\/css;base64,[^"]*";/,
    (_match, varName) => `const ${varName} = ${cssHref};`
  )
  rewritten = rewritten.replace(
    /new URL\("style\.css", import\.meta\.url\)\.href/g,
    cssHref
  )
  rewritten = rewritten.replace(
    /new URL\("\.\/file-viewer3\.css", import\.meta\.url\)\.href/g,
    cssHref
  )

  if (rewritten !== source) {
    await writeFile(filePath, rewritten, 'utf8')
  }
}
