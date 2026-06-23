# @file-viewer/eda-layout

Framework-neutral EDA layout inspection engine for Flyfish File Viewer. It exposes pure TypeScript APIs for standard GDSII record parsing, GDSII WebGL draw-batch generation, and OASIS upgrade boundaries without any UI dependency.

```ts
import {
  parseGdsLayout,
  createEdaLayoutWebglBatch,
  inspectOasisLayout,
} from '@file-viewer/eda-layout'

const layout = parseGdsLayout(new Uint8Array(buffer))
const batch = layout ? createEdaLayoutWebglBatch(layout) : undefined
const oasis = inspectOasisLayout(new Uint8Array(buffer))
```

## Scope

- `parseGdsLayout()` reads standard GDSII stream records and returns structures, boundaries, paths, text labels, references, bounds, and warnings.
- `createEdaLayoutWebglBatch()` normalizes GDSII boundaries, paths, labels, and references into triangle / line / point typed arrays for UI renderers or custom WebGL layers.
- `inspectOasisLayout()` detects OASIS files and keeps full repetition expansion / geometry rendering behind a dedicated WASM/WebGL engine boundary.
- No Vue, React, Web Component, or DOM dependency.
- `@file-viewer/renderer-eda` turns this engine output into the user-facing preview UI.

## Roadmap

GDSII now has browser WebGL batch output. `@file-viewer/renderer-eda` automatically uses a WebGL canvas for larger element sets and keeps SVG as the fallback for small layouts or browsers without WebGL. Industrial OASIS preview still needs a low-level record parser, repetition expansion, hierarchical cell navigation, incremental parsing, and tiled rendering. This package is the stable place to integrate a future KLayout/gdstk/OpenAccess-style WASM engine or a dedicated WebGL tile renderer.
