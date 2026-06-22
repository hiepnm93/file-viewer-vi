# @file-viewer/renderer-image

Standalone image renderer package for Flyfish File Viewer. It handles browser-side preview, lightbox viewing, and unified zoom for `png`, `jpg`, `webp`, `avif`, `gif`, `svg`, `tiff`, `ico`, `heic`, `heif`, `jxl`, and related image files.

## Usage

```ts
import { imageRenderer } from '@file-viewer/renderer-image'

const options = {
  builtinRenderers: 'none',
  renderers: [imageRenderer],
}
```

Or compose it through the full preset:

```ts
import { allRenderers } from '@file-viewer/preset-all'

const options = {
  builtinRenderers: 'none',
  renderers: allRenderers,
}
```

## Features

- Common image formats use native browser decoding without extra runtime work.
- HEIC / HEIF dynamically imports `heic2any` only when those formats are opened.
- Includes lightbox viewing, a unified zoom provider, theme-aware background, and unmount cleanup.

## Migration Note

The core package still keeps a bundled image renderer for backward compatibility. A later migration will switch the core image entry to this package and remove `heic2any` from core direct dependencies.
