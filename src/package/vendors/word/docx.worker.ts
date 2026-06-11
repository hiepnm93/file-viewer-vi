import type { Options } from 'docx-preview'
import { renderAsync } from 'docx-preview'
import { DOMParser, XMLSerializer } from '@xmldom/xmldom'
import { parseHTML } from 'linkedom'

type DocxWorkerRequest = {
  id: number;
  buffer: ArrayBuffer;
  options: Partial<Options>;
}

type DocxWorkerSuccess = {
  id: number;
  ok: true;
  html: string;
}

type DocxWorkerFailure = {
  id: number;
  ok: false;
  message: string;
  stack?: string;
}

type DocxWorkerResponse = DocxWorkerSuccess | DocxWorkerFailure;

type DocxWorkerScope = {
  addEventListener(type: 'message', listener: (event: MessageEvent<DocxWorkerRequest>) => void): void;
  postMessage(message: DocxWorkerResponse): void;
}

const ctx = self as unknown as DocxWorkerScope

const getFirstElementChild = function(this: { childNodes?: NodeListOf<ChildNode> }) {
  const nodes = this.childNodes
  if (!nodes) {
    return null
  }

  for (let index = 0; index < nodes.length; index += 1) {
    const child = typeof nodes.item === 'function' ? nodes.item(index) : nodes[index]
    if (child?.nodeType === 1) {
      return child
    }
  }

  return null
}

const ensureFirstElementChild = (node: unknown) => {
  if (!node || typeof node !== 'object') {
    return
  }

  const prototype = Object.getPrototypeOf(node)
  if (!prototype || Object.prototype.hasOwnProperty.call(prototype, 'firstElementChild')) {
    return
  }

  Object.defineProperty(prototype, 'firstElementChild', {
    configurable: true,
    get: getFirstElementChild
  })
}

class BrowserLikeXmlDomParser extends DOMParser {
  parseFromString(source: string, mimeType: string) {
    const xmlDocument = super.parseFromString(source, mimeType)
    ensureFirstElementChild(xmlDocument)
    ensureFirstElementChild(xmlDocument.documentElement)
    return xmlDocument
  }
}

const toErrorPayload = (id: number, error: unknown): DocxWorkerFailure => {
  if (error instanceof Error) {
    return {
      id,
      ok: false,
      message: error.message,
      stack: error.stack
    }
  }

  return {
    id,
    ok: false,
    message: String(error)
  }
}

const installDomRuntime = () => {
  const { window } = parseHTML('<!doctype html><html><head></head><body></body></html>')
  const runtime = globalThis as any

  runtime.window = window
  runtime.document = window.document
  // docx-preview relies on browser XML namespace semantics where
  // `<w:body>` has `localName === "body"`. linkedom keeps the prefix in
  // `localName`, so XML parsing must use xmldom while HTML output uses linkedom.
  runtime.DOMParser = BrowserLikeXmlDomParser
  runtime.Node = window.Node
  runtime.Element = window.Element
  runtime.HTMLElement = window.HTMLElement
  runtime.DocumentFragment = window.DocumentFragment
  runtime.XMLSerializer = XMLSerializer

  return window.document
}

const renderDocxToHtml = async (request: DocxWorkerRequest) => {
  const document = installDomRuntime()
  const styleContainer = document.createElement('div')
  const bodyContainer = document.createElement('div')

  document.body.appendChild(styleContainer)
  document.body.appendChild(bodyContainer)

  await renderAsync(request.buffer, bodyContainer as unknown as HTMLElement, styleContainer as unknown as HTMLElement, {
    ...request.options,
    // Tab stop calculation depends on browser layout APIs and cannot be trusted in Worker DOM.
    experimental: false,
    // Worker 渲染结束后会立刻释放运行时，图片/字体必须内联，不能依赖 Blob URL 生命周期。
    useBase64URL: true
  })

  return `${styleContainer.innerHTML}${bodyContainer.innerHTML}`
}

ctx.addEventListener('message', async (event: MessageEvent<DocxWorkerRequest>) => {
  const request = event.data as DocxWorkerRequest

  try {
    const html = await renderDocxToHtml(request)
    ctx.postMessage({
      id: request.id,
      ok: true,
      html
    } satisfies DocxWorkerResponse)
  } catch (error) {
    ctx.postMessage(toErrorPayload(request.id, error) satisfies DocxWorkerResponse)
  }
})
