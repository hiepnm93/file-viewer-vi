import { createApp, defineAsyncComponent } from 'vue'

const PdfView = defineAsyncComponent(() => import('./PdfView.vue'))
export default async function renderPdf(buffer: ArrayBuffer, target: HTMLDivElement) {
  const app = createApp({
    render: () => <PdfView data={buffer} />
  })
  app.mount(target)
  return app
}
