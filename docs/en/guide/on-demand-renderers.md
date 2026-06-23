# Modular And On-demand Renderers

<div class="doc-kicker">Small When You Can, Complete When You Need</div>

<p class="doc-lead">
  The 2.1.0 architecture lets teams choose minimal renderer imports, product-shaped presets, or the complete official demo capability set.
</p>

## Minimal Import

For a PDF-only Vue 3 product:

```bash
npm install @file-viewer/vue3 @file-viewer/core @file-viewer/vite-plugin @file-viewer/renderer-pdf
```

```ts
import { defineConfig } from 'vite'
import { fileViewerRenderers } from '@file-viewer/vite-plugin'

export default defineConfig({
  plugins: [
    fileViewerRenderers({
      formats: ['pdf'],
      copyAssets: true,
      chunkStrategy: 'renderer'
    })
  ]
})
```

## Presets

| Preset | Best for |
| --- | --- |
| `@file-viewer/preset-lite` | Text, code, Markdown, image, audio, and video attachments |
| `@file-viewer/preset-office` | PDF, Word, spreadsheet, presentation, OFD, and OpenDocument workflows |
| `@file-viewer/preset-engineering` | CAD, EDA, Typst, archives, email, data, 3D, geo, drawing, and mind maps |
| `@file-viewer/preset-all` | Admin workbenches and demos that need every official renderer |

## Generated Renderer Imports

`@file-viewer/vite-plugin` can generate `virtual:file-viewer-renderers` from explicit `formats`, a `preset`, or source scanning:

```ts
fileViewerRenderers({
  preset: 'office',
  scan: true,
  copyAssets: true,
  chunkStrategy: 'renderer'
})
```

`scan:true` detects hints such as `fileViewerFormats`, `data-file-viewer-formats`, and upload `accept` attributes.

## Asset Rules

Use `copyAssets:true` or `npx file-viewer-copy-assets ./public/file-viewer` for offline deployments. Worker, WASM, font, PDF, CAD, Typst, Archive, Data, and Draw.io assets should be served from your own domain.

