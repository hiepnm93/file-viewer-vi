# @file-viewer/renderer-data

Standalone data asset renderer for Flyfish File Viewer. It covers PSD, SQLite, Parquet, Avro, WASM, fonts, AI/EPS, WebArchive, and other non-document data assets without forcing regular document preview users to install data parsing dependencies.

## Usage

```ts
import FileViewer from '@file-viewer/vue3'
import { dataRenderer } from '@file-viewer/renderer-data'

const options = {
  rendererMode: 'replace',
  renderers: dataRenderer,
}
```

You can compose it with other renderers:

```ts
import { dataRenderer } from '@file-viewer/renderer-data'
import { textRenderer } from '@file-viewer/renderer-text'

const options = {
  rendererMode: 'replace',
  renderers: [dataRenderer, textRenderer],
}
```

## Offline Assets

SQLite preview depends on the `sql.js` WASM file. The default URL is still resolved through `@file-viewer/core/assets` as `wasm/data/sql-wasm.wasm`, and applications can override it through `options.data.sqlWasmUrl`.

## Scope

- PSD uses `ag-psd` for canvas and layer summary previews.
- SQLite uses `sql.js` for table metadata and sample rows.
- Parquet uses `hyparquet` for column metadata and sample rows.
- Avro uses `avsc` for object container schema and sample data.
- WASM uses browser `WebAssembly.Module` to inspect imports and exports safely.
- AI/EPS/WebArchive fall back to safe summaries and readable text snippets without executing scripts.
