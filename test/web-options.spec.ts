import { describe, expect, it } from 'vitest'
import { buildViewerSrc } from '../packages/web/src/index'

describe('viewer iframe options', () => {
  it('serializes runtime options into the viewer URL', () => {
    const src = buildViewerSrc({
      viewerUrl: '/file-viewer/index.html',
      url: '/files/archive.zip',
      options: {
        toolbar: true,
        watermark: {
          text: '内部预览',
          opacity: 0.14
        },
        archive: {
          workerUrl: '/file-viewer/vendor/libarchive/worker-bundle.js',
          cache: true
        }
      }
    })

    const parsed = new URL(src, 'https://example.com')
    const options = JSON.parse(parsed.searchParams.get('options') || '{}')
    expect(parsed.searchParams.get('url')).toBe('/files/archive.zip')
    expect(options.watermark.text).toBe('内部预览')
    expect(options.archive.cache).toBe(true)
  })
})
