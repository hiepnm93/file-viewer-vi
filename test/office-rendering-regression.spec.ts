import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const readSource = (relativePath: string) => {
  return readFileSync(join(process.cwd(), relativePath), 'utf8')
}

describe('office rendering regressions', () => {
  it('keeps DOCX fidelity-first paths as explicit opt-in features', () => {
    const source = readSource('packages/core/src/renderers/wordDocx.ts')

    expect(source).toContain("context?.options?.docx?.worker === true")
    expect(source).toContain("context?.options?.docx?.progressive === true")
    expect(source).toContain("context?.options?.docx?.visualPagination === true")
  })

  it('prevents spreadsheet sheet tabs from being compressed when many sheets exist', () => {
    const source = readSource('packages/core/src/renderers/spreadsheet.ts')

    expect(source).toContain("context?.options?.spreadsheet?.worker !== true")
    expect(source).toContain('.excel-wrapper .btn-group{min-width:0;max-width:100%;flex:1 1 auto;')
    expect(source).toContain('.excel-wrapper .sheet-tab{flex:0 0 auto;width:max-content;')
    expect(source).toContain('overflow-x:auto;overflow-y:hidden')
  })
})
