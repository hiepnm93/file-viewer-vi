import { existsSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

const outputDir = resolve(process.env.WRAPPER_DEMO_OUTPUT_DIR || 'apps/component-demo/dist')
const requiredFiles = [
  'index.html',
  'custom-element.html',
  'jquery.html',
  'manual-js.html',
  'manual-iife.html',
  'svelte-action.html',
  'vue3.html',
  'example/preview.md',
  'example/word.docx',
  'file-viewer/flyfish-viewer-assets.json',
  'vendor/docx/docx.worker.js',
  'vendor/xlsx/sheet.worker.js',
  'vendor/file-viewer/flyfish-viewer-assets.json',
  'vendor/file-viewer-web/flyfish-file-viewer-web.iife.js',
  'vendor/file-viewer-web-full/flyfish-file-viewer-web-full.iife.js',
  'vendor/file-viewer-web-full/renderers/word.iife.js',
  'vendor/file-viewer-web-full/vendor/docx/docx.worker.js',
  'wasm/cad/dwg-worker.js'
]

const fail = message => {
  console.error(`[component-demo-output] ${message}`)
  process.exit(1)
}

const assertFile = relativePath => {
  const filePath = join(outputDir, relativePath)
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    fail(`Missing required file: ${filePath}`)
  }
  return filePath
}

const assertNotHtmlFallback = relativePath => {
  const filePath = assertFile(relativePath)
  const head = readFileSync(filePath, 'utf8').slice(0, 120).trimStart().toLowerCase()
  if (head.startsWith('<!doctype html') || head.startsWith('<html')) {
    fail(`${relativePath} resolved to HTML; static asset serving would fail in browsers.`)
  }
}

for (const requiredFile of requiredFiles) {
  assertFile(requiredFile)
}

const manualIifeHtml = readFileSync(join(outputDir, 'manual-iife.html'), 'utf8')
if (!manualIifeHtml.includes('/vendor/file-viewer-web-full/flyfish-file-viewer-web-full.iife.js')) {
  fail('manual-iife.html does not reference the full browser global helper bundle.')
}
if (!manualIifeHtml.includes('window.FlyfishFileViewerWebFull')) {
  fail('manual-iife.html does not use the full browser global API.')
}
if (!manualIifeHtml.includes('<flyfish-file-viewer')) {
  fail('manual-iife.html does not exercise the script-tag custom element.')
}
if (!manualIifeHtml.includes('/example/word.docx')) {
  fail('manual-iife.html does not use the DOCX full-preset smoke sample.')
}

const iifeBundle = readFileSync(join(outputDir, 'vendor/file-viewer-web-full/flyfish-file-viewer-web-full.iife.js'), 'utf8')
for (const requiredExport of [
  'FlyfishFileViewerWebFull',
  'mountViewer',
  'createViewerControllerHandle',
  'defineFileViewerElement',
  'FileViewerElement',
  'FILE_VIEWER_ELEMENT_TAG'
]) {
  if (!iifeBundle.includes(requiredExport)) {
    fail(`IIFE helper bundle is missing ${requiredExport}.`)
  }
}
for (const legacyExport of ['mountViewerFrame', 'postFileToViewer', 'viewerUrl', 'targetOrigin']) {
  if (iifeBundle.includes(legacyExport)) {
    fail(`IIFE helper bundle must not expose legacy standalone-page API ${legacyExport}.`)
  }
}

assertNotHtmlFallback('vendor/file-viewer-web/flyfish-file-viewer-web.iife.js')
assertNotHtmlFallback('vendor/file-viewer-web-full/flyfish-file-viewer-web-full.iife.js')
assertNotHtmlFallback('vendor/file-viewer-web-full/renderers/word.iife.js')
assertNotHtmlFallback('vendor/file-viewer-web-full/vendor/docx/docx.worker.js')
assertNotHtmlFallback('vendor/docx/docx.worker.js')
assertNotHtmlFallback('vendor/xlsx/sheet.worker.js')
assertNotHtmlFallback('wasm/cad/dwg-worker.js')

console.log(`[component-demo-output] Verified wrapper demo output in ${outputDir}`)
