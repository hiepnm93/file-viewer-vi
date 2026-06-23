import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(new URL('..', import.meta.url).pathname)

function read(path) {
  return readFileSync(resolve(root, path), 'utf8')
}

function assertIncludes(content, needle, label) {
  if (!content.includes(needle)) {
    throw new Error(`${label} is missing ${needle}`)
  }
}

function assertFile(path) {
  if (!existsSync(resolve(root, path))) {
    throw new Error(`Missing documentation file: ${path}`)
  }
}

const config = read('docs/.vitepress/config.ts')
const site = read('apps/official-site/src/App.vue')
const zhHome = read('docs/index.md')
const enHome = read('docs/en/index.md')

const requiredZhLinks = [
  '/guide/quickstart-web',
  '/guide/quickstart-vue3',
  '/guide/quickstart-vue2',
  '/guide/quickstart-react',
  '/guide/ecosystem#jquery',
  '/guide/ecosystem#svelte',
  '/guide/on-demand-renderers',
  '/guide/usage',
  '/guide/docker',
  '/guide/distribution'
]

const requiredEnLinks = [
  '/en/guide/quickstart-web',
  '/en/guide/quickstart-vue3',
  '/en/guide/quickstart-vue2',
  '/en/guide/quickstart-react',
  '/en/guide/ecosystem#jquery',
  '/en/guide/ecosystem#svelte',
  '/en/guide/on-demand-renderers',
  '/en/guide/usage',
  '/en/guide/docker',
  '/en/guide/distribution'
]

const requiredEnFiles = [
  'docs/en/guide/index.md',
  'docs/en/guide/overview.md',
  'docs/en/guide/demo.md',
  'docs/en/guide/quickstart.md',
  'docs/en/guide/quickstart-web.md',
  'docs/en/guide/quickstart-vue3.md',
  'docs/en/guide/quickstart-vue2.md',
  'docs/en/guide/quickstart-react.md',
  'docs/en/guide/ecosystem.md',
  'docs/en/guide/on-demand-renderers.md',
  'docs/en/guide/usage.md',
  'docs/en/guide/formats.md',
  'docs/en/guide/format-fidelity.md',
  'docs/en/guide/faq.md',
  'docs/en/guide/development.md',
  'docs/en/guide/docker.md',
  'docs/en/guide/distribution.md'
]

for (const link of requiredZhLinks) assertIncludes(config, link, 'Chinese docs navigation')
for (const link of requiredEnLinks) assertIncludes(config, link, 'English docs navigation')
for (const file of requiredEnFiles) assertFile(file)

for (const content of [config, zhHome, enHome, site]) {
  assertIncludes(content, '206', 'public format count')
  assertIncludes(content, '24', 'public renderer pipeline count')
}

assertIncludes(site, "docsUrl = 'https://doc.file-viewer.app/'", 'official site docs URL')
assertIncludes(site, '<iframe', 'official site docs embed')
assertIncludes(site, 'resolveInitialLocale', 'official site locale detection')
assertIncludes(enHome, 'Modular Integration', 'English docs homepage')
assertIncludes(enHome, 'Flyfish Viewer', 'English docs homepage')

console.log('[docs-portal] Verified bilingual docs navigation, portal iframe, domains, and public count references.')
