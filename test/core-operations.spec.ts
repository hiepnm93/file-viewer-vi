import { describe, expect, it, vi } from 'vitest';
import {
  buildFileViewerLifecycleContext,
  buildFileViewerOperationContext,
  createFileViewerPostMessagePayload,
  normalizeFileViewerToolbar,
  resolveFileViewerOperationAvailability,
  resolveFileViewerToolbarPosition,
  resolveVisibleFileViewerToolbar,
  runFileViewerBeforeOperation,
  runFileViewerLifecycleHook,
} from '../packages/core/src';

describe('@file-viewer/core operation helpers', () => {
  it('builds lifecycle and operation contexts without framework state', () => {
    const context = buildFileViewerLifecycleContext({
      phase: 'load-complete',
      source: 'url',
      url: '/docs/%E6%8A%A5%E5%91%8A.pdf?token=1',
      version: 7,
      startedAt: 1000,
      timestamp: 1240,
      bufferSize: 4096,
    });

    expect(context).toMatchObject({
      phase: 'load-complete',
      type: 'pdf',
      filename: '报告.pdf',
      source: 'url',
      url: '/docs/%E6%8A%A5%E5%91%8A.pdf?token=1',
      size: 4096,
      version: 7,
      timestamp: 1240,
      duration: 240,
    });

    expect(buildFileViewerOperationContext('print', context, 1300)).toMatchObject({
      operation: 'print',
      label: '打印完整渲染内容',
      filename: '报告.pdf',
      timestamp: 1300,
    });
  });

  it('serializes postMessage contexts without leaking File objects', () => {
    const file = new File(['demo'], 'demo.docx');
    const context = buildFileViewerLifecycleContext({
      phase: 'load-start',
      source: 'file',
      file,
      version: 1,
      timestamp: 10,
    });

    expect(createFileViewerPostMessagePayload('flyfish-viewer:lifecycle', 'load-start', context)).toEqual({
      type: 'flyfish-viewer:lifecycle',
      event: 'load-start',
      payload: {
        phase: 'load-start',
        type: 'docx',
        filename: 'demo.docx',
        source: 'file',
        url: undefined,
        size: 4,
        version: 1,
        timestamp: 10,
        duration: undefined,
        reason: undefined,
        hasFile: true,
      },
    });
  });

  it('runs lifecycle hooks and operation guards in deterministic order', async () => {
    const events: string[] = [];
    const context = buildFileViewerLifecycleContext({
      phase: 'load-start',
      source: 'file',
      filename: 'guard.pdf',
      version: 1,
      timestamp: 10,
    });
    const operationContext = buildFileViewerOperationContext('download', context, 12);

    await runFileViewerLifecycleHook(context, {
      onLoadStart: nextContext => events.push(`lifecycle:${nextContext.phase}`),
    });

    const allowed = await runFileViewerBeforeOperation({
      context: operationContext,
      options: {
        beforeOperation: nextContext => {
          events.push(`global:${nextContext.operation}`);
        },
        toolbar: {
          beforeOperation: nextContext => {
            events.push(`toolbar:${nextContext.operation}`);
          },
          beforeDownload: () => {
            events.push('download:false');
            return false;
          },
        },
      },
      onBefore: nextContext => events.push(`before:${nextContext.operation}`),
      onCancel: nextContext => events.push(`cancel:${nextContext.operation}`),
    });

    expect(allowed).toBe(false);
    expect(events).toEqual([
      'lifecycle:load-start',
      'before:download',
      'global:download',
      'toolbar:download',
      'download:false',
      'cancel:download',
    ]);
  });

  it('normalizes toolbar visibility and operation availability in core', () => {
    expect(normalizeFileViewerToolbar(undefined)).toEqual({
      download: true,
      print: true,
      exportHtml: true,
      zoom: true,
    });
    expect(normalizeFileViewerToolbar({ toolbar: false })).toEqual({
      download: false,
      print: false,
      exportHtml: false,
      zoom: false,
    });

    const availability = resolveFileViewerOperationAvailability({
      extension: 'pdf',
      hasOriginalSource: true,
      renderedReady: true,
      adapter: { toHtml: () => '<main>pdf</main>' },
      zoomState: {
        scale: 1,
        label: '100%',
        canZoomIn: true,
        canZoomOut: false,
        canReset: false,
      },
    });

    expect(availability).toMatchObject({
      download: true,
      print: true,
      exportHtml: true,
      zoom: true,
      zoomIn: true,
      zoomOut: false,
      zoomReset: false,
    });
    expect(resolveVisibleFileViewerToolbar({ download: true, print: false, exportHtml: true, zoom: true }, availability)).toEqual({
      download: true,
      print: false,
      exportHtml: true,
      zoom: true,
    });
    expect(resolveFileViewerToolbarPosition(undefined, 'pdf')).toBe('bottom-right');
    expect(resolveFileViewerToolbarPosition({ toolbar: { position: 'top' } }, 'pdf')).toBe('top');
  });

  it('reports operation guard errors and cancels the operation', async () => {
    const onError = vi.fn();
    const onCancel = vi.fn();
    const context = buildFileViewerOperationContext('print', buildFileViewerLifecycleContext({
      phase: 'load-complete',
      source: 'file',
      filename: 'broken.pdf',
      version: 1,
      timestamp: 10,
    }));

    await expect(runFileViewerBeforeOperation({
      context,
      options: {
        beforeOperation: () => {
          throw new Error('denied');
        },
      },
      onError,
      onCancel,
    })).resolves.toBe(false);

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledWith(context);
  });
});
