# @file-viewer/vue3

The standard Vue 3 wrapper for Flyfish File Viewer. It is the new package name for the existing `@flyfish-group/file-viewer3` package and reuses the same Vue 3 component, `@file-viewer/core` capabilities, rendering routes, options, and lifecycle behavior.

```bash
npm install @file-viewer/vue3
```

```ts
import { createApp } from 'vue'
import FileViewer from '@file-viewer/vue3'
import '@file-viewer/vue3/dist/file-viewer3.css'

import App from './App.vue'

createApp(App).use(FileViewer).mount('#app')
```

```vue
<template>
  <file-viewer
    url="/example/demo.pdf"
    :options="{
      theme: 'light',
      toolbar: { position: 'bottom-right' }
    }"
  />
</template>
```

The historical packages `@flyfish-group/file-viewer3` and `file-viewer3` remain supported for compatibility. New integrations should prefer `@file-viewer/vue3`.

## Capabilities

`@file-viewer/vue3` is the full baseline viewer entry. It supports PDF, Word, Excel, PowerPoint, OFD, CAD/DWG/DXF/DWF, EPUB/UMD, archives, email, Markdown, highlighted code, images, audio, video, 3D models, geospatial files, and structured data assets. See the complete format matrix and option reference at https://doc.flyfish.dev/guide/formats
