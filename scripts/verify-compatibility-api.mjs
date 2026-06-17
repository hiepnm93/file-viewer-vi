import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEcosystemReleaseContext } from './lib/ecosystem-packages.mjs'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const sourceRoot = resolve(scriptDir, '..')
const { rootPackage, entries } = await loadEcosystemReleaseContext(sourceRoot)
const expectedWorkspaceRange = `workspace:^${rootPackage.version}`
const entryByName = new Map(entries.map(entry => [entry.packageName, entry]))

const webFacadeExports = [
  'DEFAULT_VIEWER_PUBLIC_DIR',
  'DEFAULT_VIEWER_URL',
  'VIEWER_FRAME_CACHE_KEY',
  'buildViewerSrc',
  'createViewerFrame',
  'createViewerFrameControllerHandle',
  'createViewerFrameFilePostController',
  'createViewerMountedFrameHandle',
  'isViewerFrameEvent',
  'mountViewerFrame',
  'mountViewer',
  'postFileToViewer',
  'syncViewerFrame',
  'toMessageBlob'
]

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function runtimeDependencies(packageJson) {
  return {
    ...packageJson.dependencies,
    ...packageJson.optionalDependencies
  }
}

function assertTokens(source, tokens, label) {
  for (const token of tokens) {
    assert(source.includes(token), `${label} must include ${token}`)
  }
}

function assertImportsFrom(source, packageName, label) {
  assert(
    source.includes(`from '${packageName}'`) || source.includes(`from "${packageName}"`),
    `${label} must import from ${packageName}`
  )
}

function assertNotImportsFrom(source, packageName, label) {
  assert(
    !source.includes(`from '${packageName}'`) && !source.includes(`from "${packageName}"`),
    `${label} must not import from ${packageName}`
  )
}

async function readSource(entry, relativePath) {
  return readFile(join(entry.absoluteDir, relativePath), 'utf8')
}

function requireEntry(packageName) {
  const entry = entryByName.get(packageName)
  assert(entry, `Missing compatibility package ${packageName}`)
  return entry
}

async function verifyWebCompatibility() {
  const entry = requireEntry('@flyfish-group/file-viewer-web')
  const dependencies = runtimeDependencies(entry.packageJson)
  assert(
    dependencies['@file-viewer/core'] === expectedWorkspaceRange,
    `${entry.packageName} must be the compatibility facade that depends on @file-viewer/core@${expectedWorkspaceRange}`
  )

  const indexSource = await readSource(entry, 'src/index.ts')
  assertImportsFrom(indexSource, '@file-viewer/core', entry.packageName)
  assertTokens(indexSource, webFacadeExports, entry.packageName)

  const globalSource = await readSource(entry, 'src/global.ts')
  assertTokens(globalSource, ['FlyfishFileViewerWeb', ...webFacadeExports], `${entry.packageName} global bundle`)
}

async function verifyReactCompatibility() {
  const entry = requireEntry('@flyfish-group/file-viewer-react')
  const dependencies = runtimeDependencies(entry.packageJson)
  assert(
    !dependencies['@file-viewer/core'],
    `${entry.packageName} must consume @flyfish-group/file-viewer-web instead of depending on @file-viewer/core`
  )
  assert(
    dependencies['@flyfish-group/file-viewer-web'] === expectedWorkspaceRange,
    `${entry.packageName} must depend on @flyfish-group/file-viewer-web@${expectedWorkspaceRange}`
  )

  const source = await readSource(entry, 'src/index.tsx')
  assertImportsFrom(source, '@flyfish-group/file-viewer-web', entry.packageName)
  assertNotImportsFrom(source, '@file-viewer/core', entry.packageName)
  assertTokens(source, [
    'FileViewerHandle',
    'FileViewerProps',
    'forwardRef',
    'useImperativeHandle',
    'buildViewerSrc',
    'createViewerFrameFilePostController',
    'isViewerFrameEvent',
    'ViewerFrameOptions',
    'ViewerFrameComponentProps',
    'ViewerFrameFilePostController',
    'postFile',
    'reload',
    'onViewerEvent'
  ], entry.packageName)
  assert(
    /export\s+type\s*{[\s\S]*ViewerRuntimeOptions[\s\S]*}\s+from\s+['"]@flyfish-group\/file-viewer-web['"]/.test(source),
    `${entry.packageName} must re-export shared option types from @flyfish-group/file-viewer-web`
  )
}

async function verifyVue3ScopedCompatibility() {
  const entry = requireEntry('@flyfish-group/file-viewer3')
  const dependencies = runtimeDependencies(entry.packageJson)
  assert(
    dependencies['@file-viewer/core'] === expectedWorkspaceRange,
    `${entry.packageName} must depend on @file-viewer/core@${expectedWorkspaceRange}`
  )

  const typeFacadeSource = await readSource(entry, 'src/package/common/type.ts')
  assertImportsFrom(typeFacadeSource, '@file-viewer/core', `${entry.packageName} type facade`)
  assertNotImportsFrom(typeFacadeSource, 'vue', `${entry.packageName} type facade`)
  assert(
    /import\s+type\s*{[\s\S]*}\s+from\s+['"]@file-viewer\/core['"]/.test(typeFacadeSource),
    `${entry.packageName} type facade must import core contracts with import type`
  )
  assert(
    !/\bimport\s+(?!type\b)/.test(typeFacadeSource),
    `${entry.packageName} type facade must not contain runtime imports`
  )
  assert(
    /export\s+type\s+FileViewerEmits\s*=\s*CoreFileViewerComponentEmits/.test(typeFacadeSource),
    `${entry.packageName} FileViewerEmits must be a core alias`
  )
}

async function verifyVue3UnscopedCompatibility() {
  const entry = requireEntry('file-viewer3')
  const dependencies = runtimeDependencies(entry.packageJson)
  assert(
    dependencies['@flyfish-group/file-viewer3'] === expectedWorkspaceRange,
    `${entry.packageName} must depend on @flyfish-group/file-viewer3@${expectedWorkspaceRange}`
  )
  assert(
    !dependencies['@file-viewer/core'],
    `${entry.packageName} must remain a thin alias and must not depend on @file-viewer/core`
  )
  assert(
    !existsSync(join(entry.absoluteDir, 'src')),
    `${entry.packageName} must not carry duplicate Vue3 source; it should generate a thin alias dist`
  )

  const buildScript = await readSource(entry, 'scripts/build.mjs')
  assertTokens(buildScript, [
    "export { default } from '@flyfish-group/file-viewer3';",
    "export * from '@flyfish-group/file-viewer3';",
    "@import '@flyfish-group/file-viewer3/dist/file-viewer3.css';"
  ], `${entry.packageName} build script`)
}

await verifyWebCompatibility()
await verifyReactCompatibility()
await verifyVue3ScopedCompatibility()
await verifyVue3UnscopedCompatibility()

console.log('Verified compatibility package runtime facades and alias boundaries.')
