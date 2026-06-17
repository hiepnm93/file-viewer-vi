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
  const downloadOriginalFile = async () => {
    try {
      const source = {
        buffer: currentBuffer.value,
        file: currentFile.value,
        url: currentSourceUrl.value,
        filename: displayFilename.value,
        mimeType: currentFile.value?.type
      }
      await executeFileViewerDownloadOperation({
        source,
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
        filename: displayFilename.value,
        title: displayFilename.value,
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
        title: displayFilename.value,
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
