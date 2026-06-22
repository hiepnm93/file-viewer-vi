import { DEFAULT_RENDERER_DEFINITIONS, } from '@file-viewer/core';
const geoDefinition = DEFAULT_RENDERER_DEFINITIONS.find(definition => definition.id === 'geo');
if (!geoDefinition) {
    throw new Error('@file-viewer/renderer-geo could not locate the core geospatial renderer definition.');
}
export const geoRendererDefinition = geoDefinition;
export const renderFileViewerGeo = (buffer, target, type) => import('./geo.js').then(({ default: renderGeo }) => renderGeo(buffer, target, type));
export const geoRenderer = {
    id: 'file-viewer-renderer-geo',
    label: 'Flyfish File Viewer geospatial renderer',
    definitions: [geoRendererDefinition],
    handlers: [{
            rendererId: geoRendererDefinition.id,
            handler: renderFileViewerGeo,
        }],
};
export default geoRenderer;
