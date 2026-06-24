import { type FileRenderContext, type FileViewerRenderedInstance } from '@file-viewer/core';
/**
 * Pure TypeScript audio renderer.
 *
 * Regular audio files use the browser's native `<audio>` element. MIDI stays in
 * the same async chunk and lazily imports `@tonejs/midi` only for `.mid/.midi`.
 */
export default function renderAudio(buffer: ArrayBuffer, target: HTMLDivElement, type?: string, context?: FileRenderContext): Promise<FileViewerRenderedInstance>;
