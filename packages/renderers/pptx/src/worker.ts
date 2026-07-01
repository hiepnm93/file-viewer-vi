import type { PptxWorkerFactoryOptions } from './types';

const defaultPptxWorkerUrl = new URL('./worker/pptx.worker.js', import.meta.url);
const viteDevPptxWorkerUrl = new URL(
  '/node_modules/@file-viewer/pptx/dist/worker/pptx.worker.js',
  defaultPptxWorkerUrl
);

const resolveDefaultPptxWorkerUrl = () => {
  // Vite dep optimization rewrites import.meta.url into .vite/deps, away from this package's worker file.
  if (defaultPptxWorkerUrl.pathname.includes('/node_modules/.vite/deps/worker/pptx.worker.js')) {
    return viteDevPptxWorkerUrl;
  }
  return defaultPptxWorkerUrl;
};

export const createPptxWorker = (options: PptxWorkerFactoryOptions = {}) => {
  if (options.workerFactory) {
    return options.workerFactory();
  }

  if (options.workerUrl) {
    return new Worker(options.workerUrl, {
      type: options.workerType ?? 'module',
    });
  }

  return new Worker(resolveDefaultPptxWorkerUrl(), {
    type: 'module',
  });
};
