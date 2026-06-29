import { describe, expect, it } from 'vitest';
import {
  isLikelyEncryptedArchive,
  loadArchiveEntriesWithoutWorker,
  resolveJSZip,
} from '../packages/renderers/archive/src/archiveFallback';

const createZipHeader = (signature: number, encrypted: boolean) => {
  const bytes = new Uint8Array(64);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, signature, true);
  view.setUint16(signature === 0x02014b50 ? 8 : 6, encrypted ? 1 : 0, true);
  return bytes.buffer;
};

const createJSZipLike = () => {
  const JSZip = function JSZip() {};
  return Object.assign(JSZip, {
    loadAsync: async () => ({
      forEach() {
        return undefined;
      },
    }),
  });
};

const createStoredZip = (filename: string) => {
  const nameBytes = new TextEncoder().encode(filename);
  const localHeaderLength = 30 + nameBytes.length;
  const centralDirectoryOffset = localHeaderLength;
  const centralDirectoryLength = 46 + nameBytes.length;
  const bytes = new Uint8Array(localHeaderLength + centralDirectoryLength + 22);
  const view = new DataView(bytes.buffer);

  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(26, nameBytes.length, true);
  bytes.set(nameBytes, 30);

  view.setUint32(centralDirectoryOffset, 0x02014b50, true);
  view.setUint16(centralDirectoryOffset + 4, 20, true);
  view.setUint16(centralDirectoryOffset + 6, 20, true);
  view.setUint16(centralDirectoryOffset + 28, nameBytes.length, true);
  bytes.set(nameBytes, centralDirectoryOffset + 46);

  const endOffset = centralDirectoryOffset + centralDirectoryLength;
  view.setUint32(endOffset, 0x06054b50, true);
  view.setUint16(endOffset + 8, 1, true);
  view.setUint16(endOffset + 10, 1, true);
  view.setUint32(endOffset + 12, centralDirectoryLength, true);
  view.setUint32(endOffset + 16, centralDirectoryOffset, true);

  return bytes.buffer;
};

describe('archive fallback encryption guard', () => {
  it('detects encrypted ZIP central directory entries', () => {
    const archive = createZipHeader(0x02014b50, true);

    expect(isLikelyEncryptedArchive(archive, 'secure.zip')).toBe(true);
  });

  it('detects encrypted ZIP local file headers', () => {
    const archive = createZipHeader(0x04034b50, true);

    expect(isLikelyEncryptedArchive(archive, 'secure.cbz')).toBe(true);
  });

  it('does not mark plain ZIP or non-ZIP formats as encrypted', () => {
    expect(isLikelyEncryptedArchive(createZipHeader(0x02014b50, false), 'plain.zip')).toBe(false);
    expect(isLikelyEncryptedArchive(createZipHeader(0x02014b50, true), 'plain.tar')).toBe(false);
  });

  it('resolves function-shaped JSZip exports returned by dynamic import', () => {
    const JSZip = createJSZipLike();

    expect(resolveJSZip({ default: JSZip })).toBe(JSZip);
    expect(resolveJSZip({ default: { default: JSZip } })).toBe(JSZip);
    expect(resolveJSZip({ JSZip })).toBe(JSZip);
  });

  it('loads ZIP entries through the real dynamic JSZip import', async () => {
    const entries = await loadArchiveEntriesWithoutWorker(createStoredZip('issue-59.txt'), 'issue-59.zip');

    expect(entries).toHaveLength(1);
    expect(entries[0]?.path).toBe('issue-59.txt');
  });
});
