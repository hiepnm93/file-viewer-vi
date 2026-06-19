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
  createViewerControllerHandle,
  mountViewer,
  type ViewerController,
  type ViewerControllerHandle,
  type ViewerMountOptions,
  type ViewerCoreOptions
} from './controller.js'
import { fileViewerCoreRendererRegistry } from '@file-viewer/core'

export type {
  FileRef,
  ViewerAiOptions,
  ViewerArchiveOptions,
  ViewerCadOptions,
  ViewerController,
  ViewerControllerAccessor,
  ViewerControllerHandle,
  ViewerDocxOptions,
  ViewerEvent,
  ViewerEventHandler,
  ViewerEventType,
  ViewerFetchFile,
  ViewerFetchInput,
  ViewerMountOptions,
  ViewerOptions,
  ViewerPdfOptions,
  ViewerSpreadsheetOptions,
  ViewerSearchOptions,
  ViewerSourceInput,
  ViewerThemeMode,
  ViewerToolbarOptions,
  ViewerToolbarPosition,
  ViewerTypstOptions,
  ViewerWatermarkOptions
} from './controller.js'

export interface FileViewerLegacyHandle extends ViewerControllerHandle {}

export interface FileViewerLegacyProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>,
    ViewerMountOptions {}

const defaultContainerStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  minHeight: 0
}

const viewerCoreOptions: ViewerCoreOptions = {
  registry: fileViewerCoreRendererRegistry
}

const destroyController = (
  controllerRef: React.MutableRefObject<ViewerController | null>,
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
    url,
    file,
    buffer,
    name,
    filename,
    type,
    size,
    options,
    onEvent,
    style,
    ...containerProps
  } = props

  const containerRef = useRef<HTMLDivElement | null>(null)
  const controllerRef = useRef<ViewerController | null>(null)

  const viewerOptions = useMemo<ViewerMountOptions>(() => ({
    url,
    file,
    buffer,
    name,
    filename,
    type,
    size,
    options,
    onEvent
  }), [url, file, buffer, name, filename, type, size, options, onEvent])

  useEffect(() => {
    const container = containerRef.current
    if (!container || controllerRef.current) {
      return undefined
    }

    controllerRef.current = mountViewer(container, viewerOptions, viewerCoreOptions)
    return () => destroyController(controllerRef, container)
  }, [])

  useEffect(() => {
    void controllerRef.current?.update(viewerOptions)
  }, [viewerOptions])

  useImperativeHandle(ref, () => createViewerControllerHandle(
    () => controllerRef.current,
    () => destroyController(controllerRef, containerRef.current)
  ), [])

  return React.createElement('div', {
    ...containerProps,
    ref: containerRef,
    style: { ...defaultContainerStyle, ...style }
  })
})

FileViewerLegacy.displayName = 'FileViewerLegacy'

export const FileViewer = FileViewerLegacy
export default FileViewerLegacy
