import { type FileViewerRenderedInstance } from '@file-viewer/core';
export declare const stripMarkdownFrontmatter: (text: string) => string;
export default function renderMarkdown(buffer: ArrayBuffer, target: HTMLDivElement): Promise<FileViewerRenderedInstance>;
