# @file-viewer/core

Framework-neutral TypeScript foundation for Flyfish File Viewer.

This package is the migration base for the next architecture: one pure TypeScript core, multiple thin wrappers for Vue, React, pure JavaScript, jQuery and Svelte. It currently owns the shared format matrix, source detection, renderer registry, capability calculation, heavy renderer asset manifests and the minimal runtime contract that wrappers will call into.

The existing Vue 3 package remains the production renderer while core extraction continues. Do not publish public source repositories for this package; only compiled artifacts are intended for public distribution.

```ts
import {
  listFileViewerRendererAssetManifests,
  resolveFileViewerRendererAssets
} from '@file-viewer/core'

const manifests = listFileViewerRendererAssetManifests()
const cadAssets = resolveFileViewerRendererAssets('cad', {
  baseUrl: '/file-viewer/',
  options: {
    cad: {
      wasmPath: '/file-viewer/wasm/cad/'
    }
  }
})
```

The manifest API lets wrappers and deployment scripts discover archive, CAD and Typst worker/WASM resources from the same core contract instead of hard-coding per-framework paths.
