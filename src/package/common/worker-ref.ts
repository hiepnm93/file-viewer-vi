type WorkerProvider = () => Worker

export interface WorkerRef {

  worker: Worker | null

  defaults(provider: WorkerProvider): Worker
}

export default class WorkerRefImpl implements WorkerRef {

  public worker: Worker | null = null

  constructor(worker: Worker | null) {
    this.worker = worker
  }

  defaults(provider: WorkerProvider): Worker {
    return this.worker || provider()
  }
}

export function refWorker(_name: string, _module: boolean = false): WorkerRef {
  // Keep the old extension point while defaulting to bundled inline workers.
  return new WorkerRefImpl(null)
}
