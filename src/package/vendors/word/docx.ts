// 异步模块加载
import type { Options, renderAsync } from 'docx-preview'
import { applyPrintPageSize, buildPrintPageStyle, formatCssPixels, getElementPrintPageSize } from '@/package/common/printLayout'
import type { PrintPageSize } from '@/package/common/printLayout'
import type { AppWrapper, FileRenderContext } from '@/package/common/type'

const DOCX_FULL_RENDER_XML_LIMIT = 2 * 1024 * 1024

const DOCX_DEFAULT_PAGE_SIZE: PrintPageSize = {
  width: 794,
  height: 1123
}

type DocxZipFile = {
  async: (type: 'string') => Promise<string>;
  _data?: {
    uncompressedSize?: number;
  };
}

type DocxPreflight = {
  documentXmlBytes: number;
  documentFile: DocxZipFile | null;
}

const loadLibrary = (() => {
  const loader = {
    module: null as null | Promise<{defaultOptions: Options, renderAsync: typeof renderAsync}>,
    async load() {
      if (!this.module) {
        this.module = import('docx-preview');
      }
      return this.module;
    }
  }
  return async () => {
    return await loader.load();
  }
})()

const DOCX_RESPONSIVE_CSS = `
.docx-fit-viewer {
  box-sizing: border-box;
  height: 100%;
  overflow: auto;
  background: #ececec;
}
.docx-fit-viewer .docx-wrapper {
  box-sizing: border-box;
  min-width: 0 !important;
  width: 100% !important;
  padding: 24px 14px 40px !important;
  background: #e7e9ec !important;
}
.docx-fit-viewer .docx-page-frame {
  position: relative;
  width: 100%;
  min-width: 0;
  margin: 0 auto 24px;
  overflow: visible;
}
.docx-fit-viewer .docx-page-frame > section.docx {
  position: absolute;
  top: 0;
  left: 50%;
  margin: 0 !important;
  background: #ffffff !important;
  box-shadow: 0 2px 14px rgba(25, 35, 48, 0.18);
  box-sizing: border-box;
  color: #111827;
  overflow: hidden;
  transform-origin: top center;
}
`

const DOCX_LIGHTWEIGHT_CSS = `
.docx-light-viewer {
  box-sizing: border-box;
  min-height: 100%;
  padding: 24px 14px 40px;
  background: #e7e9ec;
  color: #162033;
  font-family: "Microsoft YaHei", "PingFang SC", "Segoe UI", Arial, sans-serif;
}
.docx-light-page {
  box-sizing: border-box;
  width: min(100%, 820px);
  margin: 0 auto;
  padding: 42px 48px 56px;
  border-radius: 4px;
  background: #ffffff;
  box-shadow: 0 2px 14px rgba(25, 35, 48, 0.18);
}
.docx-light-notice {
  margin: 0 0 28px;
  padding: 16px 18px;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  background: #eff6ff;
  color: #1d4ed8;
  line-height: 1.7;
}
.docx-light-notice strong {
  display: block;
  margin-bottom: 4px;
  color: #1e3a8a;
  font-size: 16px;
}
.docx-light-title {
  margin: 0 0 24px;
  color: #111827;
  font-size: 26px;
  line-height: 1.35;
}
.docx-light-paragraph {
  margin: 0 0 12px;
  color: #243244;
  font-size: 15px;
  line-height: 1.85;
  white-space: pre-wrap;
}
.docx-light-table-wrap {
  margin: 20px 0;
  overflow-x: auto;
}
.docx-light-table {
  width: 100%;
  border-collapse: collapse;
  color: #243244;
  font-size: 14px;
}
.docx-light-table td {
  min-width: 96px;
  padding: 8px 10px;
  border: 1px solid #d7dee8;
  vertical-align: top;
  line-height: 1.6;
}
@media (max-width: 720px) {
  .docx-light-viewer {
    padding: 14px 8px 28px;
  }
  .docx-light-page {
    padding: 28px 22px 38px;
  }
}
`

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const formatBytes = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '未知大小'
  }
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }
  return `${Math.ceil(bytes / 1024)} KB`
}

const collectElementsByLocalName = (root: ParentNode, localName: string) => {
  return Array.from(root.querySelectorAll('*')).filter(element => element.localName === localName)
}

const getDirectElementChildren = (node: Element) => {
  return Array.from(node.childNodes).filter((child): child is Element => child.nodeType === Node.ELEMENT_NODE)
}

const getElementText = (node: Node): string => {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || ''
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return ''
  }

  const element = node as Element
  if (element.localName === 'tab') {
    return '  '
  }
  if (element.localName === 'br' || element.localName === 'cr') {
    return '\n'
  }

  return Array.from(element.childNodes).map(getElementText).join('')
}

const normalizeExtractedText = (text: string) => {
  return text
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const renderLightweightTable = (table: Element) => {
  const rows = collectElementsByLocalName(table, 'tr')
    .map(row => {
      const cells = collectElementsByLocalName(row, 'tc')
        .map(cell => `<td>${escapeHtml(normalizeExtractedText(getElementText(cell)))}</td>`)
        .join('')
      return cells ? `<tr>${cells}</tr>` : ''
    })
    .filter(Boolean)

  if (!rows.length) {
    return ''
  }

  return `<div class="docx-light-table-wrap"><table class="docx-light-table"><tbody>${rows.join('')}</tbody></table></div>`
}

const buildLightweightDocxHtml = (xml: string, xmlBytes: number, filename?: string) => {
  const parser = new DOMParser()
  const documentXml = parser.parseFromString(xml, 'application/xml')
  const body = collectElementsByLocalName(documentXml, 'body')[0]
  const blocks: string[] = []

  if (body) {
    getDirectElementChildren(body).forEach(child => {
      if (child.localName === 'p') {
        const text = normalizeExtractedText(getElementText(child))
        if (text) {
          blocks.push(`<p class="docx-light-paragraph">${escapeHtml(text)}</p>`)
        }
      } else if (child.localName === 'tbl') {
        const table = renderLightweightTable(child)
        if (table) {
          blocks.push(table)
        }
      }
    })
  }

  const title = filename ? escapeHtml(filename) : 'Word 文档'
  const notice = `原始 DOCX 的正文 XML 达到 ${formatBytes(xmlBytes)}，完整高保真渲染可能导致浏览器长时间无响应。已自动切换为轻量可读预览，保留正文、段落和表格内容；需要原始版式时请下载文件或提高 options.docx.maxFullRenderXmlBytes。`
  const content = blocks.length
    ? blocks.join('')
    : '<p class="docx-light-paragraph">未能从该 DOCX 中提取可读正文。</p>'

  return `<style>${DOCX_LIGHTWEIGHT_CSS}</style><div class="docx-light-viewer"><article class="docx-light-page"><div class="docx-light-notice"><strong>已启用轻量 DOCX 预览</strong>${escapeHtml(notice)}</div><h1 class="docx-light-title">${title}</h1>${content}</article></div>`
}

async function inspectDocx(buffer: ArrayBuffer): Promise<DocxPreflight> {
  const { default: JSZip } = await import('jszip')
  const zip = await JSZip.loadAsync(buffer)
  const documentFile = zip.file('word/document.xml') as DocxZipFile | null
  const documentXmlBytes = documentFile?._data?.uncompressedSize || 0
  return {
    documentXmlBytes,
    documentFile
  }
}

const shouldUseLightweightPreview = (preflight: DocxPreflight, context?: FileRenderContext) => {
  const options = context?.options?.docx
  if (options?.lightweightFallback === false) {
    return false
  }

  const limit = options?.maxFullRenderXmlBytes ?? DOCX_FULL_RENDER_XML_LIMIT
  return Number.isFinite(limit) && preflight.documentXmlBytes > limit
}

function installResponsiveStyle(target: HTMLDivElement) {
  const style = document.createElement('style')
  style.textContent = DOCX_RESPONSIVE_CSS
  target.prepend(style)
  return style
}

function clonePageShell(section: HTMLElement, article: HTMLElement, pageHeight: number) {
  const nextPage = section.cloneNode(false) as HTMLElement
  nextPage.innerHTML = ''
  nextPage.dataset.docxPaginated = 'true'
  nextPage.style.minHeight = `${pageHeight}px`
  nextPage.style.height = `${pageHeight}px`
  nextPage.style.overflow = 'hidden'

  const nextArticle = article.cloneNode(false) as HTMLElement
  nextPage.appendChild(nextArticle)

  Array.from(section.children).forEach(child => {
    if (child !== article) {
      nextPage.appendChild(child.cloneNode(true))
    }
  })

  return { page: nextPage, article: nextArticle }
}

function getDocxPageHeight(section: HTMLElement) {
  const style = window.getComputedStyle(section)
  const minHeight = parseFloat(style.minHeight)
  return Number.isFinite(minHeight) && minHeight > 0 ? minHeight : section.offsetHeight
}

function paginateOversizedSections(target: HTMLDivElement) {
  const wrapper = target.querySelector('.docx-wrapper')
  if (!wrapper) {
    return
  }

  Array.from(wrapper.children).forEach(child => {
    if (!(child instanceof HTMLElement) || !child.matches('section.docx')) {
      return
    }

    const article = child.querySelector(':scope > article')
    if (!(article instanceof HTMLElement)) {
      return
    }

    const pageHeight = getDocxPageHeight(child)
    const originalNodes = Array.from(article.childNodes)
    if (!pageHeight || originalNodes.length < 2 || child.scrollHeight <= pageHeight * 1.15) {
      return
    }

    // docx-preview 只能按已有分页符拆页；没有分页符的长文档需要在预览层补一层视觉分页。
    let current = clonePageShell(child, article, pageHeight)
    child.before(current.page)

    originalNodes.forEach(node => {
      current.article.appendChild(node)

      if (current.page.scrollHeight <= pageHeight + 1 || current.article.childNodes.length === 1) {
        return
      }

      current.article.removeChild(node)
      current = clonePageShell(child, article, pageHeight)
      child.before(current.page)
      current.article.appendChild(node)
    })

    child.remove()
  })
}

function wrapDocxPages(target: HTMLDivElement) {
  const wrapper = target.querySelector('.docx-wrapper')
  if (!wrapper) {
    return []
  }

  return Array.from(wrapper.children).flatMap(child => {
    if (!(child instanceof HTMLElement) || !child.matches('section.docx')) {
      return []
    }

    const frame = document.createElement('div')
    frame.className = 'docx-page-frame'
    child.before(frame)
    frame.appendChild(child)
    return [frame]
  })
}

function makeDocxResponsive(target: HTMLDivElement) {
  target.classList.add('docx-fit-viewer')
  const style = installResponsiveStyle(target)
  paginateOversizedSections(target)
  const frames = wrapDocxPages(target)
  let resizeFrame = 0

  const resize = () => {
    window.cancelAnimationFrame(resizeFrame)
    resizeFrame = window.requestAnimationFrame(() => {
      frames.forEach(frame => {
        const page = frame.firstElementChild
        if (!(page instanceof HTMLElement)) {
          return
        }

        page.style.transform = 'translateX(-50%)'

        const pageWidth = page.offsetWidth
        const pageHeight = page.offsetHeight
        if (!pageWidth || !pageHeight) {
          return
        }
        const availableWidth = Math.max(frame.clientWidth - 8, 120)
        const scale = Math.min(1, Math.max(0.24, availableWidth / pageWidth))

        page.style.transform = `translateX(-50%) scale(${scale})`
        frame.style.height = `${Math.ceil(pageHeight * scale)}px`
      })
    })
  }

  const observer = new ResizeObserver(resize)
  observer.observe(target)
  frames.forEach(frame => observer.observe(frame))
  resize()

  return () => {
    window.cancelAnimationFrame(resizeFrame)
    observer.disconnect()
    style.remove()
    target.classList.remove('docx-fit-viewer')
  }
}

function getDocxPageElement(frame: HTMLElement) {
  const page = frame.firstElementChild
  return page instanceof HTMLElement ? page : null
}

function getDocxFramePrintSize(frame: HTMLElement | undefined) {
  const page = frame ? getDocxPageElement(frame) : null
  return page ? getElementPrintPageSize(page, DOCX_DEFAULT_PAGE_SIZE) : DOCX_DEFAULT_PAGE_SIZE
}

function normalizeDocxPageForPrint(frame: HTMLElement, pageSize: PrintPageSize) {
  const pageWidth = formatCssPixels(pageSize.width)
  const pageHeight = formatCssPixels(pageSize.height)

  applyPrintPageSize(frame, pageSize)
  frame.style.margin = '0 auto 18px'

  const page = getDocxPageElement(frame)
  if (!page) {
    return
  }

  page.style.position = 'relative'
  page.style.top = 'auto'
  page.style.left = 'auto'
  page.style.width = pageWidth
  page.style.maxWidth = 'none'
  page.style.minHeight = pageHeight
  page.style.height = pageHeight
  page.style.margin = '0 auto'
  page.style.transform = 'none'
  page.style.transformOrigin = 'top left'
  page.style.overflow = 'hidden'
  page.style.boxShadow = 'none'
}

function buildDocxPrintStyle(target: HTMLDivElement) {
  const firstFrame = target.querySelector<HTMLElement>('.docx-page-frame')
  const pageSize = getDocxFramePrintSize(firstFrame || undefined)

  return buildPrintPageStyle({
    selector: '.viewer-export-content .docx-page-frame',
    width: pageSize.width,
    height: pageSize.height
  })
}

function buildLightweightDocxPrintStyle() {
  return `
@page {
  size: A4;
  margin: 14mm;
}
.viewer-export-content .docx-light-viewer {
  padding: 0 !important;
  background: #ffffff !important;
}
.viewer-export-content .docx-light-page {
  width: auto !important;
  margin: 0 !important;
  padding: 0 !important;
  box-shadow: none !important;
}
.viewer-export-content .docx-light-notice {
  display: none !important;
}
`
}

function prepareDocxCloneForExport(target: HTMLDivElement) {
  const liveFrames = Array.from(target.querySelectorAll<HTMLElement>('.docx-page-frame'))
  const clone = target.cloneNode(true) as HTMLElement
  const printDocument = document.createElement('div')
  printDocument.className = 'docx-print-document'
  const scopedStyles = Array.from(clone.querySelectorAll('style'))
    .filter(style => !style.textContent?.includes('.docx-fit-viewer'))
    .map(style => style.outerHTML)
    .join('')

  clone.querySelectorAll<HTMLElement>('.docx-page-frame').forEach((frame, index) => {
    normalizeDocxPageForPrint(frame, getDocxFramePrintSize(liveFrames[index]))
    printDocument.appendChild(frame.cloneNode(true))
  })

  return printDocument.childElementCount ? `${scopedStyles}${printDocument.outerHTML}` : clone.innerHTML
}

async function renderLightweightDocx(
  preflight: DocxPreflight,
  target: HTMLDivElement,
  context?: FileRenderContext
): Promise<AppWrapper> {
  if (!preflight.documentFile) {
    throw new Error('DOCX 缺少 word/document.xml，无法提取正文')
  }

  const xml = await preflight.documentFile.async('string')
  target.innerHTML = buildLightweightDocxHtml(xml, preflight.documentXmlBytes, context?.filename)
  context?.registerExportAdapter?.({
    includeDocumentStyles: false,
    printStyle: () => buildLightweightDocxPrintStyle(),
    toHtml: () => target.innerHTML
  })

  return {
    $el: target,
    unmount() {
      context?.registerExportAdapter?.(null)
      target.innerHTML = ''
    }
  }
}

/**
 * 渲染docx文件
 */
export default async function(buffer: ArrayBuffer, target: HTMLDivElement, context?: FileRenderContext): Promise<AppWrapper> {
  const preflight = await inspectDocx(buffer)
  if (shouldUseLightweightPreview(preflight, context)) {
    return renderLightweightDocx(preflight, target, context)
  }

  const { defaultOptions, renderAsync } = await loadLibrary()
  const docxOptions: Options = {
    ...defaultOptions,
    // Word 会写入 autoSpaceDN/autoSpaceDE 等兼容标签；生产预览保持静默，避免 docx-preview 调试告警刷屏。
    debug: false,
    experimental: true
  }
  await renderAsync(buffer, target, undefined, docxOptions)
  const disposeResponsive = makeDocxResponsive(target)
  context?.registerExportAdapter?.({
    includeDocumentStyles: false,
    beforeSnapshot: () => {
      window.dispatchEvent(new Event('resize'))
    },
    printStyle: () => buildDocxPrintStyle(target),
    toHtml: () => prepareDocxCloneForExport(target)
  })

  return {
    $el: target,
    unmount() {
      context?.registerExportAdapter?.(null)
      disposeResponsive()
      target.innerHTML = ''
    }
  }
}
