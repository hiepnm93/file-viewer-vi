import { createReadStream, existsSync, statSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { delimiter, extname, join, normalize, relative, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'

const outputDir = resolve(process.env.DEMO_OUTPUT_DIR || 'apps/viewer-demo/dist')
const fixturePath = resolve('apps/viewer-demo/public/example/design.psd')
const timeout = Number(process.env.PSD_LAYER_ORDER_TIMEOUT || 45000)
const requireFromDataRenderer = createRequire(resolve('packages/renderers/data/package.json'))
const requireFromScript = createRequire(import.meta.url)

const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.psd', 'application/octet-stream'],
  ['.svg', 'image/svg+xml; charset=utf-8'],
  ['.wasm', 'application/wasm'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2']
])

function fail(message) {
  console.error(`[psd-layer-order] ${message}`)
  process.exit(1)
}

function assertBuildOutput() {
  const indexPath = join(outputDir, 'index.html')
  if (!existsSync(indexPath) || !statSync(indexPath).isFile()) {
    fail(`Missing demo build output ${indexPath}. Run pnpm build-only first.`)
  }
}

async function assertFixtureStackOrder() {
  const { readPsd } = requireFromDataRenderer('ag-psd')
  const bytes = await readFile(fixturePath)
  const psd = readPsd(bytes, {
    skipCompositeImageData: true,
    skipLayerImageData: true
  })
  const rootLayerNames = (psd.children || []).map(layer => String(layer.name || ''))

  assert.deepEqual(
    rootLayerNames,
    ['Background gradient', 'Accent card', 'Cyan circle', 'Hidden magenta note'],
    'design.psd fixture should expose root layers from bottom to top'
  )
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
        const playwrightEntry = requireFromScript.resolve('playwright', { paths: [candidatePath] })
        return await import(pathToFileURL(playwrightEntry).href)
      } catch {
        // Keep probing package roots injected by npm exec / npx.
      }
    }

    fail([
      'Missing playwright module.',
      'Run with: npm exec --yes --package playwright -- node scripts/verify-psd-layer-order.mjs',
      `Original error: ${error instanceof Error ? error.message : String(error)}`
    ].join('\n'))
  }
}

async function startStaticServer() {
  assertBuildOutput()

  const server = createServer((request, response) => {
    const requestUrl = new URL(request.url || '/', 'http://127.0.0.1')
    const decodedPath = decodeURIComponent(requestUrl.pathname)
    const normalizedPath = normalize(decodedPath).replace(/^(\.\.(\/|\\|$))+/, '')
    const relativePath = normalizedPath === '/' ? 'index.html' : normalizedPath.replace(/^[/\\]+/, '')
    const filePath = resolve(outputDir, relativePath)

    if (!filePath.startsWith(outputDir) || relative(outputDir, filePath).startsWith('..')) {
      response.writeHead(403)
      response.end('Forbidden')
      return
    }

    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      response.writeHead(404)
      response.end('Not Found')
      return
    }

    response.writeHead(200, {
      'Content-Type': mimeTypes.get(extname(filePath).toLowerCase()) || 'application/octet-stream'
    })
    createReadStream(filePath).pipe(response)
  })

  await new Promise((resolveServer, rejectServer) => {
    server.once('error', rejectServer)
    server.listen(0, '127.0.0.1', resolveServer)
  })

  const address = server.address()
  if (!address || typeof address === 'string') {
    fail('Unable to resolve PSD smoke server address.')
  }

  return {
    server,
    url: `http://127.0.0.1:${address.port}`
  }
}

async function launchChromium(chromium) {
  try {
    return await chromium.launch({ headless: true })
  } catch (error) {
    try {
      return await chromium.launch({ channel: 'chrome', headless: true })
    } catch {
      throw error
    }
  }
}

function colorDistance(left, right) {
  return Math.sqrt(
    (left[0] - right[0]) ** 2 +
    (left[1] - right[1]) ** 2 +
    (left[2] - right[2]) ** 2
  )
}

async function verifyBrowserLayerOrder(page, baseUrl) {
  const browserFailures = []
  page.on('pageerror', error => {
    browserFailures.push(`pageerror: ${error.message}`)
  })
  page.on('console', message => {
    if (message.type() === 'error') {
      browserFailures.push(`console.error: ${message.text()}`)
    }
  })

  await page.goto(`${baseUrl}/index.html`, {
    waitUntil: 'domcontentloaded',
    timeout
  })
  await page.fill('input.compact-field', '/example/design.psd')
  await page.click('.primary-button')
  await page.waitForSelector('.psd-viewer', { timeout })
  await page.waitForFunction(
    () => document.querySelectorAll('.psd-layer').length >= 4 &&
      document.querySelector('.psd-canvas-shell canvas') instanceof HTMLCanvasElement,
    undefined,
    { timeout }
  )

  const state = await page.evaluate(() => {
    const layerNames = [...document.querySelectorAll('.psd-layer')]
      .map(layer => layer.getAttribute('data-layer-name') || layer.querySelector('strong')?.textContent?.trim() || '')
    const canvas = document.querySelector('.psd-canvas-shell canvas')
    if (!(canvas instanceof HTMLCanvasElement)) {
      return { layerNames, missingCanvas: true }
    }
    const context = canvas.getContext('2d')
    if (!context) {
      return { layerNames, missingContext: true }
    }
    const pixelAt = (x, y) => Array.from(context.getImageData(x, y, 1, 1).data)
    return {
      layerNames,
      cyanPixel: pixelAt(312, 94),
      backgroundPixel: pixelAt(18, 18),
      cardPixel: pixelAt(120, 90)
    }
  })

  assert.equal(state.missingCanvas, undefined, 'PSD canvas should exist')
  assert.equal(state.missingContext, undefined, 'PSD canvas 2d context should exist')
  assert.deepEqual(
    state.layerNames,
    ['Hidden magenta note', 'Cyan circle', 'Accent card', 'Background gradient'],
    'PSD layer panel should list layers from top to bottom'
  )
  assert.ok(
    state.cyanPixel[1] > 140 && state.cyanPixel[2] > 140 && state.cyanPixel[0] < 120,
    `Expected cyan layer to be visible above the background at 312,94, got ${state.cyanPixel.join(',')}`
  )
  assert.ok(
    colorDistance(state.cyanPixel, state.backgroundPixel) > 70,
    `Expected foreground pixel to differ from the background, got cyan=${state.cyanPixel.join(',')} background=${state.backgroundPixel.join(',')}`
  )
  assert.ok(
    colorDistance(state.cardPixel, state.backgroundPixel) > 40,
    `Expected card layer to be visible above the background, got card=${state.cardPixel.join(',')} background=${state.backgroundPixel.join(',')}`
  )
  assert.deepEqual(browserFailures, [], 'Browser should not emit errors while rendering PSD sample')
}

const run = async () => {
  await assertFixtureStackOrder()
  const playwrightModule = await importPlaywright()
  const { chromium } = playwrightModule.chromium ? playwrightModule : playwrightModule.default
  const serverHandle = await startStaticServer()
  const browser = await launchChromium(chromium)
  const page = await browser.newPage({
    viewport: {
      width: 1440,
      height: 960
    }
  })

  try {
    await verifyBrowserLayerOrder(page, serverHandle.url)
  } finally {
    await browser.close()
    await new Promise(resolveClose => serverHandle.server.close(resolveClose))
  }

  console.log('[psd-layer-order] Verified PSD fixture stack, layer panel order, and foreground canvas pixels.')
}

run().catch(error => {
  const hint = String(error?.message || error)
  if (hint.includes('Executable doesn') || hint.includes('browserType.launch')) {
    console.error(
      [
        '[psd-layer-order] Playwright browser is not installed.',
        'Run: npm exec --yes --package playwright -- playwright install chromium',
        `Original error: ${hint}`
      ].join('\n')
    )
    process.exit(1)
  }
  fail(error instanceof Error ? error.stack || error.message : String(error))
})
