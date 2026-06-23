import { spawnSync } from 'node:child_process'
import { brotliCompressSync, constants as zlibConstants } from 'node:zlib'
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync
} from 'node:fs'
import { basename, extname, join, relative, resolve } from 'node:path'

const projectName = process.env.CLOUDFLARE_PAGES_PROJECT || 'flyfish-file-viewer'
// Wrangler direct upload publishes to the production deployment when no branch
// is supplied. Keep branch deployments explicit so custom domains are updated
// by the default release commands.
const branch = process.env.CLOUDFLARE_PAGES_BRANCH
const outputDir = process.env.CLOUDFLARE_PAGES_OUTPUT_DIR || 'apps/viewer-demo/dist'
const dryRun = process.env.CLOUDFLARE_PAGES_DRY_RUN === '1' || process.argv.includes('--dry-run')

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
const maxFileBytes = Number.parseInt(
  process.env.CLOUDFLARE_PAGES_MAX_FILE_BYTES || String(25 * 1024 * 1024),
  10
)
const resolvedOutputDir = resolve(outputDir)
const uploadDir = resolve('.release', 'cloudflare-pages', projectName)
const skippedFiles = []
const compressedFiles = []

const toUrlPath = filePath => `/${filePath.replaceAll('\\', '/')}`

function writeCompressedAssetHeaders(targetDir) {
  if (!compressedFiles.length) {
    return
  }

  const headersPath = join(targetDir, '_headers')
  const current = existsSync(headersPath) ? readFileSync(headersPath, 'utf8') : ''
  const prefix = current
    ? `${current}${current.endsWith('\n') ? '' : '\n'}\n`
    : ''
  const additions = compressedFiles
    .map(file => [
      toUrlPath(file.path),
      '  ! Content-Type',
      '  ! Cache-Control',
      '  ! X-Content-Type-Options',
      '  Content-Type: application/wasm',
      '  Content-Encoding: br',
      '  Vary: Accept-Encoding',
      '  X-Content-Type-Options: nosniff',
      '  Cache-Control: public, max-age=31536000, immutable'
    ].join('\n'))
    .join('\n\n')

  writeFileSync(headersPath, `${prefix}${additions}\n`)
}

function writeBrotliCompressedWasm(source, target, relativePath) {
  const raw = readFileSync(source)
  const compressed = brotliCompressSync(raw, {
    params: {
      [zlibConstants.BROTLI_PARAM_QUALITY]: 11
    }
  })

  if (compressed.length > maxFileBytes) {
    return false
  }

  mkdirSync(join(target, '..'), { recursive: true })
  writeFileSync(target, compressed)
  compressedFiles.push({
    path: relativePath,
    size: raw.length,
    compressedSize: compressed.length
  })
  return true
}

function copyDeployableFiles(sourceDir, targetDir) {
  if (!existsSync(sourceDir)) {
    throw new Error(`Cloudflare Pages output directory does not exist: ${sourceDir}`)
  }

  rmSync(targetDir, { force: true, recursive: true })
  mkdirSync(targetDir, { recursive: true })

  const visit = (source, target) => {
    const stat = statSync(source)

    if (stat.isDirectory()) {
      mkdirSync(target, { recursive: true })
      for (const entry of readdirSync(source)) {
        visit(join(source, entry), join(target, entry))
      }
      return
    }

    if (!stat.isFile()) {
      return
    }

    if (stat.size > maxFileBytes) {
      const relativePath = relative(sourceDir, source)
      if (extname(source).toLowerCase() === '.wasm' &&
        writeBrotliCompressedWasm(source, target, relativePath)) {
        return
      }
      skippedFiles.push({
        path: relativePath,
        size: stat.size
      })
      return
    }

    mkdirSync(join(target, '..'), { recursive: true })
    cpSync(source, target)
  }

  visit(sourceDir, targetDir)
}

copyDeployableFiles(resolvedOutputDir, uploadDir)
writeCompressedAssetHeaders(uploadDir)

if (compressedFiles.length) {
  console.warn(
    `[cloudflare-pages] Brotli-compressed ${compressedFiles.length} oversized WASM file(s) while preparing ${basename(uploadDir)}:`
  )
  for (const file of compressedFiles) {
    console.warn(`  - ${file.path} (${file.size} bytes -> ${file.compressedSize} bytes)`)
  }
}

if (skippedFiles.length) {
  console.warn(
    `[cloudflare-pages] Skipped ${skippedFiles.length} oversized file(s) above ${maxFileBytes} bytes while preparing ${basename(uploadDir)}:`
  )
  for (const file of skippedFiles) {
    console.warn(`  - ${file.path} (${file.size} bytes)`)
  }

  const fatalWasmFiles = skippedFiles.filter(file => file.path.toLowerCase().endsWith('.wasm'))
  if (fatalWasmFiles.length) {
    throw new Error(
      `Cloudflare Pages upload would miss required WASM assets: ${fatalWasmFiles.map(file => file.path).join(', ')}`
    )
  }
}

if (dryRun) {
  console.log(`[cloudflare-pages] Dry run prepared ${uploadDir}`)
  process.exit(0)
}

const args = [
  ...(usePnpmDlx ? ['dlx'] : ['--yes']),
  'wrangler',
  'pages',
  'deploy',
  uploadDir,
  '--project-name',
  projectName,
  '--commit-dirty=true'
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
