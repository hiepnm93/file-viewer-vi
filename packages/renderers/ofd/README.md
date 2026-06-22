# @file-viewer/renderer-ofd

Flyfish File Viewer 的独立 OFD 渲染器。它基于 DLTech21/ofd.js 的纯前端解析链路，按需加载 OFD vendor、XML parser 和 ZIP 解析依赖，适合电子发票、公文和国产版式文件在线预览。

## 安装

```bash
pnpm add @file-viewer/core @file-viewer/renderer-ofd
```

## 用法

```ts
import FileViewer from '@file-viewer/vue3'
import { ofdRenderer } from '@file-viewer/renderer-ofd'

const options = {
  rendererMode: 'replace',
  renderers: ofdRenderer,
}
```

也可以通过 `@file-viewer/preset-all` 一次性启用官方 demo 的完整格式矩阵，或与其他 renderer 组合:

```ts
import { ofdRenderer } from '@file-viewer/renderer-ofd'
import { pdfRenderer } from '@file-viewer/renderer-pdf'

const options = {
  rendererMode: 'replace',
  renderers: [pdfRenderer, ofdRenderer],
}
```

## 能力

- 支持 `.ofd` 国产版式文件。
- 按需动态导入 OFD 解析/渲染代码，不污染首屏。
- vendor 文件随 npm 包发布，支持企业内网和纯离线部署。
- 支持统一缩放、打印、HTML 导出和生命周期上下文。

## 文档

- 按需渲染架构: <https://doc.file-viewer.app/guide/on-demand-renderers>
- 支持格式: <https://doc.file-viewer.app/guide/formats>
