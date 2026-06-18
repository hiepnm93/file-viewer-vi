import axios from 'axios'
import type { Ref } from 'vue'
import {
  commitFileViewerEmptyPreviewResetState,
  commitFileViewerPreviewRequestStartState,
  resolveFileViewerPreviewRequestReason,
  runFileViewerLocalFilePreview,
  runFileViewerRemoteFilePreview,
} from '@file-viewer/core'
import type { FileViewerRequestController } from '@file-viewer/core'
import type {
  FileViewerFileRef as FileRef,
  FileViewerLifecycleContext,
  FileViewerLoadStartState,
  FileViewerOptions,
  FileViewerRenderCompleteState
} from '@file-viewer/core'
import type { FileViewerVueRenderSession } from '../rendererBridge'

interface UseViewerSourceLoadingOptions {
  getFile: () => FileRef | undefined;
  getUrl: () => string | undefined;
  getOptions: () => FileViewerOptions | undefined;
  filename: Ref<string>;
  currentFile: Ref<File | null>;
  currentBuffer: Ref<ArrayBuffer | null>;
  currentSourceUrl: Ref<string | null>;
  renderedReady: Ref<boolean>;
  progressiveReady: Ref<boolean>;
  requestController: FileViewerRequestController;
  clearRenderedContent: (reason?: FileViewerLifecycleContext['reason']) => void;
  mountRenderedContent: (
    buffer: ArrayBuffer,
    file: File,
    version: number,
    sourceUrl?: string,
    streamUrl?: string
  ) => Promise<FileViewerVueRenderSession | undefined>;
  destroyRenderSession: (session?: FileViewerVueRenderSession | null) => void;
  setActiveRenderSession: (session: FileViewerVueRenderSession | null) => void;
  buildLoadStartState: (input: {
    version: number;
    source: FileViewerLifecycleContext['source'];
    file?: File | null;
    sourceUrl?: string | null;
  }) => FileViewerLoadStartState;
  buildRenderCompleteState: (input: {
    version: number;
    source: FileViewerLifecycleContext['source'];
    file?: File | null;
    sourceUrl?: string | null;
  }) => FileViewerRenderCompleteState;
  notifyLifecycle: (context: FileViewerLifecycleContext) => void;
  setActiveDocumentContext: (context: FileViewerLifecycleContext) => void;
  markLoadStarted: (version: number) => void;
  clearLoadStarted: (version: number) => void;
  startLoading: (message: string) => void;
  setLoadingMessage: (message: string) => void;
  stopLoading: () => void;
  showError: (message: string) => void;
  clearError: () => void;
  resetLoading: () => void;
  formatErrorMessage: (prefix: string, nextError: unknown) => string;
}

/**
 * FileViewer 组件层的来源加载门面。
 *
 * 请求版本、取消错误、文件包装、PDF URL 流式判断等通用能力来自
 * `@file-viewer/core`；这里只把 Vue 状态、加载态和渲染挂载回调串起来。
 */
export const useViewerSourceLoading = ({
  getFile,
  getUrl,
  getOptions,
  filename,
  currentFile,
  currentBuffer,
  currentSourceUrl,
  renderedReady,
  progressiveReady,
  requestController,
  clearRenderedContent,
  mountRenderedContent,
  destroyRenderSession,
  setActiveRenderSession,
  buildLoadStartState,
  buildRenderCompleteState,
  notifyLifecycle,
  setActiveDocumentContext,
  markLoadStarted,
  clearLoadStarted,
  startLoading,
  setLoadingMessage,
  stopLoading,
  showError,
  clearError,
  resetLoading,
  formatErrorMessage
}: UseViewerSourceLoadingOptions) => {
  const previewStateTarget = {
    get filename(): string {
      return filename.value
    },
    set filename(value: string) {
      filename.value = value
    },
    get file(): File | null {
      return currentFile.value
    },
    set file(value: File | null) {
      currentFile.value = value
    },
    get buffer(): ArrayBuffer | null {
      return currentBuffer.value
    },
    set buffer(value: ArrayBuffer | null) {
      currentBuffer.value = value
    },
    get sourceUrl(): string | null {
      return currentSourceUrl.value
    },
    set sourceUrl(value: string | null) {
      currentSourceUrl.value = value
    },
    get renderedReady(): boolean {
      return renderedReady.value
    },
    set renderedReady(value: boolean) {
      renderedReady.value = value
    },
    get progressiveReady(): boolean {
      return progressiveReady.value
    },
    set progressiveReady(value: boolean) {
      progressiveReady.value = value
    }
  }

  const createRequestVersion = (reason: FileViewerLifecycleContext['reason'] = 'replace') => {
    return commitFileViewerPreviewRequestStartState({
      reason,
      requestController,
      previewTarget: previewStateTarget,
      onClearRenderedContent: clearRenderedContent,
      onClearError: clearError
    })
  }

  const isCurrentRequest = (version: number) => {
    return requestController.isCurrent(version)
  }

  const previewLocalFile = async (source: FileRef, version: number) => {
    await runFileViewerLocalFilePreview({
      source,
      version,
      currentFilename: filename.value,
      previewTarget: previewStateTarget,
      isCurrent: isCurrentRequest,
      mountRenderedContent,
      destroyRenderSession,
      buildLoadStartState,
      buildRenderCompleteState,
      onMarkLoadStarted: markLoadStarted,
      onStartLoading: startLoading,
      onSession: setActiveRenderSession,
      onActiveDocumentContext: setActiveDocumentContext,
      onLifecycle: notifyLifecycle,
      onClearLoadStarted: clearLoadStarted,
      onStopLoading: stopLoading,
      onError: nextError => {
        console.error(nextError)
        showError(formatErrorMessage('读取文件异常', nextError))
      }
    })
  }

  const previewRemoteFile = async (url: string, version: number) => {
    await runFileViewerRemoteFilePreview({
      url,
      version,
      streaming: getOptions()?.pdf?.streaming,
      previewTarget: previewStateTarget,
      requestController,
      isCurrent: isCurrentRequest,
      downloadFile: async ({ url: downloadUrl, signal }) => {
        const { data } = await axios({
          url: downloadUrl,
          method: 'get',
          responseType: 'blob',
          signal
        })
        return data
      },
      mountRenderedContent,
      destroyRenderSession,
      buildLoadStartState,
      buildRenderCompleteState,
      onMarkLoadStarted: markLoadStarted,
      onStartLoading: startLoading,
      onSetLoadingMessage: setLoadingMessage,
      onSession: setActiveRenderSession,
      onActiveDocumentContext: setActiveDocumentContext,
      onLifecycle: notifyLifecycle,
      onClearLoadStarted: clearLoadStarted,
      onStopLoading: stopLoading,
      onMissingData: () => showError('文件下载失败'),
      onError: (nextError, kind) => {
        console.error(nextError)
        showError(formatErrorMessage(
          kind === 'stream' ? '加载 PDF 流式预览异常' : '加载文件异常',
          nextError
        ))
      }
    })
  }

  const resetViewer = () => {
    commitFileViewerEmptyPreviewResetState({
      previewTarget: previewStateTarget,
      onClearRenderedContent: clearRenderedContent,
      onResetLoading: resetLoading
    })
  }

  const refreshPreview = async () => {
    const file = getFile()
    const url = getUrl()
    const version = createRequestVersion(resolveFileViewerPreviewRequestReason({ file, url }))

    if (file) {
      await previewLocalFile(file, version)
      return
    }

    if (url) {
      await previewRemoteFile(url, version)
      return
    }

    resetViewer()
  }

  const cancelPreview = (reason: FileViewerLifecycleContext['reason'] = 'component-unmount') => {
    createRequestVersion(reason)
  }

  return {
    cancelPreview,
    isCurrentRequest,
    refreshPreview,
    resetViewer
  }
}
