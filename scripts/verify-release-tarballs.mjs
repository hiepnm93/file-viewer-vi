import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import {
  collectPackageEntrypoints,
  loadEcosystemReleaseContext,
  readJson
} from './lib/ecosystem-packages.mjs'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const sourceRoot = resolve(scriptDir, '..')
const args = process.argv.slice(2)

const readArg = (name, fallback) => {
  const direct = args.find(arg => arg.startsWith(`${name}=`))
  if (direct) return direct.slice(name.length + 1)
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : fallback
}

const packDir = resolve(sourceRoot, readArg('--pack-dir', process.env.FILE_VIEWER_ECOSYSTEM_PACK_DIR || '.release/ecosystem'))
const keepTemp = args.includes('--keep-temp')

const { entries, rootPackage } = await loadEcosystemReleaseContext(sourceRoot)
const manifestPath = join(packDir, 'npm-release-manifest.json')

function fail(message) {
  throw new Error(`[release-tarballs] ${message}`)
}

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: options.cwd || sourceRoot,
    encoding: 'utf8',
    stdio: options.capture ? 'pipe' : 'inherit'
  })
  if (result.status !== 0) {
    fail(`Command failed: ${command} ${commandArgs.join(' ')}\n${result.stdout || ''}\n${result.stderr || ''}`)
  }
  return result.stdout || ''
}

async function sha256(path) {
  return createHash('sha256').update(await readFile(path)).digest('hex')
}

function tarList(tarballPath) {
  return run('tar', ['-tzf', tarballPath], { capture: true })
    .split('\n')
    .filter(Boolean)
    .map(file => file.replace(/^package\//, ''))
}

function tarReadJson(tarballPath, path) {
  const output = run('tar', ['-xOf', tarballPath, `package/${path}`], { capture: true })
  return JSON.parse(output)
}

function hasWorkspaceDependency(packageJson) {
  return [
    packageJson.dependencies,
    packageJson.optionalDependencies,
    packageJson.peerDependencies
  ].some(group => Object.values(group || {}).some(value => typeof value === 'string' && value.startsWith('workspace:')))
}

function normalizeEntrypoint(value) {
  return String(value || '').replace(/^\.\//, '')
}

function verifyEntrypoints(entry, files) {
  const packed = new Set(files)
  for (const entrypoint of collectPackageEntrypoints(entry.packageJson)) {
    if (entrypoint.includes('*')) continue
    const normalized = normalizeEntrypoint(entrypoint)
    if (!packed.has(normalized)) {
      fail(`${entry.packageName} tarball is missing entrypoint ${entrypoint}`)
    }
  }
}

function verifyAssetManifests(entry, files, tarballPath) {
  const packed = new Set(files)
  const manifestFiles = files.filter(file => file.endsWith('flyfish-viewer-assets.json'))
  for (const manifestFile of manifestFiles) {
    const manifest = tarReadJson(tarballPath, manifestFile)
    const manifestBase = dirname(manifestFile)
    for (const group of manifest.rendererAssetManifests || []) {
      for (const asset of group.assets || []) {
        if (!asset.required || !asset.defaultPath) continue
        const normalizedPath = join(manifestBase, asset.defaultPath).replace(/\\/g, '/').replace(/\/$/, '')
        const hasAsset = asset.defaultPath.endsWith('/')
          ? files.some(file => file.startsWith(`${normalizedPath}/`))
          : packed.has(normalizedPath)
        if (!hasAsset) {
          fail(`${entry.packageName} asset manifest ${manifestFile} references missing ${asset.defaultPath}`)
        }
      }
    }
  }
}

function verifyPackageJson(entry, packedPackageJson) {
  if (packedPackageJson.name !== entry.packageName) {
    fail(`${entry.packageName} packed package name drifted to ${packedPackageJson.name}`)
  }
  if (packedPackageJson.version !== entry.version) {
    fail(`${entry.packageName} packed version ${packedPackageJson.version} !== ${entry.version}`)
  }
  if (hasWorkspaceDependency(packedPackageJson)) {
    fail(`${entry.packageName} packed package.json still contains workspace: dependencies`)
  }
  if (packedPackageJson.private === true) {
    fail(`${entry.packageName} packed package must not be private`)
  }
}

if (!existsSync(manifestPath)) {
  fail(`Missing ${manifestPath}. Run pnpm release:ecosystem:pack first.`)
}

run('node', ['scripts/verify-ecosystem-tarballs.mjs', '--pack-dir', packDir])

const manifest = await readJson(manifestPath)
if (manifest.version !== rootPackage.version) {
  fail(`manifest version ${manifest.version} !== root version ${rootPackage.version}`)
}
if (manifest.packageCount !== entries.length || manifest.packages?.length !== entries.length) {
  fail(`manifest package count does not match release context (${manifest.packageCount}/${manifest.packages?.length} !== ${entries.length})`)
}

const manifestRows = new Map(manifest.packages.map(row => [row.packageName, row]))
let verifiedAssetManifests = 0
let verifiedFiles = 0
const tempRoot = await mkdtemp(resolve(tmpdir(), 'file-viewer-release-tarballs-'))

try {
  for (const entry of entries) {
    const row = manifestRows.get(entry.packageName)
    if (!row) {
      fail(`manifest is missing ${entry.packageName}`)
    }
    const tarballPath = join(packDir, entry.tarballName)
    if (!existsSync(tarballPath)) {
      fail(`missing tarball ${entry.tarballName}`)
    }
    const digest = await sha256(tarballPath)
    const size = (await readFile(tarballPath)).byteLength
    if (row.sha256 !== digest) {
      fail(`${entry.packageName} sha256 drifted: manifest ${row.sha256} !== local ${digest}`)
    }
    if (row.tarballSize !== size) {
      fail(`${entry.packageName} size drifted: manifest ${row.tarballSize} !== local ${size}`)
    }

    const files = tarList(tarballPath)
    verifiedFiles += files.length
    verifyPackageJson(entry, tarReadJson(tarballPath, 'package.json'))
    verifyEntrypoints(entry, files)
    verifyAssetManifests(entry, files, tarballPath)
    verifiedAssetManifests += files.filter(file => file.endsWith('flyfish-viewer-assets.json')).length

    for (const requiredFile of ['package.json', 'README.md', 'README.en.md']) {
      if (!files.includes(requiredFile)) {
        fail(`${entry.packageName} tarball is missing ${requiredFile}`)
      }
    }
  }
} finally {
  if (keepTemp) {
    console.log(`[release-tarballs] Kept temp root: ${tempRoot}`)
  } else {
    await rm(tempRoot, { recursive: true, force: true })
  }
}

console.log(`[release-tarballs] Verified ${entries.length} tarballs, ${verifiedFiles} packed files, and ${verifiedAssetManifests} viewer asset manifests from ${packDir}.`)
