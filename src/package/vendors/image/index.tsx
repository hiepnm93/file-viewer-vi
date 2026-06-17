import { createApp, defineAsyncComponent } from 'vue'

const ImageViewer = defineAsyncComponent(() => import('./ImageViewer.vue'))

const readBlobDataURL = async (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = loadEvent => {
      const result = loadEvent.target?.result
      if (typeof result === 'string') {
        resolve(result)
      }
    }
    reader.onerror = e => reject(e)
    reader.readAsDataURL(blob)
  })
}

const getImageBlobType = (type?: string) => {
  const normalized = (type || '').toLowerCase()
  const mimeMap: Record<string, string> = {
    avif: 'image/avif',
    bmp: 'image/bmp',
    gif: 'image/gif',
    heic: 'image/heic',
    heif: 'image/heif',
    ico: 'image/x-icon',
    jxl: 'image/jxl',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    tif: 'image/tiff',
    tiff: 'image/tiff',
    webp: 'image/webp'
  }
  return mimeMap[normalized] || 'image/*'
}

const renderHeic = async (buffer: ArrayBuffer, type?: string) => {
  const { default: heic2any } = await import('heic2any')
  const result = await heic2any({
    blob: new Blob([buffer], { type: getImageBlobType(type) }),
    toType: 'image/png'
  })
  const blob = Array.isArray(result) ? result[0] : result
  return readBlobDataURL(blob)
}

/**
 * 图片渲染
 */
export default async function renderImage(buffer: ArrayBuffer, target: HTMLDivElement, type?: string) {
  const normalizedType = (type || '').toLowerCase()
  const url = normalizedType === 'heic' || normalizedType === 'heif'
    ? await renderHeic(buffer, normalizedType)
    : await readBlobDataURL(new Blob([buffer], { type: getImageBlobType(normalizedType) }))
  const app = createApp({
    render: () => <ImageViewer image={url} />
  });
  app.mount(target);
  return app;
}
