import { refWorker } from '@/package/common/worker-ref'
import PdfWorker from './pdf.worker.ts?worker&inline'

export default {
  create() {
    return refWorker('pdf.worker.js').defaults(() =>
      new PdfWorker())
  }
}
