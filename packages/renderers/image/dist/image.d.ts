import { type FileRenderContext, type FileViewerRenderedInstance } from '@file-viewer/core';
export default function renderImage(buffer: ArrayBuffer, target: HTMLDivElement, type?: string, context?: FileRenderContext): Promise<FileViewerRenderedInstance>;
