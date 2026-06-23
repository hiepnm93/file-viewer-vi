# @file-viewer/vite-plugin

Vite plugin for Flyfish File Viewer on-demand renderer assembly. It generates `virtual:file-viewer-renderers` from the formats your application declares, imports only the matching renderer packages, and provides renderer-oriented chunk planning plus offline worker/WASM/font asset copying. The extension mapping is verified against the full `@file-viewer/core` format matrix in repository gates, so new formats cannot silently drift away from automatic assembly.

## Install

```bash
pnpm add @file-viewer/vue3 @file-viewer/vite-plugin @file-viewer/renderer-pdf
```

Install additional renderer packages when you need more formats, such as `@file-viewer/renderer-word`, `@file-viewer/renderer-ofd`, `@file-viewer/renderer-presentation`, `@file-viewer/renderer-cad`, `@file-viewer/renderer-drawing`, `@file-viewer/renderer-3d`, `@file-viewer/renderer-data`, `@file-viewer/renderer-eda`, `@file-viewer/renderer-typst`, `@file-viewer/renderer-archive`, or `@file-viewer/renderer-text`.

When you want one package for a common product shape, install a preset:

```bash
pnpm add @file-viewer/vue3 @file-viewer/vite-plugin @file-viewer/preset-office
```

Available presets:

- `@file-viewer/preset-lite`: text, Markdown, code, image, audio, and video.
- `@file-viewer/preset-office`: PDF, Word, Excel, PowerPoint, OFD, RTF, and OpenDocument.
- `@file-viewer/preset-engineering`: CAD, 3D, drawing, XMind, Geo, Typst, Archive, Data, and EDA.
- `@file-viewer/preset-all`: the complete official demo format matrix.

## vite.config.ts

```ts
import { defineConfig } from 'vite'
import { fileViewerRenderers } from '@file-viewer/vite-plugin'

export default defineConfig({
  plugins: [
    fileViewerRenderers({
      formats: ['pdf', 'dwg', 'typst', 'zip', 'xmind'],
      scan: true,
      copyAssets: true,
      chunkStrategy: 'renderer'
    })
  ]
})
```

Or use one preset package:

```ts
fileViewerRenderers({
  preset: 'office',
  copyAssets: true
})
```

`scan: true` inspects common source folders for lightweight hints and merges them with `formats`:

```ts
export const fileViewerFormats = ['pdf', 'docx', 'xlsx']
```

```html
<input accept=".pdf,.docx" data-file-viewer-formats="dwg,xmind" />
```

This is useful when upload accept lists, sample matrices, or attachment allow-lists already live in source code: dev and production builds can generate the renderer assembly module without a second hand-written import list.

## Application Code

```ts
import FileViewer from '@file-viewer/vue3'
import { configuredFileViewerRenderers } from 'virtual:file-viewer-renderers'

const options = {
  rendererMode: 'replace',
  renderers: configuredFileViewerRenderers
}
```

## Current Boundary

The plugin currently generates imports for extracted renderer packages: Word, Spreadsheet, PDF, OFD, Presentation, CAD, Draw.io/Excalidraw/Mermaid/PlantUML, 3D, Data, EDA, Typst, archives, email, EPUB, code/Markdown/Patch/Git Bundle, image, media, XMind, and Geo. Declare them explicitly with `formats`, or let `scan: true` discover source hints automatically; core-supported extensions such as `.zipx`, `.cbz`, `.tiff`, `.mjs`, `.gv`, `.patch`, `.bundle`, `.mermaid`, `.puml`, and `.mpeg` also resolve to their renderer packages. With `copyAssets:true`, the plugin also copies the Typst compiler / renderer WASM files and the `wasm/typst/fonts/` default-font directory. `preset: 'lite' | 'office' | 'engineering' | 'all'` imports the matching `@file-viewer/preset-*` package; when `formats` are also present, the plugin adds extra renderers outside the preset.

## Documentation

- On-demand renderer architecture: <https://doc.file-viewer.app/guide/on-demand-renderers>
- Supported formats: <https://doc.file-viewer.app/guide/formats>
