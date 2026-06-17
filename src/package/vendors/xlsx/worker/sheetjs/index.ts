import { refWorker } from '@file-viewer/core'
import SheetWorker from './sheet.worker.ts?worker&inline'

export default {
  create() {
    return refWorker('sheet.worker.js').defaults(() =>
      new SheetWorker())
  }
}
