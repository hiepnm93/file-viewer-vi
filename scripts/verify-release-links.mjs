import { existsSync } from 'node:fs'
import { readdir, readFile, stat } from 'node:fs/promises'
import { dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const sourceRoot = resolve(scriptDir, '..')
const args = process.argv.slice(2)

const readArg = (name, fallback) => {
  const direct = args.find(arg => arg.startsWith(`${name}=`))
  if (direct) return direct.slice(name.length + 1)
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : fallback
}

const mode = readArg('--mode', 'source')
const checkExternal =
  (mode === 'source' || args.includes('--external')) &&
  !args.includes('--no-external') &&
  process.env.FILE_VIEWER_SKIP_EXTERNAL_LINKS !== '1'
const timeoutMs = Number(process.env.FILE_VIEWER_LINK_TIMEOUT_MS || 12000)
const externalConcurrency = Number(process.env.FILE_VIEWER_LINK_CONCURRENCY || 16)
const externalUrls = new Set()

const sourceRoots = [
  'README.md',
  'README.en.md',
  'package.json',
  'packages',
  'docs',
  'apps/official-site/src',
  'apps/official-site/package.json',
  'ecosystem'
]

const distRoots = [
  'apps/viewer-demo/dist',
  'apps/component-demo/dist',
  'apps/official-site/dist',
  'docs/.vitepress/dist',
  'packages/components/web/viewer',
  'packages/compat/web/viewer',
  'packages/components/web-full/dist'
]

const skipDirectories = new Set([
  '.git',
  '.release',
  'node_modules',
  'dist',
  'coverage',
  '.vitepress/cache',
  '.vitepress/dist'
])

const sourceExtensions = new Set(['.md', '.json', '.ts', '.tsx', '.vue', '.html'])
const distExtensions = new Set(['.html', '.css', '.js', '.json'])
const oldDomainPattern = /\b(?:viewer\.flyfish\.dev|doc\.flyfish\.dev)\b/i
const localhostPattern = /\b(?:localhost|127\.0\.0\.1|0\.0\.0\.0)(?::\d+)?\b/i
const forbiddenRuntimeHosts = new Set([
  'cdn.jsdelivr.net',
  'unpkg.com',
  'cdnjs.cloudflare.com',
  'esm.sh',
  'cdn.skypack.dev',
  'jspm.dev'
])
const nonBlockingExternalHosts = new Set([
  'linux.do',
  'www.cadence.com',
  'dev.opencascade.org',
  'git.flyfish.dev',
  'gitee.com'
])
const sourcePublicRoots = [
  'docs',
  'docs/public',
  'apps/official-site/public',
  'apps/viewer-demo/public',
  'apps/component-demo/public'
]

function fail(message) {
  throw new Error(`[release-links] ${message}`)
}

function isSkippedPath(path) {
  const normalized = path.replace(/\\/g, '/')
  const activeSkips = mode === 'dist'
    ? [...skipDirectories].filter(segment => segment !== 'dist' && segment !== '.vitepress/dist')
    : [...skipDirectories]
  return activeSkips.some(segment => normalized.includes(`/${segment}/`) || normalized.endsWith(`/${segment}`))
}

async function collectFiles(input, extensions, files = []) {
  const path = resolve(sourceRoot, input)
  if (!existsSync(path) || isSkippedPath(path)) {
    return files
  }
  const info = await stat(path)
  if (info.isFile()) {
    if (extensions.has(extname(path))) {
      files.push(path)
    }
    return files
  }
  if (!info.isDirectory()) {
    return files
  }
  for (const name of await readdir(path)) {
    await collectFiles(join(input, name), extensions, files)
  }
  return files
}

function stripMarkdownCodeFences(text, file) {
  if (extname(file) !== '.md') {
    return text
  }
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/~~~[\s\S]*?~~~/g, '')
}

function shouldExtractHtmlAttributes(file) {
  return ['.md', '.html', '.vue', '.tsx'].includes(extname(file))
}

function shouldExtractMarkdownLinks(file) {
  return extname(file) === '.md'
}

function extractLinks(text, file) {
  const links = []
  const searchableText = stripMarkdownCodeFences(text, file)
  const add = value => {
    if (!value) return
    const cleaned = value.trim().replace(/^['"]|['"]$/g, '')
    if (!cleaned || cleaned.startsWith('#')) return
    if (/^(?:mailto|tel|data|javascript):/i.test(cleaned)) return
    if (cleaned.includes('{') || cleaned.includes('${')) return
    links.push(cleaned)
  }

  if (shouldExtractMarkdownLinks(file)) {
    for (const match of searchableText.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) add(match[1])
  }
  if (shouldExtractHtmlAttributes(file)) {
    for (const match of searchableText.matchAll(/(?:^|[\s<])(?:href|src)=["']([^"']+)["']/gi)) add(match[1])
  }
  for (const match of searchableText.matchAll(/<(https?:\/\/[^>\s]+)>/g)) add(match[1])
  for (const match of searchableText.matchAll(/\bhttps?:\/\/[^\s"'`)<>{}\\，。；：、]+/g)) add(match[0])

  if (file.endsWith('package.json') || file.includes('/ecosystem/')) {
    try {
      const json = JSON.parse(text)
      const walk = value => {
        if (!value) return
        if (typeof value === 'string') {
          if (/^https?:\/\//.test(value)) add(value)
          return
        }
        if (Array.isArray(value)) {
          value.forEach(walk)
          return
        }
        if (typeof value === 'object') {
          Object.values(value).forEach(walk)
        }
      }
      walk(json)
    } catch {
      // Let JSON syntax errors surface in the existing package/docs checks.
    }
  }

  return [...new Set(links)]
}

function stripUrlNoise(value) {
  return value
    .replace(/[),.;，。；：、]+$/g, '')
    .replace(/&amp;/g, '&')
}

function splitAnchor(value) {
  const cleaned = stripUrlNoise(value)
  const index = cleaned.indexOf('#')
  return index >= 0
    ? { path: cleaned.slice(0, index), anchor: cleaned.slice(index + 1) }
    : { path: cleaned, anchor: '' }
}

function docsPathForAbsoluteLink(pathname) {
  const normalized = pathname.replace(/\/$/, '')
  const candidates = []
  if (normalized === '') {
    candidates.push('docs/index.md')
  } else {
    candidates.push(`docs${normalized}.md`)
    candidates.push(`docs${normalized}/index.md`)
  }
  for (const root of sourcePublicRoots) {
    candidates.push(join(root, decodeURIComponent(pathname)))
  }
  return candidates.map(candidate => resolve(sourceRoot, candidate))
}

function fileCandidatesForSourceLink(file, link) {
  const { path } = splitAnchor(link)
  if (!path || /^https?:\/\//i.test(path)) return []
  if (path.startsWith('/')) return docsPathForAbsoluteLink(path)
  const base = resolve(dirname(file), decodeURIComponent(path))
  const candidates = [base]
  if (!extname(base)) {
    candidates.push(`${base}.md`, join(base, 'index.md'))
  }
  return candidates
}

function findDistRoot(file) {
  return distRoots
    .map(root => resolve(sourceRoot, root))
    .find(root => file === root || file.startsWith(`${root}/`))
}

function fileCandidatesForDistLink(file, link) {
  const { path } = splitAnchor(link)
  if (!path || /^https?:\/\//i.test(path)) return []
  if (path.startsWith('//')) return []
  if (path.startsWith('/')) {
    const distRoot = findDistRoot(file)
    if (!distRoot) return []
    const base = resolve(distRoot, `.${decodeURIComponent(path)}`)
    const candidates = [base]
    if (!extname(base)) {
      candidates.push(`${base}.html`, join(base, 'index.html'))
    }
    return candidates
  }
  const base = resolve(dirname(file), decodeURIComponent(path))
  const candidates = [base]
  if (!extname(base)) {
    candidates.push(`${base}.html`, join(base, 'index.html'))
  }
  return candidates
}

function isLocalExternalUrl(parsed) {
  return ['localhost', '127.0.0.1', '0.0.0.0'].includes(parsed.hostname)
}

function isNonBlockingExternalUrl(parsed) {
  if (nonBlockingExternalHosts.has(parsed.hostname)) {
    return true
  }
  return parsed.hostname === 'github.com' &&
    parsed.pathname.startsWith('/flyfish-dev/file-viewer/releases/download/')
}

function externalFailureTarget(parsed, failures, warnings) {
  return isNonBlockingExternalUrl(parsed) ? warnings : failures
}

function npmRegistryPackageUrl(packageName) {
  if (!packageName) return null
  return packageName.startsWith('@')
    ? `https://registry.npmjs.org/${encodeURIComponent(packageName).replace('%2F', '%2f')}`
    : `https://registry.npmjs.org/${encodeURIComponent(packageName)}`
}

function npmRegistrySearchUrl(parsed) {
  const query = parsed.searchParams.get('q') || parsed.searchParams.get('text')
  if (!query) return null
  const params = new URLSearchParams({ text: query, size: '1' })
  return `https://registry.npmjs.org/-/v1/search?${params.toString()}`
}

async function checkNpmjsUrl(parsed, failures, warnings, signal) {
  if (!['npmjs.com', 'www.npmjs.com'].includes(parsed.hostname)) {
    return false
  }
  let registryUrl = null
  if (parsed.pathname.startsWith('/package/')) {
    registryUrl = npmRegistryPackageUrl(decodeURIComponent(parsed.pathname.slice('/package/'.length)))
  } else if (parsed.pathname === '/search') {
    registryUrl = npmRegistrySearchUrl(parsed)
  }
  if (!registryUrl) {
    return false
  }
  try {
    const response = await fetch(registryUrl, {
      method: 'GET',
      redirect: 'follow',
      signal,
      headers: {
        accept: 'application/json',
        'user-agent': 'file-viewer-release-link-check/1.0'
      }
    })
    if (response.status >= 400) {
      failures.push(`npm registry target returned HTTP ${response.status}: ${parsed.href}`)
    }
  } catch (error) {
    warnings.push(`npm registry target could not be checked for ${parsed.href}: ${error instanceof Error ? error.message : String(error)}`)
  }
  return true
}

async function checkExternalUrl(url, failures, warnings) {
  if (!checkExternal) return
  let parsed
  try {
    parsed = new URL(stripUrlNoise(url))
  } catch {
    failures.push(`Invalid external URL: ${url}`)
    return
  }
  if (isLocalExternalUrl(parsed)) {
    return
  }
  const target = externalFailureTarget(parsed, failures, warnings)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    if (await checkNpmjsUrl(parsed, failures, warnings, controller.signal)) {
      return
    }
    let response = await fetch(parsed, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': 'file-viewer-release-link-check/1.0'
      }
    })
    if (response.status === 405 || response.status === 403) {
      response = await fetch(parsed, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'user-agent': 'file-viewer-release-link-check/1.0'
        }
      })
    }
    if (response.status >= 400) {
      target.push(`External URL returned HTTP ${response.status}: ${parsed.href}`)
    }
  } catch (error) {
    target.push(`External URL is not reachable: ${parsed.href} (${error instanceof Error ? error.message : String(error)})`)
  } finally {
    clearTimeout(timer)
  }
}

async function checkExternalUrls(urls, failures, warnings) {
  if (!checkExternal || !urls.length) return
  const concurrency = Math.max(1, Math.min(externalConcurrency, urls.length))
  let index = 0
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (index < urls.length) {
      const currentIndex = index
      index += 1
      await checkExternalUrl(urls[currentIndex], failures, warnings)
    }
  }))
}

function assertNoForbiddenRuntimeLinks(file, text, failures) {
  if (mode !== 'dist') return
  if (oldDomainPattern.test(text)) {
    failures.push(`${file} references a deprecated flyfish.dev viewer/doc domain`)
  }
  if (
    extname(file) === '.html' ||
    file.startsWith('docs/.vitepress/dist/') ||
    file.startsWith('apps/official-site/dist/')
  ) {
    return
  }
  if (localhostPattern.test(text)) {
    failures.push(`${file} references localhost or a loopback address`)
  }
  for (const host of forbiddenRuntimeHosts) {
    if (text.includes(host)) {
      failures.push(`${file} references forbidden runtime CDN host ${host}`)
    }
  }
}

async function verifyLink(file, link, failures) {
  const value = stripUrlNoise(link)
  if (oldDomainPattern.test(value)) {
    failures.push(`${file} references deprecated domain in ${value}`)
  }
  if (/^https?:\/\//i.test(value)) {
    if (checkExternal) {
      externalUrls.add(value)
    }
    return
  }
  if (/^(?:#|mailto:|tel:|data:|javascript:)/i.test(value)) {
    return
  }
  const candidates = mode === 'dist'
    ? fileCandidatesForDistLink(file, value)
    : fileCandidatesForSourceLink(file, value)
  if (!candidates.length) {
    return
  }
  if (!candidates.some(candidate => existsSync(candidate))) {
    failures.push(`${file} links to missing local target ${value}`)
  }
}

const roots = mode === 'dist' ? distRoots : sourceRoots
const extensions = mode === 'dist' ? distExtensions : sourceExtensions
if (mode !== 'source' && mode !== 'dist') {
  fail('--mode must be source or dist')
}

const files = []
for (const root of roots) {
  await collectFiles(root, extensions, files)
}
if (!files.length) {
  fail(`No ${mode} files found to scan.`)
}

const failures = []
const warnings = []
let checkedLinks = 0
for (const file of files.sort()) {
  const relativeFile = file.replace(`${sourceRoot}/`, '')
  const text = await readFile(file, 'utf8')
  assertNoForbiddenRuntimeLinks(relativeFile, text, failures)
  for (const link of extractLinks(text, file)) {
    checkedLinks += 1
    await verifyLink(relativeFile, link, failures)
  }
}
await checkExternalUrls([...externalUrls].sort(), failures, warnings)

if (failures.length) {
  fail(`${mode} link verification failed:\n${failures.slice(0, 80).join('\n')}${failures.length > 80 ? `\n... ${failures.length - 80} more` : ''}`)
}

if (warnings.length) {
  console.warn(`[release-links] Non-blocking external warnings:\n${warnings.slice(0, 40).join('\n')}${warnings.length > 40 ? `\n... ${warnings.length - 40} more` : ''}`)
}

console.log(`[release-links] Verified ${checkedLinks} ${mode} links across ${files.length} files${checkExternal ? ` with ${externalUrls.size} external URLs checked` : ' without external reachability'}.`)
