import { refWorker } from '@/package/common/worker-ref'

export default {
  create() {
    return refWorker('pdf.worker.js').defaults(() =>
      new Worker(new URL('pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url), { type: 'module' }))
  }
}
