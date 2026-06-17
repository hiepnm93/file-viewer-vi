import {
  createFileViewerRequestController,
  type FileViewerRequestController
} from '@file-viewer/core'

export interface ViewerRequestScope {
  requestController: FileViewerRequestController;
  getCurrentVersion: () => number;
  isCurrentRequest: (version: number) => boolean;
}

/**
 * Owns the Vue FileViewer request version scope.
 *
 * The actual cancellation/versioning implementation lives in @file-viewer/core;
 * this hook keeps the top-level component as a composition shell.
 */
export const useViewerRequestScope = (): ViewerRequestScope => {
  const requestController = createFileViewerRequestController()

  return {
    requestController,
    getCurrentVersion: () => requestController.version,
    isCurrentRequest: version => requestController.isCurrent(version)
  }
}
