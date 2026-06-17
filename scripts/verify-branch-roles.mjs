import { spawnSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const sourceRoot = resolve(scriptDir, '..')

const branchRoles = await readJson(join(sourceRoot, 'ecosystem', 'branch-roles.json'))
const wrapperManifest = await readJson(join(sourceRoot, 'ecosystem', 'wrappers.json'))

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'))
}

function runGit(args) {
  const result = spawnSync('git', args, {
    cwd: sourceRoot,
    encoding: 'utf8',
    stdio: 'pipe'
  })
  if (result.status !== 0) {
    throw new Error(`Command failed: git ${args.join(' ')}\n${result.stderr || result.stdout}`)
  }
  return result.stdout.trim()
}

function repositoryPath(url) {
  const normalized = url
    .replace(/^git\+/, '')
    .replace(/\.git$/, '')
    .replace(/^https?:\/\//, '')
    .replace(/^git@([^:]+):/, '$1/')
  const segments = normalized.split('/')
  return segments.slice(-2).join('/')
}

function assertPublicRepository(url, expectedOrg, label) {
  const path = repositoryPath(url)
  const [org] = path.split('/')
  assert(org === expectedOrg, `${label} must live under ${expectedOrg}, got ${url}`)
}

assert(branchRoles.schemaVersion === 1, 'branch-roles.json schemaVersion must be 1')
assert(branchRoles.sourceRemote?.name === 'origin', 'Private source remote must be named origin')
assert(branchRoles.sourceRemote?.visibility === 'private', 'Source remote must be marked private')
assert(
  branchRoles.sourceRemote?.url === wrapperManifest.corePackage.sourceRepository,
  'branch-roles source remote must match wrappers.json corePackage.sourceRepository'
)
assert(
  wrapperManifest.corePackage.visibility === 'private-source',
  'wrappers.json corePackage.visibility must be private-source'
)

const originUrl = runGit(['remote', 'get-url', branchRoles.sourceRemote.name])
assert(
  originUrl.replace(/\.git$/, '') === branchRoles.sourceRemote.url.replace(/\.git$/, ''),
  `git origin must point to ${branchRoles.sourceRemote.url}, got ${originUrl}`
)

const currentBranch = runGit(['branch', '--show-current'])
const rolesByName = new Map(branchRoles.branches.map(branch => [branch.name, branch]))
assert(rolesByName.has('main'), 'branch roles must include main')
assert(rolesByName.has('v2'), 'branch roles must include v2')
assert(rolesByName.has('v3'), 'branch roles must include v3')
assert(rolesByName.has(currentBranch), `current branch ${currentBranch} must be declared in branch roles`)

const mainRole = rolesByName.get('main')
assert(mainRole.role === 'core', 'main branch role must be core')
assert(mainRole.packageName === wrapperManifest.corePackage.packageName, 'main branch package must be @file-viewer/core')
assert(
  mainRole.sourcePolicy === 'private-core-source-only',
  'main branch source policy must keep core source private'
)

const wrappersById = new Map(wrapperManifest.wrappers.map(wrapper => [wrapper.id, wrapper]))
for (const branchName of ['v2', 'v3']) {
  const role = rolesByName.get(branchName)
  assert(role.wrapperId, `${branchName} branch must declare wrapperId`)
  const wrapper = wrappersById.get(role.wrapperId)
  assert(wrapper, `${branchName} wrapperId ${role.wrapperId} must exist in wrappers.json`)
  assert(role.packageName === wrapper.packageName, `${branchName} packageName must match wrappers.json`)
  assert(
    role.sourcePolicy === 'wrapper-source-exported-publicly',
    `${branchName} source policy must export wrapper source publicly`
  )
  for (const compatibilityPackage of role.compatibilityPackages || []) {
    assert(
      wrapper.historicalPackages.includes(compatibilityPackage),
      `${branchName} compatibility package ${compatibilityPackage} must be declared in wrappers.json`
    )
  }
}

assert(
  wrapperManifest.sourceBranch === 'v3',
  'wrappers.json sourceBranch must remain v3 while Vue 3 is the baseline wrapper source'
)
assert(branchRoles.publicOrganization === wrapperManifest.organization, 'Public organization must match wrappers.json')
assert(branchRoles.publicArtifactRepository?.sourcePolicy === 'artifacts-only', 'Public artifact repository must be artifacts-only')
assertPublicRepository(branchRoles.publicArtifactRepository.github, branchRoles.publicOrganization, 'Public artifact GitHub repository')
assertPublicRepository(branchRoles.publicArtifactRepository.gitee, branchRoles.publicOrganization, 'Public artifact Gitee repository')

const publicArtifactRepo = repositoryPath(branchRoles.publicArtifactRepository.github)
for (const wrapper of wrapperManifest.wrappers) {
  assertPublicRepository(wrapper.github, wrapperManifest.organization, `${wrapper.packageName} GitHub repository`)
  assertPublicRepository(wrapper.gitee, wrapperManifest.organization, `${wrapper.packageName} Gitee repository`)
  assert(
    repositoryPath(wrapper.github) !== publicArtifactRepo,
    `${wrapper.packageName} must use a dedicated wrapper repository, not the public artifact repository`
  )
}

console.log(`Verified ${branchRoles.branches.length} branch roles, private origin, and ${wrapperManifest.wrappers.length} public wrapper repositories.`)
