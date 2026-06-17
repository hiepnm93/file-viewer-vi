import { vueRendererDispatcher } from "@/package/vendors/renders";
import type { FileRenderContext } from '@/package/common/type'

export function getExtend(name: string) {
  const dot = name.lastIndexOf('.')
  return name.substring(dot + 1);
}

export async function render(buffer: ArrayBuffer, type: string, target: HTMLDivElement, context?: FileRenderContext) {
  const normalizedType = type.toLowerCase()
  const handler = vueRendererDispatcher.resolve(normalizedType)
  if (handler) {
    return handler(buffer, target, normalizedType, context);
  }
}
