import { describe, expect, it } from 'vitest';
import { parseHTML } from 'linkedom';
import {
  createEmptyFileViewerSearchState,
  createFileViewerZoomState,
  findFileViewerSearchProvider,
  findFileViewerZoomProvider,
  registerFileViewerSearchProvider,
  registerFileViewerZoomProvider,
  unregisterFileViewerSearchProvider,
  unregisterFileViewerZoomProvider,
  type FileViewerSearchProvider,
  type FileViewerZoomProvider,
} from '../packages/core/src';

describe('core document providers', () => {
  it('registers providers in the core browser layer', async () => {
    const { document } = parseHTML(`
      <main id="root">
        <section id="search" data-viewer-search-provider="pdf"></section>
        <section id="zoom"></section>
      </main>
    `);
    const root = document.getElementById('root') as HTMLElement;
    const searchHost = document.getElementById('search') as HTMLElement;
    const zoomHost = document.getElementById('zoom') as HTMLElement;
    const searchProvider: FileViewerSearchProvider = {
      search: query => createEmptyFileViewerSearchState(query),
    };
    const zoomProvider: FileViewerZoomProvider = {
      zoomIn: () => createFileViewerZoomState({ scale: 1.25 }),
      zoomOut: () => createFileViewerZoomState({ scale: 0.75 }),
      resetZoom: () => createFileViewerZoomState(),
      getState: () => createFileViewerZoomState({ scale: 1 }),
    };

    registerFileViewerSearchProvider(searchHost, searchProvider);
    registerFileViewerZoomProvider(zoomHost, zoomProvider);

    expect(findFileViewerSearchProvider(root)).toBe(searchProvider);
    expect(findFileViewerZoomProvider(zoomHost)).toBe(zoomProvider);
    await expect(Promise.resolve(findFileViewerSearchProvider(root)?.search('pdf'))).resolves.toMatchObject({ query: 'pdf' });

    unregisterFileViewerSearchProvider(searchHost);
    unregisterFileViewerZoomProvider(zoomHost);

    expect(findFileViewerSearchProvider(root)).toBeNull();
    expect(findFileViewerZoomProvider(zoomHost)).toBeNull();
  });
});
