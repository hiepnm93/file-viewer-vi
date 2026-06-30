import { describe, expect, it } from 'vitest';
import { applyScrollOffset, getScrollOffset } from '../apps/viewer-demo/src/compare/useSynchronizedScroll';

const createScroller = (metrics: {
  clientHeight?: number;
  clientWidth?: number;
  scrollHeight?: number;
  scrollWidth?: number;
  scrollTop?: number;
  scrollLeft?: number;
}) => {
  const element = {
    scrollTop: metrics.scrollTop ?? 0,
    scrollLeft: metrics.scrollLeft ?? 0,
  } as HTMLElement;

  Object.defineProperty(element, 'clientHeight', { configurable: true, value: metrics.clientHeight ?? 0 });
  Object.defineProperty(element, 'clientWidth', { configurable: true, value: metrics.clientWidth ?? 0 });
  Object.defineProperty(element, 'scrollHeight', { configurable: true, value: metrics.scrollHeight ?? 0 });
  Object.defineProperty(element, 'scrollWidth', { configurable: true, value: metrics.scrollWidth ?? 0 });

  return element;
};

describe('compare synchronized scroll offsets', () => {
  it('mirrors vertical pixel offset instead of scroll percentage', () => {
    const source = createScroller({ clientHeight: 100, scrollHeight: 500, scrollTop: 240 });
    const target = createScroller({ clientHeight: 100, scrollHeight: 1000 });

    applyScrollOffset(target, 'y', getScrollOffset(source, 'y'));

    expect(target.scrollTop).toBe(240);
  });

  it('clamps vertical pixel offset to the target scroll range', () => {
    const source = createScroller({ clientHeight: 100, scrollHeight: 1200, scrollTop: 900 });
    const target = createScroller({ clientHeight: 120, scrollHeight: 400 });

    applyScrollOffset(target, 'y', getScrollOffset(source, 'y'));

    expect(target.scrollTop).toBe(280);
  });

  it('mirrors horizontal pixel offset independently', () => {
    const source = createScroller({ clientWidth: 300, scrollWidth: 1200, scrollLeft: 180 });
    const target = createScroller({ clientWidth: 240, scrollWidth: 900 });

    applyScrollOffset(target, 'x', getScrollOffset(source, 'x'));

    expect(target.scrollLeft).toBe(180);
  });
});
