# Example

当前目录用于演示文件预览与 iframe 嵌入联调。

- 运行主工程后，通过示例站点首页验证常见文件格式
- 通过 `embedded.html` 验证 iframe 集成与二进制推送方案
- 这里的样例文件适合作为本地 smoke test 的最小数据集

## 当前内置样本

- `test.doc`: 验证 `.doc` 老文档与 Word 风格页面容器
- `word.docx`: 验证现代 Word 文档链路
- `excel.xlsx`: 验证 `xlsx` 样式能力
- `ppt.pptx`: 验证 `pptx` 幻灯片渲染
- `pdf.pdf`: 验证 `pdf` 阅读体验
- `pic.png`: 验证图片预览
- `video.mp4`: 验证视频播放

## 说明

当前仓库没有把所有支持格式都做成预置样本。

如果你要补完整回归，建议额外准备这些类型的业务文件自行上传测试:

- `xlsm`、`xlsb`、`xls`、`csv`、`ods`、`fods`、`numbers`
- `md`、`markdown`
- `gif`、`jpg`、`jpeg`、`bmp`、`tiff`、`tif`、`svg`、`webp`
- `txt`、`json`、`js`、`css`、`java`、`py`、`html`、`jsx`、`ts`、`tsx`、`xml`、`log`
