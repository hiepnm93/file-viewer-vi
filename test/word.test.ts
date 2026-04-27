import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { defaultMsDocCss, parseMsDocToHtml } from 'msdoc-viewer'

function loadFixture(name: string): ArrayBuffer {
  const buffer = readFileSync(join(__dirname, name))
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
}

describe('doc renderer smoke test', () => {
  it('parses doc fixtures into html and css output', async () => {
    const result = await parseMsDocToHtml(loadFixture('test.doc'), {
      renderOptions: {
        css: defaultMsDocCss()
      }
    })

    expect(result.html).toContain('三晋先锋隐私协议')
    expect(result.css.length).toBeGreaterThan(100)
    expect(Array.isArray(result.warnings)).toBe(true)
  })
})
