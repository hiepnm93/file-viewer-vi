# @file-viewer/renderer-drawing

Flyfish File Viewer 的独立绘图渲染器，覆盖 `drawio`、`dio` 和 `excalidraw`。

## 特性

- `drawio` / `dio` 默认使用随 viewer assets 分发的 diagrams.net offline viewer。
- `excalidraw` 使用官方 `restore` 与 `exportToSvg`，失败时回退到 `roughjs` 只读 SVG。
- 支持统一缩放、打印、HTML 导出和 `options.drawing` 自托管资源配置。
- 独立安装、独立发布，适合只需要绘图预览的业务按需装配。
- `@file-viewer/core` 已不再内置 drawing renderer，也不再直接依赖 `@excalidraw/excalidraw` 或 `roughjs`。

## 使用

```ts
import { createFileViewerCore, createFileViewerRendererRegistry } from '@file-viewer/core';
import { drawingRenderer } from '@file-viewer/renderer-drawing';

const registry = createFileViewerRendererRegistry({
  renderers: [drawingRenderer],
});

const viewer = createFileViewerCore({
  target: document.querySelector('#viewer')!,
  rendererRegistry: registry,
});
```

完整按需加载方案见 [官方文档](https://doc.file-viewer.app/guide/on-demand-renderers)。
