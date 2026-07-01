import { copyFile, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { delimiter, resolve, sep } from 'node:path'
import { tmpdir } from 'node:os'
import { pathToFileURL } from 'node:url'

const root = resolve(new URL('..', import.meta.url).pathname)
const timeout = Number(process.env.ISSUE71_FULL_RENDERING_TIMEOUT || 60000)
const keepTemp = process.env.ISSUE71_FULL_RENDERING_KEEP === '1'
const sourceMode = process.env.ISSUE71_FULL_RENDERING_SOURCE || 'local'
const packageVersion = process.env.ISSUE71_FULL_RENDERING_VERSION || '2.1.16'
const ignoreVirtualModuleErrors = process.env.ISSUE71_FULL_RENDERING_IGNORE_VIRTUAL_ERRORS === '1'
const selectedFormats = new Set(
  (process.env.ISSUE71_FULL_RENDERING_FORMATS || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
)
const require = createRequire(import.meta.url)

const samples = [
  {
    id: 'pptx',
    filename: 'sample.pptx',
    source: resolve(root, 'apps/viewer-demo/public/example/ppt.pptx'),
    renderedSelector: '.flyfish-pptx-content .slide, .pptx-render-surface .slide',
    textPattern: /Implementation Plan|Planetary Community/i,
    allowTextFallback: true
  },
  {
    id: 'docx',
    filename: 'sample.docx',
    source: resolve(root, 'apps/viewer-demo/public/example/word.docx'),
    renderedSelector: '.docx-wrapper section.docx, section.docx',
    textPattern: /Lorem|目|测试|文档|This|sample/i,
    allowTextFallback: true
  },
  {
    id: 'pdf',
    filename: 'sample.pdf',
    source: resolve(root, 'apps/viewer-demo/public/example/pdf.pdf'),
    renderedSelector: '.pdfViewer .page[data-loaded="true"], .pdfViewer .page canvas, .pdf-page-list .pdf-page-button',
    textPattern: /PDF|page|文档/i,
    allowTextFallback: false
  },
  {
    id: 'zip',
    filename: 'sample.zip',
    source: resolve(root, 'apps/viewer-demo/public/example/archive.zip'),
    renderedSelector: '.archive-entry',
    textPattern: /ARCHIVE|压缩包|archive|preview/i,
    allowTextFallback: false
  }
]

const activeSamples = samples.filter(sample => !selectedFormats.size || selectedFormats.has(sample.id))
let packagePaths = new Map()

function fail(message) {
  console.error(`[issue71-full-rendering] ${message}`)
  process.exit(1)
}

function normalizeSource(source) {
  return source
    .split('\n')
    .map(line => line.replace(/^ {8}/, ''))
    .join('\n')
    .trimStart()
}

function spawnCommand(command, args, options = {}) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd: options.cwd || root,
      env: { ...process.env, ...options.env },
      stdio: options.pipe ? ['ignore', 'pipe', 'pipe'] : 'inherit'
    })
    let stdout = ''
    let stderr = ''
    if (options.pipe) {
      child.stdout?.on('data', chunk => {
        const text = chunk.toString()
        stdout += text
        options.onStdout?.(text)
      })
      child.stderr?.on('data', chunk => {
        const text = chunk.toString()
        stderr += text
        options.onStderr?.(text)
      })
    }
    child.once('error', rejectPromise)
    child.once('close', code => {
      if (code === 0) {
        resolvePromise({ stdout, stderr })
        return
      }
      const detail = options.pipe ? `\n${stdout}\n${stderr}` : ''
      rejectPromise(new Error(`${command} ${args.join(' ')} exited with ${code}${detail}`))
    })
  })
}

async function importPlaywright() {
  try {
    return await import('playwright')
  } catch (error) {
    const candidatePaths = process.env.PATH
      ?.split(delimiter)
      .filter(pathEntry => pathEntry.endsWith(`${sep}node_modules${sep}.bin`))
      .map(binDir => resolve(binDir, '..'))
      .filter(pathEntry => existsSync(pathEntry)) || []

    for (const candidatePath of candidatePaths) {
      try {
        const playwrightEntry = require.resolve('playwright', { paths: [candidatePath] })
        return await import(pathToFileURL(playwrightEntry).href)
      } catch {
        // Continue probing npm exec / npx injected package roots.
      }
    }

    fail([
      'Missing playwright module.',
      'Run with: npm exec --yes --package playwright -- node scripts/verify-issue71-full-rendering-smoke.mjs',
      `Original error: ${error instanceof Error ? error.message : String(error)}`
    ].join('\n'))
  }
}

async function collectFileViewerPackagePaths() {
  const collected = new Map()
  const visit = async dir => {
    const packageJsonPath = resolve(dir, 'package.json')
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'))
      if (packageJson.name?.startsWith('@file-viewer/') && packageJson.private !== true) {
        collected.set(packageJson.name, dir)
        return
      }
    }
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (!entry.isDirectory() || ['dist', 'node_modules'].includes(entry.name)) {
        continue
      }
      await visit(resolve(dir, entry.name))
    }
  }
  await visit(resolve(root, 'packages'))
  return collected
}

async function packPackage(packageName, tarballDir) {
  const packagePath = packagePaths.get(packageName)
  if (!packagePath) {
    fail(`Could not locate local package path for ${packageName}.`)
  }
  console.log(`[issue71-full-rendering] Packing ${packageName}`)
  await spawnCommand('pnpm', ['--filter', packageName, 'pack', '--pack-destination', tarballDir], {
    pipe: true
  })
  const packageJson = JSON.parse(await readFile(resolve(packagePath, 'package.json'), 'utf8'))
  const expectedPrefix = packageJson.name.replace(/^@/, '').replace('/', '-')
  const files = (await readdir(tarballDir))
    .filter(file => file.endsWith('.tgz'))
    .map(file => resolve(tarballDir, file))
  const matches = files.filter(file => file.includes(`${expectedPrefix}-${packageJson.version}.tgz`))
  if (!matches.length) {
    fail(`Could not find packed tarball for ${packageName} in ${tarballDir}.`)
  }
  return matches[0]
}

async function createTarballOverrides(tarballDir) {
  if (sourceMode !== 'local') {
    return new Map()
  }
  packagePaths = await collectFileViewerPackagePaths()
  const tarballs = new Map()
  for (const packageName of packagePaths.keys()) {
    tarballs.set(packageName, await packPackage(packageName, tarballDir))
  }
  return tarballs
}

async function writeIssueProject(appDir, tarballs) {
  await mkdir(resolve(appDir, 'src'), { recursive: true })
  await mkdir(resolve(appDir, 'public'), { recursive: true })
  for (const sample of activeSamples) {
    await copyFile(sample.source, resolve(appDir, 'public', sample.filename))
  }

  await writeFile(resolve(appDir, 'index.html'), normalizeSource(`
        <!doctype html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Issue 71 full rendering smoke</title>
          </head>
          <body>
            <div id="root"></div>
            <script type="module" src="/src/main.js"></script>
          </body>
        </html>
      `))
  await writeFile(resolve(appDir, 'vite.config.js'), normalizeSource(`
        import { defineConfig } from 'vite'
        import react from '@vitejs/plugin-react'
        import { fileViewerRenderers } from '@file-viewer/vite-plugin'

        export default defineConfig({
          plugins: [
            react(),
            fileViewerRenderers({ copyAssets: true })
          ],
          optimizeDeps: {
            exclude: ['@ljheee/xmind-parser']
          }
        })
      `))
  await writeFile(resolve(appDir, 'src/style.css'), normalizeSource(`
        html,
        body,
        #root {
          height: 100%;
          margin: 0;
        }

        body {
          font-family: Arial, sans-serif;
        }

        .viewer-host {
          height: 720px;
          min-height: 0;
        }
      `))
  await writeFile(resolve(appDir, 'src/main.js'), normalizeSource(`
        import React from 'react'
        import { createRoot } from 'react-dom/client'
        import FileViewer from '@file-viewer/react-full'
        import './style.css'

        const samples = ${JSON.stringify(Object.fromEntries(activeSamples.map(sample => [
          sample.id,
          { url: `/${sample.filename}`, filename: sample.filename }
        ])), null, 10)}
        const params = new URLSearchParams(window.location.search)
        const format = params.get('format') || '${activeSamples[0]?.id || 'pptx'}'
        const sample = samples[format] || samples.${activeSamples[0]?.id || 'pptx'}

        window.__fileViewerEvents = []
        window.__fileViewerStates = []
        window.__fileViewerErrors = []

        function serializeError(error) {
          if (!error) return null
          return {
            name: error.name || '',
            message: error.message || String(error),
            stack: error.stack || ''
          }
        }

        function App() {
          return React.createElement(FileViewer, {
            className: 'viewer-host',
            url: sample.url,
            filename: sample.filename,
            options: { theme: 'light', toolbar: { position: 'bottom-right' } },
            onEvent: event => {
              window.__fileViewerEvents.push({
                type: event.type,
                payload: event.payload
              })
            },
            onStateChange: state => {
              window.__fileViewerStates.push({
                loading: state.loading,
                ready: state.ready,
                error: serializeError(state.error),
                lastEvent: state.lastEvent?.type || null
              })
              if (state.error) {
                window.__fileViewerErrors.push(serializeError(state.error))
              }
            }
          })
        }

        createRoot(document.getElementById('root')).render(React.createElement(App))
      `))

  const dependencies = {
    '@file-viewer/react-full': sourceMode === 'local'
      ? `file:${tarballs.get('@file-viewer/react-full')}`
      : packageVersion,
    '@file-viewer/preset-all': sourceMode === 'local'
      ? `file:${tarballs.get('@file-viewer/preset-all')}`
      : packageVersion,
    '@file-viewer/vite-plugin': sourceMode === 'local'
      ? `file:${tarballs.get('@file-viewer/vite-plugin')}`
      : packageVersion,
    '@vitejs/plugin-react': '^4.7.0',
    react: '^18.3.1',
    'react-dom': '^18.3.1',
    vite: '^6.3.6'
  }
  await writeFile(resolve(appDir, 'package.json'), `${JSON.stringify({
    name: 'issue71-full-rendering-smoke',
    private: true,
    type: 'module',
    scripts: { dev: 'vite --host 127.0.0.1' },
    dependencies
  }, null, 2)}\n`)

  if (sourceMode === 'local') {
    const overrideLines = Array.from(tarballs.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([packageName, tarballPath]) => `  ${JSON.stringify(packageName)}: ${JSON.stringify(`file:${tarballPath}`)}`)
    await writeFile(resolve(appDir, 'pnpm-workspace.yaml'), [
      'packages:',
      '  - .',
      'overrides:',
      ...overrideLines,
      ''
    ].join('\n'))
  }
}

async function startVite(appDir) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn('pnpm', ['exec', 'vite', '--host', '127.0.0.1', '--force'], {
      cwd: appDir,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe']
    })
    let output = ''
    const onData = chunk => {
      output += chunk.toString()
      const match = output.match(/Local:\s+(http:\/\/127\.0\.0\.1:\d+\/)/)
      if (match) {
        resolvePromise({ child, baseUrl: match[1].replace(/\/$/, ''), output })
      }
    }
    child.stdout.on('data', onData)
    child.stderr.on('data', onData)
    child.once('error', rejectPromise)
    child.once('close', code => {
      if (code !== 0 && !output.includes('Local:')) {
        rejectPromise(new Error(`Vite exited before becoming ready (${code}).\n${output}`))
      }
    })
    setTimeout(() => {
      rejectPromise(new Error(`Timed out waiting for Vite dev server.\n${output}`))
    }, timeout)
  })
}

async function stopVite(child) {
  if (!child || child.killed) {
    return
  }
  child.kill('SIGINT')
  await new Promise(resolveStop => {
    const timer = setTimeout(() => {
      child.kill('SIGKILL')
      resolveStop()
    }, 5000)
    child.once('close', () => {
      clearTimeout(timer)
      resolveStop()
    })
  })
}

function isRelevantBadResponse(url) {
  if (ignoreVirtualModuleErrors && url.includes('virtual:file-viewer-renderers')) {
    return false
  }
  return !/favicon\.ico|\/@vite\/client|\/src\/main\.js|\/src\/style\.css/.test(url)
}

async function verifyFormat(page, baseUrl, sample) {
  const pageErrors = []
  const consoleErrors = []
  const failedRequests = []
  const badResponses = []
  const assetEvents = []
  const isAssetUrl = url => /vendor\/(docx|pdf|libarchive|pptx)|\.worker|\.wasm|node_modules\/\.vite\/deps/i.test(url)
  const listeners = {
    request: request => {
      const url = request.url()
      if (isAssetUrl(url)) {
        assetEvents.push({ type: 'request', url })
      }
    },
    response: response => {
      const url = response.url()
      const status = response.status()
      if (isAssetUrl(url)) {
        assetEvents.push({
          type: 'response',
          status,
          url,
          contentType: response.headers()['content-type'] || ''
        })
      }
      if (status >= 400 && isRelevantBadResponse(url)) {
        badResponses.push(`HTTP ${status}: ${url}`)
      }
    },
    requestfailed: request => {
      const url = request.url()
      const failure = request.failure()?.errorText || ''
      if (failure === 'net::ERR_ABORTED' && (/\/sample\.[^/?#]+/.test(url) || isAssetUrl(url))) {
        return
      }
      if (isRelevantBadResponse(url)) {
        failedRequests.push(`${url}: ${failure}`)
      }
    },
    pageerror: error => {
      pageErrors.push(error.message)
    },
    console: message => {
      if (message.type() !== 'error') {
        return
      }
      const location = message.location()
      if (location.url.endsWith('/favicon.ico')) {
        return
      }
      if (ignoreVirtualModuleErrors && (location.url.includes('virtual:file-viewer-renderers') || message.text().includes('virtual:file-viewer-renderers'))) {
        return
      }
      consoleErrors.push(`${message.text()} (${location.url}:${location.lineNumber})`)
    }
  }
  for (const [event, listener] of Object.entries(listeners)) {
    page.on(event, listener)
  }

  try {
    await page.goto(`${baseUrl}/?format=${sample.id}`, {
      waitUntil: 'domcontentloaded',
      timeout
    })
    try {
      await page.waitForFunction(
        ({ selector, patternSource, allowTextFallback }) => {
          const isVisible = element => {
            const style = window.getComputedStyle(element)
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
              return false
            }
            const rect = element.getBoundingClientRect()
            return rect.width > 0 && rect.height > 0
          }
          const text = document.body.innerText.replace(/\s+/g, ' ')
          const visibleErrors = Array.from(document.querySelectorAll('.file-viewer-error,.pptx-error,.archive-error,.pdf-state--error'))
            .filter(isVisible)
            .map(element => (element.textContent || '').replace(/\s+/g, ' ').trim())
            .filter(Boolean)
          const hasFatalError = visibleErrors.some(text => !/压缩包预览提示|Archive preview/i.test(text))
          const rendered = document.querySelectorAll(selector).length
          const textPattern = new RegExp(patternSource, 'i')
          return !hasFatalError && (rendered > 0 || (allowTextFallback && textPattern.test(text)))
        },
        {
          selector: sample.renderedSelector,
          patternSource: sample.textPattern.source,
          allowTextFallback: sample.allowTextFallback
        },
        { timeout }
      )
    } catch (error) {
      const snapshot = await page.evaluate(selector => ({
        bodyText: document.body.innerText.replace(/\s+/g, ' ').slice(0, 1800),
        html: document.body.innerHTML.slice(0, 2400),
        renderedCount: document.querySelectorAll(selector).length,
        errors: window.__fileViewerErrors || [],
        states: (window.__fileViewerStates || []).slice(-8),
        events: (window.__fileViewerEvents || []).slice(-12),
        visibleErrors: Array.from(document.querySelectorAll('.file-viewer-error,.pptx-error,.archive-error,.pdf-state--error'))
          .filter(element => {
            const style = window.getComputedStyle(element)
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
              return false
            }
            const rect = element.getBoundingClientRect()
            return rect.width > 0 && rect.height > 0
          })
          .map(element => (element.textContent || '').replace(/\s+/g, ' ').trim())
          .filter(Boolean)
      }), sample.renderedSelector)
      fail([
        `${sample.id} timed out waiting for rendered content in ${sourceMode} mode.`,
        `Asset events: ${JSON.stringify(assetEvents)}`,
        `Page errors: ${JSON.stringify(pageErrors)}`,
        `Console errors: ${JSON.stringify(consoleErrors)}`,
        `Bad responses: ${JSON.stringify(badResponses)}`,
        `Failed requests: ${JSON.stringify(failedRequests)}`,
        `Snapshot: ${JSON.stringify(snapshot, null, 2)}`,
        error instanceof Error ? error.message : String(error)
      ].join('\n'))
    }

    const state = await page.evaluate(selector => ({
      bodyText: document.body.innerText.replace(/\s+/g, ' ').slice(0, 1000),
      renderedCount: document.querySelectorAll(selector).length,
      errors: window.__fileViewerErrors || [],
      states: (window.__fileViewerStates || []).slice(-5),
      visibleErrors: Array.from(document.querySelectorAll('.file-viewer-error,.pptx-error,.archive-error,.pdf-state--error'))
        .filter(element => {
          const style = window.getComputedStyle(element)
          if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
            return false
          }
          const rect = element.getBoundingClientRect()
          return rect.width > 0 && rect.height > 0
        })
        .map(element => (element.textContent || '').replace(/\s+/g, ' ').trim())
        .filter(Boolean)
    }), sample.renderedSelector)
    const failures = [
      ...pageErrors.map(error => `pageerror: ${error}`),
      ...consoleErrors.map(error => `console.error: ${error}`),
      ...failedRequests.map(error => `requestfailed: ${error}`),
      ...badResponses,
      ...state.errors.map(error => `viewer error: ${error.message || JSON.stringify(error)}`)
    ]
    if (state.renderedCount < 1 && !(sample.allowTextFallback && sample.textPattern.test(state.bodyText))) {
      failures.push(`No rendered marker found. State: ${JSON.stringify(state)}`)
    }
    if (failures.length) {
      fail(`${sample.id} failed in ${sourceMode} mode:\n${failures.join('\n')}\nAsset events: ${JSON.stringify(assetEvents)}\nState: ${JSON.stringify(state)}`)
    }
    console.log(`[issue71-full-rendering] ${sourceMode}:${sample.id}: ok (${state.renderedCount} rendered marker(s))`)
  } finally {
    for (const [event, listener] of Object.entries(listeners)) {
      page.off(event, listener)
    }
  }
}

if (!['registry', 'local'].includes(sourceMode)) {
  fail('ISSUE71_FULL_RENDERING_SOURCE must be "registry" or "local".')
}
if (!activeSamples.length) {
  fail(`No format selected. Available formats: ${samples.map(sample => sample.id).join(', ')}`)
}
for (const sample of activeSamples) {
  if (!existsSync(sample.source)) {
    fail(`Missing sample ${sample.id}: ${sample.source}`)
  }
}

const tempRoot = await mkdtemp(resolve(tmpdir(), 'file-viewer-issue71-rendering-'))
const tarballDir = resolve(tempRoot, 'tarballs')
await mkdir(tarballDir, { recursive: true })

try {
  const tarballs = await createTarballOverrides(tarballDir)
  const appDir = resolve(tempRoot, `app-${sourceMode}`)
  await writeIssueProject(appDir, tarballs)
  console.log(`[issue71-full-rendering] Installing ${sourceMode} app at ${appDir}`)
  await spawnCommand('pnpm', ['install', '--ignore-scripts'], { cwd: appDir, pipe: true })
  console.log(`[issue71-full-rendering] Starting Vite ${sourceMode} app`)
  const { child, baseUrl } = await startVite(appDir)
  const playwrightModule = await importPlaywright()
  const { chromium } = playwrightModule.chromium ? playwrightModule : playwrightModule.default
  const browser = await chromium.launch({ headless: true }).catch(() => chromium.launch({ channel: 'chrome', headless: true }))
  try {
    for (const sample of activeSamples) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
      try {
        await verifyFormat(page, baseUrl, sample)
      } finally {
        await page.close().catch(() => undefined)
      }
    }
  } finally {
    await browser.close()
    await stopVite(child)
  }
} finally {
  if (keepTemp) {
    console.log(`[issue71-full-rendering] Kept temp root: ${tempRoot}`)
  } else {
    await rm(tempRoot, { recursive: true, force: true })
  }
}

console.log(`[issue71-full-rendering] Verified ${activeSamples.length} format(s) in ${sourceMode} mode.`)
