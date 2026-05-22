# 快速开始

<div class="doc-kicker">Get Running Fast</div>

<p class="doc-lead">
  如果你现在最想做的事情是“尽快看到效果”，这一页就是最快路径。
  先选接入路线，再复制一段最小示例，十几分钟内你就能把预览器跑起来。
</p>

## 先选接入路线

| 方案 | 适合谁 | 优点 | 你应该看哪页 |
| --- | --- | --- | --- |
| Vue3 组件集成 | 单个 Vue 3 项目内直接使用 | 主推基线，完整渲染能力直接进入 Vue 应用 | [Vue3 集成](/guide/quickstart-vue3) |
| Vue2 组件集成 | Vue2.7 项目内直接使用 | 保留旧业务栈，体验与 v3 一致 | [Vue2 集成](/guide/quickstart-vue2) |
| React 组件集成 | React 17 / 18 / 19 项目 | 安装即复制私有化 viewer，组件内用 iframe 加载 | [React 集成](/guide/quickstart-react) |
| 纯 JS 集成 | 非框架页面、微前端壳、任意 Web 系统 | 用 helper 创建 iframe，部署和升级边界清楚 | [纯 JS 集成](/guide/quickstart-web) |
| Iframe 嵌入 | 多系统复用、异构系统、需要隔离依赖 | 升级集中、宿主系统更轻、适合平台化 | [Iframe 嵌入](/guide/iframe) |

<div class="doc-callout">
  <strong>推荐经验:</strong> React、纯 JS 和后续其他框架都建议走私有化 iframe 适配层。Vue3 产物作为唯一预览基线，其他包只负责参数、iframe 和二进制推送协议。
</div>

## 运行环境

- Node.js `>= 18`
- 推荐使用 `pnpm`
- 浏览器需要支持现代前端能力，建议优先在最新版 Chrome 或 Edge 中联调

## Vue3 最短路径

### 1. 安装

```bash
pnpm add @flyfish-group/file-viewer3
```

### 2. 注册插件

```ts
import { createApp } from 'vue'
import App from './App.vue'
import FileViewer from '@flyfish-group/file-viewer3'

createApp(App).use(FileViewer).mount('#app')
```

### 3. 放进页面

```vue
<script setup lang="ts">
import { ref } from 'vue'

const url = ref('https://example.com/demo.docx')
</script>

<template>
  <div style="height: 100vh">
    <file-viewer :url="url" />
  </div>
</template>
```

## Vue2 最短路径

Vue2.7 项目使用 `@flyfish-group/file-viewer`，能力与 Vue3 包保持一致:

```bash
pnpm add @flyfish-group/file-viewer
```

```ts
import Vue from 'vue'
import App from './App.vue'
import FileViewer from '@flyfish-group/file-viewer'

Vue.use(FileViewer)

new Vue({
  render: h => h(App)
}).$mount('#app')
```

完整步骤见 [Vue2 集成](/guide/quickstart-vue2)。

## React 最短路径

React 17 / 18 / 19 项目安装:

```bash
pnpm add @flyfish-group/file-viewer-react
```

```tsx
import FileViewer from '@flyfish-group/file-viewer-react'

export function Preview() {
  return (
    <div style={{ height: '100vh' }}>
      <FileViewer url="/files/demo.docx" />
    </div>
  )
}
```

安装后依赖包会把 viewer 静态产物复制到 `public/file-viewer`，组件默认加载 `/file-viewer/index.html`。完整步骤见 [React 集成](/guide/quickstart-react)。

## 纯 JS 最短路径

不使用框架时安装:

```bash
pnpm add @flyfish-group/file-viewer-web
```

```html
<div id="viewer" style="height: 100vh"></div>

<script type="module">
  import { mountViewerFrame } from '@flyfish-group/file-viewer-web'

  mountViewerFrame(document.getElementById('viewer'), {
    url: '/files/demo.pdf'
  })
</script>
```

完整步骤见 [纯 JS 集成](/guide/quickstart-web)。

## Iframe 最短路径

如果你希望把预览器独立部署出来，最简单的 URL 方案可以直接这样挂载:

```html
<iframe
  src="/file-viewer/index.html?url=%2Ffiles%2Fdemo.pdf"
  style="width: 100%; height: 100%; border: 0"
></iframe>
```

如果文件需要鉴权、签名 URL 或由宿主系统完成下载，请直接阅读 [Iframe 嵌入](/guide/iframe)，使用二进制推送方案。

## 下一步建议

- 想了解 Demo 中每个示例文件的作用: 看 [Demo 说明](/guide/demo)
- 想明确 `file` 和 `url` 的参数行为: 看 [组件用法](/guide/usage)
- 准备做本地验证和打包: 看 [本地开发与打包](/guide/development)
- 想下载成品或开通源码: 看 [发布与成品分发](/guide/distribution)
