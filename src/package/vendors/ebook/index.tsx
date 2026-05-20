import { createApp, defineAsyncComponent } from 'vue'

const EpubViewer = defineAsyncComponent(() => import('./EpubViewer.vue'))

/**
 * 渲染 EPUB 电子书。
 *
 * EPUB 的目录、分页和资源解析交给 epubjs；适配层只负责在命中 `.epub`
 * 时按需挂载阅读器，避免电子书依赖影响文档、图片、代码等轻量预览。
 */
export default async function renderEpub(buffer: ArrayBuffer, target: HTMLDivElement) {
  const app = createApp({
    render: () => <EpubViewer data={buffer} />
  })
  app.mount(target)
  return app
}
