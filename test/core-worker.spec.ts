import { describe, expect, it, vi } from 'vitest';
import {
  WorkerRefImpl,
  createFileRenderHandlerRendererSession,
  createFileRenderHandlerRegistry,
  createFileRenderHandlerLoader,
  createFileViewerRendererDispatcher,
  disposeFileViewerRendered,
  disposeFileViewerRendererSession,
  normalizeSource,
  renderFileViewerHandler,
  refWorker,
  type FileRenderContext,
  type FileRenderHandler,
  type RendererDefinition,
} from '../packages/core/src';

describe('@file-viewer/core worker and render contracts', () => {
  it('creates worker refs lazily and reuses the created worker', () => {
    const worker = { terminate: vi.fn() } as unknown as Worker;
    const provider = vi.fn(() => worker);
    const ref = refWorker('demo.worker.js');

    expect(ref.name).toBe('demo.worker.js');
    expect(ref.worker).toBeNull();
    expect(ref.defaults(provider)).toBe(worker);
    expect(ref.defaults(provider)).toBe(worker);
    expect(provider).toHaveBeenCalledTimes(1);
  });

  it('keeps WorkerRefImpl constructible for compatibility wrappers', () => {
    const worker = { postMessage: vi.fn() } as unknown as Worker;
    const ref = new WorkerRefImpl('compat.worker.js', worker);

    expect(ref.name).toBe('compat.worker.js');
    expect(ref.defaults(() => {
      throw new Error('should not replace existing worker');
    })).toBe(worker);
  });

  it('keeps the legacy one-argument WorkerRefImpl constructor working', () => {
    const worker = { postMessage: vi.fn() } as unknown as Worker;
    const ref = new WorkerRefImpl(worker);

    expect(ref.name).toBe('');
    expect(ref.defaults(() => {
      throw new Error('should not replace existing worker');
    })).toBe(worker);
  });

  it('exposes renderer context and handler contracts from core', async () => {
    const context: FileRenderContext = {
      filename: 'demo.pdf',
      url: '/demo.pdf',
      streamUrl: '/demo.pdf',
      onProgressiveRender: vi.fn(),
      registerExportAdapter: vi.fn(),
    };
    const handler: FileRenderHandler<string, HTMLDivElement> = async (_buffer, target, type, nextContext) => {
      nextContext?.onProgressiveRender?.();
      target.dataset.renderedType = type || '';
      return nextContext?.filename || '';
    };
    const target = { dataset: {} } as HTMLDivElement;

    await expect(handler(new ArrayBuffer(1), target, 'pdf', context)).resolves.toBe('demo.pdf');
    expect(target.dataset.renderedType).toBe('pdf');
    expect(context.onProgressiveRender).toHaveBeenCalledTimes(1);
  });

  it('invokes render handlers through the core dispatcher contract', async () => {
    const context: FileRenderContext = {
      filename: 'demo.pdf',
      onProgressiveRender: vi.fn(),
    };
    const handler: FileRenderHandler<string, HTMLDivElement> = async (_buffer, target, type, nextContext) => {
      nextContext?.onProgressiveRender?.();
      target.dataset.renderedType = type || '';
      return nextContext?.filename || '';
    };
    const dispatcher = createFileViewerRendererDispatcher({
      registry: {
        list: () => [{
          id: 'pdf',
          label: 'PDF',
          category: 'document',
          extensions: ['pdf'],
        } as RendererDefinition],
        register: () => undefined,
        unregister: () => false,
        getById: () => undefined,
        getByExtension: () => undefined,
        hasExtension: () => false,
        listExtensions: () => [],
      },
      handlers: [{ rendererId: 'pdf', handler }],
    });
    const target = { dataset: {} } as HTMLDivElement;

    await expect(renderFileViewerHandler({
      dispatcher,
      buffer: new ArrayBuffer(1),
      target,
      type: '.PDF',
      context,
    })).resolves.toBe('demo.pdf');

    expect(target.dataset.renderedType).toBe('pdf');
    expect(context.onProgressiveRender).toHaveBeenCalledTimes(1);
  });

  it('adapts legacy render handlers into renderer loaders', async () => {
    const unmount = vi.fn();
    const onProgressiveRender = vi.fn();
    const registerExportAdapter = vi.fn();
    const handler: FileRenderHandler<{ unmount: () => void }, HTMLDivElement> = async (_buffer, target, type, context) => {
      context?.onProgressiveRender?.();
      target.dataset.renderedType = type || '';
      target.dataset.filename = context?.filename || '';
      target.dataset.streamUrl = context?.streamUrl || '';
      return { unmount };
    };
    const loader = createFileRenderHandlerLoader({ handler });
    const target = { dataset: {} } as HTMLDivElement;
    const session = await loader({
      source: normalizeSource({
        buffer: new ArrayBuffer(1),
        filename: 'demo.docx',
      }),
      surface: { container: target },
      options: {},
      registerExportAdapter,
      renderContext: {
        filename: 'legacy.docx',
        streamUrl: '/legacy-stream.docx',
        onProgressiveRender,
      },
    });

    expect(target.dataset.renderedType).toBe('docx');
    expect(target.dataset.filename).toBe('legacy.docx');
    expect(target.dataset.streamUrl).toBe('/legacy-stream.docx');
    expect(onProgressiveRender).toHaveBeenCalledTimes(1);
    await session.destroy?.();
    expect(unmount).toHaveBeenCalledTimes(1);

    const destroy = vi.fn();
    disposeFileViewerRendered({ destroy });
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it('wraps legacy rendered instances into core renderer sessions', async () => {
    const unmount = vi.fn();
    const rendered = { unmount };
    const session = createFileRenderHandlerRendererSession(rendered);

    expect(session.rendered).toBe(rendered);
    await session.destroy?.();
    expect(unmount).toHaveBeenCalledTimes(1);
  });

  it('safely disposes renderer sessions and reports teardown errors', async () => {
    const onError = vi.fn();
    const syncError = new Error('sync teardown failed');
    const asyncError = new Error('async teardown failed');
    const syncDestroy = vi.fn(() => {
      throw syncError;
    });
    const asyncDestroy = vi.fn(() => Promise.reject(asyncError));

    disposeFileViewerRendererSession({ destroy: syncDestroy }, { onError });
    disposeFileViewerRendererSession({ destroy: asyncDestroy }, { onError });
    disposeFileViewerRendererSession(null, { onError });
    await Promise.resolve();

    expect(syncDestroy).toHaveBeenCalledTimes(1);
    expect(asyncDestroy).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(syncError);
    expect(onError).toHaveBeenCalledWith(asyncError);
  });

  it('builds renderer registries from legacy render handlers', async () => {
    const unmount = vi.fn();
    const handler: FileRenderHandler<{ unmount: () => void }, HTMLDivElement> = async (_buffer, target, type, context) => {
      target.dataset.renderedType = type || '';
      target.dataset.filename = context?.filename || '';
      return { unmount };
    };
    const target = { dataset: {} } as HTMLDivElement;
    const { registry, missingRendererIds } = createFileRenderHandlerRegistry({
      definitions: [{
        id: 'text-fixture',
        label: 'Text Fixture',
        category: 'code',
        extensions: ['txt-fixture'],
      }],
      handlers: [{
        rendererId: 'text-fixture',
        handler,
      }],
    });
    const renderer = registry.getByExtension('TXT-FIXTURE');

    expect(missingRendererIds).toEqual([]);
    expect(renderer?.load).toBeTypeOf('function');

    const session = await renderer?.load?.({
      source: normalizeSource({
        buffer: new ArrayBuffer(1),
        filename: 'demo.txt-fixture',
      }),
      surface: { container: target },
      options: {},
    });

    expect(target.dataset.renderedType).toBe('txt-fixture');
    expect(target.dataset.filename).toBe('demo.txt-fixture');
    await session?.destroy?.();
    expect(unmount).toHaveBeenCalledTimes(1);
  });
});
