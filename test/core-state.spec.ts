import { describe, expect, it } from 'vitest'
import {
  DEFAULT_FILE_VIEWER_STATE_THEME,
  DEFAULT_FILE_VIEWER_UNSUPPORTED_DESCRIPTION,
  FILE_VIEWER_PREVIEW_MESSAGES,
  createFileViewerEmptyState,
  createFileViewerErrorState,
  createFileViewerLoadingState,
  createFileViewerReadyState,
  createFileViewerUnsupportedState,
  formatFileViewerErrorMessage,
  normalizeFileViewerErrorMessage
} from '../packages/core/src'

describe('@file-viewer/core render state helpers', () => {
  it('keeps preview process messages framework-neutral', () => {
    expect(FILE_VIEWER_PREVIEW_MESSAGES).toEqual({
      downloading: '正在下载文件资源...',
      streamingPdf: '正在建立 PDF 流式预览...',
      reading: '正在解析文件内容...'
    })
  })

  it('creates loading and ready descriptors with stable theme semantics', () => {
    expect(createFileViewerLoadingState('PDF', FILE_VIEWER_PREVIEW_MESSAGES.streamingPdf)).toMatchObject({
      state: 'loading',
      extension: 'pdf',
      title: DEFAULT_FILE_VIEWER_STATE_THEME.label,
      message: FILE_VIEWER_PREVIEW_MESSAGES.streamingPdf,
      description: DEFAULT_FILE_VIEWER_STATE_THEME.hint,
      recoverable: false
    })

    expect(createFileViewerReadyState('.Docx')).toMatchObject({
      state: 'ready',
      extension: 'docx',
      title: '预览完成',
      recoverable: false
    })
  })

  it('creates empty and unsupported descriptors for wrapper fallback UI', () => {
    expect(createFileViewerEmptyState()).toMatchObject({
      state: 'empty',
      extension: '',
      title: '暂无文件',
      recoverable: true
    })

    expect(createFileViewerUnsupportedState('foo')).toMatchObject({
      state: 'unsupported',
      extension: 'foo',
      title: '暂不支持在线预览',
      message: '不支持.foo格式的在线预览，请下载后预览或转换为支持的格式。',
      description: DEFAULT_FILE_VIEWER_UNSUPPORTED_DESCRIPTION,
      recoverable: true
    })
  })

  it('normalizes error messages and descriptors consistently', () => {
    expect(normalizeFileViewerErrorMessage(new Error('boom'))).toBe('boom')
    expect(formatFileViewerErrorMessage('打印失败', new Error('窗口被拦截'))).toBe('打印失败：窗口被拦截')
    expect(createFileViewerErrorState('pdf', new Error('加载失败'))).toMatchObject({
      state: 'error',
      extension: 'pdf',
      title: '预览失败',
      message: '加载失败',
      recoverable: true
    })
  })
})
