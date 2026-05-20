# Public Sample Sources

本目录中的 CAD、绘图、UMD、音频和 EPUB 示例文件使用可追溯的公开样本。后续替换这些文件时，请优先选择许可清楚、可直接访问 raw 文件的公开仓库，并同步更新本文件与 `README.md`。

| Local file | Source | License | Purpose |
| --- | --- | --- | --- |
| `drawing.dxf` | `https://github.com/mozman/ezdxf/blob/master/examples_dxf/wipeout_door.dxf` | MIT | Real DXF CAD drawing for pan, zoom and layer smoke tests |
| `sample.dwg` | `https://github.com/dshn06/cad-webviewer-unity/blob/main/cad-webview/public/cad-data/data/baseline-sample.dwg` | MIT | Real DWG sample for compatibility messaging |
| `flow.excalidraw` | `https://github.com/neo4j-labs/agent-memory/blob/main/docs/assets/images/diagrams/excalidraw/poleo-model.excalidraw` | Apache-2.0 | Real Excalidraw scene for official restore/export smoke tests |
| `process.drawio` | `https://github.com/jgraph/drawio-diagrams/blob/dev/blog/data-flow.drawio` | Apache-2.0 | Official draw.io sample for diagrams.net viewer smoke tests |
| `bundle.umd` | `https://github.com/taylorhakes/promise-polyfill/blob/8.2.2/dist/polyfill.js` | MIT | Real UMD bundle for highlight.js code preview smoke tests |
| `audio.mp3` | `https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3` | CC0 | Small MP3 sample for native audio playback smoke tests |
| `audio.ogg` | `https://commons.wikimedia.org/wiki/File:Example.ogg` | CC BY-SA 3.0 | OGG Vorbis sample for native audio playback smoke tests |
| `book.epub` | `https://www.gutenberg.org/ebooks/928.epub3.images` | Public domain in the USA | EPUB sample for epubjs table-of-contents and paginated reading smoke tests |

运行时说明:

- `sample.dwg` 是真实 DWG 文件，但当前组件仍不内置 DWG 解析器；它用于确认专有格式的兼容提示和业务侧转换指引。
- `flow.excalidraw` 先经过 `@excalidraw/excalidraw` 的官方 `restore`，再用 `exportToSvg` 输出只读预览，以兼容公开样例中常见的精简字段。
- `process.drawio` 由 diagrams.net 官方 `GraphViewer` 解析，组件不自行实现 draw.io 方言解析。
- `audio.mp3` 与 `audio.ogg` 只用于验证浏览器原生音频播放能力；不同浏览器对编码的支持存在差异。
- `book.epub` 来自 Project Gutenberg，运行时由 `epubjs` 解析 EPUB 包、目录和章节资源。
