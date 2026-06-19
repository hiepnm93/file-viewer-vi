import { existsSync } from 'node:fs'
import { cp, mkdtemp, readFile, rm, stat } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const sourceRoot = resolve(scriptDir, '..')
const args = process.argv.slice(2)

function readArg(name, fallback) {
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : fallback
}

const host = readArg('--host', 'github')
if (!['github', 'gitee'].includes(host)) {
  throw new Error(`Unsupported host ${host}. Use --host=github or --host=gitee.`)
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
const selectedIds = new Set(
  args
    .filter(arg => arg.startsWith('--id='))
    .map(arg => arg.slice('--id='.length))
)
const selectedPackages = new Set(
  args
    .filter(arg => arg.startsWith('--package='))
    .map(arg => arg.slice('--package='.length))
)

const wrapperManifest = JSON.parse(
  await readFile(join(sourceRoot, 'ecosystem', 'wrappers.json'), 'utf8')
)
const targets = [
  {
    id: 'core',
    kind: 'core',
    packageName: wrapperManifest.corePackage.packageName,
    repository: wrapperManifest.corePackage.repository,
    github: wrapperManifest.corePackage.github,
    gitee: wrapperManifest.corePackage.gitee
  },
  ...wrapperManifest.wrappers.map(wrapper => ({
    id: wrapper.id,
    kind: 'component',
    packageName: wrapper.packageName,
    repository: wrapper.repository,
    github: wrapper.github,
    gitee: wrapper.gitee
  }))
].filter(target => {
  if (selectedIds.size && !selectedIds.has(target.id)) {
    return false
  }
  if (selectedPackages.size && !selectedPackages.has(target.packageName)) {
    return false
  }
  return true
})

if (!targets.length) {
  throw new Error('No core/component repository content selected for verification.')
}

function run(command, commandArgs, cwd = sourceRoot, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd,
    encoding: 'utf8',
    stdio: options.inherit ? 'inherit' : 'pipe',
    timeout: options.timeout ?? 30_000
  })
  if (result.status !== 0) {
    throw new Error(
      `Command failed: ${command} ${commandArgs.join(' ')}\n${result.stderr || result.stdout || result.error?.message || ''}`
    )
  }
  return result.stdout.trim()
}

async function assertDirectory(path, label = path) {
  if (!existsSync(path)) {
    throw new Error(`Missing directory: ${label}`)
  }
  const info = await stat(path)
  if (!info.isDirectory()) {
    throw new Error(`Not a directory: ${label}`)
  }
}

function shouldCopy(source) {
  const name = source.split('/').at(-1)
  return ![
    '.git',
    '.DS_Store',
    'node_modules',
    'dist',
    '.pnpm-store',
    '.npm-cache'
  ].includes(name)
}

async function copyComparableTree(from, to) {
  await cp(from, to, {
    recursive: true,
    force: true,
    filter: shouldCopy
  })
  await rm(join(to, 'package-repo-manifest.json'), { force: true })
  await rm(join(to, 'wrapper-repo-manifest.json'), { force: true })
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'))
}

async function verifyManifest(remoteDir, target) {
  const manifestName = target.kind === 'core' ? 'package-repo-manifest.json' : 'wrapper-repo-manifest.json'
  const manifestPath = join(remoteDir, manifestName)
  if (!existsSync(manifestPath)) {
    throw new Error(`${target.repository} is missing ${manifestName}`)
  }
  const manifest = await readJson(manifestPath)
  if (manifest.packageName !== target.packageName) {
    throw new Error(`${target.repository} manifest packageName ${manifest.packageName} !== ${target.packageName}`)
  }
  if (manifest.repository !== target.repository) {
    throw new Error(`${target.repository} manifest repository ${manifest.repository} !== ${target.repository}`)
  }
  if (manifest[host] !== target[host]) {
    throw new Error(`${target.repository} manifest ${host} ${manifest[host]} !== ${target[host]}`)
  }
}

const tempRoot = await mkdtemp(join(tmpdir(), 'file-viewer-wrapper-content-'))
let verified = 0

try {
  for (const target of targets) {
    const localDir = join(outputRoot, target.repository)
    await assertDirectory(localDir, `${target.repository} local export`)

    const remoteDir = join(tempRoot, `${target.repository}-remote`)
    run('git', ['clone', '--depth=1', `${target[host]}.git`, remoteDir], sourceRoot, { timeout: 60_000 })
    await verifyManifest(remoteDir, target)

    const comparableLocal = join(tempRoot, `${target.repository}-local`)
    const comparableRemote = join(tempRoot, `${target.repository}-remote-clean`)
    await copyComparableTree(localDir, comparableLocal)
    await copyComparableTree(remoteDir, comparableRemote)

    try {
      run('git', ['diff', '--no-index', '--quiet', comparableLocal, comparableRemote], sourceRoot, {
        timeout: 30_000
      })
    } catch (error) {
      const diff = spawnSync('git', ['diff', '--no-index', '--stat', comparableLocal, comparableRemote], {
        cwd: sourceRoot,
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 30_000
      })
      throw new Error(
        `${target.repository} ${host} content differs from local export.\n${diff.stdout || error.message}`
      )
    }

    verified += 1
    console.log(`${host}\t${target.id}\tcontent-ok\t${target[host]}`)
  }
} finally {
  await rm(tempRoot, { recursive: true, force: true })
}

console.log(`Verified ${verified} ${host} core/component repository content trees.`)
