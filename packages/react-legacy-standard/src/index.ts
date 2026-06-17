import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type CSSProperties,
  type HTMLAttributes
} from 'react'
import {
  mountViewerFrame,
  type CreateViewerFrameOptions,
  type ViewerFrameComponentProps,
  type ViewerFrameControllerHandle,
  type ViewerFrameController,
  type ViewerFrameOptions,
} from '@file-viewer/web'

export type {
  CreateViewerFrameOptions,
  FileRef,
  ViewerAiOptions,
  ViewerArchiveOptions,
  ViewerCadOptions,
  ViewerDocxOptions,
  ViewerFrameComponentProps,
  ViewerFrameControllerHandle,
  ViewerFrameController,
  ViewerFrameEventHandler,
  ViewerFrameEventPayload,
  ViewerFrameEventType,
  ViewerFrameOptions,
  ViewerPdfOptions,
  ViewerRuntimeOptions,
  ViewerSearchOptions,
  ViewerThemeMode,
  ViewerToolbarOptions,
  ViewerToolbarPosition,
  ViewerTypstOptions,
  ViewerWatermarkOptions
} from '@file-viewer/web'

export interface FileViewerLegacyHandle extends ViewerFrameControllerHandle {}

export interface FileViewerLegacyProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>,
    ViewerFrameComponentProps {
  /**
   * Class name applied to the generated iframe.
   */
  iframeClassName?: string
  /**
   * Inline style applied to the generated iframe.
   */
  iframeStyle?: Partial<CSSStyleDeclaration>
  /**
   * Accessible title for the generated iframe.
   */
  iframeTitle?: string
}

const defaultContainerStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  minHeight: 0
}

const destroyController = (
  controllerRef: React.MutableRefObject<ViewerFrameController | null>,
  container: HTMLDivElement | null
) => {
  controllerRef.current?.destroy()
  controllerRef.current = null
  if (container) {
    container.innerHTML = ''
  }
}

export const FileViewerLegacy = forwardRef<FileViewerLegacyHandle, FileViewerLegacyProps>((props, ref) => {
  const {
    viewerUrl,
    url,
    file,
    name,
    from,
    targetOrigin,
    params,
    cacheKey,
    options,
    onViewerEvent,
    iframeClassName,
    iframeStyle,
    iframeTitle,
    style,
    ...containerProps
  } = props

  const containerRef = useRef<HTMLDivElement | null>(null)
  const controllerRef = useRef<ViewerFrameController | null>(null)

  const frameOptions = useMemo<CreateViewerFrameOptions>(() => ({
    viewerUrl,
    url,
    file,
    name,
    from,
    targetOrigin,
    params,
    cacheKey,
    options,
    onEvent: onViewerEvent,
    className: iframeClassName,
    style: iframeStyle,
    title: iframeTitle
  }), [
    viewerUrl,
    url,
    file,
    name,
    from,
    targetOrigin,
    params,
    cacheKey,
    options,
    onViewerEvent,
    iframeClassName,
    iframeStyle,
    iframeTitle
  ])

  useEffect(() => {
    const container = containerRef.current
    if (!container || controllerRef.current) {
      return undefined
    }

    controllerRef.current = mountViewerFrame(container, frameOptions)
    return () => destroyController(controllerRef, container)
  }, [])

  useEffect(() => {
    controllerRef.current?.update(frameOptions)
  }, [frameOptions])

  useImperativeHandle(ref, () => ({
    get controller() {
      return controllerRef.current
    },
    get iframe() {
      return controllerRef.current?.frame ?? null
    },
    update(nextOptions: ViewerFrameOptions) {
      return controllerRef.current?.update(nextOptions) ?? ''
    },
    postFile() {
      return controllerRef.current?.postFile() ?? false
    },
    reload() {
      controllerRef.current?.reload()
    },
    destroy() {
      destroyController(controllerRef, containerRef.current)
    }
  }), [])

  return React.createElement('div', {
    ...containerProps,
    ref: containerRef,
    style: { ...defaultContainerStyle, ...style }
  })
})

FileViewerLegacy.displayName = 'FileViewerLegacy'

export const FileViewer = FileViewerLegacy
export default FileViewerLegacy
