import { describe, expect, it } from 'vitest';
import {
  buildFileViewerDocumentTextChunks,
  createEmptyFileViewerSearchState,
  createFileViewerZoomState,
  normalizeFileViewerAiOptions,
  normalizeFileViewerSearchOptions,
  type FileViewerDocumentAnchor,
  type FileViewerSearchProvider,
  type FileViewerZoomProvider,
} from '../packages/core/src';

const anchor = (id: string, text: string, line = 1): FileViewerDocumentAnchor => ({
  id,
  index: line - 1,
  line,
  type: 'line',
  label: text.slice(0, 12),
  text,
  top: line * 10,
  left: 0,
  width: 100,
  height: 20,
});

describe('@file-viewer/core document helpers', () => {
  it('normalizes zoom state for wrapper toolbars', () => {
    expect(createFileViewerZoomState()).toEqual({
      scale: 1,
      label: '100%',
      canZoomIn: false,
      canZoomOut: false,
      canReset: false,
      minScale: undefined,
      maxScale: undefined,
    });
    expect(createFileViewerZoomState({ scale: 1.25, canZoomIn: true })).toMatchObject({
      scale: 1.25,
      label: '125%',
      canZoomIn: true,
    });
  });

  it('normalizes search and AI option shorthands', () => {
    expect(normalizeFileViewerSearchOptions(false)).toEqual({ enabled: false });
    expect(normalizeFileViewerSearchOptions(true)).toEqual({});
    expect(createEmptyFileViewerSearchState('pdf')).toEqual({
      query: 'pdf',
      total: 0,
      currentIndex: -1,
      current: null,
      matches: [],
    });

    expect(normalizeFileViewerAiOptions(false)).toEqual({ enabled: false, collectText: false });
    expect(normalizeFileViewerAiOptions({ chunkSize: 256 })).toEqual({ chunkSize: 256 });
  });

  it('builds AI-friendly document text chunks with overlap and limits', () => {
    const longText = Array.from({ length: 450 }, (_, index) => String.fromCharCode(97 + (index % 26))).join('');
    const chunks = buildFileViewerDocumentTextChunks(
      [anchor('intro', longText, 3)],
      { chunkSize: 120, chunkOverlap: 50, maxTextLength: 420 }
    );

    expect(chunks.map(chunk => ({
      id: chunk.id,
      length: chunk.text.length,
      startLine: chunk.startLine,
      endLine: chunk.endLine,
    }))).toEqual([
      { id: 'intro-chunk-1', length: 200, startLine: 3, endLine: 3 },
      { id: 'intro-chunk-2', length: 200, startLine: 3, endLine: 3 },
      { id: 'intro-chunk-3', length: 120, startLine: 3, endLine: 3 },
    ]);

    expect(buildFileViewerDocumentTextChunks([anchor('intro', 'text')], false)).toEqual([]);
  });

  it('exposes renderer provider contracts from core', async () => {
    const zoomProvider: FileViewerZoomProvider = {
      zoomIn: async () => createFileViewerZoomState({ scale: 1.1 }),
      zoomOut: async () => createFileViewerZoomState({ scale: 0.9 }),
      resetZoom: async () => createFileViewerZoomState(),
      getState: () => createFileViewerZoomState(),
    };
    const searchProvider: FileViewerSearchProvider = {
      search: async query => ({
        query,
        total: 0,
        currentIndex: -1,
        current: null,
        matches: [],
      }),
    };

    await expect(zoomProvider.zoomIn()).resolves.toMatchObject({ scale: 1.1 });
    await expect(searchProvider.search('cad')).resolves.toMatchObject({ query: 'cad' });
  });
});
