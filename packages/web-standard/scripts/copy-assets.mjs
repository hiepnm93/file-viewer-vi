#!/usr/bin/env node
import { dirname, resolve } from 'node:path'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const packageJson = require.resolve('@flyfish-group/file-viewer-web/package.json')
const script = resolve(dirname(packageJson), 'scripts/copy-assets.mjs')

await import(pathToFileURL(script).href)
