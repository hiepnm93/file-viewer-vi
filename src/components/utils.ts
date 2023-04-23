import { parse } from 'qs'

type ListenCallback = (file?: File, url?: string) => void;

export function listenForFile(callback: ListenCallback) {
  const params: any = parse(location.search.substring(1));
  const { url, from, name } = params;
  // 优先从url获取文件路径
  if (url) {
    return callback(undefined, url);
  }
  // 允许使用预留的消息机制发送二进制数据，必须在url后添加?name=xxx.xxx&from=xxx
  if (from && typeof name === 'string') {
    window.addEventListener('message', event => {
      const { origin, data: blob } = event
      if (origin === from && blob instanceof Blob) {
        // 构造响应，自动渲染
        const value = new File([blob], name, {})
        callback(value)
      }
    })
  }
}
