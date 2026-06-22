# @file-viewer/renderer-image

Flyfish File Viewer 的独立图片 renderer 包。它负责 `png`、`jpg`、`webp`、`avif`、`gif`、`svg`、`tiff`、`ico`、`heic`、`heif`、`jxl` 等图片类文件的浏览器端预览、灯箱查看和统一缩放。

## 使用

```ts
import { imageRenderer } from '@file-viewer/renderer-image'

const options = {
  builtinRenderers: 'none',
  renderers: [imageRenderer],
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

- 普通图片使用浏览器原生解码，不引入额外运行时。
- HEIC / HEIF 只在命中格式时动态加载 `heic2any` 并转换为 PNG Data URL。
- 支持图片灯箱、统一缩放 provider、明暗主题背景和组件卸载清理。

## 迁移说明

当前 `@file-viewer/core` 仍保留内置 image renderer 以兼容历史全量包。后续会把 core 的图片入口切换到本包，并从 core 直接依赖中移除 `heic2any`。
