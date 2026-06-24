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

## Automatic Preset Assembly

`@file-viewer/vite-plugin` can discover installed presets and inject the generated virtual module into the Vite HTML entry. In the common path, install the component package plus a preset, add the plugin once, and the framework component automatically receives that preview capability:

```ts
fileViewerRenderers({
  copyAssets: true
  // No preset option required: installed @file-viewer/preset-* packages are discovered.
})
```

`inject` defaults to true. Preset packages register themselves in core when imported, and `FileViewerOptions.autoRenderers` defaults to true in normal `extend` mode. Set `autoRenderers:false` only when a product needs full manual control.

The default experience is intentionally zero-config: if the plugin receives no explicit `preset`, `formats`, or `renderers`, or only receives `copyAssets:true`, it auto-discovers installed `@file-viewer/preset-*` packages. `preset-all` takes precedence when present; otherwise installed `lite`, `office`, and `engineering` presets are composed.

Install `@file-viewer/preset-all` when a heavy user wants the fastest full-capability setup:

```bash
npm install @file-viewer/vue3 @file-viewer/core @file-viewer/vite-plugin @file-viewer/preset-all
```

Use `preset:'auto'` or `autoPresets:true` when you also enable `scan:true`; this keeps installed preset discovery active while source hints add extra renderers. If `preset-all` is installed, it takes precedence to avoid importing narrower presets twice.

```ts
fileViewerRenderers({
  preset: 'auto',
  scan: true,
  formats: ['pdf'],
  copyAssets: true,
  chunkStrategy: 'renderer'
})
```

| Customization | Purpose |
| --- | --- |
| `copyAssets:true` | Copies matched Worker, WASM, font, PDF/CAD/Typst/Archive/Data, and vendor assets |
| `preset:'auto'` / `autoPresets:true` | Keeps installed preset auto-discovery active together with `scan:true` |
| `formats` / `renderers` | Adds a few formats outside a preset, or builds a strict single-renderer bundle |
| `scan:true` | Collects format hints from `fileViewerFormats`, `data-file-viewer-formats`, `accept`, and similar source hints |
| `inject:false` | Disables auto injection so application code imports `virtual:file-viewer-renderers` and passes `options.renderers` manually |
| `chunkStrategy:'renderer'` | Uses renderer-level chunk names for caching and heavy-pipeline size debugging |

## Manual Control

Strict bundles can still use the virtual module directly:

```ts
fileViewerRenderers({
  formats: ['pdf'],
  inject: false,
  copyAssets: true
})
```

```ts
import { configuredFileViewerRenderers } from 'virtual:file-viewer-renderers'

const options = {
  builtinRenderers: 'none',
  rendererMode: 'replace',
  renderers: configuredFileViewerRenderers
}
```

`scan:true` detects hints such as `fileViewerFormats`, `data-file-viewer-formats`, and upload `accept` attributes, then merges them with explicit `formats`.

## Missing Renderer Guidance

If a file extension is in the supported matrix but its renderer has not been assembled, the viewer shows a friendly install-oriented state. For example, opening `.pdf` without the PDF renderer recommends `@file-viewer/preset-office` or `@file-viewer/renderer-pdf`. Only extensions outside the matrix are shown as truly unsupported.

## Asset Rules

Use `copyAssets:true` or `npx file-viewer-copy-assets ./public/file-viewer` for offline deployments. Worker, WASM, font, PDF, CAD, Typst, Archive, Data, and Draw.io assets should be served from your own domain.
