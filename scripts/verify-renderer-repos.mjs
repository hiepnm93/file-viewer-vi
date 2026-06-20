import { existsSync } from 'node:fs'
import { readFile, stat } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const sourceRoot = resolve(scriptDir, '..')
const args = process.argv.slice(2)

const readArg = (name, fallback) => {
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : fallback
}

const outputRoot = resolve(
  sourceRoot,
  readArg(
    '--out-dir',
    process.env.FILE_VIEWER_COMPONENT_REPO_DIR ||
      process.env.FILE_VIEWER_WRAPPER_REPO_DIR ||
      '.release/component-repos'
  )
)
const selectedPackages = new Set(
  args
    .filter(arg => arg.startsWith('--package='))
    .map(arg => arg.slice('--package='.length))
)
const selectedIds = new Set(
  args
    .filter(arg => arg.startsWith('--id='))
    .map(arg => arg.slice('--id='.length))
)

const readJson = async path => JSON.parse(await readFile(path, 'utf8'))
const ecosystemManifest = await readJson(join(sourceRoot, 'ecosystem', 'wrappers.json'))

const assertFile = async (path, label = path) => {
  if (!existsSync(path)) {
    throw new Error(`Missing file: ${label}`)
  }
  const info = await stat(path)
  if (!info.isFile()) {
    throw new Error(`Not a file: ${label}`)
  }
}

const assertNoText = (text, forbidden, label) => {
  if (text.includes(forbidden)) {
    throw new Error(`${label} unexpectedly includes ${forbidden}`)
  }
}

const renderers = (ecosystemManifest.renderers || []).filter(renderer => {
  if (selectedPackages.size && !selectedPackages.has(renderer.packageName)) {
    return false
  }
  if (selectedIds.size && !selectedIds.has(renderer.id)) {
    return false
  }
  return true
})

if (!renderers.length) {
  throw new Error('No renderer packages selected for verification.')
}

for (const renderer of renderers) {
  const targetDir = join(outputRoot, renderer.repository)
  await assertFile(join(targetDir, 'package.json'), `${renderer.packageName} package.json`)
  await assertFile(join(targetDir, 'README.md'), `${renderer.packageName} README.md`)
  await assertFile(join(targetDir, 'README.en.md'), `${renderer.packageName} README.en.md`)
  await assertFile(join(targetDir, 'LICENSE'), `${renderer.packageName} LICENSE`)
  await assertFile(join(targetDir, 'renderer-repo-manifest.json'), `${renderer.packageName} manifest`)
  await assertFile(join(targetDir, 'src', 'index.ts'), `${renderer.packageName} src/index.ts`)

  const packageJson = await readJson(join(targetDir, 'package.json'))
  if (packageJson.name !== renderer.packageName) {
    throw new Error(`${renderer.packageName} export has package name ${packageJson.name}`)
  }
  if (packageJson.repository?.url !== `git+${renderer.github}.git`) {
    throw new Error(`${renderer.packageName} repository URL is not normalized to ${renderer.github}`)
  }
  const serialized = JSON.stringify(packageJson)
  assertNoText(serialized, 'workspace:', `${renderer.packageName} package.json`)
  if (existsSync(join(targetDir, 'node_modules')) || existsSync(join(targetDir, 'dist'))) {
    throw new Error(`${renderer.packageName} standalone repo must not contain node_modules or dist`)
  }
  console.log(`Verified renderer ${renderer.packageName}`)
}

console.log(`Verified ${renderers.length} renderer package repo${renderers.length === 1 ? '' : 's'} in ${outputRoot}.`)
