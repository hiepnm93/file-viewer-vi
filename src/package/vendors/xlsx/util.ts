// 深度扁平化routes
import { ref } from 'vue'

export function cellKey(row: number, col: number) {
  return `${row}-${col}`
}

export function flatten(routes: Array<any>): Array<any> {
  return routes.flatMap(route => route.children ? [route, ...flatten(route.children)] : [route])
}

// 转化style对象为style字符串
export function toStyleString(style: any) {
  return [...style].map(key => `${key}: ${style[key]}`).join(';')
}

// 暗黑模式伺服
export const darkMode = (() => {
  if (!window.matchMedia) {
    return {
      value: ref(null)
    }
  }
  // 动态值
  const value = ref(window.matchMedia('(prefers-color-scheme: dark)').matches)
  // 监听暗黑模式
  window.matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', event => value.value = event.matches)
  return {
    value
  }
})()


