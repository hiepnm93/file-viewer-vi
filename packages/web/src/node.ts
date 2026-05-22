import { cp, mkdir, readdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

export interface CopyViewerAssetsOptions {
  /**
   * 目标静态目录。默认是宿主项目的 `public/file-viewer`。
   */
  targetDir?: string
  /**
   * 覆盖默认 viewer 源目录，主要用于测试或内部发布流程。
   */
  sourceDir?: string
  /**
   * 复制前是否清空目标目录。默认清空，避免旧 hash 资源残留。
   */
  clean?: boolean
}

const distDir = dirname(fileURLToPath(import.meta.url))
const packageDir = resolve(distDir, '..')

export const DEFAULT_VIEWER_PUBLIC_DIR = 'public/file-viewer'
export const DEFAULT_VIEWER_PUBLIC_URL = '/file-viewer/index.html'

export const getViewerAssetDir = () => resolve(packageDir, 'viewer')

export const getDefaultViewerTargetDir = () => {
  return resolve(process.env.INIT_CWD || process.cwd(), DEFAULT_VIEWER_PUBLIC_DIR)
}

const removeMacMetadata = async (dir: string) => {
  const entries = await readdir(dir, { withFileTypes: true })
  await Promise.all(entries.map(entry => {
    const path = resolve(dir, entry.name)
    if (entry.name === '.DS_Store') {
      return rm(path, { force: true })
    }
    if (entry.isDirectory()) {
      return removeMacMetadata(path)
    }
    return undefined
  }))
}

export const copyViewerAssets = async (options: CopyViewerAssetsOptions = {}) => {
  const sourceDir = resolve(options.sourceDir || getViewerAssetDir())
  const targetDir = resolve(options.targetDir || getDefaultViewerTargetDir())

  if (!existsSync(resolve(sourceDir, 'index.html'))) {
    throw new Error(`缺少 viewer 构建产物: ${sourceDir}`)
  }

  if (options.clean !== false) {
    await rm(targetDir, { force: true, recursive: true })
  }

  await mkdir(targetDir, { recursive: true })
  await cp(sourceDir, targetDir, { recursive: true })
  await removeMacMetadata(targetDir)

  return {
    sourceDir,
    targetDir,
    viewerUrl: DEFAULT_VIEWER_PUBLIC_URL
  }
}
