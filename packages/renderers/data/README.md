# @file-viewer/renderer-data

Flyfish File Viewer 的独立数据资产 renderer 包。它承接 PSD、SQLite、Parquet、Avro、WASM、字体、AI/EPS、WebArchive 等非文档型数据资产预览，避免普通文档预览场景安装数据解析链路。

## 用法

```ts
import FileViewer from '@file-viewer/vue3'
import { dataRenderer } from '@file-viewer/renderer-data'

const options = {
  rendererMode: 'replace',
  renderers: dataRenderer,
}
```

也可以和其他 renderer 一起组合：

```ts
import { dataRenderer } from '@file-viewer/renderer-data'
import { textRenderer } from '@file-viewer/renderer-text'

const options = {
  rendererMode: 'replace',
  renderers: [dataRenderer, textRenderer],
}
```

## 离线资产

SQLite 预览依赖 `sql.js` WASM。默认路径仍由 `@file-viewer/core/assets` 统一解析为 `wasm/data/sql-wasm.wasm`，也可以通过 `options.data.sqlWasmUrl` 指定自托管地址。

## 能力边界

- PSD 使用 `ag-psd` 读取画布和图层摘要。
- SQLite 使用 `sql.js` 读取表结构和首个表的示例数据。
- Parquet 使用 `hyparquet` 读取列式元数据和示例行。
- Avro 使用 `avsc` 读取对象容器 schema 与示例数据。
- WASM 使用浏览器 `WebAssembly.Module` 安全读取 import/export 摘要。
- AI/EPS/WebArchive 等格式以摘要和可读文本片段安全展示，不执行脚本。
