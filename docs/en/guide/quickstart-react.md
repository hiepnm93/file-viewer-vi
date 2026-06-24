# React Integration

<div class="doc-kicker">Native React Component</div>

<p class="doc-lead">
  <code>@file-viewer/react</code> exposes a React component and handle APIs while sharing the same core options and renderer packages as other ecosystems.
</p>

## Install

```bash
npm install @file-viewer/react @file-viewer/core @file-viewer/vite-plugin @file-viewer/preset-office
```

Installing only `@file-viewer/react` gives you the lightest React component and core foundation. PDF, Office, CAD, Typst, archive, and other heavy format capabilities come from presets or renderer packages. In Vite projects, add the plugin once; it auto-discovers installed `@file-viewer/preset-*` packages:

```ts
import { defineConfig } from 'vite'
import { fileViewerRenderers } from '@file-viewer/vite-plugin'

export default defineConfig({
  plugins: [
    fileViewerRenderers({
      copyAssets: true
    })
  ]
})
```

Switch `@file-viewer/preset-office` to `@file-viewer/preset-all` when heavy users need the complete capability set immediately. The Vite config stays the same:

```bash
npm install @file-viewer/react @file-viewer/core @file-viewer/vite-plugin @file-viewer/preset-all
```

Use `formats`, `renderers`, `scan:true`, `inject:false`, or `chunkStrategy:'renderer'` only when the product needs explicit control. The recommended default remains `fileViewerRenderers({ copyAssets:true })`, with installed presets auto-activated by the plugin.

## Component Usage

```tsx
import { useRef } from 'react'
import FileViewer, { type FileViewerHandle } from '@file-viewer/react'

export function Preview() {
  const viewerRef = useRef<FileViewerHandle>(null)

  return (
    <div style={{ height: '100vh' }}>
      <FileViewer
        ref={viewerRef}
        url="/files/report.pdf"
        options={{
          theme: 'light',
          toolbar: { position: 'bottom-right' },
          search: { enabled: true },
          archive: { cache: true }
        }}
        onViewerEvent={(event) => console.log(event.type)}
      />
    </div>
  )
}
```

## Legacy React

React 16.8 and 17 projects should use:

```bash
npm install @file-viewer/react-legacy
```

The event and options model stays aligned with `@file-viewer/react`.

## Vite And Assets

For production bundles, use `@file-viewer/vite-plugin` or run `npx file-viewer-copy-assets ./public/file-viewer` so worker/WASM assets stay self-hosted.
