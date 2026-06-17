# @file-viewer/react

The standard React wrapper for Flyfish File Viewer. It is the new package name for the existing `@flyfish-group/file-viewer-react` integration and reuses the same `@file-viewer/core` iframe protocol, React component API, and private viewer assets.

```bash
npm install @file-viewer/react
```

```tsx
import FileViewer from '@file-viewer/react'

export function Preview() {
  return (
    <div style={{ height: '100vh' }}>
      <FileViewer
        url="/example/demo.docx"
        options={{
          theme: 'light',
          toolbar: { position: 'bottom-right' }
        }}
      />
    </div>
  )
}
```

The historical package `@flyfish-group/file-viewer-react` remains supported for compatibility. New integrations should prefer `@file-viewer/react`.

## Capabilities

`@file-viewer/react` shares the same `@file-viewer/core` capabilities and private Vue3 baseline viewer as the pure web wrapper, including PDF, Word, Excel, PowerPoint, OFD, CAD/DWG/DXF/DWF, EPUB/UMD, archives, email, Markdown, highlighted code, images, audio, video, 3D models, geospatial files, and structured data assets. See the complete format matrix and option reference at https://doc.flyfish.dev/guide/formats
