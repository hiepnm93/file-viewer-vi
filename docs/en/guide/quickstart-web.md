# Vanilla JS / Script Tag

<div class="doc-kicker">Pure Web Integration</div>

<p class="doc-lead">
  Use <code>@file-viewer/web</code> when you want a framework-free viewer with the same renderer capability as Vue, React, Svelte, and jQuery packages.
</p>

## Install

```bash
npm install @file-viewer/web
```

The historical package name remains synchronized for compatibility:

```bash
npm install @flyfish-group/file-viewer-web
```

## Web Component

```html
<flyfish-file-viewer
  id="viewer"
  src="/files/report.pdf"
  filename="report.pdf"
  theme="light"
  toolbar-position="bottom-right"
  style="display:block;height:720px"
></flyfish-file-viewer>
```

```ts
import { defineFileViewerElement } from '@file-viewer/web'

defineFileViewerElement()
```

Keep the host element or parent container at a stable height. The viewer fills that surface.

## Imperative Mount

```ts
import { mountViewer } from '@file-viewer/web'

const controller = mountViewer(document.getElementById('viewer')!, {
  url: '/files/report.docx',
  options: {
    theme: 'light',
    toolbar: { position: 'bottom-right' },
    archive: { cache: true }
  },
  onEvent(event) {
    console.log(event.type, event.payload)
  }
})

controller.reload()
```

## Authenticated Files

When the business system must authenticate first, fetch the file in the host page and pass a named `File`:

```ts
const blob = await fetch('/api/files/contract', {
  credentials: 'include'
}).then(response => response.blob())

const file = new File([blob], 'contract.pdf', { type: blob.type })

document.querySelector('flyfish-file-viewer')!.file = file
```

## Script Tag Without A Bundler

Use the IIFE bundle for pages that do not run Vite, Webpack, Rspack, Rollup, or another package-aware bundler:

```bash
cp ./node_modules/@file-viewer/web/dist/flyfish-file-viewer-web.iife.js ./public/vendor/file-viewer-web/flyfish-file-viewer-web.iife.js
```

```html
<script src="/vendor/file-viewer-web/flyfish-file-viewer-web.iife.js"></script>

<flyfish-file-viewer
  src="/files/demo.docx"
  filename="demo.docx"
  theme="light"
  toolbar-position="bottom-right"
  style="display:block;height:720px"
></flyfish-file-viewer>
```

The IIFE registers the default custom element and exposes `window.FlyfishFileViewerWeb.mountViewer(container, options)`.

## Offline Assets

For intranet or strict-CSP deployments, copy runtime assets into your own public directory:

```bash
npx file-viewer-copy-assets ./public/file-viewer
```

The command verifies worker, WASM, PDF, CAD, Typst, Archive, Data, DOCX, Spreadsheet, and Draw.io assets. Runtime options such as `options.pdf.workerUrl`, `options.archive.wasmUrl`, `options.docx.workerUrl`, `options.typst.compilerWasmUrl`, and `options.drawing.viewerScriptUrl` can point to self-hosted URLs.

