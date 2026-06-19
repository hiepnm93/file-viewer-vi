import { describe, expect, it } from 'vitest'
import {
  createArchiveCacheKey,
  flattenArchiveObject,
  formatBytes,
  isArchiveExtension,
  isPreviewableArchiveEntry
} from './helpers/archiveShared'

const mockFile = (name: string, size: number) => ({
  name,
  size,
  lastModified: 1700000000000,
  extract: async () => new File(['sample'], name)
})

describe('archive shared helpers', () => {
  it('flattens nested libarchive file objects and marks previewable entries', () => {
    const entries = flattenArchiveObject({
      docs: {
        'contract.pdf': mockFile('contract.pdf', 1024),
        'raw.bin': mockFile('raw.bin', 2048)
      },
      'mail.eml': mockFile('mail.eml', 512)
    })

    expect(entries.map(entry => entry.path)).toEqual([
      'docs/contract.pdf',
      'docs/raw.bin',
      'mail.eml'
    ])
    expect(entries.find(entry => entry.name === 'contract.pdf')?.previewable).toBe(true)
    expect(entries.find(entry => entry.name === 'raw.bin')?.previewable).toBe(false)
    expect(entries.find(entry => entry.name === 'mail.eml')?.previewable).toBe(true)
  })

  it('detects archive and nested-preview extensions', () => {
    expect(isArchiveExtension('ZIP')).toBe(true)
    expect(isArchiveExtension('txt')).toBe(false)
    expect(isPreviewableArchiveEntry('folder/board.dra')).toBe(true)
    expect(isPreviewableArchiveEntry('folder/archive.7z')).toBe(true)
  })

  it('builds stable cache keys using archive and entry metadata', () => {
    const [entry] = flattenArchiveObject({
      'contract.pdf': mockFile('contract.pdf', 1024)
    })

    expect(createArchiveCacheKey('demo.zip', 4096, entry)).toBe(
      'archive-entry:demo.zip:4096:contract.pdf:1024:1700000000000'
    )
  })

  it('formats bytes for archive UI labels', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(1536)).toBe('1.5 KB')
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB')
  })
})
