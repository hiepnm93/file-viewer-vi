// 异步模块加载
import type { Options, renderAsync } from 'docx-preview'

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

/**
 * 渲染mp4
 */
export default async function(buffer: ArrayBuffer, target: HTMLDivElement) {
  const { defaultOptions, renderAsync } = await loadLibrary()
  const docxOptions = Object.assign(defaultOptions, {
    debug: true,
    experimental: true
  })
  await renderAsync(buffer, target, undefined, docxOptions)
}
