import { nextTick, onBeforeUnmount, reactive, shallowRef, type Ref } from 'vue'
import {
  createEmptyFileViewerSearchState,
  createFileViewerDomSearchController,
  createFileViewerDomSearchControllerActionHandlers,
  type FileViewerDocumentAnchor,
  type FileViewerSearchOptions,
  type FileViewerSearchState
} from '@file-viewer/core'

/**
 * FileViewer 组件内的文档搜索响应式门面。
 *
 * DOM 锚点采集、搜索高亮、命中滚动和 MutationObserver 调度均由 core controller 负责，
 * 这里仅把纯 TS 快照同步为 Vue 响应式状态并绑定组件卸载生命周期。
 */
export const useDocumentSearch = (
  root: Ref<HTMLElement | null>,
  optionsSource?: () => boolean | FileViewerSearchOptions | undefined,
  scrollContainerSource?: () => HTMLElement | null | undefined
) => {
  const anchors = shallowRef<FileViewerDocumentAnchor[]>([])
  const state = reactive<FileViewerSearchState>(createEmptyFileViewerSearchState())
  const controller = createFileViewerDomSearchController({
    root: () => root.value,
    options: optionsSource,
    waitForDomUpdate: () => nextTick(),
    preferredScrollContainer: scrollContainerSource
  })
  const target = { anchors, state }
  const actions = createFileViewerDomSearchControllerActionHandlers(target, controller)

  onBeforeUnmount(() => {
    actions.destroy()
  })

  return {
    anchors,
    state,
    observe: actions.observe,
    refreshAnchors: actions.refreshAnchors,
    search: actions.search,
    next: actions.next,
    previous: actions.previous,
    clear: actions.clear
  }
}
