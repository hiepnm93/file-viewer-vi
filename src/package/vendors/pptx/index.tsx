import { createApp } from 'vue'
import PptxRender from './PptxRender.vue'

/**
 * pptx渲染逻辑，使用vue组件，重构自pptxjs，感谢大神让我站在巨人的肩膀上
 * @param buffer 二进制数据
 * @param target 目标
 * @param type 类型
 */
export default async function renderPptx(buffer: ArrayBuffer, target: HTMLDivElement) {
  return createApp({
    render: () => <PptxRender data={buffer} />
  }).mount(target)
}
