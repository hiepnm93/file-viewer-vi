import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const distDir = path.join(root, 'dist')

const fail = message => {
  console.error(`[package-output] ${message}`)
  process.exit(1)
}

const assertFile = file => {
  const fullPath = path.join(root, file)
  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
    fail(`Missing required package file: ${file}`)
  }
}

const assertMissing = file => {
  if (fs.existsSync(path.join(root, file))) {
    fail(`Unexpected demo artifact in library package output: ${file}`)
  }
}

assertFile('dist/index.mjs')
assertFile('dist/src/package/index.d.ts')
assertFile('dist/style.css')
assertFile('dist/wasm/cad/dwg-worker.js')

assertMissing('dist/index.html')
assertMissing('dist/compare.html')

const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
const typeEntry = packageJson.exports?.['.']?.types || packageJson.types
if (!typeEntry) {
  fail('package.json does not expose a type entry.')
}

const normalizedTypeEntry = typeEntry.replace(/^\.\//, '')
if (!fs.existsSync(path.join(root, normalizedTypeEntry))) {
  fail(`package.json type entry does not exist: ${typeEntry}`)
}

console.log(`[package-output] Verified library package output in ${distDir}`)
