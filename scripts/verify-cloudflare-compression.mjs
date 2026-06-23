const DEFAULT_TARGETS = [
  {
    label: 'official site',
    url: 'https://file-viewer.app/',
    encodings: ['br', 'zstd', 'gzip']
  },
  {
    label: 'docs site',
    url: 'https://doc.file-viewer.app/',
    encodings: ['br', 'zstd', 'gzip']
  },
  {
    label: 'demo site',
    url: 'https://demo.file-viewer.app/',
    encodings: ['br', 'zstd', 'gzip']
  },
  {
    label: 'Typst compiler WASM',
    url: 'https://demo.file-viewer.app/wasm/typst/typst_ts_web_compiler_bg.wasm',
    encodings: ['br'],
    contentType: 'application/wasm'
  }
];

const timeoutMs = Number.parseInt(process.env.CLOUDFLARE_COMPRESSION_TIMEOUT_MS || '20000', 10);

async function requestHead(target) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(target.url, {
      method: 'HEAD',
      headers: {
        'Accept-Encoding': target.encodings.join(', ')
      },
      redirect: 'follow',
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

function headerValue(headers, name) {
  return headers.get(name)?.toLowerCase() || '';
}

const failures = [];

for (const target of DEFAULT_TARGETS) {
  try {
    const response = await requestHead(target);
    const contentEncoding = headerValue(response.headers, 'content-encoding');
    const contentType = headerValue(response.headers, 'content-type');
    const server = headerValue(response.headers, 'server');

    if (!response.ok) {
      failures.push(`${target.label}: ${response.status} ${response.statusText}`);
      continue;
    }

    if (!target.encodings.includes(contentEncoding)) {
      failures.push(
        `${target.label}: expected Content-Encoding ${target.encodings.join('/')} but got ${contentEncoding || '(none)'}`
      );
    }

    if (target.contentType && !contentType.includes(target.contentType)) {
      failures.push(`${target.label}: expected Content-Type ${target.contentType} but got ${contentType || '(none)'}`);
    }

    if (!server.includes('cloudflare')) {
      failures.push(`${target.label}: expected Cloudflare server header but got ${server || '(none)'}`);
    }

    console.log(
      `[cloudflare-compression] ${target.label}: ${response.status} ${contentEncoding || 'identity'} ${contentType || 'unknown'}`
    );
  } catch (error) {
    failures.push(`${target.label}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failures.length) {
  console.error('[cloudflare-compression] Verification failed:');
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log('[cloudflare-compression] Verified Cloudflare compression for site, docs, demo, and Typst WASM.');
