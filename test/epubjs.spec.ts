import { describe, expect, it } from 'vitest';
import { resolveEpubJs } from '../packages/renderers/ebook/src/epub';

const createEpubFactory = () => {
  return function ePub() {
    return undefined;
  };
};

describe('epubjs module resolution', () => {
  it('unwraps nested default exports to find the callable factory', () => {
    const ePub = createEpubFactory();

    expect(resolveEpubJs({ default: ePub })).toBe(ePub);
    expect(resolveEpubJs({ default: { default: ePub } })).toBe(ePub);
  });
});
