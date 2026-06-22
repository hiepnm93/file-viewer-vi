import type { FileRenderContext, FileViewerRenderedInstance } from '@file-viewer/core';
/**
 * Pure TypeScript video renderer.
 *
 * MP4/WebM use the native `<video>` element. HLS uses native browser support
 * first and imports `hls.js` only when the current browser needs it.
 */
export default function renderVideo(buffer: ArrayBuffer, target: HTMLDivElement, type?: string, context?: FileRenderContext): Promise<FileViewerRenderedInstance>;
