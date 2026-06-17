import type {
  FileViewerArchiveOptions,
  FileViewerCadOptions,
  FileViewerTypstOptions,
} from './types';

export const DEFAULT_FILE_VIEWER_ARCHIVE_WORKER_PATH = 'vendor/libarchive/worker-bundle.js';
export const DEFAULT_FILE_VIEWER_CAD_WASM_PATH = 'wasm/cad/';
export const DEFAULT_FILE_VIEWER_CAD_WORKER_PATH = 'wasm/cad/dwg-worker.js';
export const DEFAULT_FILE_VIEWER_CAD_DWF_WASM_PATH = 'wasm/cad/dwfv-render.wasm';
export const DEFAULT_FILE_VIEWER_TYPST_COMPILER_WASM_URL =
  'https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-web-compiler@0.7.0/pkg/typst_ts_web_compiler_bg.wasm';

export interface ResolveFileViewerAssetUrlOptions {
  baseUrl?: string;
  documentBaseUrl?: string;
  trimTrailingSlash?: boolean;
}

export interface ResolvedFileViewerCadAssetUrls {
  wasmPath: string;
  workerUrl: string;
  dwfWasmUrl: string;
}

const getDefaultDocumentBaseUrl = () => {
  if (typeof document !== 'undefined' && document.baseURI) {
    return document.baseURI;
  }
  if (typeof location !== 'undefined' && location.href) {
    return location.href;
  }
  return 'http://localhost/';
};

export const resolveFileViewerAssetUrl = (
  value: string | URL | undefined,
  fallback: string,
  options: ResolveFileViewerAssetUrlOptions = {}
) => {
  const raw = value ? String(value) : fallback;
  const baseUrl = options.baseUrl
    ? options.baseUrl.endsWith('/') ? options.baseUrl : `${options.baseUrl}/`
    : options.documentBaseUrl || getDefaultDocumentBaseUrl();
  const resolvedBase = options.baseUrl
    ? new URL(baseUrl, options.documentBaseUrl || getDefaultDocumentBaseUrl()).href
    : baseUrl;
  const resolved = new URL(raw, resolvedBase).href;

  return options.trimTrailingSlash ? resolved.replace(/\/+$/, '') : resolved;
};

export const resolveFileViewerArchiveWorkerUrl = (
  options?: Pick<FileViewerArchiveOptions, 'workerUrl'> | null,
  baseUrl?: string
) => {
  return resolveFileViewerAssetUrl(options?.workerUrl, DEFAULT_FILE_VIEWER_ARCHIVE_WORKER_PATH, { baseUrl });
};

export const resolveFileViewerArchiveWasmUrl = (
  options?: Pick<FileViewerArchiveOptions, 'wasmUrl'> | null,
  fallback = ''
) => {
  if (!options?.wasmUrl) {
    return fallback;
  }
  return resolveFileViewerAssetUrl(options.wasmUrl, fallback || options.wasmUrl);
};

export const resolveFileViewerCadAssetUrls = (
  options?: Pick<FileViewerCadOptions, 'wasmPath' | 'workerUrl' | 'dwfWasmUrl'> | null,
  documentBaseUrl?: string
): ResolvedFileViewerCadAssetUrls => {
  return {
    wasmPath: resolveFileViewerAssetUrl(options?.wasmPath, DEFAULT_FILE_VIEWER_CAD_WASM_PATH, {
      documentBaseUrl,
      trimTrailingSlash: true,
    }),
    workerUrl: resolveFileViewerAssetUrl(options?.workerUrl, DEFAULT_FILE_VIEWER_CAD_WORKER_PATH, {
      documentBaseUrl,
    }),
    dwfWasmUrl: resolveFileViewerAssetUrl(options?.dwfWasmUrl, DEFAULT_FILE_VIEWER_CAD_DWF_WASM_PATH, {
      documentBaseUrl,
    }),
  };
};

export const resolveFileViewerTypstCompilerWasmUrl = (
  options?: Pick<FileViewerTypstOptions, 'compilerWasmUrl'> | null,
  overrides: Array<string | undefined> = []
) => {
  return options?.compilerWasmUrl ||
    overrides.find(Boolean) ||
    DEFAULT_FILE_VIEWER_TYPST_COMPILER_WASM_URL;
};
