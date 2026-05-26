import FileViewer from './components/FileViewer'
import type { App, Component } from 'vue'

/**
 * Flyfish Viewer Vue3 包入口。
 *
 * - Vue3 项目安装 `@flyfish-group/file-viewer3`
 * - Vue2.7 项目安装 `@flyfish-group/file-viewer`
 *
 * 两个包都会注册同名 `<file-viewer>` 组件，并保持 `url` / `file`
 * 这两条输入路径的一致行为。
 */
const components: [[string, Component]] = [
  ['file-viewer', FileViewer]
]

declare interface FileViewerInstaller {

  /**
   * 全局注册 `<file-viewer>` 组件。
   */
  install(app: App): void;
}

/**
 * Vue3 插件安装器。
 */
class Installer implements FileViewerInstaller {

  private installed: boolean = false

  public install(app: App): void {
    if (this.installed) return
    components.forEach(([name, component]) => app.component(name, component))
    this.installed = true
  }
}

export default new Installer()

export {
  FileViewer
}

export type {
  FileRef,
  FileViewerArchiveOptions,
  FileViewerOptions,
  FileViewerToolbarOptions,
  FileViewerWatermarkOptions
} from './common/type'
