import {
  normalizeSource,
  renderFileViewerHandler,
  type FileRenderHandlerRendererSession,
} from '@file-viewer/core'
import { vueRendererDispatcher, vueRendererRegistry } from '@/package/vendors/renders'
import type { FileRenderContext, Rendered } from '@/package/common/type'

export function getExtend(name: string) {
  const dot = name.lastIndexOf('.')
  return name.substring(dot + 1)
}

export async function render(buffer: ArrayBuffer, type: string, target: HTMLDivElement, context?: FileRenderContext) {
  const renderer = vueRendererRegistry.getByExtension(type)
  if (renderer?.load) {
    const session = await renderer.load({
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
    return session.rendered
  }

  return renderFileViewerHandler({
    dispatcher: vueRendererDispatcher,
    buffer,
    target,
    type,
    context
  })
}
