import { refWorker } from '@/package/common/worker-ref'

export default {
  create() {
    return refWorker('sheetjs.worker.js').defaults(() =>
      new Worker(new URL('./sheet.worker.ts', import.meta.url), { type: 'module' }))
  }
}
