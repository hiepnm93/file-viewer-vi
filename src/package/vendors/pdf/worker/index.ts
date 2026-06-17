import { refWorker } from '@file-viewer/core'
import PdfWorker from './pdf.worker.ts?worker&inline'

export default {
  create() {
    return refWorker('pdf.worker.js').defaults(() =>
      new PdfWorker())
  }
}
