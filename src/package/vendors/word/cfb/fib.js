/**
 * [MS-DOC] 2.5.1 Fib
 */
export const readFib = (buffer) => {
  let offset = 0;
  const base = readBase(buffer.slice(offset, offset += 32));
  offset += 32;
  const fibRgLw = readFibRgLw(buffer.slice(offset, offset += 88));
  const cbRgFcLcb = buffer.readUInt16LE(offset);
  offset += 2;
  const fibRgFcLcbBlob = readFibRgFcLcbBlob(buffer.slice(offset, offset += cbRgFcLcb * 8));
  const fib = {
    base,
    fibRgLw,
    fibRgFcLcbBlob
  };
  const cswNew = buffer.readUInt16LE(offset);
  offset += 2;
  if (cswNew > 0) {
    fib.fibRgCswNew = readFibRgCswNew(buffer.slice(offset, offset += cswNew * 2));
  }
  return fib;
};

/**
 * [MS-DOC] 2.5.2 FibBase
 */
const readBase = (buffer) => {
  let offset = 2;
  const nFib = buffer.readUInt16LE(offset);
  offset += 9;
  const bits = buffer.readUInt8(offset);
  const fWhichTblStm = (bits >> 1) & 0x1;
  return {
    nFib,
    fWhichTblStm
  };
};

/**
 * [MS-DOC] 2.5.4 FibRgLw97
 */
const readFibRgLw = (buffer) => {
  let offset = 12;
  const ccpText = buffer.readInt32LE(offset);
  offset += 4;
  const ccpFtn = buffer.readInt32LE(offset);
  offset += 4;
  const ccpHdd = buffer.readInt32LE(offset);
  offset += 8;
  const ccpAtn = buffer.readInt32LE(offset);
  offset += 4;
  const ccpEdn = buffer.readInt32LE(offset);
  offset += 4;
  const ccpTxbx = buffer.readInt32LE(offset);
  offset += 4;
  const ccpHdrTxbx = buffer.readInt32LE(offset);
  return {
    ccpText,
    ccpFtn,
    ccpHdd,
    ccpAtn,
    ccpEdn,
    ccpTxbx,
    ccpHdrTxbx
  };
};

/**
 * [MS-DOC] 2.5.6 FibRgFcLcb97
 */
const readFibRgFcLcbBlob = (buffer) => {
  let offset = 0;
  offset += 8 * 13; // Skip first 13 8-byte sections

  const fcPlcfBtePapx = buffer.readUInt32LE(offset);
  offset += 4;
  const lcbPlcfBtePapx = buffer.readUInt32LE(offset);
  offset += 4;
  offset += 8 * 19; // Skip next 19 8-byte sections

  if (offset !== 33 * 8) {
    throw new Error("Could not read FibRgFcLcb");
  }

  const fcClx = buffer.readUInt32LE(offset);
  offset += 4;
  const lcbClx = buffer.readUInt32LE(offset);

  return {
    fcPlcfBtePapx,
    lcbPlcfBtePapx,
    fcClx,
    lcbClx
  };
};

/**
 * [MS-DOC] 2.5.11 FibRgCswNew
 */
const readFibRgCswNew = (buffer) => {
  const nFibNew = buffer.readUInt16LE(0);
  return {
    nFibNew
  };
};
//# sourceMappingURL=fib.js.map

