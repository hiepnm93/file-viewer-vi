import { createApp, defineAsyncComponent } from 'vue'

const AudioViewer = defineAsyncComponent(() => import('./AudioViewer.vue'))
const MidiViewer = defineAsyncComponent(() => import('./MidiViewer.vue'))

/**
 * 渲染音频文件。
 *
 * 这里只做对象 URL 创建和 Vue 异步组件挂载，实际解码、缓冲和播放交给浏览器原生
 * `<audio>`，这样常见音频格式不会把额外播放器运行时带进组件包。
 */
export default async function renderAudio(buffer: ArrayBuffer, target: HTMLDivElement, type?: string) {
  const normalizedType = (type || 'mp3').toLowerCase()
  const app = createApp({
    render: () => normalizedType === 'midi' || normalizedType === 'mid'
      ? <MidiViewer data={buffer} />
      : <AudioViewer data={buffer} type={normalizedType} />
  })
  app.mount(target)
  return app
}
