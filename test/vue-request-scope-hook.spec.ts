import { describe, expect, it } from 'vitest'
import { useViewerRequestScope } from '../src/package/components/FileViewer/hooks/useViewerRequestScope'

describe('Vue FileViewer request scope hook', () => {
  it('keeps request version ownership outside the top-level component', () => {
    const scope = useViewerRequestScope()

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
})
