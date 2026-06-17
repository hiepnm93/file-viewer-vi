import {
  setFileViewerOptionsSearchParam,
  type FileViewerSerializableOptions,
} from './options';
import type { FileViewerFrameEventHandler } from './operations';
import type { FileViewerFileRef } from './types';

export type FileViewerFrameParamValue = string | number | boolean | null | undefined;

export interface FileViewerFrameOptions {
  /**
   * 私有化部署后的基线预览器页面地址。
   *
   * 默认使用安装后复制到宿主项目的 `/file-viewer/index.html`。
   */
  viewerUrl?: string;
  /**
   * 远端文件地址。会透传为预览器的 `url` 查询参数。
   */
  url?: string;
  /**
   * 本地二进制输入。优先级高于 `url`，会通过 postMessage 推送给 iframe。
   */
  file?: FileViewerFileRef;
  /**
   * 当 file 是 Blob 或 ArrayBuffer 时用于识别扩展名。
   */
  name?: string;
  /**
   * 允许推送二进制的宿主 origin。默认取当前页面 origin。
   */
  from?: string;
  /**
   * postMessage 的目标 origin。默认从 viewerUrl 推导。
   */
  targetOrigin?: string;
  /**
   * 预留给基线页面扩展的查询参数。
   */
  params?: Record<string, FileViewerFrameParamValue>;
  /**
   * iframe 入口页的缓存标识。传入 false 可关闭自动追加。
   */
  cacheKey?: string | false;
  /**
   * 透传给基线预览器的运行时选项，例如水印、工具栏和压缩包缓存限制。
   */
  options?: FileViewerSerializableOptions;
  /**
   * iframe 模式下接收基线预览器抛出的生命周期和操作事件。
   */
  onEvent?: FileViewerFrameEventHandler<Record<string, unknown> | null>;
}

export interface BuildFileViewerFrameSrcOptions extends FileViewerFrameOptions {
  /**
   * wrapper 包可以用自己的默认入口覆盖 core 默认地址。
   */
  defaultViewerUrl?: string;
  /**
   * wrapper 包注入的默认缓存标识。
   */
  defaultCacheKey?: string;
  /**
   * SSR 或测试环境下解析相对 viewerUrl 的基准地址。
   */
  baseHref?: string;
  /**
   * SSR 或测试环境下本地文件投递使用的宿主 origin。
   */
  currentOrigin?: string;
}

export const DEFAULT_FILE_VIEWER_PUBLIC_DIR = '/file-viewer';
export const DEFAULT_FILE_VIEWER_URL = `${DEFAULT_FILE_VIEWER_PUBLIC_DIR}/index.html`;

export const canUseFileViewerDom = () => {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
};

const isFile = (value: unknown): value is File => {
  return typeof File !== 'undefined' && value instanceof File;
};

const isBlob = (value: unknown): value is Blob => {
  return typeof Blob !== 'undefined' && value instanceof Blob;
};

const isArrayBuffer = (value: unknown): value is ArrayBuffer => {
  return typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer;
};

export const normalizeFileViewerFrameUrl = (
  viewerUrl?: string,
  defaultViewerUrl = DEFAULT_FILE_VIEWER_URL
) => {
  const value = viewerUrl || defaultViewerUrl;
  return value.endsWith('/') ? `${value}index.html` : value;
};

export const isFileViewerAbsoluteUrl = (value?: string) => {
  return !!value && (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value) || value.startsWith('//'));
};

export const createFileViewerFrameUrl = (
  viewerUrl?: string,
  defaultViewerUrl = DEFAULT_FILE_VIEWER_URL,
  baseHref?: string
) => {
  const normalizedViewerUrl = normalizeFileViewerFrameUrl(viewerUrl, defaultViewerUrl);
  if (canUseFileViewerDom()) {
    return new URL(normalizedViewerUrl, baseHref || window.location.href);
  }
  return new URL(normalizedViewerUrl, baseHref || 'http://localhost');
};

export const serializeFileViewerFrameUrl = (url: URL, viewerUrl?: string) => {
  if (isFileViewerAbsoluteUrl(viewerUrl)) {
    return url.toString();
  }
  return url.pathname + url.search + url.hash;
};

export const appendFileViewerFrameSearchParam = (
  target: URL,
  key: string,
  value: FileViewerFrameParamValue
) => {
  if (value === undefined || value === null || value === '') {
    target.searchParams.delete(key);
    return;
  }
  target.searchParams.set(key, String(value));
};

export const getFileViewerCurrentOrigin = () => {
  return canUseFileViewerDom() ? window.location.origin : '';
};

export const getFileViewerFrameUrl = (viewerUrl?: string, defaultViewerUrl = DEFAULT_FILE_VIEWER_URL) => {
  return normalizeFileViewerFrameUrl(viewerUrl, defaultViewerUrl);
};

export const getFileViewerFrameOrigin = (
  viewerUrl?: string,
  defaultViewerUrl = DEFAULT_FILE_VIEWER_URL,
  baseHref?: string
) => {
  if (!viewerUrl && !canUseFileViewerDom() && !baseHref) {
    return '';
  }
  return createFileViewerFrameUrl(viewerUrl, defaultViewerUrl, baseHref).origin;
};

export const getFileViewerFrameSourceFilename = (
  options: Pick<FileViewerFrameOptions, 'file' | 'name' | 'url'>
) => {
  if (isFile(options.file) && options.file.name) {
    return options.file.name;
  }
  if (options.name) {
    return options.name;
  }
  if (options.url) {
    const clean = options.url.split('?')[0]?.split('#')[0] || options.url;
    return clean.substring(clean.lastIndexOf('/') + 1) || clean;
  }
  return 'preview.bin';
};

export const buildFileViewerFrameSrc = (options: BuildFileViewerFrameSrcOptions = {}) => {
  const src = createFileViewerFrameUrl(options.viewerUrl, options.defaultViewerUrl, options.baseHref);

  Object.entries(options.params || {}).forEach(([key, value]) => {
    appendFileViewerFrameSearchParam(src, key, value);
  });
  appendFileViewerFrameSearchParam(
    src,
    '__flyfish_viewer_version',
    options.cacheKey === false ? undefined : (options.cacheKey || options.defaultCacheKey)
  );
  setFileViewerOptionsSearchParam(src.searchParams, options.options);

  if (options.file) {
    appendFileViewerFrameSearchParam(src, 'url', undefined);
    appendFileViewerFrameSearchParam(src, 'name', getFileViewerFrameSourceFilename(options));
    appendFileViewerFrameSearchParam(
      src,
      'from',
      options.from || options.currentOrigin || getFileViewerCurrentOrigin()
    );
    return serializeFileViewerFrameUrl(src, options.viewerUrl);
  }

  appendFileViewerFrameSearchParam(src, 'name', undefined);
  appendFileViewerFrameSearchParam(src, 'from', undefined);
  appendFileViewerFrameSearchParam(src, 'url', options.url);
  return serializeFileViewerFrameUrl(src, options.viewerUrl);
};

export const toFileViewerFrameMessageBlob = (file?: FileViewerFileRef) => {
  if (!file) {
    return undefined;
  }
  if (isBlob(file)) {
    return file;
  }
  if (isArrayBuffer(file)) {
    return new Blob([file]);
  }
  return undefined;
};

export const postFileToFileViewerFrame = (
  frame: HTMLIFrameElement | null | undefined,
  options: FileViewerFrameOptions
) => {
  const data = toFileViewerFrameMessageBlob(options.file);
  const targetWindow = frame?.contentWindow;
  if (!data || !targetWindow) {
    return false;
  }

  targetWindow.postMessage(data, options.targetOrigin || getFileViewerFrameOrigin(options.viewerUrl));
  return true;
};
