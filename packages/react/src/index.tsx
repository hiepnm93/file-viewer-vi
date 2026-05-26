import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type IframeHTMLAttributes,
  type SyntheticEvent
} from 'react'
import {
  buildViewerSrc,
  postFileToViewer,
  type FileRef,
  type ViewerFrameOptions
} from '@flyfish-group/file-viewer-web'

export type { FileRef, ViewerFrameOptions } from '@flyfish-group/file-viewer-web'

export interface FileViewerHandle {
  iframe: HTMLIFrameElement | null
  postFile(): boolean
  reload(): void
}

export interface FileViewerProps extends Omit<IframeHTMLAttributes<HTMLIFrameElement>, 'children' | 'src'> {
  /**
   * 私有化部署后的 Vue 基线预览器页面地址。
   *
   * 不传时默认使用 `@flyfish-group/file-viewer-web` 安装后复制到宿主项目的 `/file-viewer/index.html`。
   */
  viewerUrl?: string
  /**
   * 远端文件地址。会透传给 iframe 里的 Vue 基线预览器。
   */
  url?: string
  /**
   * 本地二进制输入。优先级高于 url，会通过 postMessage 推送给 iframe。
   */
  file?: FileRef
  /**
   * 当 file 是 Blob 或 ArrayBuffer 时用于识别扩展名。
   */
  name?: string
  /**
   * 允许推送二进制的宿主 origin。默认取当前页面 origin。
   */
  from?: string
  /**
   * postMessage 的目标 origin。默认从 viewerUrl 推导。
   */
  targetOrigin?: string
  /**
   * 预留给 Vue 基线页面的查询参数。
   */
  params?: ViewerFrameOptions['params']
  /**
   * 透传给 Vue 基线预览器的运行时选项，例如水印、工具栏和压缩包缓存限制。
   */
  options?: ViewerFrameOptions['options']
}

const defaultStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  border: 0,
  display: 'block'
}

export const FileViewer = forwardRef<FileViewerHandle, FileViewerProps>((props, forwardedRef) => {
  const {
    viewerUrl,
    url,
    file,
    name,
    from,
    targetOrigin,
    params,
    options,
    onLoad,
    style,
    title = 'Flyfish Viewer 文件预览',
    ...iframeProps
  } = props

  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [frameReady, setFrameReady] = useState(false)

  const frameOptions = useMemo<ViewerFrameOptions>(() => ({
    viewerUrl,
    url,
    file,
    name,
    from,
    targetOrigin,
    params,
    options
  }), [viewerUrl, url, file, name, from, targetOrigin, params, options])

  const src = useMemo(() => buildViewerSrc(frameOptions), [frameOptions])

  const postFile = useCallback(() => {
    return postFileToViewer(iframeRef.current, frameOptions)
  }, [frameOptions])

  const reload = useCallback(() => {
    if (iframeRef.current) {
      iframeRef.current.src = src
    }
  }, [src])

  useImperativeHandle(forwardedRef, () => ({
    get iframe() {
      return iframeRef.current
    },
    postFile,
    reload
  }), [postFile, reload])

  useEffect(() => {
    setFrameReady(false)
  }, [src])

  useEffect(() => {
    if (frameReady) {
      postFile()
    }
  }, [frameReady, postFile])

  const handleLoad = useCallback((event: SyntheticEvent<HTMLIFrameElement>) => {
    setFrameReady(true)
    onLoad?.(event)
  }, [onLoad])

  return (
    <iframe
      {...iframeProps}
      ref={iframeRef}
      src={src}
      title={title}
      style={{ ...defaultStyle, ...style }}
      onLoad={handleLoad}
    />
  )
})

FileViewer.displayName = 'FileViewer'

export default FileViewer
