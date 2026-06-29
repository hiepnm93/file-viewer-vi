import type { Book } from 'epubjs';
import { type FileRenderContext, type FileViewerRenderedInstance } from '@file-viewer/core';
type EpubFactory = (buffer: ArrayBuffer, options?: {
    openAs?: string;
    replacements?: string;
}) => Book;
export declare const resolveEpubJs: (module: unknown) => EpubFactory;
export default function renderEpub(buffer: ArrayBuffer, target: HTMLDivElement, context?: FileRenderContext): Promise<FileViewerRenderedInstance>;
export {};
