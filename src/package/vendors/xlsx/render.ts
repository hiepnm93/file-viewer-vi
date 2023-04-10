import Handsontable from 'handsontable'
import type { baseRenderer } from 'handsontable/renderers'
import { camelCase, captain, getColor } from './util'

// 边框类型
export const borders: string[] = ['left', 'right', 'top', 'bottom']

// 主题类型
const themeTypes = ['lt1', 'dk1', 'lt2', 'dk2', 'accent1', 'accent2', 'accent3', 'accent4', 'accent5', 'accent6']

// 主题颜色
let themeColors: string[] = []

// 上下文对象
export const context = {
  // 使用映射的结果写入
  set themeColors(colors: any) {
    themeColors = themeTypes.map((name: string) => colors[name])
  },
  get themeColors() {
    return themeColors
  },
  selection: {
    style: {},
    ranges: []
  }
}

// 单例的解析器
const parser = new DOMParser()

/**
 * 解析主题xml
 * @param xml
 */
export const parseTheme = (xml: string) => {
  const doc = parser.parseFromString(xml, 'text/xml')
  const elements = doc.getElementsByTagName('a:clrScheme')
  const colorNode = elements.item(0)
  if (colorNode) {
    const nodes = colorNode.children
    const colors: any = {}
    for (let i = 0; i < nodes.length; i++) {
      const element = nodes.item(i)
      if (!element) continue
      const content = element.children.item(0)
      if (!content) continue
      let value: string | null
      if (content.tagName === 'a:sysClr') {
        value = content.getAttribute('lastClr')
      } else {
        value = content.getAttribute('val')
      }
      colors[element.tagName.substring(2)] = value || '000000'
    }
    context.themeColors = colors
  }
}

// 定义具体的渲染器
const styleRender: typeof baseRenderer = function(instance, TD, row, col, prop, value, cell) {
  Handsontable.renderers.getRenderer('text')(instance, TD, row, col, prop, value, cell);
  if (cell.style) {
    const { style: { border, fill, font } } = cell
    const style: any = TD.style
    if (font) {
      if (font.bold) style.fontWeight = 'bold'
      if (font.size) style.fontSize = `${font.size}px`
      if (font.color) {
        style.color = getColor(font.color, themeColors)
      }
    }
    if (fill) {
      if (fill.bgColor) {
        style.backgroundColor = getColor(fill.bgColor, themeColors)
      }
      if (fill.fgColor && !style.backgroundColor) {
        style.backgroundColor = getColor(fill.fgColor, themeColors)
      }
    }
    if (border) {
      borders.map(key => ({ key, value: border[key] })).filter(v => v.value).forEach(v => {
        const { key, value: { style: borderStyle } } = v
        const prefix = `border${captain(key)}`
        if (borderStyle === 'thin') {
          style[`${prefix}Width`] = '0.5px'
        } else {
          style[`${prefix}Width`] = '1px'
        }
        style[`${prefix}Style`] = 'solid'
        style[`${prefix}Color`] = '#000'
      })
    }
  }
  // 启用了内联css，直接赋值
  if (cell.css) {
    const style: any = TD.style
    const { css } = cell
    Object.keys(css).forEach((key: string) => {
      const k = camelCase(key)
      style[k] = css[key]
    })
  }
}

// 注册自定义渲染
Handsontable.renderers.registerRenderer('styleRender', styleRender)
