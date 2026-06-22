declare module 'virtual:file-viewer-renderers' {
  import type {
    FileRenderHandler,
    FileViewerRenderedInstance,
    FileViewerRendererPlugin,
    FileViewerRendererPreset,
  } from '@file-viewer/core';

  type BrowserRendererHandler = FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement>;

  export interface ConfiguredFileViewerRendererPlan {
    preset: string | null;
    formats: string[];
    rendererIds: string[];
    packages: string[];
    generatedBy: '@file-viewer/vite-plugin';
  }

  export const configuredFileViewerRenderers:
    | readonly FileViewerRendererPlugin<BrowserRendererHandler>[]
    | FileViewerRendererPreset<BrowserRendererHandler>;
  export const fileViewerRendererPlan: ConfiguredFileViewerRendererPlan;
  export default configuredFileViewerRenderers;
}
