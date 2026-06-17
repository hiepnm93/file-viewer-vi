import type { ComputedRef, Ref, ShallowRef } from 'vue'
import type {
  FileRenderExportAdapter,
  FileViewerOperationAvailability,
  FileViewerOperationType
} from '@file-viewer/core'
import {
  executeFileViewerDownloadOperation,
  executeFileViewerExportHtmlOperation,
  executeFileViewerPrintOperation
} from '@file-viewer/core'

interface UseViewerExportOptions {
  activeExportAdapter: ShallowRef<FileRenderExportAdapter | null>;
  currentBuffer: Ref<ArrayBuffer | null>;
  currentFile: Ref<File | null>;
  currentSourceUrl: Ref<string | null>;
  displayFilename: ComputedRef<string>;
  formatErrorMessage: (prefix: string, nextError: unknown) => string;
  operationAvailability: ComputedRef<FileViewerOperationAvailability>;
  output: Ref<HTMLDivElement | null>;
  runBeforeOperation: (operation: FileViewerOperationType) => Promise<boolean>;
  showError: (message: string) => void;
  watermarkInlineStyle: ComputedRef<string>;
}

export const useViewerExport = ({
  activeExportAdapter,
  currentBuffer,
  currentFile,
  currentSourceUrl,
  displayFilename,
  formatErrorMessage,
  operationAvailability,
  output,
  runBeforeOperation,
  showError,
  watermarkInlineStyle
}: UseViewerExportOptions) => {
  const getFilename = (fallback = 'file-viewer-preview') => displayFilename.value || fallback

  const downloadOriginalFile = async () => {
    try {
      await executeFileViewerDownloadOperation({
        source: {
          buffer: currentBuffer.value,
          file: currentFile.value,
          url: currentSourceUrl.value,
          filename: getFilename(currentFile.value?.name || 'preview.bin'),
          mimeType: currentFile.value?.type
        },
        filename: getFilename(currentFile.value?.name || 'preview.bin'),
        beforeOperation: runBeforeOperation,
        throwOnMissingSource: false
      })
    } catch (nextError) {
      showError(formatErrorMessage('下载失败', nextError))
    }
  }

  const exportRenderedHtml = async () => {
    try {
      await executeFileViewerExportHtmlOperation({
        source: output.value,
        adapter: activeExportAdapter.value,
        filename: getFilename('preview'),
        title: getFilename(),
        watermarkInlineStyle: watermarkInlineStyle.value,
        beforeOperation: runBeforeOperation
      })
    } catch (nextError) {
      showError(formatErrorMessage('导出 HTML 失败', nextError))
    }
  }

  const printRenderedHtml = async () => {
    try {
      await executeFileViewerPrintOperation({
        source: output.value,
        adapter: activeExportAdapter.value,
        title: getFilename(),
        watermarkInlineStyle: watermarkInlineStyle.value,
        printAvailable: operationAvailability.value.print,
        beforeOperation: runBeforeOperation
      })
    } catch (nextError) {
      showError(formatErrorMessage('打印失败', nextError))
    }
  }

  return {
    downloadOriginalFile,
    exportRenderedHtml,
    printRenderedHtml
  }
}
