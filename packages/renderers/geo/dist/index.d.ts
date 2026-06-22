import { type FileRenderHandler, type FileViewerRenderedInstance, type FileViewerRendererPlugin, type RendererDefinition } from '@file-viewer/core';
export declare const geoRendererDefinition: RendererDefinition;
export declare const renderFileViewerGeo: FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement>;
export declare const geoRenderer: FileViewerRendererPlugin<FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement>>;
export default geoRenderer;
