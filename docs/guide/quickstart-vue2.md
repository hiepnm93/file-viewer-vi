# Vue2（历史版本）

注意，当前版本在 `v3` 分支。如果要使用 Vue2 版本，请访问：

- <https://blog.csdn.net/wybaby168/article/details/129264431>

如果你的业务工程目前还在 Vue2，也不用担心：你可以先用 Iframe 把预览能力接进来，等业务升级到 Vue3 后再把接入方式“无痛切换”为组件集成。

当前仓库为 **Vue3 + Vite** 版本的实现与维护主线。

如果你的业务工程仍是 Vue2：

- 建议优先采用 [Iframe 嵌入（推荐）](/guide/iframe)，将预览器作为独立应用统一升级
- 如需 Vue2 版本的源码/历史集成方式，请参考作者博客与历史仓库说明（该部分不再与本仓库同步更新）：
  - Vue2 相关说明：<https://blog.csdn.net/wybaby168/article/details/129264431>
  - 项目背景与原始文章：<https://blog.csdn.net/wybaby168/article/details/122842866>

::: tip 小建议
如果你在 Vue2 工程里遇到较多依赖冲突或升级困难，建议立即更换为 Iframe 集成方式：更轻量级，且日后能够无缝升级。
:::

## 为什么推荐 Iframe

- 不向业务工程引入解析依赖，降低依赖冲突风险
- 预览器可独立部署，统一更新
- 宿主系统可自行完成鉴权下载，再推送二进制给 iframe

## 继续阅读

- [Iframe 嵌入（推荐）](/guide/iframe)
- [Vue3 集成](/guide/quickstart-vue3)

---

## 在 Vue2 项目里怎么“先跑起来”

这里不再展开写 Vue2 的组件集成（因为该版本不再与本仓库同步维护），但你依然可以用更稳的方式把预览能力接入到 Vue2：用 Iframe。

::: tip 你可以把它当成一个约定
Vue2 负责业务与鉴权下载；预览器负责渲染。
业务把文件 URL 或二进制发给 Iframe，预览器接收到后展示。
:::

一个最小化的思路示例（更完整的消息协议与代码请看 Iframe 页面）：

```html
<iframe id="viewer" src="https://你的预览器地址" style="width: 100%; height: 100%; border: 0"></iframe>
<script>
  const frame = document.getElementById('viewer')
  frame.onload = () => {
    frame.contentWindow?.postMessage(
      {
        type: 'preview:url',
        url: 'https://example.com/demo.pdf'
      },
      '*'
    )
  }
</script>
```

## 一个更顺滑的升级路径

- 现在（Vue2）：先用 Iframe 把预览能力接入，业务侧把鉴权/下载做牢靠
- 未来（Vue3）：等业务升级到 Vue3 后，如果你希望更紧密的组件体验，再切换到 [Vue3 集成](/guide/quickstart-vue3)

这样做的好处是：你不会被某一次依赖升级“卡死”，预览能力的迭代也更容易统一推进。
