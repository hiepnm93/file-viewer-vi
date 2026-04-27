# Demo 说明

<div class="doc-kicker">See It Before You Ship It</div>

<p class="doc-lead">
  一个好用的 Demo，不只是“给别人看看”，也是团队内部确认能力边界、联调文件样本和复现问题的最快入口。
  当前仓库已经把最常见的预览样本准备好了，但这些样本只是最小可用集合，不代表它覆盖了全部支持格式。你可以把这一页当作“怎么验证文档能力”的操作手册。
</p>

## 本地可用的两个入口

| 入口 | 地址 | 适合做什么 |
| --- | --- | --- |
| 主示例页 | `/` | 切换预置文件、上传本地文件、快速确认各类格式表现 |
| iframe 示例页 | `/example/embedded.html` | 验证独立部署与二进制推送协议 |

## 主示例页

主示例页内置了常见文件样本，包括 `.doc`、`.docx`、Excel、PPT、PDF、图片与视频。它适合做三件事:

- 快速演示当前项目支持哪些文件类型
- 用本地上传验证 `file` 方案
- 在修改渲染逻辑后做肉眼回归检查

<div class="doc-shot">
  <img src="/_images/demo-main.png" alt="主示例页截图" />
  <p class="doc-caption">主示例页提供文件切换、URL 预览和上传预览，是最直接的联调入口。</p>
</div>

## `.doc` 页面效果

这次文档升级后，`.doc` 示例也被单独拿出来说明，因为它已经不只是“能打开”，而是具备更明确的页面感。

<div class="doc-shot">
  <img src="/_images/demo-doc.png" alt="DOC 文件渲染截图" />
  <p class="doc-caption">`.doc` 文件现在会显示在灰色工作台中的白色纸张上，页面居中，阅读体验更接近 Word。</p>
</div>

## iframe 示例页

`public/example/embedded.html` 演示了宿主页面如何下载文件，再把 `Blob` 推送给预览器。

<div class="doc-shot">
  <img src="/_images/demo-iframe.png" alt="Iframe 示例页截图" />
  <p class="doc-caption">iframe 示例适合验证跨系统集成路径，尤其适合做带鉴权文件的联调。</p>
</div>

## 示例文件清单

仓库中当前提供的示例文件位于 `public/example/`:

| 文件 | 用途 | 对应能力 |
| --- | --- | --- |
| `test.doc` | 验证老 Word 文档链路 | `.doc` + Word 风格页面容器 |
| `word.docx` | 验证现代 Word 文档 | `.docx` |
| `excel.xlsx` | 验证表格样式链路 | `xlsx` |
| `ppt.pptx` | 验证演示文稿渲染 | `pptx` |
| `pdf.pdf` | 验证 PDF 阅读体验 | `pdf` |
| `pic.png` | 验证图片预览 | `png` |
| `video.mp4` | 验证视频播放 | `mp4` |

## 这些格式也支持，但仓库里没内置预置样本

下面这批格式已经在代码里注册了渲染器，只是当前示例站没有全部做成预置文件。验证时建议你自己准备一份业务样本上传测试:

- 表格兼容格式：`xlsm`、`xlsb`、`xls`、`csv`、`ods`、`fods`、`numbers`
- Markdown：`md`、`markdown`
- 图片：`gif`、`jpg`、`jpeg`、`bmp`、`tiff`、`tif`、`svg`、`webp`
- 文本/代码：`txt`、`json`、`js`、`css`、`java`、`py`、`html`、`jsx`、`ts`、`tsx`、`xml`、`log`

## 建议保留一套自己的回归样本

如果你要把这个项目接进正式业务，建议你把下面这几类文件各留一份，形成自己的最小回归集:

- 一份版式复杂的 `docx`
- 一份历史 `.doc`
- 一份带合并单元格和颜色的 `xlsx`
- 一份兼容格式表格，比如 `xls` 或 `csv`
- 一份业务里最常见的 `pdf`
- 一份 Markdown 说明文档
- 一份日志或配置文件，比如 `log` / `json`
- 一份 `svg` 或 `webp` 图片

这样每次升级预览器、调整依赖或准备发版时，都能快速知道“这次有没有把关键能力碰坏”。

<div class="doc-note">
  建议你先用仓库内置样本确认主链路，再用自己的真实文件补一轮回归。前者帮你判断“项目本身能不能跑”，后者帮你判断“它能不能真正接住你的业务”。
</div>
