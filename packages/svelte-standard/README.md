# @file-viewer/svelte

标准 Svelte wrapper 包，提供 Svelte 组件和 action 两种接入方式。组件和 action 都复用 `@file-viewer/web` 与 `@file-viewer/core` 的 iframe 协议、静态 viewer 产物和完整预览能力，SSR 环境下只在浏览器端挂载。

```bash
npm install @file-viewer/svelte @file-viewer/web
```

## 组件用法

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

默认加载 `/file-viewer/index.html`。请通过 `@file-viewer/web` 提供的复制命令把 viewer 静态产物放入站点目录:

```bash
npx file-viewer-copy-assets ./public/file-viewer
```

## Action 用法

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

组件实例和 action 都支持 `update`、`reload`、`postFile` 和 `destroy` 等底层 controller 行为。

## 能力范围

`@file-viewer/svelte` 与纯 Web、Vue3 基线 viewer 共享同一套 `@file-viewer/core` 能力，覆盖 PDF、Word、Excel、PPT、OFD、CAD/DWG/DXF/DWF、EPUB/UMD、压缩包、邮件、Markdown、代码高亮、图片、音频、视频、3D 模型、地理数据和结构化数据资产等预览链路。

完整格式矩阵、参数、生命周期 hooks、beforeOperation、主题、水印、搜索、缩放、打印和导出能力请查看官方文档: https://doc.flyfish.dev/

English README: [README.en.md](./README.en.md)。
