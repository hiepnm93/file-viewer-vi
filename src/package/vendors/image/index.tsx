import { createApp } from 'vue'
import ImageViewer from './ImageViewer.vue'
import { readDataURL } from '../../common/util'
import VueViewer from 'v-viewer'

/**
 * 图片渲染
 */
export default async function renderImage(buffer: ArrayBuffer, target: HTMLDivElement) {
  const url = await readDataURL(buffer)
  const app = createApp({
    render: () => <ImageViewer image={url} />
  });
  app.use(VueViewer);
  app.mount(target);
  return app;
}
