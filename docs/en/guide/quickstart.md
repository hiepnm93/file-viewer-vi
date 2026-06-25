# Quickstart

<div class="doc-kicker">Get Running Fast</div>

<p class="doc-lead">
  Pick the package that matches your stack, give the viewer container a stable height, and pass a file URL or a real <code>File</code>.
  One component, one line of code, fast integration.
</p>

## Three-step Integration

| Step | Decision | Fast answer |
| --- | --- | --- |
| 1 | Pick the component package | Vanilla JS uses `@file-viewer/web`; Vue uses `@file-viewer/vue3`, `@file-viewer/vue2.7`, or `@file-viewer/vue2.6`; React uses `@file-viewer/react`; the ecosystem page covers every package. |
| 2 | Pick the capability layer | Use `preset-lite` for lightweight attachments, `preset-office` for documents, `preset-engineering` for engineering assets, or `preset-all` for the complete matrix. |
| 3 | Pass the source and options | Use `url="/files/demo.pdf"` or a real `File`, then pass the selected preset through `options`. |

This page keeps the shortest runnable paths. See [Component Options](/en/guide/usage) for the full API, renderer package matrix, toolbar, watermark, print, search, lifecycle, and guard options. See [Modular Assembly](/en/guide/on-demand-renderers) for on-demand renderers and the Vite plugin.

## Pick The Capability Layer First

Installing a standard component package such as `@file-viewer/vue3`, `@file-viewer/react`, or `@file-viewer/web` is the lightest path. It gives you the native framework component, types, controller APIs, and the core foundation; it does not install every heavy PDF, Office, CAD, Typst, archive, or engineering renderer by default.

Add a preset or a single renderer package for the file formats your product actually needs:

| Package | Coverage | Best fit |
| --- | --- | --- |
| `@file-viewer/preset-lite` | Text, Markdown, code, image, audio, video | Lightweight attachment preview |
| `@file-viewer/preset-office` | PDF, Word, Excel, PowerPoint, OFD, RTF, OpenDocument | OA, approvals, knowledge bases, contracts |
| `@file-viewer/preset-engineering` | CAD, 3D, drawing, XMind, Geo, Typst, Archive, Data, EDA | Engineering, R&D, design assets |
| `@file-viewer/preset-all` | Full official demo matrix | Demos and internal all-format workbenches |
| Single renderer | For example `@file-viewer/renderer-pdf` or `@file-viewer/renderer-word` | Minimal custom format cuts |

The most stable integration path is to import a preset or renderer explicitly and pass it through `options.preset` / `options.renderers`. This works in Webpack, Rspack, Rollup, Umi, classic multi-page apps, micro-frontends, and internal component libraries. Vite projects can add `@file-viewer/vite-plugin` later to remove manual imports and copy offline assets automatically.

### Universal Setup: Inject options.preset

Install the component package and one preset:

```bash
pnpm add @file-viewer/vue3 @file-viewer/preset-office
```

```ts
import officePreset from '@file-viewer/preset-office'

export const viewerOptions = {
  preset: officePreset,
  rendererMode: 'replace',
  theme: 'light',
  toolbar: { position: 'bottom-right' }
}
```

Pass the same options object to your framework component:

```vue
<file-viewer url="/files/demo.docx" :options="viewerOptions" />
```

Multiple capability bundles use the same `preset` field as an array, so applications do not need a second option name:

```ts
import officePreset from '@file-viewer/preset-office'
import engineeringPreset from '@file-viewer/preset-engineering'

export const viewerOptions = {
  preset: [officePreset, engineeringPreset],
  rendererMode: 'replace'
}
```

For the smallest exact cut, skip presets and install a single renderer:

```bash
pnpm add @file-viewer/vue3 @file-viewer/renderer-pdf
```

```ts
import { pdfRenderer } from '@file-viewer/renderer-pdf'

export const viewerOptions = {
  renderers: [pdfRenderer],
  rendererMode: 'replace'
}
```

If a file extension is supported but the required renderer is not assembled, the viewer shows an install-oriented hint instead of a vague unsupported state.

### Vite Plugin: Zero-Config Assembly

In Vite projects, install and register the plugin in addition to a preset. Once `fileViewerRenderers({ copyAssets:true })` is in `vite.config.ts`, it auto-discovers installed `@file-viewer/preset-*` packages, injects the renderer virtual module, and copies Worker / WASM / font / vendor assets. Application code no longer needs to import the preset manually:

```bash
pnpm add @file-viewer/vue3 @file-viewer/preset-office
pnpm add -D @file-viewer/vite-plugin
```

```ts
// vite.config.ts
import { fileViewerRenderers } from '@file-viewer/vite-plugin'

export default {
  plugins: [
    fileViewerRenderers({
      copyAssets: true
      // No preset:'office' needed; the plugin discovers installed @file-viewer/preset-office.
    })
  ]
}
```

Heavy users can switch to the complete preset while keeping the same Vite config:

```bash
pnpm add @file-viewer/vue3 @file-viewer/preset-all
pnpm add -D @file-viewer/vite-plugin
```

Use explicit options only when you need customization:

| Option | Best fit |
| --- | --- |
| `copyAssets:true` | Copies Worker, WASM, PDF font, CAD, Typst, Archive, Data, and other offline assets; recommended for production and intranet deployments |
| `formats` / `renderers` | Generates exact renderer imports when you do not use a preset, or when a preset needs a few extra formats |
| `scan:true` | Scans source hints such as `fileViewerFormats`, `data-file-viewer-formats`, and upload `accept` attributes |
| `preset:'auto'` / `autoPresets:true` | Keeps installed preset auto-discovery active while `scan:true` is enabled |
| `inject:false` | Disables auto injection so you can import `virtual:file-viewer-renderers` and pass `options.renderers` manually |
| `chunkStrategy:'renderer'` | Splits chunks by renderer for caching, debugging, and heavy-pipeline size analysis |

The recommended default is `fileViewerRenderers({ copyAssets:true })`. Configure the advanced options only for strict bundle cuts, source-hint scanning, or complete registry control.

## Vanilla JavaScript / Web Component

```bash
npm install @file-viewer/web @file-viewer/preset-office
```

```html
<flyfish-file-viewer
  id="viewer"
  src="/files/demo.pdf"
  filename="demo.pdf"
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

const viewer = document.getElementById('viewer')
viewer.options = {
  preset: officePreset,
  rendererMode: 'replace',
  theme: 'light',
  toolbar: { position: 'bottom-right' }
}
```

## Vue 3

```bash
npm install @file-viewer/vue3 @file-viewer/preset-office
```

```ts
import { createApp } from 'vue'
import App from './App.vue'
import FileViewer from '@file-viewer/vue3'

createApp(App).use(FileViewer).mount('#app')
```

```vue
<script setup lang="ts">
import officePreset from '@file-viewer/preset-office'

const viewerOptions = {
  preset: officePreset,
  rendererMode: 'replace',
  theme: 'light',
  toolbar: { position: 'bottom-right' }
}
</script>

<template>
  <div style="height: 100vh">
    <file-viewer url="/files/report.docx" :options="viewerOptions" />
  </div>
</template>
```

## React

```bash
npm install @file-viewer/react @file-viewer/preset-office
```

```tsx
import FileViewer from '@file-viewer/react'
import officePreset from '@file-viewer/preset-office'

export function Preview() {
  return (
    <div style={{ height: '100vh' }}>
      <FileViewer
        url="/files/report.pdf"
        options={{
          preset: officePreset,
          rendererMode: 'replace',
          theme: 'light',
          toolbar: { position: 'bottom-right' },
          archive: { cache: true }
        }}
      />
    </div>
  )
}
```

React 16.8/17 projects can use `@file-viewer/react-legacy`.

## Locale And Copy

The viewer defaults to `locale: 'auto'`, which follows the browser language and resolves to Chinese or English. Use the same `options` object across Vanilla JS / Pure Web, Vue, React, jQuery, and Svelte when you need a fixed locale or custom copy:

```ts
const options = {
  locale: 'en-US',
  messages: {
    'toolbar.download': 'Save file'
  }
}
```

You can also group locale and copy under `i18n`:

```ts
const options = {
  i18n: {
    locale: 'zh-CN',
    messages(key, params, locale) {
      return key === 'state.empty.title' ? '请选择文件' : undefined
    }
  }
}
```

Web Component users can set `locale="en-US"` directly on `<flyfish-file-viewer>`.

## Authenticated Files

If your app must authenticate before downloading a file, fetch the file in the host app and pass a named `File` to the viewer:

```ts
const blob = await fetch('/api/files/contract', {
  credentials: 'include'
}).then(response => response.blob())

const file = new File([blob], 'contract.pdf', { type: blob.type })
```

Passing a filename with an extension is important because the viewer uses it to pick the renderer.

## Self-host Worker And WASM Assets

Most web apps can install the package and run. For intranet, strict CSP, offline, or custom static-prefix deployments, copy viewer assets into your app:

```bash
npx file-viewer-copy-assets ./public/file-viewer
```

The copy command verifies PDF, archive, DOCX, spreadsheet, Draw.io, CAD, Typst, SQLite, Worker, WASM, and vendor assets. Runtime options let you point each renderer to your own static paths.

## Try The Demo Locally

```bash
pnpm install
pnpm dev
```

The main demo opens at the Vite dev server URL. The comparison demo is available at `/compare.html`.
