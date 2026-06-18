import styleHref from './style.css?url'
import {
  createFileViewerNativeController,
  type CreateFileViewerNativeControllerOptions,
  type FileViewerNativeController,
  type FileViewerNativeSource
} from '@file-viewer/core'
import { vueRendererRegistry } from './vendors/renders'

export interface CreateFlyfishFileViewerOptions
  extends Omit<CreateFileViewerNativeControllerOptions, 'registry'> {}

export type FlyfishFileViewerNativeController = FileViewerNativeController
export type FlyfishFileViewerNativeSource = FileViewerNativeSource

const ensureNativeViewerStyles = () => {
  if (typeof document === 'undefined') return
  if (document.querySelector('link[data-file-viewer-style="true"]')) return

  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = styleHref
  link.dataset.fileViewerStyle = 'true'
  document.head.appendChild(link)
}

/**
 * Mount the full Flyfish renderer stack directly into a DOM container.
 *
 * This is the native integration base used by framework wrappers. It does not
 * create an iframe; wrappers keep their own component lifecycle and call the
 * shared core controller for loading, teardown, search, zoom, print and export.
 */
export const createFlyfishFileViewer = (
  container: HTMLElement,
  options: CreateFlyfishFileViewerOptions = {}
) => {
  ensureNativeViewerStyles()
  return createFileViewerNativeController(container, {
    ...options,
    registry: vueRendererRegistry
  })
}

export const mountFlyfishFileViewer = createFlyfishFileViewer
