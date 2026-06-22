# @file-viewer/preset-all

The full renderer preset for Flyfish File Viewer. It packages the current complete format matrix as an explicit preset and acts as the compatibility bridge for the 2.x on-demand renderer architecture.

## When To Use

- You want the same full-format coverage as the official demo.
- You are migrating from the historical all-in-one dependency model to on-demand renderer assembly.
- You want to start with one preset, then later replace it with narrower combinations such as `preset-lite`, `preset-office`, `renderer-pdf`, or `renderer-cad`.

## Usage

```ts
import FileViewer from '@file-viewer/vue3'
import { allRenderers } from '@file-viewer/preset-all'

const options = {
  renderers: allRenderers,
}
```

Use replace mode when the viewer should only install renderers from this preset:

```ts
const options = {
  rendererMode: 'replace',
  renderers: allRenderers,
}
```

This version still reuses the complete renderer implementation from `@file-viewer/core`. As PDF, Office, CAD, Typst, Archive, and other heavy paths move into standalone renderer packages, this preset will become the aggregation layer over those packages.

## Documentation

- On-demand renderer architecture: <https://doc.file-viewer.app/guide/on-demand-renderers>
- Supported formats: <https://doc.file-viewer.app/guide/formats>
