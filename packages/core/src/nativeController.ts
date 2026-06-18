import { createViewer, type CreateViewerOptions } from './viewer';
import {
  DEFAULT_FILE_VIEWER_SOURCE_FILENAME,
  getExtension,
  normalizeFilename,
  readFileViewerBuffer,
  resolveFileViewerSourceFilename,
  wrapFileViewerFileRef,
} from './source';
import type {
  FileViewerFileRef,
  FileViewerInstance,
  FileViewerOptions,
  FileViewerSource,
  RendererRegistry,
  RendererSession,
} from './types';

export interface FileViewerNativeSource {
  url?: string;
  file?: FileViewerFileRef;
  buffer?: ArrayBuffer;
  filename?: string;
  name?: string;
  type?: string;
  size?: number;
}

export interface FileViewerNativeFetchInput {
  url: string;
  signal?: AbortSignal;
  source: FileViewerNativeSource;
}

export type FileViewerNativeFetchFile = (
  input: FileViewerNativeFetchInput
) => Promise<FileViewerFileRef | null | undefined>;

export interface CreateFileViewerNativeControllerOptions
  extends Omit<CreateViewerOptions, 'registry' | 'options' | 'signal'> {
  registry?: RendererRegistry;
  options?: FileViewerOptions;
  source?: FileViewerNativeSource;
  autoLoad?: boolean;
  fetchFile?: FileViewerNativeFetchFile;
  onError?: (error: unknown, source: FileViewerNativeSource) => void;
}

export interface FileViewerNativeController {
  readonly instance: FileViewerInstance;
  readonly container: HTMLElement;
  load(source: FileViewerNativeSource): Promise<RendererSession | null>;
  updateOptions(options: Partial<FileViewerOptions>): void;
  update(input: {
    source?: FileViewerNativeSource | null;
    options?: Partial<FileViewerOptions>;
  }): Promise<RendererSession | null>;
  getSource(): FileViewerNativeSource | null;
  reload(): Promise<RendererSession | null>;
  cancel(): void;
  destroy(): Promise<void>;
}

const canUseFetch = () => typeof fetch === 'function';

const defaultFetchFile: FileViewerNativeFetchFile = async ({ url, signal }) => {
  if (!canUseFetch()) {
    throw new Error('fetch is not available in the current runtime.');
  }

  const response = await fetch(url, {
    signal,
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
  }
  return response.blob();
};

const resolveNativeSourceFilename = (source: FileViewerNativeSource) => {
  return normalizeFilename(
    source.filename || source.name || resolveFileViewerSourceFilename({
      file: source.file,
      url: source.url,
      fallback: DEFAULT_FILE_VIEWER_SOURCE_FILENAME,
    }),
    source.type ? `preview.${source.type}` : DEFAULT_FILE_VIEWER_SOURCE_FILENAME
  );
};

export const resolveFileViewerNativeLoadSource = async (
  source: FileViewerNativeSource,
  options: {
    fetchFile?: FileViewerNativeFetchFile;
    signal?: AbortSignal;
  } = {}
): Promise<FileViewerSource> => {
  const filename = resolveNativeSourceFilename(source);
  const type = source.type || getExtension(filename);

  if (source.buffer) {
    return {
      buffer: source.buffer,
      filename,
      type,
      size: source.size ?? source.buffer.byteLength,
      url: source.url,
    };
  }

  if (source.file) {
    const file = wrapFileViewerFileRef(source.file, filename);
    return {
      file,
      buffer: await readFileViewerBuffer(file),
      filename: file.name || filename,
      type: type || getExtension(file.name),
      size: source.size ?? file.size,
      url: source.url,
    };
  }

  if (source.url) {
    const fileRef = await (options.fetchFile || defaultFetchFile)({
      url: source.url,
      signal: options.signal,
      source,
    });
    if (!fileRef) {
      throw new Error('Downloaded file is empty.');
    }

    const file = wrapFileViewerFileRef(fileRef, filename);
    return {
      file,
      buffer: await readFileViewerBuffer(file),
      filename: file.name || filename,
      type: type || getExtension(file.name),
      size: source.size ?? file.size,
      url: source.url,
    };
  }

  return {
    filename,
    type,
  };
};

export const createFileViewerNativeController = (
  container: HTMLElement,
  {
    registry,
    options = {},
    source,
    autoLoad = true,
    fetchFile,
    onError,
  }: CreateFileViewerNativeControllerOptions = {}
): FileViewerNativeController => {
  let currentSource: FileViewerNativeSource | null = source ?? null;
  let abortController: AbortController | null = null;
  const instance = createViewer(container, {
    registry,
    options,
  });

  const cancel = () => {
    abortController?.abort();
    abortController = null;
  };

  const load = async (nextSource: FileViewerNativeSource) => {
    cancel();
    currentSource = nextSource;
    abortController = typeof AbortController !== 'undefined' ? new AbortController() : null;
    try {
      const resolvedSource = await resolveFileViewerNativeLoadSource(nextSource, {
        fetchFile,
        signal: abortController?.signal,
      });
      return await instance.load(resolvedSource);
    } catch (error) {
      onError?.(error, nextSource);
      throw error;
    }
  };

  const controller: FileViewerNativeController = {
    instance,
    container,
    load,
    updateOptions(nextOptions) {
      instance.updateOptions(nextOptions);
    },
    async update(input) {
      if (input.options) {
        instance.updateOptions(input.options);
      }
      if (input.source === null) {
        currentSource = null;
        await instance.destroy('reset');
        return null;
      }
      if (input.source) {
        return load(input.source);
      }
      return null;
    },
    getSource() {
      return currentSource;
    },
    async reload() {
      if (!currentSource) {
        return null;
      }
      return load(currentSource);
    },
    cancel,
    async destroy() {
      cancel();
      await instance.destroy('component-unmount');
    },
  };

  if (autoLoad && source) {
    void controller.load(source).catch(() => {
      // onError already received the original error; avoid an unhandled promise
      // when consumers opt into auto-loading during component mount.
    });
  }

  return controller;
};
