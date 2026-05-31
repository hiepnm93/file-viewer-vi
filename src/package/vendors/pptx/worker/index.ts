import { refWorker } from '@/package/common/worker-ref'
import PptxWorker from './pptx.worker.js?worker&inline'

export default {
  create() {
    return refWorker('pptx.worker.js').defaults(() =>
      new PptxWorker())
  }
}
