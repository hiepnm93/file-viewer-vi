import { renderFileViewerHandler } from '@file-viewer/core'
import { vueRendererDispatcher } from "@/package/vendors/renders";
import type { FileRenderContext } from '@/package/common/type'

export function getExtend(name: string) {
  const dot = name.lastIndexOf('.')
  return name.substring(dot + 1);
}

export async function render(buffer: ArrayBuffer, type: string, target: HTMLDivElement, context?: FileRenderContext) {
  return renderFileViewerHandler({
    dispatcher: vueRendererDispatcher,
    buffer,
    target,
    type,
    context
  })
}
