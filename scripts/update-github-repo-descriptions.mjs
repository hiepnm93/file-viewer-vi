import { readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const sourceRoot = resolve(scriptDir, '..')
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')

const readJson = async path => JSON.parse(await readFile(path, 'utf8'))
const ecosystemManifest = await readJson(join(sourceRoot, 'ecosystem', 'wrappers.json'))
const branchRoles = await readJson(join(sourceRoot, 'ecosystem', 'branch-roles.json'))

const repoSlugFromUrl = url => {
  const match = String(url).match(/github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?$/)
  if (!match) {
    throw new Error(`Unable to parse GitHub repository URL: ${url}`)
  }
  return match[1]
}

const run = (command, commandArgs) => {
  const printable = `${command} ${commandArgs.join(' ')}`
  if (dryRun) {
    console.log(`[dry-run] ${printable}`)
    return
  }
  const result = spawnSync(command, commandArgs, {
    cwd: sourceRoot,
    encoding: 'utf8',
    stdio: 'inherit'
  })
  if (result.status !== 0) {
    throw new Error(`Command failed: ${printable}`)
  }
}

const records = [
  {
    github: branchRoles.publicMainRepository.github,
    description: branchRoles.publicMainRepository.description,
    homepage: 'https://file-viewer.app'
  },
  {
    github: ecosystemManifest.corePackage.github,
    description: ecosystemManifest.corePackage.description,
    homepage: 'https://doc.file-viewer.app'
  },
  ...(ecosystemManifest.renderers || []).map(renderer => ({
    github: renderer.github,
    description: renderer.description,
    homepage: 'https://doc.file-viewer.app'
  })),
  ...ecosystemManifest.wrappers.map(component => ({
    github: component.github,
    description: component.description,
    homepage: 'https://doc.file-viewer.app'
  }))
]

for (const record of records) {
  if (!record.description) {
    throw new Error(`Missing GitHub description for ${record.github}`)
  }
  const repo = repoSlugFromUrl(record.github)
  run('gh', [
    'repo',
    'edit',
    repo,
    '--description',
    record.description,
    '--homepage',
    record.homepage
  ])
  console.log(`Updated ${repo}: ${record.description}`)
}

console.log(`Updated ${records.length} GitHub repository description${records.length === 1 ? '' : 's'}.`)
