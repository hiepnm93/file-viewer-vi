import {
  createFileRenderHandlerRendererSession,
  normalizeSource,
  renderFileViewerHandler,
  type FileRenderHandlerRendererSession,
  type FileRenderContext,
  type FileViewerRenderedInstance as Rendered,
} from '@file-viewer/core'
import { vueRendererDispatcher, vueRendererRegistry } from '@/package/vendors/renders'

export type FileViewerVueRenderSession = FileRenderHandlerRendererSession<Rendered | undefined>

export function getExtend(name: string) {
  const dot = name.lastIndexOf('.')
  return name.substring(dot + 1)
}

export async function renderSession(
  buffer: ArrayBuffer,
  type: string,
  target: HTMLDivElement,
  context?: FileRenderContext
): Promise<FileViewerVueRenderSession> {
  const renderer = vueRendererRegistry.getByExtension(type)
  if (renderer?.load) {
    return await renderer.load({
      source: normalizeSource({
        buffer,
        filename: context?.filename || `preview.${type}`,
        type,
        url: context?.url
      }),
      surface: { container: target },
      options: context?.options || {},
      registerExportAdapter: context?.registerExportAdapter,
      renderContext: context
    }) as FileRenderHandlerRendererSession<Rendered>
  }

  const rendered = await renderFileViewerHandler<Rendered | undefined, HTMLDivElement>({
    dispatcher: vueRendererDispatcher,
    buffer,
    target,
    type,
    context
  })
  return createFileRenderHandlerRendererSession(rendered)
}

export async function render(buffer: ArrayBuffer, type: string, target: HTMLDivElement, context?: FileRenderContext) {
  const session = await renderSession(buffer, type, target, context)
  return session.rendered
}
