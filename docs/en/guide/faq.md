# FAQ

## The viewer is blank

Confirm the host container has a stable height and the file has a recognizable extension or explicit `type`.

## A worker or WASM file does not load

Run:

```bash
npx file-viewer-copy-assets ./public/file-viewer
```

Then confirm your server returns the correct MIME type for `.wasm`, `.js`, fonts, and JSON manifests. Strict CSP deployments should serve all viewer assets from the same trusted origin.

## Can I deploy without public CDNs?

Yes. Runtime assets are designed to be self-hosted. Draw.io, Typst, CAD, Archive, PDF, DOCX, Spreadsheet, SQLite, and other heavy assets can be copied into your own static directory.

## Why does every format not expose every toolbar action?

Each renderer reports operation availability. Download is usually available, but print, HTML export, search, zoom, page navigation, and text anchors depend on the active renderer.

## Should I use an iframe?

No for standard package integrations. Use the native package for your stack. iframe-style demos can still be useful for embedding the full hosted demo, but the core product path is native and debuggable.

