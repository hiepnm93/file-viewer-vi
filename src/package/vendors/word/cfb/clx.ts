import type { FibRgLw97 } from '../types/fib';
import { Buffer } from 'buffer';

/**
 * [MS-DOC] 2.9.38 Clx
 */
export function parseClx(clx: Buffer): Buffer {
    /* Skip RgPrc to get Pcdt */
    var offset = 0;
    /* [MS-DOC] 2.9.209 Prc */
    var firstByte = clx.readUInt8(offset);
    if (firstByte !== 0x1 && firstByte !== 0x2) {
        throw Error("Invalid first byte of Clx.");
    }
    /* Not empty RgPrc */
    while (clx.readUInt8(offset) === 0x1) {
        /* [MS-DOC] 2.9.210 PrcData */
        offset++;
        var cbGrpGpl = clx.readInt16LE(offset);
        offset += 2;
        /* cbGrpGpl must be less than or equal to 0x3fa2 */
        console.assert(cbGrpGpl <= 0x3fa2);
        offset += cbGrpGpl;
    }
    /* [MS-DOC] 2.9.178 Pcdt */
    var pcdt = clx.slice(offset);
    /* clxt (first byte of Pcdt) must be 0x2 */
    console.assert(pcdt.readUInt8(0) === 0x2);
    var lcb = pcdt.readUInt32LE(1);
    /* [MS-DOC] 2.8.35 PlcPcd */
    return pcdt.slice(5, 5 + lcb);
}

/**
 * [MS-DOC] 2.8.35 PlcPcd
 */
function getLastCp(fibRgLw: FibRgLw97): number {
    var fibMeta = Object.values(fibRgLw);
    var [ccpText, ...ccpOther] = fibMeta;
    var ccpSum = ccpOther.reduce(function(a, b) { return a + b; }, 0);
    return ccpSum !== 0 ? ccpSum + ccpText + 1 : ccpText;
}

export function getTxt(fibRgLw: FibRgLw97, plcPcd: Buffer, doc: Buffer): string {
    var cpSizeBytes = 4;
    var lastCp = getLastCp(fibRgLw);
    var offset = 0;
    var pcdCount = -1;

    while (plcPcd.readUInt32LE(offset) <= lastCp) {
        offset += cpSizeBytes;
        pcdCount++;
    }

    /* [MS-DOC] 2.8.35 PlcPcd */
    var acp = plcPcd.slice(0, offset);
    var pcdSizeBytes = 8;
    var upperBound = offset + pcdCount * pcdSizeBytes;
    var acpIndex = 0;
    var finalTxt = "";

    while (offset < upperBound) {
        var pcd = plcPcd.slice(offset, (offset += pcdSizeBytes));
        var fcCompressed = pcd.readUInt32LE(2);
        var fc = fcCompressed & ~(0x1 << 30);
        var strlen = acp.readUInt32LE((acpIndex + 1) * 4) - acp.readUInt32LE(acpIndex * 4);
        
        if ((fcCompressed >> 30) & 0x1) {
            finalTxt += getTxtCompressed(doc, fc, strlen);
        } else {
            finalTxt += getTxtNotCompressed(doc, fc, strlen);
        }
        acpIndex++;
    }

    return finalTxt;
}

/* [MS-DOC] 2.9.73 FcCompressed */
function getTxtCompressed(doc: Buffer, fc: number, strlen: number): string {
    return fixFcString(doc.slice(fc / 2, fc / 2 + strlen).toString("binary"));
}

function getTxtNotCompressed(doc: Buffer, fc: number, strlen: number): string {
    return doc.slice(fc, fc + 2 * strlen).toString("utf16le");
}

const REPLACEMENTS: { [key: string]: string } = {
    "\x82": "\u201A", // Single low-9 quotation mark
    "\x83": "\u0192", // Latin small letter f with hook
    "\x84": "\u201E", // Double low-9 quotation mark
    "\x85": "\u2026", // Horizontal ellipsis
    "\x86": "\u2020", // Dagger
    "\x87": "\u2021", // Double dagger
    "\x88": "\u02C6", // Modifier letter circumflex accent
    "\x89": "\u2030", // Per mille sign
    "\x8A": "\u0160", // Latin capital letter S with caron
    "\x8B": "\u2039", // Single left-pointing angle quotation mark
    "\x8C": "\u0152", // Latin capital ligature OE
    "\x91": "\u2018", // Left single quotation mark
    "\x92": "\u2019", // Right single quotation mark
    "\x93": "\u201C", // Left double quotation mark
    "\x94": "\u201D", // Right double quotation mark
    "\x95": "\u2022", // Bullet
    "\x96": "\u2013", // En dash
    "\x97": "\u2014", // Em dash
    "\x98": "\u02DC", // Small tilde
    "\x99": "\u2122", // Trade mark sign
    "\x9A": "\u0161", // Latin small letter s with caron
    "\x9B": "\u203A", // Single right-pointing angle quotation mark
    "\x9C": "\u0153", // Latin small ligature oe
    "\x9F": "\u0178", // Latin capital letter Y with diaeresis
};

function fixFcString(str: string): string {
    return str.replace(/[\x82-\x8C\x91-\x9C\x9F]/g, function($$) { return REPLACEMENTS[$$]; });
} 