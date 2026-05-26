import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { parseEdaFile } from '@/package/vendors/eda/parser'

describe('EDA parser', () => {
  it('parses generated OLB CFB fixtures and extracts readable strings', async () => {
    const data = await readFile('public/example/sample.olb')
    const parsed = await parseEdaFile(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength), 'olb')

    expect(parsed.parser).toBe('cfb')
    expect(parsed.type).toBe('olb')
    expect(parsed.streams.some(stream => stream.path.includes('RESISTOR'))).toBe(true)
    expect(parsed.strings.join('\n')).toContain('Demo resistor symbol')
  })

  it('falls back safely for non-CFB DRA data', async () => {
    const buffer = new TextEncoder().encode('DRA fallback fixture with PADSTACK and ROUTE').buffer
    const parsed = await parseEdaFile(buffer, 'dra')

    expect(parsed.parser).toBe('binary')
    expect(parsed.type).toBe('dra')
    expect(parsed.warnings[0]).toContain('不是标准 CFB')
    expect(parsed.strings.join('\n')).toContain('PADSTACK')
  })
})
