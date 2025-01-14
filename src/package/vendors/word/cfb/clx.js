/**
 * [MS-DOC] 2.9.38 Clx
 */
export const parseClx = (clx) => {
    /* Skip RgPrc to get Pcdt */
    let offset = 0;
    /* [MS-DOC] 2.9.209 Prc */
    const firstByte = clx.readUInt8(offset);
    if (firstByte !== 0x1 && firstByte !== 0x2) {
        throw Error("Invalid first byte of Clx.");
    }
    /* Not empty RgPrc */
    while (clx.readUInt8(offset) === 0x1) {
        /* [MS-DOC] 2.9.210 PrcData */
        offset++;
        const cbGrpGpl = clx.readInt16LE(offset);
        offset += 2;
        /* cbGrpGpl must be less than or equal to 0x3fa2 */
        console.assert(cbGrpGpl <= 0x3fa2);
        offset += cbGrpGpl;
    }
    /* [MS-DOC] 2.9.178 Pcdt */
    const pcdt = clx.slice(offset);
    /* clxt (first byte of Pcdt) must be 0x2 */
    console.assert(pcdt.readUInt8(0) === 0x2);
    const lcb = pcdt.readUInt32LE(1);
    /* [MS-DOC] 2.8.35 PlcPcd */
    const plcPcd = pcdt.slice(5, 5 + lcb);
    return plcPcd;
};

/**
 * [MS-DOC] 2.8.35 PlcPcd
 */
const getLastCp = (fibRgLw) => {
    const [ccpText, ...ccpOther] = Object.values(fibRgLw);
    const ccpSum = ccpOther.reduce((a, b) => a + b, 0);
    return ccpSum !== 0 ? ccpSum + ccpText + 1 : ccpText;
};

export const getTxt = (fibRgLw, plcPcd, doc) => {
    const cpSizeBytes = 4;
    const lastCp = getLastCp(fibRgLw);
    let offset = 0;
    let pcdCount = -1;

    while (plcPcd.readUInt32LE(offset) <= lastCp) {
        offset += cpSizeBytes;
        pcdCount++;
    }

    /* [MS-DOC] 2.8.35 PlcPcd */
    const acp = plcPcd.slice(0, offset);
    const pcdSizeBytes = 8;
    const upperBound = offset + pcdCount * pcdSizeBytes;
    let acpIndex = 0;
    let finalTxt = "";

    while (offset < upperBound) {
        const pcd = plcPcd.slice(offset, (offset += pcdSizeBytes));
        const fcCompressed = pcd.readUInt32LE(2);
        const fc = fcCompressed & ~(0x1 << 30);
        const strlen = acp.readUInt32LE((acpIndex + 1) * 4) - acp.readUInt32LE(acpIndex * 4);
        
        finalTxt += (fcCompressed >> 30) & 0x1
            ? getTxtCompressed(doc, fc, strlen)
            : getTxtNotCompressed(doc, fc, strlen);
            
        acpIndex++;
    }
    return finalTxt;
};

/* [MS-DOC] 2.9.73 FcCompressed */
const getTxtCompressed = (doc, fc, strlen) => {
    return fixFcString(doc.slice(fc / 2, fc / 2 + strlen).toString("binary"));
};

const getTxtNotCompressed = (doc, fc, strlen) => {
    return doc.slice(fc, fc + 2 * strlen).toString("utf16le");
};

const REPLACEMENTS = {
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

const fixFcString = (str) => {
    return str.replace(/[\x82-\x8C\x91-\x9C\x9F]/g, (char) => REPLACEMENTS[char]);
};
//# sourceMappingURL=clx.js.map