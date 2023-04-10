import type { App } from 'vue'
import { createApp, defineAsyncComponent } from 'vue'
import 'handsontable/dist/handsontable.full.min.css'
// 注册中文
import { registerLanguageDictionary, zhCN } from 'handsontable/i18n'

registerLanguageDictionary(zhCN)

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
