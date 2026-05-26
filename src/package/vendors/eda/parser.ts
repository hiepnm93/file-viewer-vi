import type { CFB$Entry } from 'cfb'

const CFB_MAGIC = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]
const MAX_STREAMS = 200
const MAX_SAMPLE_BYTES = 4096
const MAX_STRINGS = 180

export interface EdaStreamView {
  path: string;
  name: string;
  size: number;
  kind: 'text' | 'binary' | 'storage';
  sample?: string;
}

export interface EdaParseResult {
  type: 'olb' | 'dra';
  parser: 'cfb' | 'binary';
  title: string;
  byteLength: number;
  streamCount: number;
  totalStreamBytes: number;
  streams: EdaStreamView[];
  strings: string[];
  warnings: string[];
}

const toBytes = (buffer: ArrayBuffer) => new Uint8Array(buffer)

const isCfbFile = (bytes: Uint8Array) => {
  return CFB_MAGIC.every((value, index) => bytes[index] === value)
}

const normalizeBytes = (value: CFB$Entry['content']) => {
  return value instanceof Uint8Array ? value : new Uint8Array(value)
}

const cleanupText = (text: string) => {
  return text
    .replace(/\u0000/g, '')
    .replace(/[^\S\r\n]+/g, ' ')
    .replace(/\r\n/g, '\n')
    .trim()
}

const looksLikeText = (bytes: Uint8Array) => {
  if (!bytes.length) {
    return false
  }
  const sample = bytes.slice(0, Math.min(bytes.length, MAX_SAMPLE_BYTES))
  let printable = 0
  for (const byte of sample) {
    if (byte === 9 || byte === 10 || byte === 13 || (byte >= 32 && byte <= 126) || byte >= 0x80) {
      printable += 1
    }
  }
  return printable / sample.length > 0.82
}

const decodeSample = (bytes: Uint8Array) => {
  const sample = bytes.slice(0, Math.min(bytes.length, MAX_SAMPLE_BYTES))
  if (!sample.length) {
    return ''
  }
  try {
    return cleanupText(new TextDecoder('utf-8', { fatal: false }).decode(sample))
  } catch {
    return ''
  }
}

const extractAsciiStrings = (bytes: Uint8Array) => {
  const result: string[] = []
  let current = ''
  for (const byte of bytes) {
    if (byte >= 32 && byte <= 126) {
      current += String.fromCharCode(byte)
      continue
    }
    if (current.length >= 4) {
      result.push(current)
    }
    current = ''
  }
  if (current.length >= 4) {
    result.push(current)
  }
  return result
}

const extractUtf16Strings = (bytes: Uint8Array) => {
  const result: string[] = []
  let current = ''
  for (let index = 0; index + 1 < bytes.length; index += 2) {
    const low = bytes[index]
    const high = bytes[index + 1]
    if (high === 0 && low >= 32 && low <= 126) {
      current += String.fromCharCode(low)
      continue
    }
    if (current.length >= 4) {
      result.push(current)
    }
    current = ''
  }
  if (current.length >= 4) {
    result.push(current)
  }
  return result
}

const collectStrings = (chunks: Uint8Array[]) => {
  const seen = new Set<string>()
  const result: string[] = []
  chunks.forEach(chunk => {
    const candidates = [...extractAsciiStrings(chunk), ...extractUtf16Strings(chunk)]
    candidates.forEach(item => {
      const cleaned = cleanupText(item)
      if (!cleaned || cleaned.length < 4 || seen.has(cleaned) || result.length >= MAX_STRINGS) {
        return
      }
      seen.add(cleaned)
      result.push(cleaned)
    })
  })
  return result
}

const parseCfbContainer = async (buffer: ArrayBuffer, type: 'olb' | 'dra'): Promise<EdaParseResult> => {
  const CFB = await import('cfb')
  const container = CFB.parse(toBytes(buffer), { type: 'array' })
  const streamEntries = container.FileIndex
    .map((entry, index) => ({ entry, path: container.FullPaths[index] || entry.name }))
    .filter(item => item.entry.type !== 5)
    .slice(0, MAX_STREAMS)

  const byteChunks: Uint8Array[] = []
  const streams = streamEntries.map(({ entry, path }) => {
    if (entry.type === 1) {
      return {
        path,
        name: entry.name,
        size: entry.size || 0,
        kind: 'storage' as const
      }
    }
    const content = normalizeBytes(entry.content || [])
    byteChunks.push(content)
    const sample = looksLikeText(content) ? decodeSample(content) : ''
    return {
      path,
      name: entry.name,
      size: entry.size || content.byteLength || 0,
      kind: sample ? 'text' as const : 'binary' as const,
      sample
    }
  })

  const totalStreamBytes = streams.reduce((sum, stream) => sum + stream.size, 0)
  const warnings = streamEntries.length >= MAX_STREAMS
    ? [`仅展示前 ${MAX_STREAMS} 个 CFB 项，完整文件仍可下载后在专业 EDA 工具中打开。`]
    : []

  return {
    type,
    parser: 'cfb',
    title: type === 'olb' ? 'OrCAD Library' : 'OrCAD / Allegro Drawing',
    byteLength: buffer.byteLength,
    streamCount: container.FileIndex.length,
    totalStreamBytes,
    streams,
    strings: collectStrings(byteChunks),
    warnings
  }
}

const parseBinaryFallback = (buffer: ArrayBuffer, type: 'olb' | 'dra'): EdaParseResult => {
  const bytes = toBytes(buffer)
  return {
    type,
    parser: 'binary',
    title: type === 'olb' ? 'OLB Binary Library' : 'DRA Binary Drawing',
    byteLength: buffer.byteLength,
    streamCount: 1,
    totalStreamBytes: buffer.byteLength,
    streams: [{
      path: `${type}.${type}`,
      name: `${type}.${type}`,
      size: buffer.byteLength,
      kind: looksLikeText(bytes) ? 'text' : 'binary',
      sample: decodeSample(bytes)
    }],
    strings: collectStrings([bytes]),
    warnings: ['该文件不是标准 CFB 容器，已退化为安全的二进制字符串索引预览。']
  }
}

export const parseEdaFile = async (buffer: ArrayBuffer, type = 'olb') => {
  const normalizedType = type === 'dra' ? 'dra' : 'olb'
  const bytes = toBytes(buffer)
  if (!isCfbFile(bytes)) {
    return parseBinaryFallback(buffer, normalizedType)
  }
  try {
    return await parseCfbContainer(buffer, normalizedType)
  } catch (error) {
    const fallback = parseBinaryFallback(buffer, normalizedType)
    fallback.warnings.unshift(error instanceof Error ? error.message : String(error))
    return fallback
  }
}
