import {
  DEFAULT_RENDERER_DEFINITIONS,
  coreBrowserRendererHandlers,
  type FileRenderHandler,
  type FileViewerRenderedInstance,
  type FileViewerRendererPlugin,
  type FileViewerRendererPreset,
} from '@file-viewer/core';

type BrowserRendererHandler = FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement>;

const allRendererHandlers = coreBrowserRendererHandlers as readonly {
  rendererId: string;
  handler: BrowserRendererHandler;
}[];

export const fileViewerAllRendererPlugin: FileViewerRendererPlugin<BrowserRendererHandler> = {
  id: 'file-viewer-all-renderers',
  label: 'Flyfish File Viewer all renderers',
  definitions: DEFAULT_RENDERER_DEFINITIONS,
  handlers: allRendererHandlers,
};

export const allRenderers: FileViewerRendererPreset<BrowserRendererHandler> = {
  id: 'file-viewer-preset-all',
  label: 'Flyfish File Viewer full renderer preset',
  renderers: [fileViewerAllRendererPlugin],
};

export const fileViewerPresetAll = allRenderers;

export default allRenderers;
