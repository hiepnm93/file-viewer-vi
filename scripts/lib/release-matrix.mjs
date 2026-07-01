import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import {
  ecosystemPackageManifestEntry,
  loadEcosystemReleaseContext,
  readJson
} from './ecosystem-packages.mjs'
import {
  readCoreRendererDefinitions,
  summarizeRendererSupport
} from './format-support.mjs'

const canonicalSurfaceDefinitions = [
  {
    id: 'vanilla-mount',
    label: 'Vanilla JS mountViewer',
    appliesTo: ['web'],
    requiredEntryFormats: ['esm']
  },
  {
    id: 'web-component',
    label: 'Web Component custom element',
    appliesTo: ['web'],
    requiredEntryFormats: ['iife']
  },
  {
    id: 'script-iife',
    label: 'Script tag IIFE',
    appliesTo: ['web'],
    requiredEntryFormats: ['iife']
  },
  {
    id: 'vue3',
    label: 'Vue 3',
    appliesTo: ['vue3'],
    requiredEntryFormats: ['esm', 'types']
  },
  {
    id: 'vue2.7',
    label: 'Vue 2.7',
    appliesTo: ['vue2.7'],
    requiredEntryFormats: ['esm', 'types']
  },
  {
    id: 'vue2.6',
    label: 'Vue 2.6',
    appliesTo: ['vue2.6'],
    requiredEntryFormats: ['esm', 'types']
  },
  {
    id: 'react',
    label: 'React 18/19',
    appliesTo: ['react'],
    requiredEntryFormats: ['esm', 'types']
  },
  {
    id: 'react-legacy',
    label: 'React 16.8/17',
    appliesTo: ['react-legacy'],
    requiredEntryFormats: ['esm', 'types']
  },
  {
    id: 'jquery',
    label: 'jQuery',
    appliesTo: ['jquery'],
    requiredEntryFormats: ['esm', 'types']
  },
  {
    id: 'svelte',
    label: 'Svelte',
    appliesTo: ['svelte'],
    requiredEntryFormats: ['svelte-component', 'esm', 'types']
  }
]

const releaseChannels = [
  {
    id: 'npm',
    label: 'npm registry',
    blocking: true
  },
  {
    id: 'github-release',
    label: 'GitHub Release assets',
    blocking: true
  },
  {
    id: 'cloudflare-demo',
    label: 'demo.file-viewer.app',
    blocking: true
  },
  {
    id: 'cloudflare-docs',
    label: 'doc.file-viewer.app',
    blocking: true
  },
  {
    id: 'cloudflare-site',
    label: 'file-viewer.app',
    blocking: true
  },
  {
    id: 'github-source',
    label: 'GitHub source repositories',
    blocking: true
  },
  {
    id: 'gitee-mirror',
    label: 'Gitee mirror repositories',
    blocking: false
  },
  {
    id: 'docker',
    label: 'Docker image',
    blocking: true
  }
]

const productionTargets = [
  {
    id: 'site',
    url: 'https://file-viewer.app',
    buildScript: 'site:build',
    deployScript: 'site:deploy:cloudflare',
    blocking: true
  },
  {
    id: 'demo',
    url: 'https://demo.file-viewer.app',
    buildScript: 'build-only',
    deployScript: 'deploy:cloudflare',
    blocking: true
  },
  {
    id: 'docs',
    url: 'https://doc.file-viewer.app',
    buildScript: 'docs:build',
    deployScript: 'docs:deploy:cloudflare',
    blocking: true
  }
]

const surfaceFamily = wrapper => {
  const basePackage = wrapper.basePackage || wrapper.packageName
  if (basePackage.includes('/web')) return 'web'
  if (basePackage.includes('/vue3')) return 'vue3'
  if (basePackage.includes('/vue2.7')) return 'vue2.7'
  if (basePackage.includes('/vue2.6')) return 'vue2.6'
  if (basePackage.includes('/react-legacy')) return 'react-legacy'
  if (basePackage.includes('/react')) return 'react'
  if (basePackage.includes('/jquery')) return 'jquery'
  if (basePackage.includes('/svelte')) return 'svelte'
  return wrapper.id.replace(/-full$/, '')
}

const sortById = items => [...items].sort((a, b) => a.id.localeCompare(b.id))

const packageReleaseGroup = entry => {
  if (entry.kind === 'standard-wrapper') {
    return entry.wrapper?.flavor === 'full' ? 'component-full' : 'component-standard'
  }
  return entry.kind
}

function mapComponentTargets(wrapperManifest) {
  return wrapperManifest.wrappers.map(wrapper => {
    const family = surfaceFamily(wrapper)
    const isFull = wrapper.flavor === 'full' || wrapper.id.endsWith('-full')
    return {
      id: wrapper.id,
      packageName: wrapper.packageName,
      packageDir: wrapper.packageDir,
      framework: wrapper.framework,
      family,
      flavor: isFull ? 'full' : 'standard',
      basePackage: wrapper.basePackage || null,
      surfaces: canonicalSurfaceDefinitions
        .filter(surface => surface.appliesTo.includes(family))
        .map(surface => surface.id),
      presetPolicy: isFull ? 'preset-all-by-default' : 'explicit-preset-all',
      entryFormats: wrapper.entryFormats || [],
      historicalPackages: wrapper.historicalPackages || []
    }
  })
}

function mapRenderChains(smokeMatrix) {
  return sortById((smokeMatrix.cases || []).map(testCase => ({
    id: testCase.id,
    family: testCase.family,
    rendererId: testCase.rendererId,
    extension: testCase.extension,
    sample: testCase.sample,
    smokeSurfaces: testCase.surfaces || [],
    assertions: testCase.assertions || []
  })))
}

function mapWrapperFamilyTargets(smokeMatrix) {
  return (smokeMatrix.wrapperCoverage?.requiredFamilies || []).map(family => ({
    family: family.family,
    rendererId: family.rendererId,
    extension: family.extension,
    sample: family.sample,
    assertions: family.assertions || []
  }))
}

function mapMatrixTargets(componentTargets, renderChains) {
  return componentTargets.flatMap(component =>
    renderChains.map(chain => ({
      id: `${component.id}:${chain.id}`,
      componentId: component.id,
      packageName: component.packageName,
      componentFlavor: component.flavor,
      presetPolicy: component.presetPolicy,
      surfaces: component.surfaces,
      renderChainId: chain.id,
      rendererId: chain.rendererId,
      extension: chain.extension,
      sample: chain.sample,
      assertions: chain.assertions
    }))
  )
}

function mapSpecialBrowserChecks() {
  return [
    {
      id: 'web-full-iife-pptx-subpath',
      script: 'verify:web-full-iife-pptx',
      covers: ['script-iife', 'pptx', 'subpath-assets']
    },
    {
      id: 'issue71-full-rendering',
      script: 'verify:issue71-full-rendering-smoke',
      covers: ['full-packages', 'pptx', 'docx', 'pdf', 'zip', 'vite']
    },
    {
      id: 'issue72-web-full-iife-custom-element',
      script: 'verify:issue72-web-full-iife',
      covers: ['web-component', 'script-iife', 'pptx-worker', 'floating-toolbar']
    },
    {
      id: 'vite-plugin-auto-scan',
      script: 'verify:vite-plugin-auto-scan',
      covers: ['vite-plugin', 'pnpm-strict', 'copy-assets']
    },
    {
      id: 'vite-plugin-format-coverage',
      script: 'verify:vite-plugin-format-coverage',
      covers: ['vite-plugin', 'all-renderer-packages']
    }
  ]
}

export async function buildReleaseMatrix(sourceRoot) {
  const [context, renderers, smokeMatrix, rootPackageSource] = await Promise.all([
    loadEcosystemReleaseContext(sourceRoot),
    readCoreRendererDefinitions(sourceRoot),
    readJson(join(sourceRoot, 'ecosystem', 'smoke-matrix.json')),
    readFile(join(sourceRoot, 'package.json'), 'utf8')
  ])
  const { rootPackage, wrapperManifest, entries } = context
  const rendererSummary = summarizeRendererSupport(renderers)
  const packages = entries.map(entry => ({
    ...ecosystemPackageManifestEntry(entry),
    releaseGroup: packageReleaseGroup(entry),
    blocking: true,
    entryFormats: entry.wrapper?.entryFormats || entry.renderer?.entryFormats || entry.preset?.entryFormats || []
  }))
  const componentTargets = mapComponentTargets(wrapperManifest)
  const renderChains = mapRenderChains(smokeMatrix)
  const wrapperFamilyTargets = mapWrapperFamilyTargets(smokeMatrix)
  const matrixTargets = mapMatrixTargets(componentTargets, renderChains)
  const packageGroups = packages.reduce((groups, entry) => {
    groups[entry.releaseGroup] = (groups[entry.releaseGroup] || 0) + 1
    return groups
  }, {})

  return {
    schemaVersion: 1,
    generatedFrom: {
      rootPackageHash: Buffer.from(rootPackageSource).toString('base64url').slice(0, 16),
      releaseMatrixSchema: 'ecosystem/release-matrix.schema.json',
      wrapperManifest: 'ecosystem/wrappers.json',
      smokeMatrix: 'ecosystem/smoke-matrix.json',
      rendererDefinitions: 'packages/core/src/registry/formats.ts'
    },
    version: rootPackage.version,
    releasePolicy: {
      defaultBlocking: true,
      nonBlockingChannels: ['gitee-mirror'],
      externalRuntimeAssets: 'forbidden',
      fullPackagePresetPolicy: 'preset-all-by-default',
      standardPackagePresetPolicy: 'explicit-preset-all'
    },
    counts: {
      packages: packages.length,
      componentTargets: componentTargets.length,
      surfaces: canonicalSurfaceDefinitions.length,
      renderChains: renderChains.length,
      rendererIds: renderers.size,
      uniqueExtensions: rendererSummary.uniqueExtensionCount,
      wrapperFamilyTargets: componentTargets.length * wrapperFamilyTargets.length,
      exhaustiveComponentRenderTargets: matrixTargets.length
    },
    packageGroups,
    releaseChannels,
    productionTargets,
    surfaces: canonicalSurfaceDefinitions,
    packages,
    componentTargets,
    renderChains,
    wrapperFamilyTargets,
    matrixTargets,
    specialBrowserChecks: mapSpecialBrowserChecks(),
    assetFamilies: [
      'pdf-worker-cmaps-wasm-fonts',
      'docx-worker-jszip',
      'pptx-worker',
      'xlsx-worker',
      'archive-libarchive-worker-wasm',
      'cad-workers-wasm',
      'typst-wasm-fonts',
      'drawio-vendor',
      'sql-wasm'
    ]
  }
}

export function stableStringify(value) {
  return `${JSON.stringify(value, null, 2)}\n`
}

export function normalizeMatrixForCompare(value) {
  return JSON.parse(JSON.stringify(value))
}
