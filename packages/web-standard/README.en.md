# @file-viewer/web

The standard pure web wrapper for Flyfish File Viewer. It is the new package name for the existing `@flyfish-group/file-viewer-web` integration and reuses the same `@file-viewer/core` iframe protocol, private viewer assets, and runtime behavior.

```bash
npm install @file-viewer/web
```

```ts
import { mountViewerFrame } from '@file-viewer/web'

const controller = mountViewerFrame(document.getElementById('viewer')!, {
  url: '/example/demo.pdf',
  options: {
    theme: 'light',
    toolbar: { position: 'bottom-right' }
  }
})
```

The wrapper loads `/file-viewer/index.html` by default. Copy the complete private viewer assets with:

```bash
npx file-viewer-copy-assets ./public/file-viewer
```

The historical package `@flyfish-group/file-viewer-web` remains supported for compatibility. New integrations should prefer `@file-viewer/web`.

## Capabilities

`@file-viewer/web` shares the same `@file-viewer/core` capabilities and private Vue3 baseline viewer, including PDF, Word, Excel, PowerPoint, OFD, CAD/DWG/DXF/DWF, EPUB/UMD, archives, email, Markdown, highlighted code, images, audio, video, 3D models, geospatial files, and structured data assets. See the complete format matrix and option reference at https://doc.flyfish.dev/guide/formats
