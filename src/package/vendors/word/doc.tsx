import type { App } from 'vue'
import { createApp, defineAsyncComponent } from 'vue'


// 导入异步组件
const DocViewer = defineAsyncComponent(() => import('./DocViewer.vue'))

/**
 * 渲染doc文件
 */
export default async function render(buffer: ArrayBuffer, target: HTMLDivElement): Promise<App> {
  const app = createApp({
    render: () => <DocViewer data={buffer} />
  })
  app.mount(target)
  return app
}
