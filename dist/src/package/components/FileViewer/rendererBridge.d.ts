import { FileRenderContext, FileRenderHandlerRendererSession, FileViewerRenderedInstance as Rendered } from '@file-viewer/core';
export type FileViewerVueRenderSession = FileRenderHandlerRendererSession<Rendered | undefined>;
/**
 * Bridges the Vue renderer registry into the framework-neutral core renderer session.
 *
 * The Vue component package owns only lifecycle and the DOM surface. The actual renderer
 * registry is rebuilt from the current options for every load, so presets such as
 * @file-viewer/preset-all work in the native Vue component path without falling back to
 * the static core-only registry.
 */
export declare function createVueRenderSession(buffer: ArrayBuffer, type: string, target: HTMLDivElement, context?: FileRenderContext): Promise<FileViewerVueRenderSession>;
