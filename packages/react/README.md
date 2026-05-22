# @flyfish-group/file-viewer-react

React 文件预览组件。只提供私有化部署路线: 依赖的 `@flyfish-group/file-viewer-web` 会随包携带 Vue 基线 viewer 产物，并在安装后复制到宿主项目 `public/file-viewer`。React 组件默认加载 `/file-viewer/index.html`，不依赖任何外部服务。

```bash
pnpm add @flyfish-group/file-viewer-react
```

```tsx
import FileViewer from '@flyfish-group/file-viewer-react'

export function Preview() {
  return (
    <div style={{ height: '100vh' }}>
      <FileViewer
        url="https://example.com/demo.docx"
      />
    </div>
  )
}
```

`file` 优先级高于 `url`。当传入 `Blob` 或 `ArrayBuffer` 时，请同时传 `name`，例如 `contract.pdf`，用于 Vue 基线预览器识别格式。

```tsx
<FileViewer file={blob} name="contract.pdf" />
```

如果你的静态目录不是 `public/file-viewer`，复制到自定义目录后再覆盖 `viewerUrl`:

```tsx
<FileViewer viewerUrl="/vendor/file-viewer/index.html" url={url} />
```
