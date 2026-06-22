import { type FileRenderHandler, type FileViewerRenderedInstance, type FileViewerRendererPlugin, type RendererDefinition } from '@file-viewer/core';
export declare const mediaRendererDefinitions: RendererDefinition[];
export declare const renderFileViewerAudio: FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement>;
export declare const renderFileViewerVideo: FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement>;
export declare const mediaRenderer: FileViewerRendererPlugin<FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement>>;
export default mediaRenderer;
