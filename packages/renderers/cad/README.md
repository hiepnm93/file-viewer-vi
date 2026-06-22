# @file-viewer/renderer-cad

Flyfish File Viewer 的独立 CAD renderer 包。它基于 `@flyfish-dev/cad-viewer` 提供 DWG、DXF、DWF、DWFx 和 XPS 的浏览器端预览，并通过 File Viewer 统一的 asset manifest 解析 wasm / worker 路径，适合企业内网和离线部署。

## 用法

```ts
import FileViewer from '@file-viewer/vue3'
import { cadRenderer } from '@file-viewer/renderer-cad'

const options = {
  rendererMode: 'replace',
  renderers: cadRenderer,
}
```

也可以和其他 renderer 一起组合：

```ts
import { cadRenderer } from '@file-viewer/renderer-cad'
import { pdfRenderer } from '@file-viewer/renderer-pdf'

const options = {
  rendererMode: 'replace',
  renderers: [pdfRenderer, cadRenderer],
}
```

## 能力边界

- 支持 `.dwg`、`.dxf`、`.dwf`、`.dwfx`、`.xps`。
- DWG 使用 Worker + LibreDWG WASM 按需解析，避免阻塞主线程。
- DXF 使用 JavaScript parser 并归一化为统一 CAD document。
- DWF / DWFx / XPS 使用 native renderer，并通过 `dwfv-render.wasm` 提供高性能 raster / WebGL fallback。
- 支持图层显示切换、结构统计、适配视图、缩放、全局 toolbar zoom provider 和 resize observer。

## 离线资产

默认会从 viewer assets 下读取：

- `wasm/cad/`
- `wasm/cad/dwg-worker.js`
- `wasm/cad/dwfv-render.wasm`

私有化部署时可以通过 `options.cad.wasmPath`、`options.cad.workerUrl`、`options.cad.dwfWasmUrl` 覆盖。

## 迁移说明

当前 core 仍保留内置 CAD renderer 以兼容历史全量包。后续会把 core 的 CAD 入口切换到本包，并从 core 直接依赖中移除 `@flyfish-dev/cad-viewer`。
