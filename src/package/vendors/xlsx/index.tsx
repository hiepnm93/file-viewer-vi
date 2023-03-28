import ExcelJS from 'exceljs'
import type { App } from 'vue'
import { createApp } from 'vue'
import XlsxTable from './XlsxTable.vue'
import 'handsontable/dist/handsontable.full.min.css'

// 注册中文
import { registerLanguageDictionary, zhCN } from 'handsontable/i18n'

registerLanguageDictionary(zhCN)

/**
 * 渲染excel
 */
export default async function render(buffer: ArrayBuffer, target: HTMLDivElement): Promise<App> {
  const workbook = await new ExcelJS.Workbook().xlsx.load(buffer)
  const app = createApp({
    render: () => <XlsxTable workbook={workbook} />
  })
  app.mount(target)
  return app
}
