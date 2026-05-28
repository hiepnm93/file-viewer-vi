import { readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const distDir = process.env.FILE_VIEWER_DIST_DIR
  ? resolve(process.env.FILE_VIEWER_DIST_DIR)
  : join(process.cwd(), 'dist')

const inlineWorkerBlobRE = /new Blob\(\[atob\(([^)]+)\)\],/g

async function collectJavaScriptFiles(dir, files = []) {
  const entries = await readdir(dir)
  for (const entry of entries) {
    const filePath = join(dir, entry)
    const fileStat = await stat(filePath)
    if (fileStat.isDirectory()) {
      await collectJavaScriptFiles(filePath, files)
    } else if (/\.(mjs|js)$/.test(entry)) {
      files.push(filePath)
    }
  }
  return files
}

for (const filePath of await collectJavaScriptFiles(distDir)) {
  const source = await readFile(filePath, 'utf8')
  let replacementCount = 0
  const fixed = source.replace(inlineWorkerBlobRE, (_match, base64Source) => {
    replacementCount += 1
    return `new Blob([Uint8Array.from(atob(${base64Source}), byte => byte.charCodeAt(0))],`
  })

  if (!replacementCount) continue

  await writeFile(filePath, fixed, 'utf8')
  console.log(`fixed ${replacementCount} inline worker blob(s) in ${filePath.replace(`${process.cwd()}/`, '')}`)
}
