import {
  buildFileViewerRenderedHtmlDocument,
  triggerFileViewerBlobDownload,
  triggerFileViewerUrlDownload,
  waitForFileViewerPrintWindowReady,
} from './export';
import { DEFAULT_FILE_VIEWER_SOURCE_FILENAME } from './source';
import type {
  FileRenderExportAdapter,
  FileViewerDownloadOptions,
  FileViewerExportHtmlOptions,
  FileViewerOperationType,
  FileViewerPrintOptions,
} from './types';

export interface FileViewerOriginalSourceState {
  buffer?: ArrayBuffer | null;
  file?: File | Blob | null;
  url?: string | null;
  filename?: string | null;
  mimeType?: string | null;
}

export type CreateFileViewerOriginalSourceStateInput = FileViewerOriginalSourceState;

export const DEFAULT_FILE_VIEWER_PREVIEW_TITLE = 'file-viewer-preview';
export const DEFAULT_FILE_VIEWER_EXPORT_FILENAME = 'preview';
export const DEFAULT_FILE_VIEWER_DOWNLOAD_FILENAME = DEFAULT_FILE_VIEWER_SOURCE_FILENAME;

export interface ResolveFileViewerOperationFilenameInput {
  filename?: string | null;
  source?: FileViewerOriginalSourceState | null;
  fallback?: string;
}

export interface FileViewerOperationExecutorBase {
  beforeOperation?: (operation: FileViewerOperationType) => boolean | Promise<boolean>;
}

export interface ExecuteFileViewerDownloadOperationInput
  extends FileViewerOperationExecutorBase,
    FileViewerDownloadOptions {
  source: FileViewerOriginalSourceState;
  throwOnMissingSource?: boolean;
}

export interface ExecuteFileViewerExportHtmlOperationInput
  extends FileViewerOperationExecutorBase,
    FileViewerExportHtmlOptions {
  source: HTMLElement | null | undefined;
  adapter?: FileRenderExportAdapter | null;
}

export interface ExecuteFileViewerPrintOperationInput
  extends FileViewerOperationExecutorBase,
    FileViewerPrintOptions {
  source: HTMLElement | null | undefined;
  adapter?: FileRenderExportAdapter | null;
  printAvailable?: boolean;
}

interface BuildRenderedHtmlDocumentFromOperationInput {
  source: HTMLElement | null | undefined;
  title?: string;
  filename?: string;
  adapter?: FileRenderExportAdapter | null;
  watermarkInlineStyle?: string;
}

const getBlobFilename = (file: File | Blob | null | undefined) => {
  return file && 'name' in file && typeof file.name === 'string' ? file.name : '';
};

const getBlobMimeType = (file: File | Blob | null | undefined) => {
  return file && typeof file.type === 'string' ? file.type : '';
};

export const createFileViewerOriginalSourceState = ({
  buffer = null,
  file = null,
  url = null,
  filename = null,
  mimeType = null,
}: CreateFileViewerOriginalSourceStateInput = {}): FileViewerOriginalSourceState => {
  return {
    buffer,
    file,
    url,
    filename,
    mimeType: mimeType || getBlobMimeType(file) || null,
  };
};

export const resolveFileViewerOriginalFilename = (
  source: FileViewerOriginalSourceState,
  fallback = 'preview'
) => {
  return source.filename || getBlobFilename(source.file) || fallback;
};

export const resolveFileViewerOperationFilename = ({
  filename,
  source,
  fallback = DEFAULT_FILE_VIEWER_PREVIEW_TITLE,
}: ResolveFileViewerOperationFilenameInput) => {
  return filename || (source ? resolveFileViewerOriginalFilename(source, '') : '') || fallback;
};

export const hasFileViewerOriginalSource = (source: FileViewerOriginalSourceState) => {
  return !!source.buffer || !!source.file || !!source.url;
};

const runBeforeOperation = async (
  beforeOperation: FileViewerOperationExecutorBase['beforeOperation'],
  operation: FileViewerOperationType
) => {
  if (!beforeOperation) {
    return true;
  }
  return await beforeOperation(operation);
};

const buildRenderedHtmlDocumentFromOperation = async (
  mode: 'export' | 'print',
  {
    source,
    title,
    filename,
    adapter = null,
    watermarkInlineStyle,
  }: BuildRenderedHtmlDocumentFromOperationInput
) => {
  if (!source) {
    throw new Error('当前没有可导出的预览内容');
  }

  return buildFileViewerRenderedHtmlDocument({
    source,
    mode,
    title: resolveFileViewerOperationFilename({
      filename: title || filename,
      fallback: DEFAULT_FILE_VIEWER_PREVIEW_TITLE,
    }),
    adapter,
    watermarkInlineStyle,
  });
};

export const executeFileViewerDownloadOperation = async ({
  source,
  filename,
  beforeOperation,
  throwOnMissingSource = true,
}: ExecuteFileViewerDownloadOperationInput) => {
  if (!hasFileViewerOriginalSource(source)) {
    if (throwOnMissingSource) {
      throw new Error('当前没有可下载的源文件');
    }
    return false;
  }

  if (!await runBeforeOperation(beforeOperation, 'download')) {
    return false;
  }

  const resolvedFilename = resolveFileViewerOperationFilename({
    filename,
    source,
    fallback: DEFAULT_FILE_VIEWER_DOWNLOAD_FILENAME,
  });

  if (source.buffer) {
    triggerFileViewerBlobDownload(
      new Blob([source.buffer], { type: source.mimeType || source.file?.type || 'application/octet-stream' }),
      resolvedFilename
    );
    return true;
  }

  if (source.file) {
    triggerFileViewerBlobDownload(source.file, resolvedFilename);
    return true;
  }

  triggerFileViewerUrlDownload(source.url as string, resolvedFilename);
  return true;
};

export const executeFileViewerExportHtmlOperation = async ({
  download = true,
  filename,
  beforeOperation,
  ...input
}: ExecuteFileViewerExportHtmlOperationInput) => {
  if (!await runBeforeOperation(beforeOperation, 'export-html')) {
    return '';
  }

  const html = await buildRenderedHtmlDocumentFromOperation('export', {
    ...input,
    filename,
  });

  if (download !== false) {
    const baseName = resolveFileViewerOperationFilename({
      filename: filename || input.title,
      fallback: DEFAULT_FILE_VIEWER_EXPORT_FILENAME,
    });
    triggerFileViewerBlobDownload(
      new Blob([html], { type: 'text/html;charset=utf-8' }),
      `${baseName}.rendered.html`
    );
  }

  return html;
};

export const executeFileViewerPrintOperation = async ({
  autoPrint = true,
  beforeOperation,
  openWindow,
  printAvailable = true,
  printWindow,
  ...input
}: ExecuteFileViewerPrintOperationInput) => {
  if (!printAvailable) {
    throw new Error('当前文件类型不支持完整打印，请下载原文件后在本地应用中打印');
  }

  if (!await runBeforeOperation(beforeOperation, 'print')) {
    return false;
  }

  const html = await buildRenderedHtmlDocumentFromOperation('print', input);
  const targetWindow = printWindow ||
    openWindow?.() ||
    (typeof window !== 'undefined' ? window.open('', '_blank') : null);

  if (!targetWindow) {
    throw new Error('浏览器拦截了打印窗口');
  }

  targetWindow.document.open();
  targetWindow.document.write(html);
  targetWindow.document.close();
  targetWindow.focus();
  await waitForFileViewerPrintWindowReady(targetWindow);

  if (autoPrint !== false) {
    targetWindow.print();
  }

  return true;
};
