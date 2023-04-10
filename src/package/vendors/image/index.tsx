import { createApp, defineAsyncComponent } from 'vue'
import { readDataURL } from '../../common/util'

const ImageViewer = defineAsyncComponent(() => import('./ImageViewer.vue'))

/**
 * 图片渲染
 */
export default async function renderImage(buffer: ArrayBuffer, target: HTMLDivElement) {
  const url = await readDataURL(buffer)
  const app = createApp({
    render: () => <ImageViewer image={url} />
  });
  app.mount(target);
  return app;
}
