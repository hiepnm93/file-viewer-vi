import { existsSync } from 'node:fs'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { loadEcosystemReleaseContext } from './lib/ecosystem-packages.mjs'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const sourceRoot = resolve(scriptDir, '..')
const args = process.argv.slice(2)

const hasArg = name => args.includes(name)
const readArg = (name, fallback) => {
  const direct = args.find(arg => arg.startsWith(`${name}=`))
  if (direct) {
    return direct.slice(name.length + 1)
  }
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : fallback
}

const npmSpec = readArg('--npm', process.env.FILE_VIEWER_NPM_SMOKE_NPM || 'npm@11.17.0')
const smokeRoot = resolve(
  sourceRoot,
  readArg('--tmp-dir', process.env.FILE_VIEWER_NPM_SMOKE_DIR || '.release/npm-install-smoke')
)
const keepTemp = hasArg('--keep-temp')
const registryOnly = hasArg('--registry-only')
const tarballOnly = hasArg('--tarball-only')

const installTargets = ['@file-viewer/vue3', '@file-viewer/preset-office']
const smokeImports = ['@file-viewer/vue3', '@file-viewer/preset-office']

const { entries } = await loadEcosystemReleaseContext(sourceRoot)
const entryByPackageName = new Map(entries.map(entry => [entry.packageName, entry]))

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function npmCommandArgs(commandArgs) {
  if (npmSpec === 'npm') {
    return { command: 'npm', args: commandArgs }
  }
  return { command: 'npx', args: ['--yes', npmSpec, ...commandArgs] }
}

function runNpm(commandArgs, cwd, options = {}) {
  const { command, args: npmArgs } = npmCommandArgs(commandArgs)
  return run(command, npmArgs, cwd, options)
}

function run(command, commandArgs, cwd = sourceRoot, options = {}) {
  console.log(`$ ${[command, ...commandArgs].join(' ')}`)
  const result = spawnSync(command, commandArgs, {
    cwd,
    encoding: 'utf8',
    stdio: options.capture ? 'pipe' : 'inherit',
    env: {
      ...process.env,
      npm_config_loglevel: process.env.npm_config_loglevel || 'error',
      npm_config_audit: 'false',
      npm_config_fund: 'false'
    },
    timeout: Number(process.env.FILE_VIEWER_NPM_SMOKE_TIMEOUT_MS || 600_000)
  })
  if (result.error) {
    throw new Error(
      [
        `Command failed in ${cwd}: ${command} ${commandArgs.join(' ')}`,
        result.error.message,
        result.stdout,
        result.stderr
      ].filter(Boolean).join('\n')
    )
  }
  if (result.status !== 0) {
    throw new Error(
      [
        `Command failed in ${cwd}: ${command} ${commandArgs.join(' ')}`,
        result.stdout,
        result.stderr
      ].filter(Boolean).join('\n')
    )
  }
  return result.stdout?.trim() || ''
}

function runtimeDependencyNames(packageJson) {
  return Object.keys({
    ...(packageJson.dependencies || {}),
    ...(packageJson.optionalDependencies || {})
  }).sort()
}

function collectLocalDependencyClosure(entry, collected = new Map()) {
  for (const dependencyName of runtimeDependencyNames(entry.packageJson)) {
    const dependencyEntry = entryByPackageName.get(dependencyName)
    if (!dependencyEntry || collected.has(dependencyEntry.packageName)) {
      continue
    }
    collected.set(dependencyEntry.packageName, dependencyEntry)
    collectLocalDependencyClosure(dependencyEntry, collected)
  }
  return collected
}

function collectTargetEntries(packageNames) {
  const collected = new Map()
  for (const packageName of packageNames) {
    const entry = entryByPackageName.get(packageName)
    assert(entry, `Missing ecosystem package entry for ${packageName}`)
    collected.set(entry.packageName, entry)
    collectLocalDependencyClosure(entry).forEach(dependencyEntry => {
      collected.set(dependencyEntry.packageName, dependencyEntry)
    })
  }
  return [...collected.values()]
}

function toFileSpec(fromDir, targetFile) {
  const relativePath = relative(fromDir, targetFile).split(sep).join('/')
  return `file:${relativePath.startsWith('.') ? relativePath : `./${relativePath}`}`
}

async function writeSmokeProject(caseRoot, dependencies) {
  await mkdir(caseRoot, { recursive: true })
  await writeFile(
    join(caseRoot, 'package.json'),
    `${JSON.stringify(
      {
        name: `file-viewer-npm-install-smoke-${relative(smokeRoot, caseRoot).replace(/[\\/]/g, '-')}`,
        private: true,
        type: 'module',
        scripts: {
          smoke: 'node smoke.mjs'
        },
        dependencies
      },
      null,
      2
    )}\n`
  )
  await writeFile(
    join(caseRoot, 'smoke.mjs'),
    `${smokeImports.map((packageName, index) => `import * as package${index} from '${packageName}'`).join('\n')}
${smokeImports.map((_packageName, index) => `if (!package${index}) throw new Error('Missing smoke import ${index}')`).join('\n')}
console.log('[npm-install-smoke] Imports passed.')
`
  )
}

async function runRegistrySmoke() {
  const caseRoot = join(smokeRoot, 'registry')
  await rm(caseRoot, { recursive: true, force: true })
  await writeSmokeProject(
    caseRoot,
    Object.fromEntries(installTargets.map(packageName => [packageName, 'latest']))
  )
  runNpm(['install', '--ignore-scripts', '--no-audit', '--no-fund'], caseRoot)
  runNpm(['run', 'smoke'], caseRoot)
  console.log(`[npm-install-smoke] Registry install passed with ${npmSpec}.`)
}

async function runTarballSmoke() {
  const tarballDir = join(smokeRoot, 'tarballs')
  const caseRoot = join(smokeRoot, 'tarball')
  await rm(tarballDir, { recursive: true, force: true })
  await rm(caseRoot, { recursive: true, force: true })
  await mkdir(tarballDir, { recursive: true })

  const tarballByPackageName = new Map()
  for (const entry of collectTargetEntries(installTargets)) {
    run('pnpm', ['-C', entry.packageDir, 'pack', '--pack-destination', tarballDir], sourceRoot, {
      capture: true
    })
    const tarball = join(tarballDir, entry.tarballName)
    assert(existsSync(tarball), `Expected tarball was not created: ${tarball}`)
    tarballByPackageName.set(entry.packageName, tarball)
  }

  await writeSmokeProject(
    caseRoot,
    Object.fromEntries(
      [...tarballByPackageName.entries()].map(([packageName, tarball]) => [
        packageName,
        toFileSpec(caseRoot, tarball)
      ])
    )
  )
  runNpm(['install', '--ignore-scripts', '--no-audit', '--no-fund'], caseRoot)
  runNpm(['run', 'smoke'], caseRoot)
  console.log(`[npm-install-smoke] Local tgz dependency-closure install passed with ${npmSpec}.`)
}

if (!keepTemp) {
  await rm(smokeRoot, { recursive: true, force: true })
}
await mkdir(smokeRoot, { recursive: true })

if (!tarballOnly) {
  await runRegistrySmoke()
}
if (!registryOnly) {
  await runTarballSmoke()
}

console.log('[npm-install-smoke] All requested npm install smoke checks passed.')
