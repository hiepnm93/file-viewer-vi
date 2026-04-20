# Vue3 集成

本项目作为当前仓库的 Vue3 构建版本，会跟随 Vue2 版本持续更新，敬请期待，欢迎提交 issue 和交流技术。

欢迎各位友友们提交工单和 P/R，感谢大家！

本页面向 **Vue3 + Vite** 项目，介绍如何安装并使用 `file-viewer` 组件。

如果你是第一次接触这个组件，建议你先按本页把 Demo 跑起来；等确认效果没问题，再回过头把“注意事项”和“推荐方案”补齐到你的工程规范里。

::: tip Tips
本集成方式将会全量引入本项目的所有代码和依赖，所以可能会在你的项目中产生依赖版本冲突，请注意甄别。如果发生很多的依赖冲突，建议立即更换 Iframe 集成方式，更轻量级，且日后能够无缝升级。
:::

## 安装

选择你熟悉的包管理器即可，这里以 `pnpm` 为例：

```bash
pnpm add @flyfish-group/file-viewer3
```

如果你习惯用 `npm`，也可以：

```bash
npm install --save @flyfish-group/file-viewer3
```

<details>
<summary>如果你需要用源码/私库方式接入（可选）</summary>

如果你使用了 flyfish 的私库，请使用上面的安装命令安装依赖即可。

常规情况下，如果你是把仓库 clone 到本地后做联调，也可以使用 `npm link` / `pnpm link` 的方式进行接入。

示例（思路）：先在预览器工程里执行 link，再在你的业务工程里 link 过去；之后在业务工程里按本页的“注册插件”方式引入即可。

</details>

## 注册插件

把它当作一个 Vue 插件注册一次即可（通常放在 `main.ts`/`main.js`）。

```ts
import { createApp } from 'vue'
import App from './App.vue'
import FileViewer from '@flyfish-group/file-viewer3'

createApp(App).use(FileViewer).mount('#app')
```

::: tip 如果你更喜欢局部注册
你也可以只在某个页面里局部引入并注册组件。为了保持示例一致性，本项目文档默认使用全局注册方式。
:::

## 使用组件

`file-viewer` 支持两种输入方式：
- `url`：传一个可访问的文件地址（组件内部会去下载并解析）
- `file`：直接传入 `File`/`Blob`/`ArrayBuffer`（适合上传后本地预览、或业务侧已拿到二进制）

### 通过 URL 预览

这是最常见的用法：你只要给出一个 URL，组件就会尝试拉取并渲染。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const url = ref('https://example.com/demo.pdf')
</script>

<template>
  <div style="height: 100vh">
    <file-viewer :url="url" />
  </div>
</template>
```

### 通过上传文件预览

如果你希望“先让用户选择文件，再直接预览”，可以走 `file` 参数：

```vue
<script setup lang="ts">
import { ref } from 'vue'

const file = ref<File | undefined>()

function onChange(e: Event) {
  const input = e.target as HTMLInputElement
  const f = input.files?.item(0)
  if (f) file.value = f
}
</script>

<template>
  <div style="height: 100vh">
    <input type="file" @change="onChange" />
    <div style="height: calc(100vh - 40px)">
      <file-viewer :file="file" />
    </div>
  </div>
</template>
```

## 注意事项

- URL 预览需要资源服务端支持 CORS；否则浏览器无法读取文件二进制
- 预览器会填满父容器，请给父容器明确高度（例如 `100vh`）

你也可以像原项目说明里那样理解它：你需要自己定义好预览器的父元素，预览器默认会占满父元素。

::: tip 常见小坑
- 如果你发现页面空白或控制台提示跨域，多半是目标文件服务没有正确返回 `Access-Control-Allow-Origin`。
- 如果你把预览器放进了一个“高度不确定”的容器里，最终高度可能会变成 `0`，看起来像没渲染。
:::

另外，组件也支持直接传入文件或者二进制进行展示；如果你的业务侧已经拿到了 `File/Blob/ArrayBuffer`，优先走 `file` 参数会更顺滑。

## 推荐：Iframe 嵌入

当你不希望在业务工程内引入解析依赖、或需要统一升级预览器时，使用 Iframe：

这条路线更像“平台化接入”：业务系统负责传参，预览能力由独立应用承载，更适合多系统共用的场景。

- [Iframe 嵌入（推荐）](/guide/iframe)

---

## 更贴近真实项目的接入建议

下面这些不是“必须步骤”，但在真实项目里基本都会遇到；提前看一眼，后面踩坑会少很多。

### 1）给预览容器一个“稳定的高度”

你已经看到示例里用了 `100vh`。如果你是在后台系统里把预览器放进 Tab、Drawer、Dialog 之类的容器，建议你让外层容器用 Flex 布局撑开高度，例如：

```vue
<template>
  <div class="page">
    <header class="toolbar">...你的工具栏...</header>
    <main class="content">
      <file-viewer :url="url" />
    </main>
  </div>
</template>

<style scoped>
.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.content {
  flex: 1;
  min-height: 0;
}
</style>
```

### 2）URL 预览的跨域（CORS）怎么排查

如果你用的是 `url` 参数，本质上是在浏览器里“下载文件再解析”。因此：

- 文件服务需要允许跨域访问（至少要有 `Access-Control-Allow-Origin`）
- 如果你带了鉴权 Header（例如 token），还需要允许 `Access-Control-Allow-Headers`

排查方式也很朴素：打开浏览器 DevTools 的 Network，找到文件请求，看 Response Headers 里是否有对应的 CORS 头。

### 3）`url` 还是 `file`？一个简单的经验

- 你有现成的公网/内网文件地址，并且服务端 CORS 没问题：用 `url`，接入最快
- 你需要鉴权下载、或者需要对文件做脱敏/水印、或服务端 CORS 不方便改：用 `file`（业务侧拿到二进制后再交给预览器）

### 4）遇到问题怎么更快定位

当你遇到“空白 / 只显示加载中 / 某种格式打不开”时，建议你先按顺序确认：

1. 容器高度是否为 0（最常见）
2. URL 请求是否成功（404/403/跨域）
3. 文件本身是否损坏（换一个已知正常的文件测试一下）

如果方便，带上：文件类型、浏览器版本、控制台报错截图，再去提 issue 会更快收到回复。
