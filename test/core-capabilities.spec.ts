import { describe, expect, it } from 'vitest';
import {
  isDomPrintableExtension,
  isKnownNonPrintableExtension,
  needsDedicatedPrintAdapter,
  resolvePrintAvailability,
} from '../packages/core/src';

describe('@file-viewer/core capability helpers', () => {
  it('keeps print capability decisions centralized in core', () => {
    expect(needsDedicatedPrintAdapter('pdf')).toBe(true);
    expect(needsDedicatedPrintAdapter('.DOCX')).toBe(true);
    expect(isDomPrintableExtension('md')).toBe(true);
    expect(isDomPrintableExtension('ofd')).toBe(true);
    expect(isKnownNonPrintableExtension('xlsx')).toBe(true);
    expect(isKnownNonPrintableExtension('zip')).toBe(true);
  });

  it('only enables adapter-backed print formats after the adapter is ready', () => {
    expect(resolvePrintAvailability('pdf', null, true)).toBe(false);
    expect(resolvePrintAvailability('pdf', { toHtml: () => '<main>pdf</main>' }, true)).toBe(true);
    expect(resolvePrintAvailability('pdf', { print: false, toHtml: () => '<main>pdf</main>' }, true)).toBe(false);
    expect(resolvePrintAvailability('markdown', null, true)).toBe(true);
    expect(resolvePrintAvailability('markdown', null, false)).toBe(false);
    expect(resolvePrintAvailability('xlsx', null, true)).toBe(false);
  });
});
