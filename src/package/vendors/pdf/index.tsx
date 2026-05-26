import { createApp, defineAsyncComponent } from 'vue'
import type { FileRenderContext } from '@/package/common/type'

const PdfView = defineAsyncComponent(() => import('./PdfView.vue'))
export default async function renderPdf(buffer: ArrayBuffer, target: HTMLDivElement, context?: FileRenderContext) {
  const app = createApp({
    render: () => <PdfView data={buffer} exportAdapter={context?.registerExportAdapter} />
  })
  app.mount(target)
  return app
}
