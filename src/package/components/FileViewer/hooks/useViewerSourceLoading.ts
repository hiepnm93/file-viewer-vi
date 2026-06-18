import axios from 'axios'
import type { Ref } from 'vue'
import {
  cancelFileViewerPreviewRequest,
  commitFileViewerEmptyPreviewResetState,
  createFileViewerPreviewStateTarget,
  reportFileViewerMissingRemoteData,
  reportFileViewerPreviewLoadError,
  runFileViewerLocalFilePreview,
  runFileViewerPreviewRequest,
  runFileViewerRemoteFilePreview,
} from '@file-viewer/core'
import type { FileViewerErrorMessageFormatter, FileViewerRequestController } from '@file-viewer/core'
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
  formatErrorMessage: FileViewerErrorMessageFormatter;
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
  const previewStateTarget = createFileViewerPreviewStateTarget({
    filename: {
      get: () => filename.value,
      set: value => {
        filename.value = value
      }
    },
    file: {
      get: () => currentFile.value,
      set: value => {
        currentFile.value = value
      }
    },
    buffer: {
      get: () => currentBuffer.value,
      set: value => {
        currentBuffer.value = value
      }
    },
    sourceUrl: {
      get: () => currentSourceUrl.value,
      set: value => {
        currentSourceUrl.value = value
      }
    },
    renderedReady: {
      get: () => renderedReady.value,
      set: value => {
        renderedReady.value = value
      }
    },
    progressiveReady: {
      get: () => progressiveReady.value,
      set: value => {
        progressiveReady.value = value
      }
    }
  })

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
        reportFileViewerPreviewLoadError({
          kind: 'local',
          error: nextError,
          formatErrorMessage,
          onErrorMessage: showError
        })
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
      onMissingData: () => {
        reportFileViewerMissingRemoteData({
          onErrorMessage: showError
        })
      },
      onError: (nextError, kind) => {
        reportFileViewerPreviewLoadError({
          kind,
          error: nextError,
          formatErrorMessage,
          onErrorMessage: showError
        })
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
    await runFileViewerPreviewRequest({
      file: getFile(),
      url: getUrl(),
      requestController,
      previewTarget: previewStateTarget,
      onPreviewLocalFile: previewLocalFile,
      onPreviewRemoteFile: previewRemoteFile,
      onClearRenderedContent: clearRenderedContent,
      onClearError: clearError,
      onResetLoading: resetLoading
    })
  }

  const cancelPreview = (reason: FileViewerLifecycleContext['reason'] = 'component-unmount') => {
    cancelFileViewerPreviewRequest({
      reason,
      requestController,
      previewTarget: previewStateTarget,
      onClearRenderedContent: clearRenderedContent,
      onClearError: clearError
    })
  }

  return {
    cancelPreview,
    isCurrentRequest,
    refreshPreview,
    resetViewer
  }
}
