import type { SvelteComponentTyped } from 'svelte'
import type {
  CreateViewerFrameOptions,
  FileRef,
  ViewerFrameController,
  ViewerFrameEventHandler,
  ViewerFrameEventPayload,
  ViewerRuntimeOptions
} from '@file-viewer/web'

export interface FileViewerSvelteProps {
  viewerUrl?: string
  url?: string
  file?: FileRef
  name?: string
  from?: string
  targetOrigin?: string
  params?: CreateViewerFrameOptions['params']
  cacheKey?: CreateViewerFrameOptions['cacheKey']
  options?: ViewerRuntimeOptions
  onViewerEvent?: ViewerFrameEventHandler
  className?: string
  containerStyle?: string
  iframeClassName?: string
  iframeStyle?: Partial<CSSStyleDeclaration>
  iframeTitle?: string
}

export interface FileViewerSvelteEvents {
  viewerEvent: CustomEvent<{
    payload: ViewerFrameEventPayload
    event: MessageEvent
  }>
}

export default class FileViewer extends SvelteComponentTyped<
  FileViewerSvelteProps,
  FileViewerSvelteEvents,
  Record<string, never>
> {
  getController(): ViewerFrameController | null
  getIframe(): HTMLIFrameElement | null
  update(options: CreateViewerFrameOptions): string
  postFile(): boolean
  reload(): void
  destroy(): void
}
