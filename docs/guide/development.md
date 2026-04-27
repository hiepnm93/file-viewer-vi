# 本地开发与打包

<div class="doc-kicker">Build With Confidence</div>

<p class="doc-lead">
  当你准备发布一个开源组件时，代码、文档、Demo 和打包产物最好能在本地一次性对齐。
  这一页把常用命令、建议验证顺序和发版前检查项整理在一起，方便团队复用。
</p>

## 安装依赖

```bash
pnpm install
```

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `pnpm dev` | 启动示例站点 |
| `pnpm build` | 构建示例站点 |
| `pnpm build-lib` | 构建组件库产物 |
| `pnpm docs:dev` | 启动 VitePress 文档站 |
| `pnpm docs:build` | 构建 VitePress 文档站 |
| `pnpm type-check` | 执行 TypeScript 类型检查 |
| `pnpm test` | 运行测试 |

## 推荐验证顺序

```bash
pnpm type-check
pnpm build
pnpm build-lib
pnpm docs:build
pnpm test
```

如果你要发布 npm 包，再执行:

```bash
npm pack
```

## 主要产物位置

- 应用构建产物: `dist/`
- 文档站构建产物: `docs/.vitepress/dist/`
- npm 包 tarball: 仓库根目录下的 `*.tgz`

## 发版前检查清单

- README 是否和当前代码能力一致
- 文档站中的支持格式、iframe 协议和 Demo 截图是否最新
- `file` / `url` 的行为说明是否与运行逻辑一致
- 本地构建和文档构建是否全部通过
- `npm pack` 产物中是否包含正确的 `dist/` 和 README

## 部署建议

项目可以部署在 Vercel 或任意静态资源服务上。对外提供 Demo 时，建议:

- 使用稳定域名承载在线预览器
- 把 iframe 方案作为推荐接入方式写进对外文档
- 发布前先用本地构建产物做一次完整 smoke test
