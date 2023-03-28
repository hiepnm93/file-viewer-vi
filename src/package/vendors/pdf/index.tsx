import { createApp } from 'vue'
import PdfView from './PdfView.vue'

export default async function renderPdf(buffer: ArrayBuffer, target: HTMLDivElement) {
  const app = createApp({
    render: () => <PdfView data={buffer} />
  })
  app.mount(target)
  return app
}
