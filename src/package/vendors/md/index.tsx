import { readText } from '@/package/common/util'
import { createApp, defineAsyncComponent } from 'vue'

const MarkdownViewer = defineAsyncComponent(() => import('./MarkdownViewer.vue'))

/**
 * 渲染mp4
 */
export default async function(buffer: ArrayBuffer, target: HTMLDivElement) {
  const text = await readText(buffer)
  const app = createApp({
    render: () => <MarkdownViewer data={text} />
  })
  app.mount(target)
  return app
}
