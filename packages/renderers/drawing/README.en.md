# @file-viewer/renderer-drawing

Standalone Draw.io and Excalidraw renderer for Flyfish File Viewer.

## Highlights

- Uses the bundled diagrams.net offline viewer for `drawio` / `dio` files.
- Uses Excalidraw's official `restore` and `exportToSvg` APIs, with a `roughjs` SVG fallback.
- Supports unified zoom, print, HTML export, and `options.drawing` self-hosted asset configuration.
- Ships as an independent renderer package for applications that only need drawing preview.
- `@file-viewer/core` no longer bundles the drawing renderer and no longer depends directly on `@excalidraw/excalidraw` or `roughjs`.

## Usage

```ts
import { createFileViewerCore, createFileViewerRendererRegistry } from '@file-viewer/core';
import { drawingRenderer } from '@file-viewer/renderer-drawing';

const registry = createFileViewerRendererRegistry({
  renderers: [drawingRenderer],
});

const viewer = createFileViewerCore({
  target: document.querySelector('#viewer')!,
  rendererRegistry: registry,
});
```

See the [official on-demand renderer guide](https://doc.file-viewer.app/guide/on-demand-renderers) for production setup.
