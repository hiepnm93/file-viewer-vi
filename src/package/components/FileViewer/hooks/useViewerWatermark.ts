import { computed } from 'vue'
import type { FileViewerWatermarkOptions } from '@file-viewer/core'
import {
  buildFileViewerWatermarkInlineStyle,
  buildFileViewerWatermarkStyle,
  normalizeFileViewerWatermark
} from '@file-viewer/core'

export const useViewerWatermark = (
  getWatermark: () => boolean | FileViewerWatermarkOptions | undefined
) => {
  const normalizedWatermark = computed(() => normalizeFileViewerWatermark(getWatermark()))

  const watermarkStyle = computed(() => {
    return buildFileViewerWatermarkStyle(normalizedWatermark.value || undefined)
  })

  const watermarkInlineStyle = computed(() => {
    return buildFileViewerWatermarkInlineStyle(normalizedWatermark.value || undefined)
  })

  return {
    normalizedWatermark,
    watermarkStyle,
    watermarkInlineStyle
  }
}
