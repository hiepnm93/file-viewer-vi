# @file-viewer/renderer-geo

Flyfish File Viewer 的独立地理数据 renderer 包。它负责 GeoJSON、KML、GPX 和 Shapefile 的浏览器端预览，并让 `@tmcw/togeojson`、`shpjs` 只在命中地理数据格式时加载。

## 使用

```ts
import { geoRenderer } from '@file-viewer/renderer-geo'

const options = {
  builtinRenderers: 'none',
  renderers: [geoRenderer],
}
```

也可以通过全量 preset 自动装配：

```ts
import { allRenderers } from '@file-viewer/preset-all'

const options = {
  builtinRenderers: 'none',
  renderers: allRenderers,
}
```

## 能力

- GeoJSON 直接读取 `FeatureCollection`、`Feature` 或单个 geometry。
- KML / GPX 只在命中格式时按需加载 `@tmcw/togeojson`，转换为统一 GeoJSON 管线。
- SHP / Shapefile 只在命中格式时按需加载 `shpjs`，支持常见 ZIP 或二进制 Shapefile 数据转 GeoJSON。
- 渲染层不依赖在线地图瓦片，默认输出离线 SVG 矢量预览，适合内网部署和附件快速审阅。
- 卸载时清理 DOM 资源，和 core 的生命周期、导出 HTML、缩放能力保持一致。

## 迁移说明

当前 `@file-viewer/core` 仍保留内置 geo renderer 以兼容历史全量包。后续会把 core 的地理数据入口切换到本包，并从 core 直接依赖中移除 `@tmcw/togeojson` 和 `shpjs`。
