import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const packageJson = JSON.parse(readFileSync(resolve('package.json'), 'utf8'))
const image = process.env.DOCKER_IMAGE || 'flyfishdev/file-viewer'
const isPush = process.argv.includes('--push')
const isLoad = process.argv.includes('--load') || !isPush
const hostArch = process.arch === 'arm64' ? 'arm64' : 'amd64'
const platforms = process.env.DOCKER_PLATFORMS || (isPush ? 'linux/amd64,linux/arm64' : `linux/${hostArch}`)
const builderName = process.env.DOCKER_BUILDER || 'flyfish-viewer-builder'
const tagList = (process.env.DOCKER_TAGS || `${packageJson.version},latest`)
  .split(',')
  .map(tag => tag.trim())
  .filter(Boolean)

const runDocker = (args, options = {}) => {
  const result = spawnSync('docker', args, {
    stdio: options.stdio || 'inherit',
    env: process.env
  })
  return result.status || 0
}

if (isPush) {
  const hasBuilder = runDocker(['buildx', 'inspect', builderName], { stdio: 'ignore' }) === 0
  if (!hasBuilder) {
    const createStatus = runDocker([
      'buildx',
      'create',
      '--name',
      builderName,
      '--driver',
      'docker-container'
    ])
    if (createStatus !== 0) {
      process.exit(createStatus)
    }
  }
  const bootstrapStatus = runDocker(['buildx', 'inspect', builderName, '--bootstrap'])
  if (bootstrapStatus !== 0) {
    process.exit(bootstrapStatus)
  }
}

const args = [
  'buildx',
  'build',
  ...(isPush ? ['--builder', builderName] : []),
  '--platform',
  platforms,
  '--build-arg',
  `APP_VERSION=${packageJson.version}`
]

for (const tag of tagList) {
  args.push('-t', `${image}:${tag}`)
}

args.push(isPush ? '--push' : '--load')
args.push('.')

console.log(`[docker] image=${image}`)
console.log(`[docker] tags=${tagList.join(', ')}`)
console.log(`[docker] platforms=${platforms}`)
console.log(`[docker] mode=${isPush ? 'push' : 'load'}`)
if (isPush) {
  console.log(`[docker] builder=${builderName}`)
}

const result = spawnSync('docker', args, { stdio: 'inherit', env: process.env })

if (result.status !== 0) {
  process.exit(result.status || 1)
}
