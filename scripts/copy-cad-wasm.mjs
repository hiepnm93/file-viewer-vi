import { existsSync } from 'node:fs'
import { copyFile, cp, mkdir, readdir, rm, stat } from 'node:fs/promises'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const resolveFromProject = specifier => {
  try {
    return require.resolve(specifier)
  } catch {
    const corePackageJson = join(projectRoot, 'packages/core/package.json')
    const coreRequire = createRequire(corePackageJson)
    return coreRequire.resolve(specifier)
  }
}
const findPackageJsonFromEntry = entry => {
  let current = dirname(entry)
  while (current && current !== dirname(current)) {
    const candidate = join(current, 'package.json')
    if (existsSync(candidate)) {
      return candidate
    }
    current = dirname(current)
  }
  throw new Error(`[file-viewer] Unable to locate package.json from ${entry}`)
}
const resolvePackageJson = packageName => {
  try {
    return resolveFromProject(`${packageName}/package.json`)
  } catch {
    return findPackageJsonFromEntry(resolveFromProject(packageName))
  }
}
const resolvePackageRoot = packageName => dirname(resolvePackageJson(packageName))
const packageJson = resolvePackageJson('@flyfish-dev/cad-viewer')
const packageRoot = dirname(packageJson)
const distRoot = join(packageRoot, 'dist')
const wasmDir = join(distRoot, 'wasm')
const dwgWorker = join(wasmDir, 'dwg-worker.js')
const typstCompilerWasm = join(
  resolvePackageRoot('@myriaddreamin/typst-ts-web-compiler'),
  'pkg',
  'typst_ts_web_compiler_bg.wasm'
)
const typstRendererWasm = join(
  resolvePackageRoot('@myriaddreamin/typst-ts-renderer'),
  'pkg',
  'typst_ts_renderer_bg.wasm'
)
const dataSqlWasm = join(resolvePackageRoot('sql.js'), 'dist', 'sql-wasm.wasm')
const pdfjsRoot = resolvePackageRoot('pdfjs-dist')
const pdfWorker = join(pdfjsRoot, 'legacy', 'build', 'pdf.worker.mjs')
const pdfCmapsDir = join(pdfjsRoot, 'cmaps')
const pdfWasmDir = join(pdfjsRoot, 'wasm')
const pdfStandardFontsDir = join(pdfjsRoot, 'standard_fonts')
const rawArgs = process.argv.slice(2)
const args = new Set(rawArgs)
const readArgValue = name => {
  const index = rawArgs.indexOf(name)
  if (index === -1) {
    return undefined
  }
  const value = rawArgs[index + 1]
  return value && !value.startsWith('--') ? value : undefined
}
const resolveFromCwd = value => {
  if (!value) {
    return undefined
  }
  return isAbsolute(value) ? value : resolve(process.cwd(), value)
}
const publicRoot = resolveFromCwd(readArgValue('--public-root')) ?? join(projectRoot, 'apps/viewer-demo/public')
const distBaseRoot = resolveFromCwd(readArgValue('--dist-root')) ?? join(projectRoot, 'apps/viewer-demo/dist')
const baseTargetRoots = [
  !args.has('--dist-only') && publicRoot,
  (args.has('--dist') || args.has('--dist-only')) && distBaseRoot
].filter(Boolean)
const cadTargetRoots = baseTargetRoots.map(root => join(root, 'wasm', 'cad'))
const typstTargetRoots = baseTargetRoots.map(root => join(root, 'wasm', 'typst'))
const dataTargetRoots = baseTargetRoots.map(root => join(root, 'wasm', 'data'))
const pdfTargetRoots = baseTargetRoots.map(root => join(root, 'vendor', 'pdf'))

const copyWorkerChunks = async targetRoot => {
  const files = await readdir(wasmDir)
  await Promise.all(
    files
      .filter(file => /^dwg-worker-.+\.js$/.test(file))
      .map(file => copyChecked(join(wasmDir, file), join(targetRoot, file)))
  )
}

const copyChecked = async (from, to) => {
  const info = await stat(from)
  if (!info.isFile() || info.size <= 0) {
    throw new Error(`[file-viewer] Invalid viewer asset: ${from}`)
  }
  await copyFile(from, to)
}

const copyDirectoryChecked = async (from, to) => {
  const info = await stat(from)
  if (!info.isDirectory()) {
    throw new Error(`[file-viewer] Invalid viewer asset directory: ${from}`)
  }
  await rm(to, { recursive: true, force: true })
  await mkdir(dirname(to), { recursive: true })
  await cp(from, to, { recursive: true, force: true })
}

for (const targetRoot of cadTargetRoots) {
  await mkdir(targetRoot, { recursive: true })
  await copyChecked(join(wasmDir, 'libredwg-web.js'), join(targetRoot, 'libredwg-web.js'))
  await copyChecked(join(wasmDir, 'libredwg-web.wasm'), join(targetRoot, 'libredwg-web.wasm'))
  await copyChecked(join(wasmDir, 'dwfv-render.wasm'), join(targetRoot, 'dwfv-render.wasm'))
  await copyWorkerChunks(targetRoot)
  await copyChecked(dwgWorker, join(targetRoot, 'dwg-worker.js'))
}

for (const targetRoot of typstTargetRoots) {
  await mkdir(targetRoot, { recursive: true })
  await copyChecked(typstCompilerWasm, join(targetRoot, 'typst_ts_web_compiler_bg.wasm'))
  await copyChecked(typstRendererWasm, join(targetRoot, 'typst_ts_renderer_bg.wasm'))
}

for (const targetRoot of dataTargetRoots) {
  await mkdir(targetRoot, { recursive: true })
  await copyChecked(dataSqlWasm, join(targetRoot, 'sql-wasm.wasm'))
}

for (const targetRoot of pdfTargetRoots) {
  await mkdir(targetRoot, { recursive: true })
  await copyChecked(pdfWorker, join(targetRoot, 'pdf.worker.mjs'))
  await copyDirectoryChecked(pdfCmapsDir, join(targetRoot, 'cmaps'))
  await copyDirectoryChecked(pdfWasmDir, join(targetRoot, 'wasm'))
  await copyDirectoryChecked(pdfStandardFontsDir, join(targetRoot, 'standard_fonts'))
}

console.log(
  `[file-viewer] Viewer WASM assets copied to ${
    [...cadTargetRoots, ...typstTargetRoots, ...dataTargetRoots, ...pdfTargetRoots]
      .map(root => root.replace(`${projectRoot}/`, ''))
      .join(', ')
  }`
)
