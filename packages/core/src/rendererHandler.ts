import { DEFAULT_RENDERER_DEFINITIONS } from './formats';
import { createFileViewerRendererDispatcher } from './rendererDispatcher';
import type { FileViewerRendererDispatcher } from './rendererDispatcher';
import { createRendererRegistry } from './registry';
import { normalizeFileExtension } from './source';
import type {
  FileRenderContext,
  FileRenderHandler,
  RendererDefinition,
  RendererLoadContext,
  RendererLoader,
  RendererRegistry,
  RendererSession,
} from './types';

export interface RenderFileViewerHandlerInput<
  Rendered = unknown,
  Target extends HTMLElement = HTMLElement,
> {
  dispatcher: Pick<FileViewerRendererDispatcher<FileRenderHandler<Rendered, Target>>, 'resolve'>;
  buffer: ArrayBuffer;
  target: Target;
  type?: string;
  context?: FileRenderContext;
  throwOnMissingHandler?: boolean;
}

export interface CreateFileRenderHandlerLoaderOptions<
  Rendered = unknown,
  Target extends HTMLElement = HTMLElement,
> {
  handler: FileRenderHandler<Rendered, Target>;
  getTarget?: (context: RendererLoadContext) => Target;
  createContext?: (context: RendererLoadContext) => FileRenderContext;
  destroy?: (rendered: Rendered, context: RendererLoadContext) => void | Promise<void>;
}

export interface FileRenderHandlerRendererSession<Rendered = unknown> extends RendererSession {
  rendered: Rendered;
}

export interface CreateFileRenderHandlerRegistryOptions<
  Rendered = unknown,
  Target extends HTMLElement = HTMLElement,
> extends Omit<CreateFileRenderHandlerLoaderOptions<Rendered, Target>, 'handler'> {
  definitions?: readonly RendererDefinition[];
  handlers: Iterable<{
    rendererId: string;
    handler: FileRenderHandler<Rendered, Target>;
  }>;
}

export interface FileRenderHandlerRegistryResult<
  Rendered = unknown,
  Target extends HTMLElement = HTMLElement,
> {
  registry: RendererRegistry;
  dispatcher: FileViewerRendererDispatcher<FileRenderHandler<Rendered, Target>>;
  missingRendererIds: string[];
}

export const disposeFileViewerRendered = (rendered?: unknown) => {
  if (!rendered || typeof rendered !== 'object') {
    return;
  }

  const disposable = rendered as {
    unmount?: () => void | Promise<void>;
    $destroy?: () => void | Promise<void>;
    destroy?: () => void | Promise<void>;
  };

  if (typeof disposable.unmount === 'function') {
    return disposable.unmount();
  }
  if (typeof disposable.$destroy === 'function') {
    return disposable.$destroy();
  }
  if (typeof disposable.destroy === 'function') {
    return disposable.destroy();
  }
};

export const buildFileRenderContextFromLoadContext = ({
  source,
  options,
  registerExportAdapter,
  renderContext,
}: RendererLoadContext): FileRenderContext => ({
  filename: source.filename,
  url: source.url,
  streamUrl: source.url,
  options,
  registerExportAdapter,
  ...renderContext,
});

export const renderFileViewerHandler = async <
  Rendered = unknown,
  Target extends HTMLElement = HTMLElement,
>({
  dispatcher,
  buffer,
  target,
  type = '',
  context,
  throwOnMissingHandler = false,
}: RenderFileViewerHandlerInput<Rendered, Target>) => {
  const normalizedType = normalizeFileExtension(type);
  const handler = dispatcher.resolve(normalizedType);

  if (!handler) {
    if (throwOnMissingHandler) {
      throw new Error(`No file viewer renderer is registered for "${normalizedType}".`);
    }
    return undefined;
  }

  return handler(buffer, target, normalizedType, context);
};

export const createFileRenderHandlerLoader = <
  Rendered = unknown,
  Target extends HTMLElement = HTMLElement,
>({
  handler,
  getTarget = context => context.surface.container as Target,
  createContext = buildFileRenderContextFromLoadContext,
  destroy,
}: CreateFileRenderHandlerLoaderOptions<Rendered, Target>): RendererLoader => {
  return async context => {
    const { source } = context;
    if (!source.buffer) {
      throw new Error('FileRenderHandler renderer requires an ArrayBuffer source.');
    }

    const target = getTarget(context);
    const rendered = await handler(
      source.buffer,
      target,
      source.extension,
      createContext(context)
    );

    return {
      rendered,
      destroy: () => {
        if (destroy) {
          return destroy(rendered, context);
        }
        return disposeFileViewerRendered(rendered);
      },
    } satisfies FileRenderHandlerRendererSession<Rendered>;
  };
};

export const createFileRenderHandlerRegistry = <
  Rendered = unknown,
  Target extends HTMLElement = HTMLElement,
>({
  definitions = DEFAULT_RENDERER_DEFINITIONS,
  handlers,
  getTarget,
  createContext,
  destroy,
}: CreateFileRenderHandlerRegistryOptions<Rendered, Target>): FileRenderHandlerRegistryResult<Rendered, Target> => {
  const baseRegistry = createRendererRegistry(definitions);
  const dispatcher = createFileViewerRendererDispatcher<FileRenderHandler<Rendered, Target>>({
    registry: baseRegistry,
    handlers,
  });
  const definitionsWithLoaders = baseRegistry.list().map(definition => {
    const handler = dispatcher.handlersByRendererId.get(definition.id);
    if (!handler) {
      return definition;
    }

    return {
      ...definition,
      load: createFileRenderHandlerLoader({
        handler,
        getTarget,
        createContext,
        destroy,
      }),
    } satisfies RendererDefinition;
  });

  return {
    registry: createRendererRegistry(definitionsWithLoaders),
    dispatcher,
    missingRendererIds: dispatcher.missingRendererIds,
  };
};
