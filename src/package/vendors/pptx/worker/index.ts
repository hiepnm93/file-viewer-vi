import { refWorker } from '@file-viewer/core'
import PptxWorker from './pptx.worker.js?worker&inline'

export default {
  create() {
    return refWorker('pptx.worker.js').defaults(() =>
      new PptxWorker())
  }
}
