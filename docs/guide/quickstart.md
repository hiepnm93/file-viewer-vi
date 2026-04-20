# 快速开始

欢迎来到 Flyfish Viewer（`@flyfish-group/file-viewer3`）的快速开始。
如果你只想“尽快跑起来”，照着本页复制粘贴就能完成集成；如果你想要更强的隔离与可运维性，建议直接走 Iframe 方案。

本项目提供两条使用路线：

- **Vue3 组件集成**：作为组件库安装并在你的 Vue3 项目里使用
- **Iframe 嵌入（推荐）**：把预览器当作独立应用，通过 `postMessage` 推送文件二进制或 URL

::: tip 怎么选更省心？
- 你的预览需求只在一个 Vue3 项目里用：先用 **Vue3 组件集成**，最直观。
- 你有多个系统、希望统一升级预览器、或不想把解析依赖带进业务包：直接选 **Iframe 嵌入**。
:::

## 运行环境

- Node.js：建议 `>= 18`
- 包管理器：推荐 `pnpm`

::: tip 也可以用 npm/yarn
文档里以 `pnpm` 为例是因为它安装更快、更稳定；如果你的团队统一使用 `npm` 或 `yarn`，把安装命令换掉即可，不影响使用方式。
:::

## Vue3：安装与使用

下面这一段是“最快路径”：安装 → 注册一次 → 页面里直接用。

1. 安装依赖

```bash
pnpm add @flyfish-group/file-viewer3
```

2. 在入口注册组件

这一步做完后，你就可以在任意页面直接写 `<file-viewer />` 了。

```ts
import { createApp } from 'vue'
import App from './App.vue'
import FileViewer from '@flyfish-group/file-viewer3'

createApp(App).use(FileViewer).mount('#app')
```

3. 在页面中使用

预览器会尽量填满父容器，所以这里用 `100vh` 给了一个“满屏高度”的示例；你也可以按布局需要改成固定高度或自适应容器高度。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const url = ref('https://example.com/word.docx')
</script>

<template>
  <div style="height: 100vh">
    <file-viewer :url="url" />
  </div>
</template>
```

更多示例见：

- [组件用法（url / file）](/guide/usage)
- [Vue3 集成](/guide/quickstart-vue3)

## Iframe：快速嵌入

如果你不希望在业务工程里引入大量依赖、或需要多系统统一升级预览器，优先使用 Iframe 嵌入。

::: tip 你会得到什么
- 业务工程更轻：预览能力独立部署，业务只负责“把文件/URL 传进去”。
- 升级更可控：预览器更新一次，多系统一起生效。
:::

- [Iframe 嵌入（推荐）](/guide/iframe)
