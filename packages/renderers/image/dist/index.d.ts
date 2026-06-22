import { type FileRenderHandler, type FileViewerRenderedInstance, type FileViewerRendererPlugin, type RendererDefinition } from '@file-viewer/core';
export declare const imageRendererDefinition: RendererDefinition;
export declare const renderFileViewerImage: FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement>;
export declare const imageRenderer: FileViewerRendererPlugin<FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement>>;
export default imageRenderer;
