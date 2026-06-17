# @file-viewer/react

标准 React wrapper 包。当前作为 `@flyfish-group/file-viewer-react` 的标准命名入口，复用同一套 `@file-viewer/core` iframe 协议、React 组件 API 和私有化 viewer 静态产物。

```bash
npm install @file-viewer/react
```

```tsx
import FileViewer from '@file-viewer/react'

export function Preview() {
  return (
    <div style={{ height: '100vh' }}>
      <FileViewer
        url="/example/demo.docx"
        options={{
          theme: 'light',
          toolbar: { position: 'bottom-right' }
        }}
      />
    </div>
  )
}
```

历史包名 `@flyfish-group/file-viewer-react` 会继续同步维护；新项目建议优先使用 `@file-viewer/react`。English README: [README.en.md](./README.en.md)。

## 能力范围

`@file-viewer/react` 与纯 Web、Vue3 基线 viewer 共享同一套 `@file-viewer/core` 能力，覆盖 PDF、Word、Excel、PPT、OFD、CAD/DWG/DXF/DWF、EPUB/UMD、压缩包、邮件、Markdown、代码高亮、图片、音频、视频、3D 模型、地理数据和结构化数据资产等预览链路。完整格式矩阵和参数说明见官方文档: https://doc.flyfish.dev/guide/formats
