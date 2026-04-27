# Vue2 历史版本

当前仓库维护主线是 `v3` 分支，对应 Vue 3 + Vite 版本。

如果你的业务系统仍然在 Vue2 上，建议优先使用 iframe 集成方式，让预览器作为独立页面接入，这样业务侧几乎不用承担解析依赖带来的升级压力。

## 为什么推荐这样做

- Vue2 项目可以先稳定接入，不必等待整体迁移
- 预览器可以独立部署和升级，多系统复用时更省心
- 鉴权下载逻辑可以继续留在宿主系统中完成

## Vue2 相关历史资料

- Vue2 说明文章: <https://blog.csdn.net/wybaby168/article/details/129264431>
- 项目背景文章: <https://blog.csdn.net/wybaby168/article/details/122842866>

## 推荐迁移路径

1. 当前在 Vue2 项目中，通过 [Iframe 嵌入](/guide/iframe) 先完成预览接入
2. 业务未来升级到 Vue3 后，再根据需要切换到 [Vue3 集成](/guide/quickstart-vue3)

<div class="doc-note">
  这样做的好处很朴素: 你不用被某次框架升级卡住，预览能力也能继续平稳迭代。
</div>
