# React Integration

<div class="doc-kicker">Native React Component</div>

<p class="doc-lead">
  <code>@file-viewer/react</code> exposes a React component and handle APIs while sharing the same core options and renderer packages as other ecosystems.
</p>

## Install

```bash
npm install @file-viewer/react
```

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

