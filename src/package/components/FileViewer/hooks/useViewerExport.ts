import type { ComputedRef, Ref, ShallowRef } from 'vue'
import type {
  FileRenderExportAdapter,
  FileViewerOperationAvailability,
  FileViewerOperationType
} from '@/package/common/type'
import {
  buildFileViewerRenderedHtmlDocument,
  triggerFileViewerBlobDownload,
  triggerFileViewerUrlDownload,
  waitForFileViewerPrintWindowReady
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
  const buildRenderedHtmlDocument = async (mode: 'export' | 'print' = 'export') => {
    const out = output.value
    if (!out) {
      throw new Error('当前没有可导出的预览内容')
    }

    const title = displayFilename.value || 'file-viewer-preview'
    return buildFileViewerRenderedHtmlDocument({
      source: out,
      mode,
      title,
      adapter: activeExportAdapter.value,
      watermarkInlineStyle: watermarkInlineStyle.value
    })
  }

  const downloadOriginalFile = async () => {
    const buffer = currentBuffer.value
    const file = currentFile.value
    const sourceUrl = currentSourceUrl.value
    if ((!buffer || !file) && !sourceUrl) {
      return
    }
    if (!await runBeforeOperation('download')) {
      return
    }
    if (buffer && file) {
      triggerFileViewerBlobDownload(new Blob([buffer], { type: file.type || 'application/octet-stream' }), file.name || 'preview.bin')
      return
    }
    triggerFileViewerUrlDownload(sourceUrl as string, displayFilename.value || 'preview.bin')
  }

  const exportRenderedHtml = async () => {
    try {
      if (!await runBeforeOperation('export-html')) {
        return
      }
      const html = await buildRenderedHtmlDocument('export')
      const baseName = displayFilename.value || 'preview'
      triggerFileViewerBlobDownload(new Blob([html], { type: 'text/html;charset=utf-8' }), `${baseName}.rendered.html`)
    } catch (nextError) {
      showError(formatErrorMessage('导出 HTML 失败', nextError))
    }
  }

  const printRenderedHtml = async () => {
    try {
      if (!operationAvailability.value.print) {
        throw new Error('当前文件类型不支持完整打印，请下载原文件后在本地应用中打印')
      }
      if (!await runBeforeOperation('print')) {
        return
      }
      const html = await buildRenderedHtmlDocument('print')
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        throw new Error('浏览器拦截了打印窗口')
      }
      printWindow.document.open()
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.focus()
      await waitForFileViewerPrintWindowReady(printWindow)
      printWindow.print()
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
