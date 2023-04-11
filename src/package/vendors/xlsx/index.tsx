import type { App } from 'vue'
import { createApp, defineAsyncComponent } from 'vue'


// 导入异步组件
const XlsxTable = defineAsyncComponent(() => import('./XlsxTable.vue'))

/**
 * 渲染excel
 */
export default async function render(buffer: ArrayBuffer, target: HTMLDivElement): Promise<App> {
  const app = createApp({
    render: () => <XlsxTable data={buffer} />
  })
  app.mount(target)
  return app
}
