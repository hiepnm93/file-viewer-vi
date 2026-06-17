import { computed, reactive, toValue, watch, type MaybeRefOrGetter } from 'vue'
import {
  applyFileViewerLoadingRuntimeState,
  createFileViewerLoadingController,
  resolveFileViewerLoadingTheme,
  type FileViewerLoadingRuntimeState,
  type FileViewerStateTheme
} from '@file-viewer/core'

export type LoadingTheme = FileViewerStateTheme

export const resolveLoadingTheme = resolveFileViewerLoadingTheme

/**
 * FileViewer loading 响应式门面。
 *
 * 真实 loading 状态机和主题矩阵在 `@file-viewer/core` 中维护，
 * 这里仅把纯 TS controller 的快照同步成组件需要的 Vue ref/computed 形态。
 */
export const useLoading = (extendSource: MaybeRefOrGetter<string>) => {
  const controller = createFileViewerLoadingController(toValue(extendSource))
  const state = reactive<FileViewerLoadingRuntimeState>(controller.getState())

  const syncFromController = (nextState = controller.getState()) => {
    applyFileViewerLoadingRuntimeState(state, nextState)
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
