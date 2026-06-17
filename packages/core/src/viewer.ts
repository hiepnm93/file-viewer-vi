import { getRendererAvailability, createUnsupportedAvailability } from './capabilities';
import { createRendererRegistry } from './registry';
import { normalizeSource } from './source';
import type {
  FileViewerInstance,
  FileViewerLifecycleContext,
  FileViewerOptions,
  FileViewerSource,
  NormalizedFileViewerSource,
  RendererRegistry,
  RendererSession,
} from './types';

export interface CreateViewerOptions {
  registry?: RendererRegistry;
  options?: FileViewerOptions;
  signal?: AbortSignal;
}

const emitLifecycle = async (
  options: FileViewerOptions,
  phase: FileViewerLifecycleContext['phase'],
  source: NormalizedFileViewerSource,
  version: number,
  startedAt: number,
  reason?: FileViewerLifecycleContext['reason']
) => {
  const context: FileViewerLifecycleContext = {
    phase,
    type: source.extension,
    filename: source.filename,
    source: source.kind,
    url: source.url,
    file: typeof File !== 'undefined' && source.file instanceof File ? source.file : undefined,
    size: source.size,
    version,
    timestamp: Date.now(),
    duration: phase.endsWith('complete') ? Date.now() - startedAt : undefined,
    reason,
  };

  if (phase === 'load-start') {
    await options.hooks?.onLoadStart?.(context);
  } else if (phase === 'load-complete') {
    await options.hooks?.onLoadComplete?.(context);
  } else if (phase === 'unload-start') {
    await options.hooks?.onUnloadStart?.(context);
  } else {
    await options.hooks?.onUnloadComplete?.(context);
  }
};

export const createViewer = (
  container: HTMLElement,
  createOptions: CreateViewerOptions = {}
): FileViewerInstance => {
  const registry = createOptions.registry || createRendererRegistry();
  let options = createOptions.options || {};
  let currentSource: NormalizedFileViewerSource | null = null;
  let currentSession: RendererSession | null = null;
  let version = 0;

  const destroyCurrent = async (reason: FileViewerLifecycleContext['reason'] = 'replace') => {
    if (!currentSource) {
      return;
    }
    const source = currentSource;
    const startedAt = Date.now();
    await emitLifecycle(options, 'unload-start', source, version, startedAt, reason);
    await currentSession?.destroy?.();
    currentSession = null;
    currentSource = null;
    await emitLifecycle(options, 'unload-complete', source, version, startedAt, reason);
  };

  return {
    container,
    async load(source: FileViewerSource) {
      await destroyCurrent('replace');

      const normalized = normalizeSource(source);
      currentSource = normalized;
      version += 1;

      const renderer = registry.getByExtension(normalized.extension);
      const startedAt = Date.now();
      await emitLifecycle(options, 'load-start', normalized, version, startedAt);

      if (!renderer?.load) {
        currentSession = null;
        await emitLifecycle(options, 'load-complete', normalized, version, startedAt);
        return null;
      }

      currentSession = await renderer.load({
        source: normalized,
        surface: { container },
        options,
        signal: createOptions.signal,
      });
      await emitLifecycle(options, 'load-complete', normalized, version, startedAt);
      return currentSession;
    },
    destroy(reason = 'component-unmount') {
      return destroyCurrent(reason);
    },
    updateOptions(nextOptions: Partial<FileViewerOptions>) {
      options = {
        ...options,
        ...nextOptions,
      };
    },
    getCapabilities(extension?: string) {
      const targetExtension = extension || currentSource?.extension || '';
      const renderer = registry.getByExtension(targetExtension);
      if (!renderer) {
        return createUnsupportedAvailability(targetExtension);
      }
      return getRendererAvailability(renderer, currentSession);
    },
    getRenderer(extension?: string) {
      return registry.getByExtension(extension || currentSource?.extension || '');
    },
    getSource() {
      return currentSource;
    },
  };
};
