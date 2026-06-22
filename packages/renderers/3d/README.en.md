# @file-viewer/renderer-3d

Standalone 3D model renderer package for Flyfish File Viewer. It uses Three.js, OrbitControls, and format-specific Three.js loaders to preview GLB/GLTF, OBJ, STL, PLY, FBX, DAE, 3DS, 3MF, AMF, USD, KMZ, PCD, VRML, XYZ, VTK, and related model files directly in the browser.

## Usage

```ts
import FileViewer from '@file-viewer/vue3'
import { modelRenderer } from '@file-viewer/renderer-3d'

const options = {
  rendererMode: 'replace',
  renderers: modelRenderer,
}
```

You can combine it with other renderer packages:

```ts
import { modelRenderer } from '@file-viewer/renderer-3d'
import { cadRenderer } from '@file-viewer/renderer-cad'

const options = {
  rendererMode: 'replace',
  renderers: [modelRenderer, cadRenderer],
}
```

## Capabilities

- Supports WebGL preview, orbit controls, fit-to-view, grid, axes, wireframe, and auto-rotate.
- For `gltf`, `dae`, and `fbx` files with external textures or binary resources, the original URL directory is used as the resource base.
- STEP, IGES, IFC, and 3DM entries explain the required OpenCascade / web-ifc / rhino3dm WASM path instead of pretending to provide full B-Rep or BIM support.
- The core package still keeps the bundled 3D renderer for backward compatibility. A later migration will switch the core 3D entry to this package and remove `three` from core direct dependencies.
