import { normalizeFileExtension } from './source';
import type { FileViewerOperationAvailability, RendererDefinition, RendererSession } from './types';

export const DEFAULT_OPERATION_AVAILABILITY: FileViewerOperationAvailability = Object.freeze({
  download: false,
  print: false,
  exportHtml: false,
  zoom: false,
  zoomIn: false,
  zoomOut: false,
  zoomReset: false,
});

const resolveBooleanCapability = (value: boolean | 'adapter' | 'provider' | undefined) => {
  return value === true || value === 'adapter' || value === 'provider';
};

export const getRendererAvailability = (
  renderer: RendererDefinition | undefined,
  session?: RendererSession | null
): FileViewerOperationAvailability => {
  if (!renderer) {
    return { ...DEFAULT_OPERATION_AVAILABILITY };
  }

  const base: FileViewerOperationAvailability = {
    download: renderer.capabilities?.download !== false,
    print: resolveBooleanCapability(renderer.capabilities?.print),
    exportHtml: resolveBooleanCapability(renderer.capabilities?.exportHtml),
    zoom: resolveBooleanCapability(renderer.capabilities?.zoom),
    zoomIn: resolveBooleanCapability(renderer.capabilities?.zoom),
    zoomOut: resolveBooleanCapability(renderer.capabilities?.zoom),
    zoomReset: resolveBooleanCapability(renderer.capabilities?.zoom),
  };

  return {
    ...base,
    ...session?.getAvailability?.(),
  };
};

export const createUnsupportedAvailability = (extension: string): FileViewerOperationAvailability => ({
  ...DEFAULT_OPERATION_AVAILABILITY,
  download: normalizeFileExtension(extension).length > 0,
});
