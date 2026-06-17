import { reactive, shallowRef, type Ref } from 'vue'
import {
  createFileViewerZoomState,
  findFileViewerZoomProvider
} from '@file-viewer/core'
export {
  findFileViewerZoomProvider,
  registerFileViewerZoomProvider,
  unregisterFileViewerZoomProvider
} from '@file-viewer/core'
import type { FileViewerZoomProvider, FileViewerZoomState } from '@/package/common/type'

export const createZoomChangeEmitter = () => {
  const listeners = new Set<() => void>()
  return {
    emit() {
      listeners.forEach(listener => listener())
    },
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    }
  }
}

interface UseViewerZoomOptions {
  root: Ref<HTMLElement | null>;
  enabled?: () => boolean;
  beforeZoom?: (operation: 'zoom-in' | 'zoom-out' | 'zoom-reset') => Promise<boolean> | boolean;
}

/**
 * FileViewer 内部的统一缩放门面。
 *
 * 这里只寻找并调用当前渲染器注册的 provider，不做通用 CSS 缩放兜底。
 * 这样可以确保虚拟表格、PDF 文本层、CAD canvas 等交互坐标仍由各自渲染器掌控。
 */
export const useViewerZoom = ({
  root,
  enabled,
  beforeZoom
}: UseViewerZoomOptions) => {
  const provider = shallowRef<FileViewerZoomProvider | null>(null)
  const state = reactive(createFileViewerZoomState())

  let unsubscribe: (() => void) | null = null
  let observer: MutationObserver | null = null

  const applyState = (nextState?: FileViewerZoomState | null) => {
    const normalized = createFileViewerZoomState(nextState || {})
    state.scale = normalized.scale
    state.label = normalized.label
    state.canZoomIn = normalized.canZoomIn
    state.canZoomOut = normalized.canZoomOut
    state.canReset = normalized.canReset
    state.minScale = normalized.minScale
    state.maxScale = normalized.maxScale
  }

  const clearProvider = () => {
    unsubscribe?.()
    unsubscribe = null
    provider.value = null
    applyState(null)
  }

  const syncProvider = () => {
    if (enabled?.() === false) {
      clearProvider()
      return null
    }

    const nextProvider = findFileViewerZoomProvider(root.value)
    if (nextProvider !== provider.value) {
      unsubscribe?.()
      provider.value = nextProvider
      unsubscribe = nextProvider?.subscribe?.(() => {
        applyState(nextProvider.getState())
      }) || null
    }
    applyState(nextProvider?.getState?.() || null)
    return nextProvider
  }

  const runZoomAction = async (
    operation: 'zoom-in' | 'zoom-out' | 'zoom-reset',
    action: (nextProvider: FileViewerZoomProvider) => FileViewerZoomState | Promise<FileViewerZoomState>
  ) => {
    const nextProvider = syncProvider()
    if (!nextProvider) {
      return createFileViewerZoomState(state)
    }

    if (beforeZoom && await beforeZoom(operation) === false) {
      return createFileViewerZoomState(state)
    }

    const nextState = await action(nextProvider)
    applyState(nextState || nextProvider.getState())
    return createFileViewerZoomState(state)
  }

  const startObserving = () => {
    observer?.disconnect()
    if (!root.value || typeof MutationObserver === 'undefined') {
      syncProvider()
      return
    }
    observer = new MutationObserver(() => {
      syncProvider()
    })
    observer.observe(root.value, {
      childList: true,
      subtree: true
    })
    syncProvider()
  }

  const stopObserving = () => {
    observer?.disconnect()
    observer = null
    clearProvider()
  }

  return {
    zoomState: state,
    hasZoomProvider: () => !!syncProvider(),
    refreshZoomProvider: syncProvider,
    startZoomObserver: startObserving,
    stopZoomObserver: stopObserving,
    clearZoomProvider: clearProvider,
    getZoomState: () => createFileViewerZoomState(state),
    zoomIn: () => runZoomAction('zoom-in', nextProvider => nextProvider.zoomIn()),
    zoomOut: () => runZoomAction('zoom-out', nextProvider => nextProvider.zoomOut()),
    resetZoom: () => runZoomAction('zoom-reset', nextProvider => nextProvider.resetZoom())
  }
}
