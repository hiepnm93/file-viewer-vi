import { describe, expect, it } from 'vitest'
import {
  createFileViewerRequestController,
  createFileViewerRequestScope
} from '../packages/core/src'

describe('@file-viewer/core request scope', () => {
  it('exposes request version ownership without framework hooks', () => {
    const scope = createFileViewerRequestScope()

    expect(scope.getCurrentVersion()).toBe(0)
    expect(scope.isCurrentRequest(0)).toBe(true)

    const firstVersion = scope.requestController.createVersion()

    expect(firstVersion).toBe(1)
    expect(scope.getCurrentVersion()).toBe(1)
    expect(scope.isCurrentRequest(firstVersion)).toBe(true)
    expect(scope.isCurrentRequest(0)).toBe(false)

    const secondVersion = scope.requestController.createVersion()

    expect(secondVersion).toBe(2)
    expect(scope.getCurrentVersion()).toBe(2)
    expect(scope.isCurrentRequest(firstVersion)).toBe(false)
    expect(scope.isCurrentRequest(secondVersion)).toBe(true)
  })

  it('can wrap an existing request controller for shared owners', () => {
    const requestController = createFileViewerRequestController()
    const scope = createFileViewerRequestScope(requestController)
    const version = requestController.createVersion()

    expect(scope.requestController).toBe(requestController)
    expect(scope.getCurrentVersion()).toBe(version)
    expect(scope.isCurrentRequest(version)).toBe(true)
  })
})
