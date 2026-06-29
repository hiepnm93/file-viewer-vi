import { type ArchiveEntryView } from './archiveShared.js';
type JSZipLike = {
    loadAsync(data: ArrayBuffer): Promise<{
        forEach(callback: (relativePath: string, file: {
            dir?: boolean;
            date?: Date;
            async(type: 'arraybuffer'): Promise<ArrayBuffer>;
        }) => void): void;
    }>;
};
export declare const resolveJSZip: (module: unknown) => JSZipLike;
export declare const isLikelyEncryptedArchive: (data: ArrayBuffer, filename: string) => boolean;
/**
 * Worker fallback for constrained browsers, temporary local servers, and
 * mobile WebViews. The main libarchive path still covers broader formats;
 * this covers common ZIP/TAR/GZIP archives without an extra static Worker.
 */
export declare const loadArchiveEntriesWithoutWorker: (data: ArrayBuffer, filename: string) => Promise<ArchiveEntryView[] | null>;
export {};
