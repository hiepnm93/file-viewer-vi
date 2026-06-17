import { computed, reactive, toValue, watch, type MaybeRefOrGetter } from 'vue'
import {
  cloneFileViewerLoadingRuntimeState,
  createFileViewerLoadingController,
  resolveFileViewerLoadingTheme,
  type FileViewerLoadingRuntimeState,
  type FileViewerStateTheme
} from '@file-viewer/core'

export type LoadingTheme = FileViewerStateTheme

export const resolveLoadingTheme = resolveFileViewerLoadingTheme

const applyLoadingState = (
  target: FileViewerLoadingRuntimeState,
  source: FileViewerLoadingRuntimeState
) => {
  target.loading = source.loading
  target.error = source.error
  target.message = source.message
  target.theme = source.theme
  target.styleVars = source.styleVars
}

/**
 * Vue 响应式门面。
 *
 * 真实 loading 状态机和主题矩阵在 `@file-viewer/core` 中维护，
 * 这里仅把纯 TS controller 的快照同步成 Vue ref/computed 形态。
 */
export const useLoading = (extendSource: MaybeRefOrGetter<string>) => {
  const controller = createFileViewerLoadingController(toValue(extendSource))
  const state = reactive<FileViewerLoadingRuntimeState>(controller.getState())

  const syncFromController = (nextState = controller.getState()) => {
    applyLoadingState(state, cloneFileViewerLoadingRuntimeState(nextState))
  }

  watch(
    () => toValue(extendSource),
    nextExtend => {
      syncFromController(controller.setExtension(nextExtend))
    }
  )

  return {
    loading: computed(() => state.loading),
    error: computed(() => state.error),
    message: computed(() => state.message),
    theme: computed(() => state.theme),
    styleVars: computed(() => state.styleVars),
    startLoading: (nextMessage: string) => syncFromController(controller.startLoading(nextMessage)),
    setLoadingMessage: (nextMessage: string) => syncFromController(controller.setLoadingMessage(nextMessage)),
    stopLoading: () => syncFromController(controller.stopLoading()),
    showError: (nextMessage: string) => syncFromController(controller.showError(nextMessage)),
    clearError: () => syncFromController(controller.clearError()),
    resetLoading: () => syncFromController(controller.resetLoading())
  }
}
