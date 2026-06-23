# Vue 2 Integration

<div class="doc-kicker">Vue 2.7 And Vue 2.6</div>

<p class="doc-lead">
  Vue 2 projects can use native component packages without switching to an iframe-only integration.
</p>

## Vue 2.7

```bash
npm install @file-viewer/vue2.7
```

```ts
import Vue from 'vue'
import FileViewer from '@file-viewer/vue2.7'

Vue.use(FileViewer)
```

```vue
<template>
  <div class="preview-shell">
    <file-viewer
      url="/files/report.pdf"
      :options="viewerOptions"
      @viewer-event="onViewerEvent"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      viewerOptions: {
        theme: 'light',
        toolbar: { position: 'bottom-right' }
      }
    }
  },
  methods: {
    onViewerEvent(event) {
      console.log(event.type)
    }
  }
}
</script>
```

## Vue 2.6

```bash
npm install @file-viewer/vue2.6
```

Use the same component API as Vue 2.7. Keep your host container at a fixed or viewport-relative height.

## Historical Package

`@flyfish-group/file-viewer` remains the compatibility line for Vue 2.7. New projects should prefer `@file-viewer/vue2.7` or `@file-viewer/vue2.6`.

