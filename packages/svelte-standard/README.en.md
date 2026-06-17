# @file-viewer/svelte

The standard Svelte wrapper for Flyfish File Viewer. It provides both a Svelte component and a Svelte action. Both entry points reuse the `@file-viewer/web` iframe protocol, the shared `@file-viewer/core` runtime, and the same production viewer assets. Mounting only happens in the browser, so it is safe for SvelteKit SSR.

```bash
npm install @file-viewer/svelte @file-viewer/web
```

## Component Usage

```svelte
<script lang="ts">
  import FileViewer from '@file-viewer/svelte'

  let viewer: FileViewer
</script>

<section style="height: 100vh">
  <FileViewer
    bind:this={viewer}
    url="/example/demo.pdf"
    options={{
      theme: 'light',
      toolbar: { position: 'bottom-right' }
    }}
    on:viewerEvent={(event) => console.log(event.detail.payload)}
  />
</section>
```

The default viewer entry is `/file-viewer/index.html`. Copy the viewer assets into your public directory with the command provided by `@file-viewer/web`:

```bash
npx file-viewer-copy-assets ./public/file-viewer
```

## Action Usage

```svelte
<script lang="ts">
  import { fileViewer } from '@file-viewer/svelte/action'

  const preview = {
    url: '/example/report.docx',
    options: { theme: 'auto' }
  }
</script>

<div use:fileViewer={preview} style="height: 100vh"></div>
```

The component instance and the action controller both support the same underlying `update`, `reload`, `postFile`, and `destroy` behavior.

## Capabilities

`@file-viewer/svelte` shares the same `@file-viewer/core` capabilities and baseline viewer as the pure web and Vue 3 wrappers, including PDF, Word, Excel, PowerPoint, OFD, CAD/DWG/DXF/DWF, EPUB/UMD, archives, email, Markdown, highlighted code, images, audio, video, 3D models, geospatial files, and structured data assets.

See the official documentation for the full format matrix, options, lifecycle hooks, beforeOperation, theme, watermark, search, zoom, print, and export APIs: https://doc.flyfish.dev/

Chinese README: [README.md](./README.md).
