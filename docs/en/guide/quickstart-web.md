# Vanilla JS / Script Tag

<div class="doc-kicker">Pure Web Integration</div>

<p class="doc-lead">
  Use <code>@file-viewer/web</code> when you want a framework-free viewer with the same renderer capability as Vue, React, Svelte, and jQuery packages.
</p>

## Install

```bash
npm install @file-viewer/web @file-viewer/preset-office
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
  locale="en-US"
  theme="light"
  toolbar-position="bottom-right"
  style="display:block;height:720px"
></flyfish-file-viewer>
```

```ts
import { defineFileViewerElement } from '@file-viewer/web'
import officePreset from '@file-viewer/preset-office'

defineFileViewerElement()

const viewer = document.getElementById('viewer') as HTMLElement & {
  options: unknown
}

viewer.options = {
  preset: officePreset,
  rendererMode: 'replace',
  theme: 'light',
  toolbar: { position: 'bottom-right' }
}
```

Keep the host element or parent container at a stable height. The viewer fills that surface.

For Vite projects, add `@file-viewer/vite-plugin`. Installing the package alone does not make Vite run it; register the plugin once in `vite.config.ts`. It auto-discovers installed `@file-viewer/preset-*` packages and injects renderers, so both the Custom Element and `mountViewer` receive the matching format capabilities without manually importing the preset:

```bash
npm install -D @file-viewer/vite-plugin
```

```ts
import { defineConfig } from 'vite'
import { fileViewerRenderers } from '@file-viewer/vite-plugin'

export default defineConfig({
  plugins: [
    fileViewerRenderers({
      copyAssets: true
    })
  ]
})
```

Installing only `@file-viewer/web` gives you the lightest native web component. Add a preset or renderer package for PDF, Office, CAD, Typst, archives, and other concrete formats. Heavy users can replace `@file-viewer/preset-office` with `@file-viewer/preset-all` for the complete capability set:

```bash
npm install @file-viewer/web @file-viewer/preset-all
```

Use `formats`, `renderers`, `scan:true`, `inject:false`, or `chunkStrategy:'renderer'` only when the product needs exact registry control. The default path stays `fileViewerRenderers({ copyAssets:true })`, with installed presets auto-activated by the plugin.

## Imperative Mount

```ts
import { mountViewer } from '@file-viewer/web'
import officePreset from '@file-viewer/preset-office'

const controller = mountViewer(document.getElementById('viewer')!, {
  url: '/files/report.docx',
  options: {
    preset: officePreset,
    rendererMode: 'replace',
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

## Internationalization

The Web Component accepts `locale` as an HTML attribute or JS property. Use `options.messages` / `options.i18n` for custom copy:

```html
<flyfish-file-viewer src="/files/report.pdf" locale="en-US"></flyfish-file-viewer>
```

```ts
const viewer = document.querySelector('flyfish-file-viewer')!
viewer.locale = 'zh-CN'
viewer.options = {
  i18n: {
    locale: 'zh-CN',
    messages: {
      'toolbar.print': 'Print document'
    }
  }
}
```

For intranet or strict-CSP deployments, copy runtime assets into your own public directory:

```bash
npx file-viewer-copy-assets ./public/file-viewer
```

The command verifies worker, WASM, PDF, CAD, Typst, Archive, Data, DOCX, Spreadsheet, and Draw.io assets. Runtime options such as `options.pdf.workerUrl`, `options.archive.wasmUrl`, `options.docx.workerUrl`, `options.typst.compilerWasmUrl`, and `options.drawing.viewerScriptUrl` can point to self-hosted URLs.
