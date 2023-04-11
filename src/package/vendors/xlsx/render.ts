import Handsontable from 'handsontable'
import type { baseRenderer } from 'handsontable/renderers'
import 'handsontable/dist/handsontable.full.min.css'
import { registerLanguageDictionary, zhCN } from 'handsontable/i18n'

// 注册中文
registerLanguageDictionary(zhCN)

// 上下文对象
export const context = {
  selection: {
    style: {},
    ranges: []
  }
}

// 定义具体的渲染器
const styleRender: typeof baseRenderer = function(instance, TD, row, col, prop, value, cell) {
  Handsontable.renderers.getRenderer('text')(instance, TD, row, col, prop, value, cell)
  if (cell.style) {
    const style: any = TD.style
    Object.assign(style, cell.style)
  }
}

// 注册自定义渲染
Handsontable.renderers.registerRenderer('styleRender', styleRender)
