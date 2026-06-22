# @file-viewer/preset-lite

Flyfish File Viewer 的轻量 renderer preset。它适合只需要 Markdown、代码、文本、图片、音频和视频预览的业务页面，避免默认安装 Office、PDF、CAD、Typst、3D、压缩包等重链路。

## 何时使用

- 你需要一个开箱即用但非常轻的附件预览能力。
- 业务只处理 README、日志、配置、截图、音视频等常见轻量文件。
- 你希望后续再按需叠加 `@file-viewer/renderer-pdf`、`@file-viewer/renderer-word` 或其它专业 renderer。

## 用法

```ts
import FileViewer from '@file-viewer/vue3'
import { liteRenderers } from '@file-viewer/preset-lite'

const options = {
  builtinRenderers: 'none',
  rendererMode: 'replace',
  renderers: liteRenderers,
}
```

也可以配合 `@file-viewer/vite-plugin` 使用：

```ts
fileViewerRenderers({
  preset: 'lite',
  copyAssets: true,
})
```

## 包含的 renderer

- `@file-viewer/renderer-text`
- `@file-viewer/renderer-image`
- `@file-viewer/renderer-media`

## 文档

- 按需渲染架构: <https://doc.file-viewer.app/guide/on-demand-renderers>
- 支持格式: <https://doc.file-viewer.app/guide/formats>
