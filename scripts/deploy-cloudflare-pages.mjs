import { spawnSync } from 'node:child_process'

const projectName = process.env.CLOUDFLARE_PAGES_PROJECT || 'flyfish-file-viewer'
// Wrangler direct upload publishes to the production deployment when no branch
// is supplied. Keep branch deployments explicit so custom domains are updated
// by the default release commands.
const branch = process.env.CLOUDFLARE_PAGES_BRANCH
const outputDir = process.env.CLOUDFLARE_PAGES_OUTPUT_DIR || 'apps/viewer-demo/dist'

function commandExists(command, args = ['--version']) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    shell: false,
    stdio: 'pipe'
  })
  return result.status === 0
}

const pnpmCommand = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const usePnpmDlx = commandExists(pnpmCommand)
const command = usePnpmDlx ? pnpmCommand : npxCommand
const args = [
  ...(usePnpmDlx ? ['dlx'] : ['--yes']),
  'wrangler',
  'pages',
  'deploy',
  outputDir,
  '--project-name',
  projectName
]

if (branch) {
  args.push('--branch', branch)
}

const result = spawnSync(command, args, {
  stdio: 'inherit',
  shell: false
})

if (result.error) {
  throw result.error
}

process.exit(result.status ?? 1)
