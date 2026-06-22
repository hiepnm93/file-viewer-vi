# @file-viewer/renderer-3d

Flyfish File Viewer 的独立 3D 模型 renderer 包。它使用 Three.js、OrbitControls 和按格式异步加载的 Three.js loaders，为 GLB/GLTF、OBJ、STL、PLY、FBX、DAE、3DS、3MF、AMF、USD、KMZ、PCD、VRML、XYZ、VTK 等模型提供浏览器端只读预览。

## 用法

```ts
import FileViewer from '@file-viewer/vue3'
import { modelRenderer } from '@file-viewer/renderer-3d'

const options = {
  rendererMode: 'replace',
  renderers: modelRenderer,
}
```

也可以和其他 renderer 一起组合：

```ts
import { modelRenderer } from '@file-viewer/renderer-3d'
import { cadRenderer } from '@file-viewer/renderer-cad'

const options = {
  rendererMode: 'replace',
  renderers: [modelRenderer, cadRenderer],
}
```

## 能力边界

- 支持 WebGL 交互预览、轨道控制、适配视图、网格、坐标轴、线框和自动旋转。
- `gltf` / `dae` / `fbx` 等带外部贴图或二进制资源的格式，会以原始 `url` 的目录作为资源基准继续加载。
- STEP、IGES、IFC、3DM 等工程 B-Rep / BIM 格式入口会给出明确转换说明；完整解析应拆独立 OpenCascade / web-ifc / rhino3dm WASM renderer。
- 当前 core 仍保留内置 3D renderer 以兼容历史全量包。后续会把 core 的 3D 入口切换到本包，并从 core 直接依赖中移除 `three`。
