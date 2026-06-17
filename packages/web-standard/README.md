# @file-viewer/web

标准纯 Web wrapper 包。当前作为 `@flyfish-group/file-viewer-web` 的标准命名入口，复用同一套 `@file-viewer/core` iframe 协议、viewer 静态产物复制工具和完整预览体验。

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

默认加载 `/file-viewer/index.html`。安装脚本或手动命令会复制完整 viewer 静态产物:

```bash
npx file-viewer-copy-assets ./public/file-viewer
```

历史包名 `@flyfish-group/file-viewer-web` 会继续同步维护；新项目建议优先使用 `@file-viewer/web`。English README: [README.en.md](./README.en.md)。

## 能力范围

`@file-viewer/web` 与 Vue3 基线 viewer 共享同一套 `@file-viewer/core` 能力，覆盖 PDF、Word、Excel、PPT、OFD、CAD/DWG/DXF/DWF、EPUB/UMD、压缩包、邮件、Markdown、代码高亮、图片、音频、视频、3D 模型、地理数据和结构化数据资产等预览链路。完整格式矩阵和参数说明见官方文档: https://doc.flyfish.dev/guide/formats
