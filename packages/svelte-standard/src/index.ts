import {
  type ViewerController,
  type ViewerMountOptions,
  type ViewerCoreOptions,
  mountViewer as mountCoreViewer
} from './controller.js'
import { fileViewerCoreRendererRegistry } from '@file-viewer/core'

export type {
  FileRef,
  ViewerAiOptions,
  ViewerArchiveOptions,
  ViewerCadOptions,
  ViewerController,
  ViewerControllerAccessor,
  ViewerControllerHandle,
  ViewerDocxOptions,
  ViewerEvent,
  ViewerEventHandler,
  ViewerEventType,
  ViewerFetchFile,
  ViewerFetchInput,
  ViewerMountOptions,
  ViewerOptions,
  ViewerPdfOptions,
  ViewerSpreadsheetOptions,
  ViewerSearchOptions,
  ViewerSourceInput,
  ViewerThemeMode,
  ViewerToolbarOptions,
  ViewerToolbarPosition,
  ViewerTypstOptions,
  ViewerWatermarkOptions
} from './controller.js'

export interface FileViewerSvelteActionOptions extends ViewerMountOptions {
  /**
   * Clear the container before mounting a fresh native viewer. Enabled by default.
   */
  replace?: boolean
}

export interface FileViewerSvelteActionReturn {
  update(options?: FileViewerSvelteActionOptions): void
  destroy(): void
}

const canUseDom = () => typeof window !== 'undefined' && typeof document !== 'undefined'

const clearContainer = (node: HTMLElement) => {
  node.innerHTML = ''
}

export const mountViewer = (
  container: HTMLElement,
  options: ViewerMountOptions = {},
  coreOptions: ViewerCoreOptions = {}
) => mountCoreViewer(container, options, {
  registry: fileViewerCoreRendererRegistry,
  ...coreOptions
})

export const fileViewer = (
  node: HTMLElement,
  initialOptions: FileViewerSvelteActionOptions = {}
): FileViewerSvelteActionReturn => {
  let options = initialOptions
  let controller: ViewerController | null = null

  const mount = () => {
    if (!canUseDom()) {
      return
    }

    if (controller) {
      if (options.replace === false) {
        controller.update(options)
        return
      }

      controller.destroy()
      controller = null
    }

    if (options.replace !== false) {
      clearContainer(node)
    }

    const { replace: _replace, ...viewerOptions } = options
    controller = mountViewer(node, viewerOptions)
  }

  mount()

  return {
    update(nextOptions: FileViewerSvelteActionOptions = {}) {
      options = { ...options, ...nextOptions }
      if (controller) {
        const { replace: _replace, ...viewerOptions } = options
        controller.update(viewerOptions)
        return
      }
      mount()
    },
    destroy() {
      controller?.destroy()
      controller = null
      if (options.replace !== false) {
        clearContainer(node)
      }
    }
  }
}

export default fileViewer
