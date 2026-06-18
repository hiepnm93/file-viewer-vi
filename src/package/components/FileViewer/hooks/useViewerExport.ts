import type { ComputedRef, Ref, ShallowRef } from 'vue'
import type {
  FileRenderExportAdapter,
  FileViewerOperationAvailability,
  FileViewerOperationActionErrorContext,
  FileViewerOperationType
} from '@file-viewer/core'
import {
  createFileViewerOperationActionHandlers
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
  const operationErrorPrefixes: Record<FileViewerOperationActionErrorContext['operation'], string> = {
    download: '下载失败',
    print: '打印失败',
    'export-html': '导出 HTML 失败'
  }

  const actions = createFileViewerOperationActionHandlers({
    getBuffer: () => currentBuffer.value,
    getFile: () => currentFile.value,
    getUrl: () => currentSourceUrl.value,
    getFilename: () => displayFilename.value,
    getMimeType: () => currentFile.value?.type,
    getRenderedSource: () => output.value,
    getAdapter: () => activeExportAdapter.value,
    getWatermarkInlineStyle: () => watermarkInlineStyle.value,
    getPrintAvailable: () => operationAvailability.value.print,
    beforeOperation: runBeforeOperation,
    onError: ({ operation, error: nextError }) => {
      showError(formatErrorMessage(operationErrorPrefixes[operation], nextError))
    }
  })

  const downloadOriginalFile = async () => {
    await actions.downloadOriginalFile()
  }

  const exportRenderedHtml = async () => {
    await actions.exportRenderedHtml()
  }

  const printRenderedHtml = async () => {
    await actions.printRenderedHtml()
  }

  return {
    downloadOriginalFile,
    exportRenderedHtml,
    printRenderedHtml
  }
}
