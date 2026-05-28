import { refWorker } from '@/package/common/worker-ref'
import SheetWorker from './sheet.worker.ts?worker&inline'

export default {
  create() {
    return refWorker('sheet.worker.js').defaults(() =>
      new SheetWorker())
  }
}
