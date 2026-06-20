import { existsSync } from 'node:fs'
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
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
const keepExisting = args.includes('--keep-existing')

const readJson = async path => JSON.parse(await readFile(path, 'utf8'))
const writeJson = async (path, value) => writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8')

const rootPackage = await readJson(join(sourceRoot, 'package.json'))
const ecosystemManifest = await readJson(join(sourceRoot, 'ecosystem', 'wrappers.json'))

const collectPackageDirs = async workspaceRoot => {
  if (!existsSync(workspaceRoot)) {
    return []
  }
  const entries = await readdir(workspaceRoot, { withFileTypes: true })
  return entries
    .filter(entry => entry.isDirectory())
    .map(entry => join(workspaceRoot, entry.name))
    .filter(packageDir => existsSync(join(packageDir, 'package.json')))
}

const workspacePackageDirs = [
  sourceRoot,
  join(sourceRoot, 'packages', 'core'),
  ...(await collectPackageDirs(join(sourceRoot, 'packages', 'compat'))),
  ...(await collectPackageDirs(join(sourceRoot, 'packages', 'components'))),
  ...(await collectPackageDirs(join(sourceRoot, 'packages', 'renderers'))),
  ...(await collectPackageDirs(join(sourceRoot, 'apps')))
]

const workspaceVersions = new Map()
for (const packageDir of workspacePackageDirs) {
  const packagePath = join(packageDir, 'package.json')
  if (!existsSync(packagePath)) {
    continue
  }
  const packageJson = await readJson(packagePath)
  workspaceVersions.set(packageJson.name, packageJson.version)
}

const run = (command, commandArgs) => {
  const result = spawnSync(command, commandArgs, {
    cwd: sourceRoot,
    encoding: 'utf8',
    stdio: 'pipe'
  })
  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${commandArgs.join(' ')}\n${result.stderr || result.stdout}`)
  }
  return result.stdout.trim()
}

const assertDirectory = async path => {
  if (!existsSync(path)) {
    throw new Error(`Missing directory: ${path}`)
  }
  const info = await stat(path)
  if (!info.isDirectory()) {
    throw new Error(`Not a directory: ${path}`)
  }
}

const assertFile = async path => {
  if (!existsSync(path)) {
    throw new Error(`Missing file: ${path}`)
  }
  const info = await stat(path)
  if (!info.isFile()) {
    throw new Error(`Not a file: ${path}`)
  }
}

const removePath = path => rm(path, { recursive: true, force: true })

const shouldCopy = source => {
  const name = basename(source)
  return ![
    '.DS_Store',
    '.git',
    '.vercel',
    'dist',
    'node_modules',
    'tsconfig.tsbuildinfo'
  ].includes(name)
}

const copyPackage = async (from, to) => {
  if (!keepExisting) {
    await removePath(to)
  }
  await mkdir(to, { recursive: true })
  await cp(from, to, {
    recursive: true,
    force: true,
    filter: shouldCopy
  })
}

const normalizeWorkspaceRange = (dependencyName, range) => {
  if (!range?.startsWith?.('workspace:')) {
    return range
  }
  const workspaceRange = range.slice('workspace:'.length)
  if (workspaceRange === '*' || workspaceRange === '') {
    const version = workspaceVersions.get(dependencyName)
    return version ? `^${version}` : `^${rootPackage.version}`
  }
  return workspaceRange
}

const normalizeDependencyBlock = block => {
  if (!block) {
    return
  }
  for (const [dependencyName, range] of Object.entries(block)) {
    block[dependencyName] = normalizeWorkspaceRange(dependencyName, range)
  }
}

const normalizePackageJson = async (targetDir, renderer) => {
  const packagePath = join(targetDir, 'package.json')
  const packageJson = await readJson(packagePath)
  packageJson.packageManager = rootPackage.packageManager
  packageJson.private = false
  packageJson.repository = {
    type: 'git',
    url: `git+${renderer.github}.git`
  }
  packageJson.homepage = renderer.github
  packageJson.bugs = {
    url: `${renderer.github}/issues`
  }
  normalizeDependencyBlock(packageJson.dependencies)
  normalizeDependencyBlock(packageJson.devDependencies)
  normalizeDependencyBlock(packageJson.peerDependencies)
  normalizeDependencyBlock(packageJson.optionalDependencies)
  await writeJson(packagePath, packageJson)
}

const normalizeStandaloneTsConfig = async targetDir => {
  const tsconfigPath = join(targetDir, 'tsconfig.json')
  if (!existsSync(tsconfigPath)) {
    return
  }

  const tsconfig = await readJson(tsconfigPath)
  if (tsconfig.compilerOptions?.paths) {
    delete tsconfig.compilerOptions.paths
  }
  if (tsconfig.references) {
    delete tsconfig.references
  }
  await writeJson(tsconfigPath, tsconfig)
}

const writeGitignore = async targetDir => {
  await writeFile(
    join(targetDir, '.gitignore'),
    [
      'node_modules/',
      'dist/',
      '*.tgz',
      '*.tsbuildinfo',
      '.DS_Store',
      '.pnpm-store/',
      '.npm-cache/',
      ''
    ].join('\n'),
    'utf8'
  )
}

const writeStandaloneManifest = async (targetDir, renderer, packageJson) => {
  await writeJson(join(targetDir, 'renderer-repo-manifest.json'), {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    sourceBranch: run('git', ['branch', '--show-current']),
    sourceCommit: run('git', ['rev-parse', '--short', 'HEAD']),
    organization: ecosystemManifest.organization,
    rendererId: renderer.id,
    packageName: renderer.packageName,
    packageVersion: packageJson.version,
    repository: renderer.repository,
    github: renderer.github,
    gitee: renderer.gitee,
    entryFormats: renderer.entryFormats,
    sourcePackageDir: renderer.packageDir,
    publicSource: renderer.publicSource === true
  })
}

const assertStandaloneRepo = async (targetDir, renderer) => {
  await assertFile(join(targetDir, 'package.json'))
  await assertFile(join(targetDir, 'README.md'))
  await assertFile(join(targetDir, 'README.en.md'))
  await assertFile(join(targetDir, 'LICENSE'))
  const packageJson = await readJson(join(targetDir, 'package.json'))
  if (packageJson.name !== renderer.packageName) {
    throw new Error(`Package name mismatch in ${targetDir}: ${packageJson.name} !== ${renderer.packageName}`)
  }
  const serialized = JSON.stringify(packageJson)
  if (serialized.includes('workspace:')) {
    throw new Error(`Workspace dependency leaked into standalone renderer repo: ${targetDir}`)
  }
  if (existsSync(join(targetDir, 'node_modules')) || existsSync(join(targetDir, 'dist'))) {
    throw new Error(`Generated dependency/build output leaked into standalone renderer repo: ${targetDir}`)
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
  throw new Error('No renderer packages selected for export.')
}

await mkdir(outputRoot, { recursive: true })
await assertFile(join(sourceRoot, 'LICENSE'))

for (const renderer of renderers) {
  const sourcePackageDir = join(sourceRoot, renderer.packageDir)
  await assertDirectory(sourcePackageDir)
  const targetDir = join(outputRoot, renderer.repository)
  await copyPackage(sourcePackageDir, targetDir)
  await cp(join(sourceRoot, 'LICENSE'), join(targetDir, 'LICENSE'), { force: true })
  await writeGitignore(targetDir)
  await normalizePackageJson(targetDir, renderer)
  await normalizeStandaloneTsConfig(targetDir)
  const targetPackageJson = await readJson(join(targetDir, 'package.json'))
  await writeStandaloneManifest(targetDir, renderer, targetPackageJson)
  await assertStandaloneRepo(targetDir, renderer)
  console.log(`Prepared ${renderer.packageName} -> ${targetDir}`)
}

console.log(`Prepared ${renderers.length} renderer package repo${renderers.length === 1 ? '' : 's'} in ${outputRoot}`)
