import { readFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildReleaseMatrix,
  stableStringify
} from './lib/release-matrix.mjs'
import { validateJsonSchema } from './lib/simple-json-schema.mjs'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const sourceRoot = resolve(scriptDir, '..')
const args = process.argv.slice(2)
const metadataOnly = args.includes('--metadata-only')
const runBrowser = args.includes('--browser') || !metadataOnly
const matrixPath = join(sourceRoot, 'ecosystem', 'release-matrix.json')
const schemaPath = join(sourceRoot, 'ecosystem', 'release-matrix.schema.json')

function assert(condition, message) {
  if (!condition) {
    throw new Error(`[release-matrix] ${message}`)
  }
}

function run(command, commandArgs) {
  console.log(`$ ${[command, ...commandArgs].join(' ')}`)
  const result = spawnSync(command, commandArgs, {
    cwd: sourceRoot,
    stdio: 'inherit',
    env: process.env
  })
  if (result.status !== 0) {
    throw new Error(`[release-matrix] Command failed: ${command} ${commandArgs.join(' ')}`)
  }
}

const expected = await buildReleaseMatrix(sourceRoot)
const [actualContent, schemaContent] = await Promise.all([
  readFile(matrixPath, 'utf8').catch(() => ''),
  readFile(schemaPath, 'utf8')
])
const expectedContent = stableStringify(expected)
assert(actualContent === expectedContent, 'ecosystem/release-matrix.json is out of date. Run `pnpm generate:release-matrix`.')

const matrix = JSON.parse(actualContent)
const schema = JSON.parse(schemaContent)
const schemaFailures = validateJsonSchema(matrix, schema)
assert(!schemaFailures.length, `ecosystem/release-matrix.json does not match schema:\n${schemaFailures.join('\n')}`)
assert(
  schema.$id === `https://github.com/flyfish-dev/file-viewer/releases/download/v${matrix.version}/release-matrix.schema.json`,
  'release matrix schema $id must point at the matching GitHub Release schema asset'
)
assert(matrix.generatedFrom.releaseMatrixSchema === 'ecosystem/release-matrix.schema.json', 'release matrix must record its schema source')

const packagesByName = new Map(matrix.packages.map(entry => [entry.packageName, entry]))
const componentIds = new Set(matrix.componentTargets.map(target => target.id))
const renderChainIds = new Set(matrix.renderChains.map(chain => chain.id))
const targetIds = new Set()

assert(matrix.counts.packages === 52, `expected 52 ecosystem packages, got ${matrix.counts.packages}`)
assert(matrix.counts.componentTargets === 16, `expected 16 component targets, got ${matrix.counts.componentTargets}`)
assert(matrix.counts.rendererIds === 24, `expected 24 renderer ids, got ${matrix.counts.rendererIds}`)
assert(matrix.counts.renderChains >= matrix.counts.rendererIds, 'render chains must cover every renderer id')
assert(matrix.counts.exhaustiveComponentRenderTargets === matrix.counts.componentTargets * matrix.counts.renderChains, 'exhaustive target count drifted')
assert(matrix.releasePolicy.nonBlockingChannels.length === 1 && matrix.releasePolicy.nonBlockingChannels[0] === 'gitee-mirror', 'only Gitee may be non-blocking')

for (const entry of matrix.packages) {
  assert(entry.blocking === true, `${entry.packageName} must be blocking in the release matrix`)
  assert(entry.version === matrix.version || entry.releaseVersion === entry.version, `${entry.packageName} version is not release-aligned`)
}

for (const requiredPackage of [
  '@file-viewer/core',
  '@file-viewer/web',
  '@file-viewer/web-full',
  '@file-viewer/vue3',
  '@file-viewer/vue3-full',
  '@file-viewer/react',
  '@file-viewer/react-full',
  '@file-viewer/svelte',
  '@file-viewer/svelte-full',
  '@file-viewer/vite-plugin'
]) {
  assert(packagesByName.has(requiredPackage), `release matrix is missing ${requiredPackage}`)
}

for (const target of matrix.componentTargets) {
  assert(packagesByName.has(target.packageName), `component target ${target.id} references unknown package ${target.packageName}`)
  assert(Array.isArray(target.surfaces) && target.surfaces.length, `component target ${target.id} has no surfaces`)
  if (target.flavor === 'full') {
    assert(target.presetPolicy === 'preset-all-by-default', `${target.id} full package must use preset-all-by-default`)
  } else {
    assert(target.presetPolicy === 'explicit-preset-all', `${target.id} standard package must use explicit-preset-all`)
  }
}

for (const target of matrix.matrixTargets) {
  assert(!targetIds.has(target.id), `duplicate matrix target ${target.id}`)
  targetIds.add(target.id)
  assert(componentIds.has(target.componentId), `matrix target ${target.id} references unknown component ${target.componentId}`)
  assert(renderChainIds.has(target.renderChainId), `matrix target ${target.id} references unknown render chain ${target.renderChainId}`)
  assert(Array.isArray(target.assertions) && target.assertions.length, `matrix target ${target.id} has no assertions`)
}

const rendererIds = new Set(matrix.renderChains.map(chain => chain.rendererId))
assert(rendererIds.size === matrix.counts.rendererIds, 'render chains do not cover the declared renderer id count')

for (const check of matrix.specialBrowserChecks) {
  assert(typeof check.script === 'string' && check.script.startsWith('verify:'), `special browser check ${check.id} has invalid script`)
}

console.log(
  `[release-matrix] Metadata verified: ${matrix.counts.packages} packages, ${matrix.counts.componentTargets} component targets, ${matrix.counts.renderChains} render chains, ${matrix.counts.exhaustiveComponentRenderTargets} exhaustive targets.`
)

if (runBrowser) {
  const browserGateScripts = [
    'verify:smoke-matrix',
    'verify:demo-browser-smoke',
    'verify:component-browser-smoke',
    'verify:web-full-iife-pptx',
    'verify:issue71-full-rendering-smoke',
    'verify:issue72-web-full-iife',
    'verify:vite-plugin-auto-scan',
    'verify:vite-plugin-format-coverage'
  ]
  for (const script of browserGateScripts) {
    run('pnpm', [script])
  }
  console.log(`[release-matrix] Browser and integration gates passed for ${browserGateScripts.length} scripts.`)
}
