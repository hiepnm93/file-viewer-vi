# @file-viewer/vue3

标准 Vue3 wrapper 包。当前作为 `@flyfish-group/file-viewer3` 的标准命名入口，复用同一套 Vue3 组件、`@file-viewer/core` 能力、渲染链路、参数和生命周期体验。

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

历史包名 `@flyfish-group/file-viewer3` 和 `file-viewer3` 会继续同步维护；新项目建议优先使用 `@file-viewer/vue3`。

## 能力范围

`@file-viewer/vue3` 是当前完整基线 viewer 入口，覆盖 PDF、Word、Excel、PPT、OFD、CAD/DWG/DXF/DWF、EPUB/UMD、压缩包、邮件、Markdown、代码高亮、图片、音频、视频、3D 模型、地理数据和结构化数据资产等预览链路。完整格式矩阵和参数说明见官方文档: https://doc.flyfish.dev/guide/formats

English README: [README.en.md](./README.en.md)。
