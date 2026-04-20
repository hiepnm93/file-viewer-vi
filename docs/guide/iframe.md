# Iframe 嵌入（推荐）

Iframe 嵌入适合以下场景：

- 你的业务系统不希望引入文档预览的重依赖
- 多个系统共用同一套预览器，便于统一升级
- 需要跨域展示，但希望由宿主站点控制文件下载与鉴权

## 原理

预览器页面支持通过 `postMessage` 接收一个 `Blob`，并在 URL 中携带 `name` 与 `from` 参数完成安全校验：

- `from`：允许发送消息的宿主 origin
- `name`：文件名（用于推断扩展名）

## 示例（本仓库已提供）

示例文件：`public/example/embedded.html`

### 1. 设置预览器地址

把 `context.origin` 改成你的预览器部署地址：

- 线上：例如 `https://viewer.flyfish.dev`
- 本地：例如 `http://localhost:5173`

### 2. 构造 iframe URL

iframe 访问：

```
${origin}?name=${encodeURIComponent(filename)}&from=${encodeURIComponent(location.origin)}
```

### 3. 推送文件二进制

宿主页面下载到 `Blob` 后，向 iframe 发送：

```js
frame.contentWindow.postMessage(blob, origin)
```

## 注意事项

- `from` 会与 `postMessage` 的 `event.origin` 做严格匹配，不匹配将被丢弃
- 若你的文件需要鉴权，建议由宿主系统自行下载（携带 cookie/token），然后推送二进制给 iframe

