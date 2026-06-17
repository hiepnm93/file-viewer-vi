import { createApp, defineAsyncComponent } from 'vue'
import JSZip from 'jszip'

const OpenDocumentViewer = defineAsyncComponent(() => import('./OpenDocumentViewer.vue'))

const createWrapper = (el: HTMLDivElement) => ({
  $el: el,
  unmount() {
    el.innerHTML = ''
  }
})

const nodeText = (node: Element) => {
  return (node.textContent || '').replace(/\s+/g, ' ').trim()
}

const parseOdf = async (buffer: ArrayBuffer, type: string) => {
  const zip = await JSZip.loadAsync(buffer)
  const content = await zip.file('content.xml')?.async('text')
  if (!content) {
    throw new Error('ODF 文件缺少 content.xml')
  }
  const doc = new DOMParser().parseFromString(content, 'application/xml')
  const parseError = doc.querySelector('parsererror')
  if (parseError) {
    throw new Error(parseError.textContent || 'ODF XML 解析失败')
  }
  if (type === 'odp') {
    const slides = Array.from(doc.getElementsByTagName('draw:page'))
    return slides.map((slide, index) => {
      const blocks = Array.from(slide.getElementsByTagName('text:p'))
        .map(nodeText)
        .filter(Boolean)
      return { title: `第 ${index + 1} 页`, blocks: blocks.length ? blocks : ['该页没有可提取文本'] }
    })
  }
  const blocks = [
    ...Array.from(doc.getElementsByTagName('text:h')).map(nodeText),
    ...Array.from(doc.getElementsByTagName('text:p')).map(nodeText)
  ].filter(Boolean)
  return [{ title: '正文', blocks: blocks.length ? blocks : ['没有提取到可读文本'] }]
}

const renderRtf = async (buffer: ArrayBuffer, target: HTMLDivElement) => {
  const rtfModule = await import('rtf.js/dist/RTFJS.bundle.js')
  const RTFJS = rtfModule.RTFJS || rtfModule.default || rtfModule
  RTFJS.loggingEnabled?.(false)
  const doc = new RTFJS.Document(buffer, {})
  const meta = doc.metadata?.() || {}
  const elements = await doc.render()
  target.innerHTML = ''
  const stage = document.createElement('div')
  stage.className = 'flyfish-rtf-viewer'
  const header = document.createElement('div')
  header.className = 'flyfish-rtf-header'
  header.innerHTML = `<span>RTF</span><strong>${meta.title || 'RTF 文档预览'}</strong>`
  const paper = document.createElement('article')
  paper.className = 'flyfish-rtf-paper'
  elements.forEach((element: HTMLElement) => paper.appendChild(element))
  const style = document.createElement('style')
  style.textContent = `
    .flyfish-rtf-viewer{min-height:100%;padding:28px;overflow:auto;background:#dfe5eb;color:#1f2937}
    .flyfish-rtf-header{width:min(100%,900px);margin:0 auto 18px;padding:18px 22px;border-radius:8px;background:#fff;box-shadow:0 10px 26px rgba(15,23,42,.1)}
    .flyfish-rtf-header span{display:block;color:#0f766e;font-size:12px;font-weight:800}
    .flyfish-rtf-header strong{display:block;margin-top:6px;color:#132235;font-size:24px}
    .flyfish-rtf-paper{width:min(100%,900px);min-height:980px;margin:0 auto;padding:54px 62px;background:#fff;box-shadow:0 16px 38px rgba(15,23,42,.12);line-height:1.75}
    .flyfish-rtf-paper p{margin:0 0 12px}
  `
  stage.appendChild(style)
  stage.appendChild(header)
  stage.appendChild(paper)
  target.appendChild(stage)
  return createWrapper(target)
}

/**
 * RTF / ODF 兼容预览。
 *
 * RTF 走 rtf.js 的 HTML 渲染能力；ODT/ODP 是 ZIP + XML 容器，当前以
 * `content.xml` 中的正文/幻灯片文本为准做只读阅读预览，保持安全和兼容。
 */
export default async function renderOpenDocument(buffer: ArrayBuffer, target: HTMLDivElement, type?: string) {
  const normalizedType = (type || 'odt').toLowerCase()
  if (normalizedType === 'rtf') {
    return renderRtf(buffer, target)
  }
  const pages = await parseOdf(buffer, normalizedType)
  const title = normalizedType === 'odp' ? 'OpenDocument 演示文稿预览' : 'OpenDocument 文档预览'
  const app = createApp({
    render: () => <OpenDocumentViewer type={normalizedType} title={title} pages={pages} />
  })
  app.mount(target)
  return app
}
