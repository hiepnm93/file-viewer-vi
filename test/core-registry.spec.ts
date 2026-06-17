import { describe, expect, it } from 'vitest';
import {
  DEFAULT_RENDERER_DEFINITIONS,
  DEFAULT_SUPPORTED_EXTENSIONS,
  createRendererRegistry,
  createViewer,
  getExtension,
  normalizeSource,
  type RendererDefinition,
} from '../packages/core/src';

describe('@file-viewer/core registry', () => {
  it('keeps the current public format matrix at 194 extensions', () => {
    expect(DEFAULT_SUPPORTED_EXTENSIONS).toHaveLength(194);
    expect(DEFAULT_SUPPORTED_EXTENSIONS).toContain('pdf');
    expect(DEFAULT_SUPPORTED_EXTENSIONS).toContain('docx');
    expect(DEFAULT_SUPPORTED_EXTENSIONS).toContain('dwf');
    expect(DEFAULT_SUPPORTED_EXTENSIONS).toContain('zip');
    expect(DEFAULT_SUPPORTED_EXTENSIONS).toContain('typst');
  });

  it('normalizes file names, query strings and explicit type overrides', () => {
    expect(getExtension('/docs/report.PDF?token=1')).toBe('pdf');
    expect(normalizeSource({ url: 'https://example.com/a/b/合同.docx?download=1' })).toMatchObject({
      kind: 'url',
      filename: '合同.docx',
      extension: 'docx',
    });
    expect(normalizeSource({ buffer: new ArrayBuffer(8), filename: 'raw.bin', type: '.ofd' })).toMatchObject({
      kind: 'buffer',
      filename: 'raw.bin',
      extension: 'ofd',
      size: 8,
    });
  });

  it('resolves renderers by extension and rejects duplicate extension ownership', () => {
    const registry = createRendererRegistry();

    expect(registry.getByExtension('.PDF')?.id).toBe('pdf');
    expect(registry.getByExtension('dwfx')?.id).toBe('cad');
    expect(registry.getByExtension('zip')?.id).toBe('archive');

    expect(() => {
      registry.register({
        id: 'duplicate-pdf',
        label: 'Duplicate PDF',
        category: 'document',
        extensions: ['pdf'],
      });
    }).toThrow(/already registered/);
  });

  it('runs a minimal framework-neutral load and unload lifecycle', async () => {
    const events: string[] = [];
    const renderer: RendererDefinition = {
      id: 'fixture',
      label: 'Fixture',
      category: 'document',
      extensions: ['fixture'],
      capabilities: { download: true, print: true, exportHtml: true, zoom: true, search: true },
      load: async ({ surface, source }) => {
        surface.container.dataset.loaded = source.filename;
        return {
          destroy: () => {
            surface.container.dataset.destroyed = 'true';
          },
          getAvailability: () => ({
            zoomIn: true,
            zoomOut: true,
            zoomReset: true,
          }),
        };
      },
    };

    const registry = createRendererRegistry([
      ...DEFAULT_RENDERER_DEFINITIONS,
      renderer,
    ]);
    const container = { dataset: {} } as unknown as HTMLElement;
    const viewer = createViewer(container, {
      registry,
      options: {
        hooks: {
          onLoadStart: context => events.push(`${context.phase}:${context.type}`),
          onLoadComplete: context => events.push(`${context.phase}:${context.filename}`),
          onUnloadStart: context => events.push(`${context.phase}:${context.reason}`),
          onUnloadComplete: context => events.push(`${context.phase}:${context.reason}`),
        },
      },
    });

    await viewer.load({ buffer: new ArrayBuffer(1), filename: 'demo.fixture' });

    expect(container.dataset.loaded).toBe('demo.fixture');
    expect(viewer.getCapabilities()).toMatchObject({
      download: true,
      print: true,
      exportHtml: true,
      zoom: true,
      zoomIn: true,
      zoomOut: true,
      zoomReset: true,
    });

    await viewer.destroy();

    expect(container.dataset.destroyed).toBe('true');
    expect(events).toEqual([
      'load-start:fixture',
      'load-complete:demo.fixture',
      'unload-start:component-unmount',
      'unload-complete:component-unmount',
    ]);
  });
});
