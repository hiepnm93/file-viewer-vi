import { readText } from '../../common/util'
import { createApp } from 'vue'
import CodeViewer from './CodeViewer.vue'

/**
 * 渲染文本
 * @param buffer 文本二进制内容
 * @param target 目标
 */
export default async function renderText(buffer: ArrayBuffer, target: HTMLDivElement) {
  const text = await readText(buffer)
  const app = createApp({
    render: () => <CodeViewer value={text} />
  })
  app.mount(target)
  return app
}
