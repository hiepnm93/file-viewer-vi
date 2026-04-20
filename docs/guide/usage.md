# 组件用法（url / file）

`file-viewer` 组件支持两种输入：

- `url?: string`：通过 URL 下载并预览（内部使用 `axios` 拉取 `blob`）
- `file?: File | Blob | ArrayBuffer`：直接传入文件对象或二进制

## 通过 URL 预览

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

注意：URL 预览要求目标地址允许浏览器跨域访问（CORS）。

## 通过文件上传预览

```vue
<script setup lang="ts">
import { ref } from 'vue'

const file = ref<File | Blob | ArrayBuffer | undefined>()

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

## 同时传入 `file` 与 `url`

当两者同时存在时，组件会优先渲染 `file`；如果 `file` 为空，则根据 `url` 拉取预览。

## 容器尺寸

预览器默认填满父容器，请务必给父容器明确高度（例如 `100vh`）。
