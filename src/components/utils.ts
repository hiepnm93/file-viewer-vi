import { parse } from 'qs'
import type { FileViewerOptions } from '@/package/common/type'

type ListenCallback = (file?: File, url?: string, options?: FileViewerOptions) => void;

const parseViewerOptions = (value: unknown): FileViewerOptions | undefined => {
  if (!value) {
    return undefined
  }
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as FileViewerOptions
    } catch {
      return undefined
    }
  }
  if (typeof value === 'object') {
    return value as FileViewerOptions
  }
  return undefined
}

export function listenForFile(callback: ListenCallback) {
  const params: any = parse(location.search.substring(1));
  const { url, from, name, options } = params;
  const viewerOptions = parseViewerOptions(options)
  // 优先从url获取文件路径
  if (url) {
    return callback(undefined, url, viewerOptions);
  }
  // 允许使用预留的消息机制发送二进制数据，必须在url后添加?name=xxx.xxx&from=xxx
  if (from && typeof name === 'string') {
    window.addEventListener('message', event => {
      const { origin, data: blob } = event
      if (origin === from && blob instanceof Blob) {
        // 构造响应，自动渲染
        const value = new File([blob], name, {})
        callback(value, undefined, viewerOptions)
      }
    })
  }
}
