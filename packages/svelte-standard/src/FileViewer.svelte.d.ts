import type { SvelteComponentTyped } from 'svelte'
import type {
  ViewerController,
  ViewerControllerHandle,
  ViewerEvent,
  ViewerMountOptions,
} from './controller.js'

export interface FileViewerSvelteProps extends ViewerMountOptions {
  className?: string
  containerStyle?: string
}

export interface FileViewerSvelteEvents {
  viewerEvent: CustomEvent<ViewerEvent>
}

export interface FileViewerSvelteHandle extends ViewerControllerHandle {}

export default class FileViewer extends SvelteComponentTyped<
  FileViewerSvelteProps,
  FileViewerSvelteEvents,
  Record<string, never>
> implements FileViewerSvelteHandle {
  getController(): ViewerController | null
  getApi(): ReturnType<ViewerController['getApi']>
  load(options: ViewerMountOptions): Promise<void>
  update(options?: ViewerMountOptions): Promise<void>
  reload(): Promise<void>
  destroy(): void
}
