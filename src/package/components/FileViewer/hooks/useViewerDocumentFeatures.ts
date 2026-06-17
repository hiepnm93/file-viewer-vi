import type { Ref } from 'vue'
import type {
  FileViewerDocumentAnchor,
  FileViewerDocumentChunk,
  FileViewerOptions,
  FileViewerSearchState
} from '@file-viewer/core'
import {
  buildFileViewerDocumentTextChunks,
  cloneFileViewerSearchState,
  createFileViewerRawPostMessagePayload,
  getCurrentFileViewerDocumentAnchor,
  postFileViewerMessageToParent,
  resolveFileViewerScrollContainer,
  scrollToFileViewerDocumentAnchor
} from '@file-viewer/core'
import { useDocumentSearch } from './useDocumentSearch'

interface UseViewerDocumentFeaturesOptions {
  output: Ref<HTMLDivElement | null>;
  getOptions: () => FileViewerOptions | undefined;
  emitSearchChange: (state: FileViewerSearchState) => void;
  emitLocationChange: (anchor: FileViewerDocumentAnchor | null) => void;
}

const postViewerPayload = (
  type: 'flyfish-viewer:search' | 'flyfish-viewer:location',
  event: string,
  payload: FileViewerSearchState | FileViewerDocumentAnchor | null
) => {
  postFileViewerMessageToParent(createFileViewerRawPostMessagePayload(type, event, payload))
}

/**
 * FileViewer 的文档交互门面。
 *
 * 底层锚点、滚动和文本切片由 core 负责，Vue 侧只保留搜索响应式 hook；
 * 这里负责把这些能力组合成组件对外暴露的 API，并处理 iframe 事件桥接。
 */
export const useViewerDocumentFeatures = ({
  output,
  getOptions,
  emitSearchChange,
  emitLocationChange
}: UseViewerDocumentFeaturesOptions) => {
  const getScrollContainer = () => {
    return resolveFileViewerScrollContainer(output.value)
  }

  const documentSearch = useDocumentSearch(
    output,
    () => getOptions()?.search,
    getScrollContainer
  )

  const getSearchState = () => cloneFileViewerSearchState(documentSearch.state)

  const notifySearchChange = () => {
    const state = getSearchState()
    emitSearchChange(state)
    postViewerPayload('flyfish-viewer:search', 'search-change', state)
    return state
  }

  const notifyLocationChange = () => {
    const anchor = getCurrentFileViewerDocumentAnchor(output.value, documentSearch.anchors.value)
    emitLocationChange(anchor)
    postViewerPayload('flyfish-viewer:location', 'location-change', anchor)
    return anchor
  }

  const refreshDocumentIndex = async () => {
    documentSearch.observe()
    await documentSearch.refreshAnchors()
    notifyLocationChange()
    return documentSearch.anchors.value
  }

  const searchDocument = async (query: string) => {
    await documentSearch.search(query)
    return notifySearchChange()
  }

  const clearDocumentSearch = async () => {
    await documentSearch.clear()
    return notifySearchChange()
  }

  const clearDocumentState = () => {
    void documentSearch.clear()
  }

  const nextSearchResult = async () => {
    await documentSearch.next()
    notifyLocationChange()
    return notifySearchChange()
  }

  const previousSearchResult = async () => {
    await documentSearch.previous()
    notifyLocationChange()
    return notifySearchChange()
  }

  const collectDocumentAnchors = async () => {
    await refreshDocumentIndex()
    return documentSearch.anchors.value
  }

  const scrollToAnchor = async (anchor: FileViewerDocumentAnchor | string) => {
    if (!documentSearch.anchors.value.length) {
      await refreshDocumentIndex()
    }
    const result = scrollToFileViewerDocumentAnchor(output.value, anchor)
    notifyLocationChange()
    return result
  }

  const scrollToLine = async (line: number) => {
    if (!documentSearch.anchors.value.length) {
      await refreshDocumentIndex()
    }
    const result = scrollToFileViewerDocumentAnchor(output.value, line)
    notifyLocationChange()
    return result
  }

  const getDocumentTextChunks = (): FileViewerDocumentChunk[] => {
    return buildFileViewerDocumentTextChunks(documentSearch.anchors.value, getOptions()?.ai)
  }

  return {
    refreshDocumentIndex,
    clearDocumentState,
    getScrollContainer,
    searchDocument,
    clearDocumentSearch,
    nextSearchResult,
    previousSearchResult,
    getSearchState,
    collectDocumentAnchors,
    scrollToAnchor,
    scrollToLine,
    getDocumentTextChunks
  }
}
