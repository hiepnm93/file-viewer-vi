import {
  DEFAULT_FILE_VIEWER_PUBLIC_DIR,
  DEFAULT_FILE_VIEWER_URL,
  buildFileViewerFrameSrc,
  createFileViewerFrame as createCoreFileViewerFrame,
  getFileViewerCurrentOrigin,
  getFileViewerFrameOrigin,
  getFileViewerFrameSourceFilename,
  getFileViewerFrameUrl,
  isFileViewerFrameEvent,
  mountFileViewerFrame as mountCoreFileViewerFrame,
  postFileToFileViewerFrame,
  syncFileViewerFrame as syncCoreFileViewerFrame,
  toFileViewerFrameMessageBlob
} from '@file-viewer/core'
import type {
  FileViewerFileRef,
  FileViewerAiOptions,
  FileViewerArchiveOptions,
  FileViewerDocxOptions,
  FileViewerDirectFrameHandle as CoreFileViewerDirectFrameHandle,
  FileViewerFrameControllerHandle as CoreFileViewerFrameControllerHandle,
  FileViewerFrameController as CoreFileViewerFrameController,
  FileViewerFrameEventHandler,
  FileViewerFrameEventPayload,
  FileViewerFrameComponentProps as CoreFileViewerFrameComponentProps,
  FileViewerFrameOptions,
  FileViewerFrameParamValue,
  FileViewerMountedFrameHandle as CoreFileViewerMountedFrameHandle,
  FileViewerPdfOptions,
  FileViewerPostMessageType,
  FileViewerSearchOptions,
  FileViewerSerializableOptions,
  FileViewerSerializableCadOptions,
  FileViewerSerializableToolbarOptions,
  FileViewerThemeMode,
  FileViewerToolbarPosition,
  FileViewerTypstOptions,
  FileViewerWatermarkOptions
} from '@file-viewer/core'

export type FileRef = FileViewerFileRef

export type ViewerFrameParamValue = FileViewerFrameParamValue

export type ViewerWatermarkOptions = FileViewerWatermarkOptions
export type ViewerToolbarPosition = FileViewerToolbarPosition
export type ViewerToolbarOptions = FileViewerSerializableToolbarOptions
export type ViewerArchiveOptions = FileViewerArchiveOptions
export type ViewerPdfOptions = FileViewerPdfOptions
export type ViewerDocxOptions = FileViewerDocxOptions
export type ViewerTypstOptions = FileViewerTypstOptions
export type ViewerCadOptions = FileViewerSerializableCadOptions
export type ViewerSearchOptions = FileViewerSearchOptions
export type ViewerAiOptions = FileViewerAiOptions
export type ViewerThemeMode = FileViewerThemeMode
export type ViewerRuntimeOptions = FileViewerSerializableOptions

export type ViewerFrameEventType = FileViewerPostMessageType
export type ViewerFrameEventPayload = FileViewerFrameEventPayload<Record<string, unknown> | null>
export type ViewerFrameEventHandler = FileViewerFrameEventHandler<Record<string, unknown> | null>

export interface ViewerFrameOptions extends FileViewerFrameOptions {}

export interface ViewerFrameComponentProps extends CoreFileViewerFrameComponentProps {}

export interface CreateViewerFrameOptions extends ViewerFrameOptions {
  autoPostFile?: boolean
  className?: string
  style?: Partial<CSSStyleDeclaration>
  title?: string
}

export interface ViewerFrameController extends CoreFileViewerFrameController {}

export interface ViewerDirectFrameHandle extends CoreFileViewerDirectFrameHandle {}

export interface ViewerMountedFrameHandle extends CoreFileViewerMountedFrameHandle {}

export interface ViewerFrameControllerHandle extends CoreFileViewerFrameControllerHandle {}

export const DEFAULT_VIEWER_PUBLIC_DIR = DEFAULT_FILE_VIEWER_PUBLIC_DIR
export const DEFAULT_VIEWER_URL = DEFAULT_FILE_VIEWER_URL
export const VIEWER_FRAME_CACHE_KEY = '1.0.23'

export const isViewerFrameEvent = (value: unknown): value is ViewerFrameEventPayload => {
  return isFileViewerFrameEvent(value)
}

export const getCurrentOrigin = getFileViewerCurrentOrigin

export const getViewerUrl = (viewerUrl?: string) => getFileViewerFrameUrl(viewerUrl, DEFAULT_VIEWER_URL)

export const getViewerOrigin = (viewerUrl?: string) => {
  return getFileViewerFrameOrigin(viewerUrl, DEFAULT_VIEWER_URL)
}

export const getSourceFilename = getFileViewerFrameSourceFilename

export const buildViewerSrc = (options: ViewerFrameOptions = {}) => {
  return buildFileViewerFrameSrc({
    ...options,
    defaultViewerUrl: DEFAULT_VIEWER_URL,
    defaultCacheKey: VIEWER_FRAME_CACHE_KEY
  })
}

const withViewerFrameDefaults = <Options extends ViewerFrameOptions>(options: Options) => ({
  ...options,
  defaultViewerUrl: DEFAULT_VIEWER_URL,
  defaultCacheKey: VIEWER_FRAME_CACHE_KEY
})

export const toMessageBlob = toFileViewerFrameMessageBlob

export const postFileToViewer = (
  frame: HTMLIFrameElement | null | undefined,
  options: ViewerFrameOptions
) => {
  return postFileToFileViewerFrame(frame, options)
}

export const syncViewerFrame = (
  frame: HTMLIFrameElement | null | undefined,
  options: ViewerFrameOptions
) => {
  return syncCoreFileViewerFrame(frame, withViewerFrameDefaults(options))
}

export const createViewerFrame = (options: CreateViewerFrameOptions = {}) => {
  return createCoreFileViewerFrame(withViewerFrameDefaults(options))
}

export const mountViewerFrame = (
  container: HTMLElement,
  initialOptions: CreateViewerFrameOptions = {}
): ViewerFrameController => {
  return mountCoreFileViewerFrame(container, withViewerFrameDefaults(initialOptions))
}

export const mountViewer = mountViewerFrame
