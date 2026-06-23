# Vue 3 Integration

<div class="doc-kicker">Native Vue Component</div>

<p class="doc-lead">
  <code>@file-viewer/vue3</code> provides a Vue-native component and plugin while keeping renderer engines lazy and framework-neutral underneath.
</p>

## Install

```bash
npm install @file-viewer/vue3
```

## Register Globally

```ts
import { createApp } from 'vue'
import App from './App.vue'
import FileViewer from '@file-viewer/vue3'

createApp(App).use(FileViewer).mount('#app')
```

```vue
<template>
  <div class="preview-shell">
    <file-viewer
      url="/files/report.docx"
      :options="viewerOptions"
      @viewer-event="onViewerEvent"
    />
  </div>
</template>

<script setup lang="ts">
const viewerOptions = {
  theme: 'light',
  toolbar: { position: 'bottom-right' },
  search: { enabled: true },
  archive: { cache: true }
}

function onViewerEvent(event) {
  console.log(event.type)
}
</script>

<style scoped>
.preview-shell {
  height: 100vh;
}
</style>
```

## Local Registration

```vue
<script setup lang="ts">
import { FileViewer } from '@file-viewer/vue3'
</script>
```

## Recommended Vite Setup

Use the Vite plugin to assemble renderer imports and copy worker/WASM assets:

```ts
import { defineConfig } from 'vite'
import { fileViewerRenderers } from '@file-viewer/vite-plugin'

export default defineConfig({
  plugins: [
    fileViewerRenderers({
      preset: 'office',
      scan: true,
      copyAssets: true,
      chunkStrategy: 'renderer'
    })
  ]
})
```

## Compatibility Names

Historical packages remain synchronized:

- `@flyfish-group/file-viewer3`
- `file-viewer3`

New Vue 3 projects should use `@file-viewer/vue3`.

