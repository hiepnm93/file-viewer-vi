import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { delimiter, extname, join, normalize, relative, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

const outputDir = resolve(process.env.ZOOM_STATE_OUTPUT_DIR || process.env.DEMO_OUTPUT_DIR || 'apps/viewer-demo/dist')
const externalUrl = process.env.ZOOM_STATE_URL
const timeout = Number(process.env.ZOOM_STATE_TIMEOUT || 60000)
const require = createRequire(import.meta.url)

const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.ofd', 'application/octet-stream'],
  ['.pdf', 'application/pdf'],
  ['.png', 'image/png'],
  ['.wasm', 'application/wasm'],
])

const fail = message => {
  console.error(`[zoom-state] ${message}`)
  process.exit(1)
}

const importPlaywright = async () => {
  try {
    const mod = await import('playwright')
    return mod.default || mod
  } catch (error) {
    const candidatePaths = process.env.PATH
      ?.split(delimiter)
      .filter(pathEntry => pathEntry.endsWith(`${sep}node_modules${sep}.bin`))
      .map(binDir => resolve(binDir, '..'))
      .filter(pathEntry => existsSync(pathEntry)) || []

    for (const candidatePath of candidatePaths) {
      try {
        const playwrightEntry = require.resolve('playwright', { paths: [candidatePath] })
        const mod = await import(pathToFileURL(playwrightEntry).href)
        return mod.default || mod
      } catch {
        // Continue probing npm exec / npx injected package roots.
      }
    }

    fail([
      'Missing playwright module.',
      'Run with: npm exec --yes --package playwright -- node scripts/verify-zoom-state.mjs',
      `Original error: ${error instanceof Error ? error.message : String(error)}`,
    ].join('\n'))
  }
}

const startStaticServer = async () => {
  if (externalUrl) {
    return {
      url: externalUrl.replace(/\/$/, ''),
      close: () => {},
    }
  }

  if (!existsSync(join(outputDir, 'index.html'))) {
    fail(`Missing demo build output: ${join(outputDir, 'index.html')}`)
  }

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
      'Content-Type': mimeTypes.get(extname(filePath).toLowerCase()) || 'application/octet-stream',
    })
    createReadStream(filePath).pipe(response)
  })

  await new Promise((resolveServer, rejectServer) => {
    server.once('error', rejectServer)
    server.listen(0, '127.0.0.1', resolveServer)
  })

  const address = server.address()
  if (!address || typeof address === 'string') {
    fail('Unable to resolve zoom-state smoke server address.')
  }

  return {
    url: `http://127.0.0.1:${address.port}`,
    close: () => server.close(),
  }
}

const delay = ms => new Promise(resolveDelay => setTimeout(resolveDelay, ms))

const percent = text => {
  const match = String(text || '').match(/(\d+)%/)
  return match ? Number(match[1]) : NaN
}

const assertClosePercent = (label, expected, context) => {
  if (!Number.isFinite(label) || !Number.isFinite(expected) || Math.abs(label - expected) > 1) {
    throw new Error(`Expected zoom label ${label}% to match ${expected}%.\n${JSON.stringify(context, null, 2)}`)
  }
}

const withPage = async (browser, baseUrl, failures, path, viewport, fn) => {
  const page = await browser.newPage({ viewport })
  page.on('console', msg => {
    if (msg.type() === 'error') {
      failures.push(`${path}: browser console error: ${msg.text()}`)
    }
  })
  page.on('pageerror', error => {
    failures.push(`${path}: browser page error: ${error.message}`)
  })

  await page.goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded', timeout })
  try {
    await fn(page)
  } catch (error) {
    const snapshot = await page.evaluate(() => ({
      url: location.href,
      meters: Array.from(document.querySelectorAll('.viewer-zoom-meter,.mobile-zoom-meter,.pdf-scale-button')).map(el => ({
        tag: el.tagName,
        text: (el.textContent || '').trim(),
        className: el.getAttribute('class') || '',
      })),
      bodyText: document.body.innerText.replace(/\s+/g, ' ').trim().slice(0, 1000),
    })).catch(() => null)
    failures.push(`${path}: ${error instanceof Error ? error.message : String(error)}\n${JSON.stringify(snapshot, null, 2)}`)
  } finally {
    await page.close()
  }
}

const verifyDocxZoom = async page => {
  await page.waitForSelector('.docx-fit-viewer', { timeout })
  await page.waitForFunction(() => {
    const pageEl = document.querySelector('.docx-page-frame > section.docx, .docx-flow-frame > section.docx')
    return pageEl instanceof HTMLElement && /scale\(([^)]+)\)/.test(pageEl.style.transform)
  }, { timeout })
  await delay(250)

  const result = await page.evaluate(async () => {
    const waitFrame = () => new Promise(resolveFrame => requestAnimationFrame(() => resolveFrame()))
    const read = () => {
      const pageEl = document.querySelector('.docx-page-frame > section.docx, .docx-flow-frame > section.docx')
      const meterText = (document.querySelector('.viewer-zoom-meter,.mobile-zoom-meter')?.textContent || '').trim()
      const transform = pageEl instanceof HTMLElement ? pageEl.style.transform : ''
      const match = transform.match(/scale\(([^)]+)\)/)
      const scale = match ? Number(match[1]) : NaN
      return { meterText, scale, transform }
    }
    const before = read()
    const zoomIn = Array.from(document.querySelectorAll('button[title="放大预览"],button[aria-label="放大预览"]'))
      .find(button => button instanceof HTMLButtonElement && !button.disabled)
    zoomIn?.click()
    await waitFrame()
    await waitFrame()
    const after = read()
    return { before, after }
  })

  const beforeLabel = percent(result.before.meterText)
  const afterLabel = percent(result.after.meterText)
  const beforeExpected = Math.round(result.before.scale * 100)
  const afterExpected = Math.round(result.after.scale * 100)
  assertClosePercent(beforeLabel, beforeExpected, result)
  assertClosePercent(afterLabel, afterExpected, result)
  if (afterLabel <= beforeLabel) {
    throw new Error(`DOCX zoom label did not increase after zoom-in.\n${JSON.stringify(result, null, 2)}`)
  }
}

const verifyPdfZoom = async page => {
  await page.waitForSelector('.pdfViewer .page', { timeout })
  await page.waitForFunction(() => document.querySelector('.pdf-state')?.hasAttribute('hidden'), { timeout })
  await page.waitForFunction(() => {
    const pdfText = (document.querySelector('.pdf-scale-button')?.textContent || '').trim()
    const meterText = (document.querySelector('.viewer-zoom-meter,.mobile-zoom-meter')?.textContent || '').trim()
    return /\d+%/.test(pdfText) && pdfText !== '100%' && meterText === pdfText
  }, { timeout })
}

const verifyImageZoom = async page => {
  await page.waitForSelector('.image-stage img', { timeout })
  await page.waitForFunction(() => {
    const img = document.querySelector('.image-stage img')
    return img instanceof HTMLImageElement &&
      img.complete &&
      img.naturalWidth > 0 &&
      img.getBoundingClientRect().width > 0
  }, { timeout })
  await page.waitForFunction(() => {
    const img = document.querySelector('.image-stage img')
    const meterText = (document.querySelector('.viewer-zoom-meter,.mobile-zoom-meter')?.textContent || '').trim()
    if (!(img instanceof HTMLImageElement) || !img.naturalWidth || !meterText) {
      return false
    }
    const label = Number((meterText.match(/(\d+)%/) || [])[1])
    const expected = Math.round(img.getBoundingClientRect().width / img.naturalWidth * 100)
    return Number.isFinite(label) && Math.abs(label - expected) <= 1 && !(label === 100 && expected !== 100)
  }, { timeout })
}

const main = async () => {
  const { chromium } = await importPlaywright()
  const server = await startStaticServer()
  const browser = await chromium.launch({ headless: true })
  const failures = []

  try {
    await withPage(browser, server.url, failures, '?locale=zh-CN', { width: 700, height: 720 }, verifyDocxZoom)
    await withPage(browser, server.url, failures, '?url=/example/pdf.pdf&locale=zh-CN', { width: 760, height: 720 }, verifyPdfZoom)
    await withPage(browser, server.url, failures, '?url=/example/pic.png&locale=zh-CN', { width: 700, height: 720 }, verifyImageZoom)
  } finally {
    await browser.close()
    server.close()
  }

  if (failures.length) {
    fail(failures.join('\n\n'))
  }
  console.log('[zoom-state] ok')
}

main().catch(error => {
  fail(error instanceof Error ? error.stack || error.message : String(error))
})
