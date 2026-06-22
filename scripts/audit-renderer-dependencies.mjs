import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const readJson = path => JSON.parse(readFileSync(resolve(root, path), 'utf8'));

const rendererGroups = {
  office: [
    '@file-viewer/docx',
    '@file-viewer/pptx',
    'msdoc-viewer',
    'styled-exceljs',
    'e-virt-table',
    'rtf.js',
    'jszip',
  ],
  document: [
    'pdfjs-dist',
    '@myriaddreamin/typst.ts',
    '@myriaddreamin/typst-ts-renderer',
    '@myriaddreamin/typst-ts-web-compiler',
    'ofd-xml-parser',
    'linkedom',
  ],
  engineering: [
    '@flyfish-dev/cad-viewer',
    'three',
    '@excalidraw/excalidraw',
    'roughjs',
    'cfb',
    '@ljheee/xmind-parser',
    '@tmcw/togeojson',
    'shpjs',
  ],
  archiveEmailEbook: [
    'libarchive.js',
    'postal-mime',
    '@kenjiuno/msgreader',
    'epubjs',
    'pako',
  ],
  mediaAndData: [
    'highlight.js',
    'marked',
    'heic2any',
    'hls.js',
    '@tonejs/midi',
    'ag-psd',
    'sql.js',
    'hyparquet',
    'avsc',
  ],
  smallShared: [
    '@xmldom/xmldom',
    'tinycolor2',
  ],
};

const groupByDependency = new Map(
  Object.entries(rendererGroups).flatMap(([group, dependencies]) => (
    dependencies.map(name => [name, group])
  ))
);

const corePackage = readJson('packages/core/package.json');
const dependencies = Object.keys(corePackage.dependencies || {}).sort();
const rows = dependencies.map(name => ({
  dependency: name,
  group: groupByDependency.get(name) || 'unclassified',
  version: corePackage.dependencies[name],
}));

const byGroup = rows.reduce((result, row) => {
  result[row.group] ||= [];
  result[row.group].push(row);
  return result;
}, {});

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ total: rows.length, groups: byGroup, rows }, null, 2));
} else {
  console.log(`@file-viewer/core direct dependencies: ${rows.length}`);
  Object.entries(byGroup).forEach(([group, items]) => {
    console.log(`\n[${group}] ${items.length}`);
    items.forEach(item => {
      console.log(`  - ${item.dependency}@${item.version}`);
    });
  });
  if (byGroup.unclassified?.length) {
    console.log('\nUnclassified dependencies must be reviewed before renderer modularization gates become blocking.');
  }
}
