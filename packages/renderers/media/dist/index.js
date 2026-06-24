import { DEFAULT_RENDERER_DEFINITIONS, } from '@file-viewer/core';
const mediaRendererIds = ['audio', 'video'];
const mediaDefinitions = DEFAULT_RENDERER_DEFINITIONS.filter(definition => mediaRendererIds.includes(definition.id));
if (mediaDefinitions.length !== mediaRendererIds.length) {
    throw new Error('@file-viewer/renderer-media could not locate the shared audio/video format definitions.');
}
export const mediaRendererDefinitions = mediaDefinitions;
export const renderFileViewerAudio = (buffer, target, type, context) => import('./audio.js').then(({ default: renderAudio }) => renderAudio(buffer, target, type, context));
export const renderFileViewerVideo = (buffer, target, type, context) => import('./video.js').then(({ default: renderVideo }) => renderVideo(buffer, target, type, context));
export const mediaRenderer = {
    id: 'file-viewer-renderer-media',
    label: 'Flyfish File Viewer media renderer',
    definitions: mediaRendererDefinitions,
    handlers: [
        {
            rendererId: 'audio',
            handler: renderFileViewerAudio,
        },
        {
            rendererId: 'video',
            handler: renderFileViewerVideo,
        },
    ],
};
export default mediaRenderer;
