<script setup lang='ts'>
import axios from 'axios'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { readBuffer } from '../../common/util'
import type {
  FileRef,
  FileRenderExportAdapter,
  FileRenderExportMode,
  FileViewerBeforeOperation,
  FileViewerLifecycleContext,
  FileViewerLifecyclePhase,
  FileViewerOptions,
  FileViewerOperationContext,
  FileViewerOperationType,
  FileViewerToolbarOptions,
  FileViewerWatermarkOptions,
  Rendered
} from '@/package/common/type'
import { useLoading } from '@/package/use'
import { getExtend, render } from './util'

const props = defineProps<{
  /**
   * 本地二进制输入。优先级高于 `url`。
   *
   * 推荐传入带正确扩展名的 `File`；如果业务侧只有 Blob 或 ArrayBuffer，
   * 请先包装成 `new File([...], 'demo.pdf')`，保证格式识别稳定。
   */
  file?: FileRef,
  /**
   * 远端文件地址。组件会在浏览器内下载该地址，再根据路径里的扩展名选择渲染器。
   *
   * 目标资源必须允许浏览器访问；鉴权或无扩展名下载接口建议由宿主侧先取回，
   * 再通过 `file` 参数传入。
   */
  url?: string
  /**
   * 预览器通用选项。
   *
   * 目前覆盖内置操作栏、水印，以及压缩包内文件预览的缓存/体积限制。
   */
  options?: FileViewerOptions
}>()

const emit = defineEmits<{
  (event: 'load-start', context: FileViewerLifecycleContext): void;
  (event: 'load-complete', context: FileViewerLifecycleContext): void;
  (event: 'unload-start', context: FileViewerLifecycleContext): void;
  (event: 'unload-complete', context: FileViewerLifecycleContext): void;
  (event: 'operation-before', context: FileViewerOperationContext): void;
  (event: 'operation-cancel', context: FileViewerOperationContext): void;
}>()

const PREVIEW_MESSAGE = {
  downloading: '正在下载文件资源...',
  reading: '正在解析文件内容...'
}

const filename = ref('')
const output = ref<HTMLDivElement | null>(null)
const currentFile = ref<File | null>(null)
const currentBuffer = ref<ArrayBuffer | null>(null)

const displayFilename = computed(() => getSourceFilename())
const currentExtend = computed(() => {
  const name = displayFilename.value
  if (!name || !name.includes('.')) {
    return ''
  }
  return getExtend(name).toLowerCase()
})

const normalizedToolbar = computed<FileViewerToolbarOptions>(() => {
  const toolbar = props.options?.toolbar
  if (toolbar === false) {
    return {
      download: false,
      print: false,
      exportHtml: false
    }
  }
  if (toolbar && typeof toolbar === 'object') {
    return {
      download: toolbar.download !== false,
      print: toolbar.print !== false,
      exportHtml: toolbar.exportHtml !== false
    }
  }
  return {
    download: true,
    print: true,
    exportHtml: true
  }
})

const showToolbar = computed(() => {
  const toolbar = normalizedToolbar.value
  return toolbar.download || toolbar.print || toolbar.exportHtml
})

const toolbarDisabled = computed(() => loading.value || !!error.value || !currentBuffer.value)

const normalizedWatermark = computed<FileViewerWatermarkOptions | null>(() => {
  const watermark = props.options?.watermark
  if (!watermark) {
    return null
  }
  if (watermark === true) {
    return {
      enabled: true,
      text: 'Flyfish Viewer'
    }
  }
  if (watermark.enabled === false) {
    return null
  }
  if (!watermark.text && !watermark.image) {
    return null
  }
  return {
    enabled: true,
    ...watermark
  }
})

const {
  loading,
  error,
  message,
  theme: loadingTheme,
  styleVars: loadingVars,
  startLoading,
  setLoadingMessage,
  stopLoading,
  showError,
  clearError,
  resetLoading
} = useLoading(currentExtend)

let activeRendered: Rendered | undefined
let activeExportAdapter: FileRenderExportAdapter | null = null
let activeDocumentContext: FileViewerLifecycleContext | null = null
let renderVersion = 0
let pendingDownloadController: AbortController | null = null
const loadStartedAt = new Map<number, number>()

const lifecycleHookName: Record<FileViewerLifecyclePhase, keyof NonNullable<FileViewerOptions['hooks']>> = {
  'load-start': 'onLoadStart',
  'load-complete': 'onLoadComplete',
  'unload-start': 'onUnloadStart',
  'unload-complete': 'onUnloadComplete'
}

const operationLabels: Record<FileViewerOperationType, string> = {
  download: '下载原始文件',
  print: '打印完整渲染内容',
  'export-html': '导出渲染 HTML'
}

const normalizeFilename = (name: string) => {
  try {
    return decodeURIComponent(name)
  } catch {
    return name
  }
}

const getFilenameFromUrl = (url: string) => {
  const clean = url.split('?')[0]?.split('#')[0] || url
  const tail = clean.substring(clean.lastIndexOf('/') + 1) || clean
  return normalizeFilename(tail)
}

const getSourceFilename = () => {
  if (filename.value) {
    return filename.value
  }
  if (props.file instanceof File && props.file.name) {
    return normalizeFilename(props.file.name)
  }
  if (typeof props.url === 'string' && props.url) {
    return getFilenameFromUrl(props.url)
  }
  return ''
}

const getFilenameExtension = (name: string) => {
  const dot = name.lastIndexOf('.')
  return dot >= 0 ? name.substring(dot + 1).toLowerCase() : ''
}

const toSerializableContext = (
  context: FileViewerLifecycleContext | FileViewerOperationContext
) => {
  const { file: _file, ...serializable } = context
  return {
    ...serializable,
    hasFile: !!context.file
  }
}

const postViewerEvent = (
  type: 'flyfish-viewer:lifecycle' | 'flyfish-viewer:operation',
  event: string,
  context: FileViewerLifecycleContext | FileViewerOperationContext
) => {
  if (typeof window === 'undefined' || window.parent === window) {
    return
  }
  window.parent.postMessage({
    type,
    event,
    payload: toSerializableContext(context)
  }, '*')
}

const buildLifecycleContext = ({
  phase,
  version,
  source,
  file,
  sourceUrl,
  reason
}: {
  phase: FileViewerLifecyclePhase;
  version: number;
  source: FileViewerLifecycleContext['source'];
  file?: File | null;
  sourceUrl?: string;
  reason?: FileViewerLifecycleContext['reason'];
}): FileViewerLifecycleContext => {
  const name = normalizeFilename(file?.name || filename.value || (sourceUrl ? getFilenameFromUrl(sourceUrl) : ''))
  const startedAt = loadStartedAt.get(version)
  const now = Date.now()
  return {
    phase,
    type: getFilenameExtension(name),
    filename: name,
    source,
    url: sourceUrl,
    file: file || undefined,
    size: file?.size ?? currentBuffer.value?.byteLength,
    version,
    timestamp: now,
    duration: phase === 'load-complete' && startedAt ? now - startedAt : undefined,
    reason
  }
}

const notifyLifecycle = (context: FileViewerLifecycleContext) => {
  if (context.phase === 'load-start') {
    emit('load-start', context)
  } else if (context.phase === 'load-complete') {
    emit('load-complete', context)
  } else if (context.phase === 'unload-start') {
    emit('unload-start', context)
  } else {
    emit('unload-complete', context)
  }
  const hook = props.options?.hooks?.[lifecycleHookName[context.phase]]
  if (hook) {
    void Promise.resolve(hook(context)).catch(error => {
      console.error(`FileViewer ${context.phase} hook failed`, error)
    })
  }
  postViewerEvent('flyfish-viewer:lifecycle', context.phase, context)
}

const buildOperationContext = (operation: FileViewerOperationType): FileViewerOperationContext => {
  const base = activeDocumentContext || buildLifecycleContext({
    phase: 'load-complete',
    version: renderVersion,
    source: props.file ? 'file' : (props.url ? 'url' : 'empty'),
    file: currentFile.value,
    sourceUrl: props.url
  })
  const { phase: _phase, ...context } = base
  return {
    ...context,
    operation,
    label: operationLabels[operation],
    timestamp: Date.now()
  }
}

const getToolbarBeforeOperation = (operation: FileViewerOperationType): Array<FileViewerBeforeOperation | undefined> => {
  const toolbar = props.options?.toolbar
  if (!toolbar || typeof toolbar !== 'object') {
    return []
  }
  const specificHook = operation === 'download'
    ? toolbar.beforeDownload
    : operation === 'print'
      ? toolbar.beforePrint
      : toolbar.beforeExportHtml
  return [toolbar.beforeOperation, specificHook]
}

const runBeforeOperation = async (operation: FileViewerOperationType) => {
  const context = buildOperationContext(operation)
  emit('operation-before', context)
  postViewerEvent('flyfish-viewer:operation', 'operation-before', context)

  const hooks = [
    props.options?.beforeOperation,
    ...getToolbarBeforeOperation(operation)
  ]

  try {
    for (const hook of hooks) {
      if (!hook) {
        continue
      }
      const result = await hook(context)
      if (result === false) {
        emit('operation-cancel', context)
        postViewerEvent('flyfish-viewer:operation', 'operation-cancel', context)
        return false
      }
    }
  } catch (nextError) {
    console.error(nextError)
    showError(formatErrorMessage('操作前置校验失败', nextError))
    emit('operation-cancel', context)
    postViewerEvent('flyfish-viewer:operation', 'operation-cancel', context)
    return false
  }

  return true
}

const escapeXml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')

const encodeSvgDataUrl = (svg: string) => {
  return `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`
}

const clampNumber = (value: unknown, fallback: number, min: number, max: number) => {
  const next = typeof value === 'number' && Number.isFinite(value) ? value : fallback
  return Math.min(max, Math.max(min, next))
}

const buildWatermarkSvg = (watermark: FileViewerWatermarkOptions) => {
  const gapX = clampNumber(watermark.gapX, 260, 96, 800)
  const gapY = clampNumber(watermark.gapY, 180, 80, 800)
  const width = clampNumber(watermark.width, watermark.image ? 160 : 220, 32, gapX)
  const height = clampNumber(watermark.height, watermark.image ? 72 : 72, 24, gapY)
  const rotate = clampNumber(watermark.rotate, -24, -75, 75)
  const opacity = clampNumber(watermark.opacity, 0.18, 0.02, 0.8)
  const x = (gapX - width) / 2
  const y = (gapY - height) / 2
  const cx = gapX / 2
  const cy = gapY / 2

  if (watermark.image) {
    const href = escapeXml(watermark.image)
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${gapX}" height="${gapY}" viewBox="0 0 ${gapX} ${gapY}"><g opacity="${opacity}" transform="rotate(${rotate} ${cx} ${cy})"><image href="${href}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet"/></g></svg>`
  }

  const text = escapeXml(watermark.text || 'Flyfish Viewer')
  const fontSize = clampNumber(watermark.fontSize, 20, 10, 72)
  const color = escapeXml(watermark.color || '#355070')
  const fontFamily = escapeXml(watermark.fontFamily || "Aptos, 'Segoe UI', sans-serif")

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${gapX}" height="${gapY}" viewBox="0 0 ${gapX} ${gapY}"><g opacity="${opacity}" transform="rotate(${rotate} ${cx} ${cy})"><text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" fill="${color}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="700">${text}</text></g></svg>`
}

const watermarkStyle = computed(() => {
  const watermark = normalizedWatermark.value
  if (!watermark) {
    return undefined
  }
  return {
    backgroundImage: encodeSvgDataUrl(buildWatermarkSvg(watermark))
  }
})

const watermarkInlineStyle = computed(() => {
  const watermark = normalizedWatermark.value
  if (!watermark) {
    return ''
  }
  return `position:absolute;inset:0;pointer-events:none;background-image:${encodeSvgDataUrl(buildWatermarkSvg(watermark))};background-repeat:repeat;z-index:20;`
})

// 每次开始新的预览任务时都生成一个版本号。
// 所有异步回包都必须校验版本，避免旧任务把新视图覆盖掉。
const createRequestVersion = (reason: FileViewerLifecycleContext['reason'] = 'replace') => {
  renderVersion += 1
  pendingDownloadController?.abort()
  pendingDownloadController = null
  clearRenderedContent(reason)
  currentFile.value = null
  currentBuffer.value = null
  clearError()
  return renderVersion
}

const isCurrentRequest = (version: number) => {
  return version === renderVersion
}

const finishLoading = (version: number) => {
  if (isCurrentRequest(version)) {
    stopLoading()
  }
}

const isAbortError = (nextError: unknown) => {
  if (axios.isCancel(nextError)) {
    return true
  }
  if (nextError instanceof DOMException && nextError.name === 'AbortError') {
    return true
  }
  return typeof nextError === 'object' &&
    nextError !== null &&
    'code' in nextError &&
    nextError.code === 'ERR_CANCELED'
}

const formatErrorMessage = (prefix: string, nextError: unknown) => {
  if (nextError instanceof Error) {
    return `${prefix}：${nextError.message}`
  }
  return `${prefix}：${String(nextError)}`
}

// 统一把 File、Blob、ArrayBuffer 收敛为 File，
// 后续读取和扩展名识别都只面对一种输入类型。
const wrapFileRef = (data: FileRef, nextFilename?: string) => {
  if (data instanceof File) {
    return data
  }

  const safeFilename = normalizeFilename(nextFilename || filename.value || 'preview.bin')

  if (data instanceof Blob) {
    return new File([data], safeFilename, { type: data.type })
  }

  if (data instanceof ArrayBuffer) {
    return new File([data], safeFilename, {})
  }

  throw new Error('不支持的文件类型格式！')
}

// 卸载旧预览实例并清空容器，避免不同预览器残留 DOM 或事件监听。
const clearRenderedContent = (reason: FileViewerLifecycleContext['reason'] = 'replace') => {
  const context = activeDocumentContext
  if (context) {
    notifyLifecycle({
      ...context,
      phase: 'unload-start',
      timestamp: Date.now(),
      reason
    })
  }

  try {
    activeRendered?.unmount?.()
  } catch (nextError) {
    console.warn('预览内容卸载失败', nextError)
  } finally {
    activeRendered = undefined
    activeDocumentContext = null
    activeExportAdapter = null

    const out = output.value
    if (out) {
      while (out.firstChild) {
        out.removeChild(out.firstChild)
      }
    }
  }

  if (context) {
    notifyLifecycle({
      ...context,
      phase: 'unload-complete',
      timestamp: Date.now(),
      reason
    })
  }
}

const registerExportAdapter = (adapter: FileRenderExportAdapter | null) => {
  activeExportAdapter = adapter
}

const mountRenderedContent = async (buffer: ArrayBuffer, file: File, version: number, sourceUrl?: string) => {
  const out = output.value
  if (!out || !isCurrentRequest(version)) {
    return undefined
  }

  clearRenderedContent('replace')

  const child = document.createElement('div')
  child.className = 'file-render'
  out.appendChild(child)

  try {
    const rendered = await render(buffer, getExtend(file.name), child, {
      filename: file.name,
      url: sourceUrl,
      options: props.options,
      registerExportAdapter
    })
    if (!isCurrentRequest(version)) {
      rendered?.unmount?.()
      if (child.parentNode === out) {
        out.removeChild(child)
      }
      return undefined
    }
    return rendered
  } catch (nextError) {
    if (child.parentNode === out) {
      out.removeChild(child)
    }
    throw nextError
  }
}

// 文件读取和渲染拆成一个独立步骤，方便后续给不同来源复用。
const readAndRenderFile = async (
  file: File,
  version: number,
  sourceUrl?: string,
  source: FileViewerLifecycleContext['source'] = sourceUrl ? 'url' : 'file'
) => {
  filename.value = normalizeFilename(file.name || '')
  const arrayBuffer = await readBuffer(file)
  if (!(arrayBuffer instanceof ArrayBuffer) || !isCurrentRequest(version)) {
    return
  }
  currentFile.value = file
  currentBuffer.value = arrayBuffer

  const rendered = await mountRenderedContent(arrayBuffer, file, version, sourceUrl)
  if (!isCurrentRequest(version)) {
    rendered?.unmount?.()
    return
  }
  activeRendered = rendered
  const context = buildLifecycleContext({
    phase: 'load-complete',
    version,
    source,
    file,
    sourceUrl
  })
  activeDocumentContext = context
  notifyLifecycle(context)
  loadStartedAt.delete(version)
}

const previewLocalFile = async (source: FileRef, version: number) => {
  const file = wrapFileRef(source)
  filename.value = normalizeFilename(file.name || '')
  loadStartedAt.set(version, Date.now())
  notifyLifecycle(buildLifecycleContext({
    phase: 'load-start',
    version,
    source: 'file',
    file
  }))
  startLoading(PREVIEW_MESSAGE.reading)

  try {
    await readAndRenderFile(file, version, undefined, 'file')
  } catch (nextError) {
    if (!isCurrentRequest(version)) {
      return
    }
    console.error(nextError)
    showError(formatErrorMessage('读取文件异常', nextError))
  } finally {
    loadStartedAt.delete(version)
    finishLoading(version)
  }
}

// 远端预览额外管理下载控制器，新的请求进来时可以立即中断旧下载。
const previewRemoteFile = async (url: string, version: number) => {
  const nextFilename = getFilenameFromUrl(url)
  filename.value = nextFilename
  loadStartedAt.set(version, Date.now())
  notifyLifecycle(buildLifecycleContext({
    phase: 'load-start',
    version,
    source: 'url',
    sourceUrl: url
  }))
  startLoading(PREVIEW_MESSAGE.downloading)

  const controller = new AbortController()
  pendingDownloadController = controller

  try {
    const { data } = await axios({
      url,
      method: 'get',
      responseType: 'blob',
      signal: controller.signal
    })

    if (!isCurrentRequest(version)) {
      return
    }

    if (!data) {
      showError('文件下载失败')
      return
    }

    setLoadingMessage(PREVIEW_MESSAGE.reading)
    await readAndRenderFile(wrapFileRef(data, nextFilename), version, url, 'url')
  } catch (nextError) {
    if (!isCurrentRequest(version) || isAbortError(nextError)) {
      return
    }
    console.error(nextError)
    showError(formatErrorMessage('加载文件异常', nextError))
  } finally {
    if (pendingDownloadController === controller) {
      pendingDownloadController = null
    }
    loadStartedAt.delete(version)
    finishLoading(version)
  }
}

// 没有输入源时回到干净初始态，避免保留上一份文档的残留信息。
const resetViewer = () => {
  filename.value = ''
  currentFile.value = null
  currentBuffer.value = null
  clearRenderedContent()
  resetLoading()
}

// 统一入口只负责决定“读本地”还是“拉远端”，
// 具体的下载、读取和挂载细节都下沉到独立 helper。
const refreshPreview = async () => {
  const hasSource = !!props.file || !!props.url
  const version = createRequestVersion(hasSource ? 'replace' : 'reset')

  if (props.file) {
    await previewLocalFile(props.file, version)
    return
  }

  if (props.url) {
    await previewRemoteFile(props.url, version)
    return
  }

  resetViewer()
}

const triggerBlobDownload = (blob: Blob, name: string) => {
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = name
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 4000)
}

const replaceCanvasWithImages = (source: HTMLElement, clone: HTMLElement) => {
  const sourceCanvases = Array.from(source.querySelectorAll('canvas'))
  const clonedCanvases = Array.from(clone.querySelectorAll('canvas'))

  clonedCanvases.forEach((canvas, index) => {
    const sourceCanvas = sourceCanvases[index]
    if (!sourceCanvas) {
      return
    }
    try {
      const image = document.createElement('img')
      image.src = sourceCanvas.toDataURL('image/png')
      image.alt = 'rendered canvas'
      image.style.maxWidth = '100%'
      image.style.display = 'block'
      image.style.margin = '0 auto'
      canvas.replaceWith(image)
    } catch {
      // 跨域资源污染过的 canvas 无法导出，只保留原 canvas 占位。
    }
  })
}

const collectDocumentStyles = () => {
  return Array.from(document.querySelectorAll<HTMLStyleElement | HTMLLinkElement>('style, link[rel="stylesheet"]'))
    .map(node => {
      if (node instanceof HTMLStyleElement) {
        return `<style>${node.textContent || ''}</style>`
      }
      if (node.href) {
        return `<link rel="stylesheet" href="${escapeXml(node.href)}" />`
      }
      return ''
    })
    .filter(Boolean)
    .join('\n')
}

const waitForNextPaint = () => {
  return new Promise<void>(resolve => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve())
    })
  })
}

const waitForImages = async (root: HTMLElement) => {
  const images = Array.from(root.querySelectorAll('img'))
  await Promise.all(images.map(async image => {
    if (image.complete) {
      return
    }
    if ('decode' in image) {
      try {
        await image.decode()
        return
      } catch {
        // decode 失败时继续走 load/error 事件，避免单张异常图片阻塞打印。
      }
    }
    await new Promise<void>(resolve => {
      image.addEventListener('load', () => resolve(), { once: true })
      image.addEventListener('error', () => resolve(), { once: true })
    })
  }))
}

const waitForPrintWindowReady = async (printWindow: Window) => {
  const { document: printDocument } = printWindow
  if (printDocument.readyState !== 'complete') {
    await new Promise<void>(resolve => {
      printWindow.addEventListener('load', () => resolve(), { once: true })
      printWindow.setTimeout(() => resolve(), 1200)
    })
  }

  await Promise.all(Array.from(printDocument.images).map(async image => {
    if (image.complete) {
      return
    }
    if ('decode' in image) {
      try {
        await image.decode()
        return
      } catch {
        // 图片解码失败不阻塞打印，浏览器仍会尝试按现有资源输出。
      }
    }
    await new Promise<void>(resolve => {
      image.addEventListener('load', () => resolve(), { once: true })
      image.addEventListener('error', () => resolve(), { once: true })
      printWindow.setTimeout(() => resolve(), 1500)
    })
  }))

  await new Promise<void>(resolve => {
    printWindow.requestAnimationFrame(() => {
      printWindow.requestAnimationFrame(() => resolve())
    })
  })
}

const prepareRenderedContentForSnapshot = async (source: HTMLElement) => {
  await activeExportAdapter?.beforeSnapshot?.()
  await waitForNextPaint()
  await waitForImages(source)
}

const buildExportHtmlDocument = (contentHtml: string, title: string) => {
  const watermark = watermarkInlineStyle.value
    ? `<div class="viewer-export-watermark" style="${watermarkInlineStyle.value}"></div>`
    : ''
  const styles = collectDocumentStyles()

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title}</title>
  ${styles}
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; min-height: 100%; background: #f2f4f7; color: #172033; font-family: Aptos, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif; }
    body { padding: 24px; }
    .viewer-export-shell { position: relative; min-height: calc(100vh - 48px); overflow: visible; background: #f2f4f7; }
    .viewer-export-content { position: relative; z-index: 1; width: 100%; min-height: 100%; overflow: visible; }
    .viewer-export-content .file-render,
    .viewer-export-content .file-viewer,
    .viewer-export-content .viewer-stage,
    .viewer-export-content .content,
    .viewer-export-content .pdf-shell,
    .viewer-export-content .pdf-content,
    .viewer-export-content .pdf-viewport,
    .viewer-export-content .pdf-wrapper,
    .viewer-export-content .docx-fit-viewer,
    .viewer-export-content .docx-wrapper,
    .viewer-export-content .msdoc-stage,
    .viewer-export-content .code-viewer,
    .viewer-export-content .markdown-viewer,
    .viewer-export-content .email-shell,
    .viewer-export-content .archive-shell,
    .viewer-export-content .eda-shell,
    .viewer-export-content .ebook-shell,
    .viewer-export-content .umd-shell,
    .viewer-export-content .drawing-shell,
    .viewer-export-content .audio-shell,
    .viewer-export-content .cad-shell,
    .viewer-export-content .cad-body,
    .viewer-export-content .cad-canvas-wrap,
    .viewer-export-content .dwg-preview-frame {
      position: relative !important;
      inset: auto !important;
      width: 100% !important;
      height: auto !important;
      min-height: 0 !important;
      max-height: none !important;
      overflow: visible !important;
    }
    .viewer-export-content .docx-wrapper {
      display: block !important;
      padding: 0 !important;
      background: transparent !important;
    }
    .viewer-export-content .docx-page-frame,
    .viewer-export-content .msdoc-page {
      position: relative !important;
      width: 100% !important;
      height: auto !important;
      min-height: 0 !important;
      margin: 0 auto 18px !important;
      overflow: visible !important;
      break-after: page;
      page-break-after: always;
    }
    .viewer-export-content .docx-page-frame:last-child,
    .viewer-export-content .msdoc-page:last-child {
      break-after: auto;
      page-break-after: auto;
    }
    .viewer-export-content .docx-page-frame > section.docx {
      position: relative !important;
      top: auto !important;
      left: auto !important;
      max-width: 100% !important;
      margin: 0 auto !important;
      overflow: visible !important;
      transform: none !important;
      box-shadow: none !important;
    }
    .viewer-export-content .msdoc-stage {
      display: block !important;
      padding: 0 !important;
      background: transparent !important;
    }
    .viewer-export-content .msdoc-page > .msdoc-root {
      margin: 0 auto !important;
      box-shadow: none !important;
      overflow: visible !important;
    }
    .viewer-export-content .pdf-toolbar,
    .viewer-export-content .pdf-nav-pane,
    .viewer-export-content .viewer-actions {
      display: none !important;
    }
    .viewer-export-content .pdf-content,
    .viewer-export-content .pdf-shell--nav-hidden .pdf-content,
    .viewer-export-content .cad-body.without-layers {
      display: block !important;
      grid-template-columns: none !important;
    }
    .viewer-export-content .pdfViewer { padding: 0 !important; }
    .viewer-export-content .pdfViewer .page {
      margin: 0 auto 16px !important;
      border: 0 !important;
      box-shadow: none !important;
      break-after: page;
      page-break-after: always;
    }
    .viewer-export-content .pdfViewer .page:last-child {
      break-after: auto;
      page-break-after: auto;
    }
    .viewer-export-content .pdf-export-document {
      display: grid;
      justify-items: center;
      gap: 18px;
      padding: 4px 0;
    }
    .viewer-export-content .pdf-export-page {
      max-width: 100%;
      overflow: hidden;
      background: #ffffff;
      box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
      break-after: page;
      page-break-after: always;
    }
    .viewer-export-content .pdf-export-page:last-child {
      break-after: auto;
      page-break-after: auto;
    }
    .viewer-export-content .pdf-export-page img {
      display: block;
      width: 100%;
      height: auto;
    }
    img, canvas, svg, video { max-width: 100%; }
    @media print {
      @page { margin: 12mm; }
      html, body { min-height: auto; background: #ffffff; }
      body { padding: 0; }
      .viewer-export-shell,
      .viewer-export-content {
        min-height: 0;
        overflow: visible;
        background: #ffffff;
      }
      .viewer-export-content .pdf-export-document {
        display: block;
        padding: 0;
      }
      .viewer-export-content .pdf-export-page {
        width: 100% !important;
        margin: 0 auto;
        overflow: visible;
        box-shadow: none;
      }
      .viewer-export-content .docx-page-frame,
      .viewer-export-content .msdoc-page {
        width: 100% !important;
        margin: 0 auto !important;
      }
      .viewer-export-content .docx-page-frame > section.docx,
      .viewer-export-content .msdoc-page > .msdoc-root {
        width: 100% !important;
        max-width: 100% !important;
        border: 0 !important;
      }
    }
  </style>
</head>
<body>
  <main class="viewer-export-shell">
    <div class="viewer-export-content">${contentHtml}</div>
    ${watermark}
  </main>
</body>
</html>`
}

const buildRenderedHtmlDocument = async (mode: FileRenderExportMode = 'export') => {
  const out = output.value
  if (!out) {
    throw new Error('当前没有可导出的预览内容')
  }

  const title = escapeXml(displayFilename.value || 'file-viewer-preview')
  if (activeExportAdapter?.toHtml) {
    const contentHtml = await activeExportAdapter.toHtml({ mode, title })
    return buildExportHtmlDocument(contentHtml, title)
  }

  await prepareRenderedContentForSnapshot(out)
  const clone = out.cloneNode(true) as HTMLElement
  replaceCanvasWithImages(out, clone)
  return buildExportHtmlDocument(clone.innerHTML, title)
}

const downloadOriginalFile = async () => {
  const buffer = currentBuffer.value
  const file = currentFile.value
  if (!buffer || !file) {
    return
  }
  if (!await runBeforeOperation('download')) {
    return
  }
  triggerBlobDownload(new Blob([buffer], { type: file.type || 'application/octet-stream' }), file.name || 'preview.bin')
}

const exportRenderedHtml = async () => {
  try {
    if (!await runBeforeOperation('export-html')) {
      return
    }
    const html = await buildRenderedHtmlDocument('export')
    const baseName = displayFilename.value || 'preview'
    triggerBlobDownload(new Blob([html], { type: 'text/html;charset=utf-8' }), `${baseName}.rendered.html`)
  } catch (nextError) {
    showError(formatErrorMessage('导出 HTML 失败', nextError))
  }
}

const printRenderedHtml = async () => {
  try {
    if (!await runBeforeOperation('print')) {
      return
    }
    const html = await buildRenderedHtmlDocument('print')
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      throw new Error('浏览器拦截了打印窗口')
    }
    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    await waitForPrintWindowReady(printWindow)
    printWindow.print()
  } catch (nextError) {
    showError(formatErrorMessage('打印失败', nextError))
  }
}

watch([() => props.file, () => props.url], () => {
  void refreshPreview()
}, { immediate: true })

onBeforeUnmount(() => {
  createRequestVersion('component-unmount')
  resetLoading()
})
</script>

<template>
  <div class='file-viewer' :style='loadingVars'>
    <div class='viewer-stage'>
      <div v-if='showToolbar' class='viewer-actions'>
        <button
          v-if='normalizedToolbar.download'
          type='button'
          :disabled='toolbarDisabled'
          title='下载原始文件'
          @click='downloadOriginalFile'
        >
          下载
        </button>
        <button
          v-if='normalizedToolbar.print'
          type='button'
          :disabled='toolbarDisabled'
          title='打印完整渲染内容'
          @click='printRenderedHtml'
        >
          打印
        </button>
        <button
          v-if='normalizedToolbar.exportHtml'
          type='button'
          :disabled='toolbarDisabled'
          title='导出当前渲染后的 HTML'
          @click='exportRenderedHtml'
        >
          HTML
        </button>
      </div>
      <div ref='output' class='content' :class='{ hidden: loading || !!error }' />
      <div v-if='watermarkStyle' class='viewer-watermark' :style='watermarkStyle' />

      <div v-if='loading' class='state-panel loading-panel'>
        <div class='loading-card'>
          <div class='loading-icon'>{{ loadingTheme.badge }}</div>
          <div class='loading-copy'>
            <span class='loading-kicker'>{{ loadingTheme.label }}</span>
            <strong>{{ message }}</strong>
            <p>{{ loadingTheme.hint }}</p>
          </div>
          <span class='loading-ring' />
        </div>
      </div>

      <div v-else-if='error' class='state-panel error-panel'>
        <div class='error-card'>
          <strong>预览失败</strong>
          <p>{{ error }}</p>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.file-viewer {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.viewer-stage {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.viewer-actions {
  position: absolute;
  z-index: 35;
  top: 12px;
  right: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px;
  border-radius: 12px;
  border: 1px solid rgba(20, 35, 53, 0.08);
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 12px 28px rgba(17, 30, 45, 0.1);
  backdrop-filter: blur(12px);
}

.viewer-actions button {
  min-width: 42px;
  height: 30px;
  padding: 0 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #40546a;
  font: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.viewer-actions button:hover:not(:disabled) {
  background: rgba(33, 163, 102, 0.1);
  color: #16774c;
}

.viewer-actions button:disabled {
  color: #aab5c0;
  cursor: not-allowed;
}

.content {
  display: block;
  width: 100%;
  height: 100%;
  overflow: auto;
  background: #f2f2f2;
}

.content.hidden {
  visibility: hidden;
}

.viewer-watermark {
  position: absolute;
  z-index: 20;
  inset: 0;
  pointer-events: none;
  background-repeat: repeat;
}

.state-panel {
  position: absolute;
  z-index: 40;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(246, 248, 249, 0.98));
}

.loading-card,
.error-card {
  width: min(100%, 460px);
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 22px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(19, 36, 55, 0.06);
  box-shadow: 0 18px 42px rgba(15, 31, 47, 0.12);
}

.loading-icon {
  flex-shrink: 0;
  min-width: 70px;
  height: 70px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  background: linear-gradient(135deg, var(--viewer-accent) 0%, var(--viewer-accent) 100%);
  color: #ffffff;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 0.04em;
  box-shadow: 0 14px 30px rgba(17, 28, 40, 0.14);
}

.loading-copy {
  min-width: 0;
  flex: 1;
}

.loading-kicker {
  display: block;
  color: var(--viewer-accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.loading-copy strong,
.error-card strong {
  display: block;
  margin-top: 4px;
  color: #16283b;
  font-size: 20px;
  line-height: 1.2;
}

.loading-copy p,
.error-card p {
  margin: 8px 0 0;
  color: #6a7d90;
  line-height: 1.6;
}

.loading-ring {
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  border-radius: 999px;
  border: 3px solid var(--viewer-soft);
  border-top-color: var(--viewer-accent);
  animation: viewer-spin 0.9s linear infinite;
}

.error-card {
  display: block;
  text-align: center;
}

.error-card strong {
  color: #b42318;
}

@keyframes viewer-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

<style>
.file-render {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}
</style>
