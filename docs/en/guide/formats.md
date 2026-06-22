# Supported Formats

<div class="doc-kicker">Format Truth</div>

<p class="doc-lead">
  The current core declares 24 preview pipelines and 198 file extensions.
  Renderers are loaded on demand, so opening a lightweight text file does not force the browser to load every heavy document engine.
</p>

## Main Preview Pipelines

| Category | Examples |
| --- | --- |
| Word | `docx`, `docm`, `dotx`, `dotm`, legacy `doc`, `dot`, plus RTF and ODT paths |
| Spreadsheets | `xlsx`, `xlsm`, `xlsb`, `xls`, `csv`, `ods`, `fods`, `numbers` |
| Presentations | `pptx`, `pptm`, `potx`, `potm`, `ppsx`, `ppsm`, `odp` |
| Layout documents | `pdf`, `ofd`, `typ`, `typst` |
| Archives | `zip`, `7z`, `rar`, `tar`, `gz`, `tgz`, `cab`, `iso`, `apk`, `cbz`, `cbr`, and more |
| Email | `eml`, `msg`, `mbox` |
| Diagrams and mind maps | `xmind`, `drawio`, `dio`, `excalidraw` |
| CAD and engineering | `dwg`, `dxf`, `dwf`, `dwfx`, `xps`, plus EDA files such as `gds`, `oas`, `oasis`, `olb`, `dra` |
| 3D and geospatial | `gltf`, `glb`, `obj`, `stl`, `ply`, `step`, `geojson`, `kml`, `gpx`, `shp` |
| Text, code, and data | Markdown, source code, logs, JSON, YAML, TOML, SQL, IPYNB, SQLite, WASM, Parquet, Avro |
| Media and assets | Images, SVG, HEIC, audio, video, HLS, fonts, PSD-style design assets |

## Capability Model

Each renderer reports what it can safely do. The common toolbar then shows download, print, HTML export, zoom, search, and navigation only when the active file type supports those operations.

This avoids pretending that every format supports the same operations. Word and PDF can use full-page print adapters, images can zoom naturally, archives can lazy-extract nested entries, and virtual spreadsheet tables avoid fragile outer CSS scaling.

## Best Evaluation Path

1. Open the [live demo](https://demo.file-viewer.app).
2. Try the sample closest to your production files.
3. Test your own file through upload or URL.
4. Use the [comparison demo](https://demo.file-viewer.app/compare.html) for contract, report, and generated-output review.
5. If your deployment is offline or CSP-restricted, run `npx file-viewer-copy-assets ./public/file-viewer` and point renderer assets to your own static path.
