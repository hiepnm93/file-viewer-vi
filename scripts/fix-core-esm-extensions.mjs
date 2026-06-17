import { existsSync } from 'node:fs'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const sourceRoot = resolve(scriptDir, '..')
const coreDistDir = join(sourceRoot, 'packages', 'core', 'dist')

const relativeSpecifierPattern = /(\bfrom\s*['"]|\bimport\s*\(\s*['"])(\.{1,2}\/[^'"]+)(['"])/g

const hasKnownExtension = specifier => extname(specifier) !== ''

const resolveJsSpecifier = (fileDir, specifier) => {
  if (hasKnownExtension(specifier)) {
    return specifier
  }

  const candidate = resolve(fileDir, `${specifier}.js`)
  return existsSync(candidate) ? `${specifier}.js` : specifier
}

async function fixFile(filePath) {
  const source = await readFile(filePath, 'utf8')
  const fileDir = dirname(filePath)
  const fixed = source.replace(relativeSpecifierPattern, (_match, prefix, specifier, suffix) => {
    return `${prefix}${resolveJsSpecifier(fileDir, specifier)}${suffix}`
  })

  if (fixed !== source) {
    await writeFile(filePath, fixed, 'utf8')
    return true
  }
  return false
}

const entries = await readdir(coreDistDir, { withFileTypes: true })
let changedCount = 0

for (const entry of entries) {
  if (!entry.isFile() || extname(entry.name) !== '.js') {
    continue
  }
  const changed = await fixFile(join(coreDistDir, entry.name))
  if (changed) {
    changedCount += 1
  }
}

console.log(`[core-esm] Normalized relative import extensions in ${changedCount} file${changedCount === 1 ? '' : 's'}.`)
