import { nextTick, shallowRef, type Ref } from 'vue'
import {
  buildFileViewerDocumentTextChunks,
  collectFileViewerDocumentAnchors,
  findFileViewerAnchorForElement,
  getCurrentFileViewerDocumentAnchor,
  scrollToFileViewerDocumentAnchor
} from '@file-viewer/core'
import type {
  FileViewerAiOptions,
  FileViewerDocumentAnchor,
  FileViewerDocumentChunk
} from '@/package/common/type'

export const collectDocumentAnchors = collectFileViewerDocumentAnchors
export const findAnchorForElement = findFileViewerAnchorForElement
export const getCurrentDocumentAnchor = getCurrentFileViewerDocumentAnchor
export const scrollToDocumentAnchor = scrollToFileViewerDocumentAnchor

export const buildDocumentTextChunks = (
  anchors: FileViewerDocumentAnchor[],
  options?: boolean | FileViewerAiOptions
): FileViewerDocumentChunk[] => {
  return buildFileViewerDocumentTextChunks(anchors, options)
}

export const useDocumentLocation = (root: Ref<HTMLElement | null>) => {
  const anchors = shallowRef<FileViewerDocumentAnchor[]>([])

  const refreshAnchors = async () => {
    await nextTick()
    anchors.value = collectDocumentAnchors(root.value)
    return anchors.value
  }

  const getCurrentAnchor = () => getCurrentDocumentAnchor(root.value, anchors.value)

  const scrollToAnchor = (anchor: FileViewerDocumentAnchor | string) => {
    return scrollToDocumentAnchor(root.value, anchor)
  }

  const scrollToLine = async (line: number) => {
    if (!anchors.value.length) {
      await refreshAnchors()
    }
    return scrollToDocumentAnchor(root.value, line)
  }

  const getTextChunks = (options?: boolean | FileViewerAiOptions) => {
    return buildDocumentTextChunks(anchors.value, options)
  }

  return {
    anchors,
    refreshAnchors,
    getCurrentAnchor,
    scrollToAnchor,
    scrollToLine,
    getTextChunks
  }
}
