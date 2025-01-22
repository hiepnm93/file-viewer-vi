import type { Fib, FibBase, FibRgLw97, FibRgFcLcb, FibRgCswNew } from '../types/fib';
import { Buffer } from 'buffer';

/**
 * [MS-DOC] 2.5.1 Fib
 * The Fib structure contains information about the document and specifies the file pointers to various portions that make up the document.
 * The Fib is a variable length structure. With the exception of the base portion which is fixed in size, 
 * every section is preceded with a count field that specifies the size of the next section.
 * 
 * 结构布局：
 * base (32 bytes): The FibBase, fixed-length portion of the Fib
 * csw (2 bytes): Count of 16-bit values in fibRgW, MUST be 0x000E
 * fibRgW (28 bytes): The FibRgW97, 0x000E 16-bit values
 * cslw (2 bytes): Count of 32-bit values in fibRgLw, MUST be 0x0016
 * fibRgLw (88 bytes): The FibRgLw97, 0x0016 32-bit values
 * cbRgFcLcb (2 bytes): Count of 64-bit values in fibRgFcLcbBlob
 * fibRgFcLcbBlob (variable): Array of 64-bit values, size depends on nFib
 * cswNew (2 bytes): Count of 16-bit values in fibRgCswNew
 * fibRgCswNew (variable): Optional, present only if cswNew > 0
 */
export const readFib = (buffer: Buffer): Fib => {
  let offset = 0;
  // 读取 base 部分 (32 bytes)
  const base = readBase(buffer.slice(offset, offset += 32));
  offset += 32;

  // 读取 fibRgLw 部分 (88 bytes)
  const fibRgLw = readFibRgLw(buffer.slice(offset, offset += 88));

  // 读取 cbRgFcLcb (2 bytes)
  // 指定后续 fibRgFcLcbBlob 中 64 位值的数量
  const cbRgFcLcb = buffer.readUInt16LE(offset);
  offset += 2;

  // 读取 fibRgFcLcbBlob (cbRgFcLcb * 8 bytes)
  const fibRgFcLcbBlob = readFibRgFcLcbBlob(buffer.slice(offset, offset += cbRgFcLcb * 8));

  // 创建基本的 Fib 结构
  const fib: Fib = {
    base,
    fibRgLw,
    fibRgFcLcbBlob
  };

  // 读取 cswNew (2 bytes)
  // 指定后续 fibRgCswNew 中 16 位值的数量
  const cswNew = buffer.readUInt16LE(offset);
  offset += 2;

  // 如果 cswNew 不为 0，读取 fibRgCswNew
  if (cswNew > 0) {
    fib.fibRgCswNew = readFibRgCswNew(buffer.slice(offset, offset += cswNew * 2));
  }

  return fib;
};

/**
 * [MS-DOC] 2.5.2 FibBase
 * The FibBase structure is the fixed-length portion of the Fib.
 * 
 * 结构布局：
 * nFib (2 bytes): 文件格式版本号，通常为 0x00C1
 * fWhichTblStm (1 bit): 指定使用的 Table Stream
 *   - 0: 使用 0Table
 *   - 1: 使用 1Table
 */
const readBase = (buffer: Buffer): FibBase => {
  let offset = 2;
  // 读取文件格式版本号
  const nFib = buffer.readUInt16LE(offset);
  offset += 9;
  // 读取 Table Stream 标识位
  const bits = buffer.readUInt8(offset);
  const fWhichTblStm = (bits >> 1) & 0x1;
  return {
    nFib,
    fWhichTblStm
  };
};

/**
 * [MS-DOC] 2.5.4 FibRgLw97
 * The FibRgLw97 structure contains an array of 4-byte values that specify various document properties.
 * 
 * 结构布局：
 * ccpText: 主文档中的字符数
 * ccpFtn: 脚注中的字符数
 * ccpHdd: 页眉页脚中的字符数
 * ccpAtn: 注释中的字符数
 * ccpEdn: 尾注中的字符数
 * ccpTxbx: 主文档文本框中的字符数
 * ccpHdrTxbx: 页眉页脚文本框中的字符数
 */
const readFibRgLw = (buffer: Buffer): FibRgLw97 => {
  let offset = 12;
  // 读取主文档字符数
  const ccpText = buffer.readInt32LE(offset);
  offset += 4;
  // 读取脚注字符数
  const ccpFtn = buffer.readInt32LE(offset);
  offset += 4;
  // 读取页眉页脚字符数
  const ccpHdd = buffer.readInt32LE(offset);
  offset += 8;
  // 读取注释字符数
  const ccpAtn = buffer.readInt32LE(offset);
  offset += 4;
  // 读取尾注字符数
  const ccpEdn = buffer.readInt32LE(offset);
  offset += 4;
  // 读取主文档文本框字符数
  const ccpTxbx = buffer.readInt32LE(offset);
  offset += 4;
  // 读取页眉页脚文本框字符数
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
 * The FibRgFcLcb97 structure specifies the file offsets and lengths of various streams.
 * Each entry is a pair of 4-byte values:
 * - fc: 指定在 Table Stream 中的偏移量
 * - lcb: 指定对应结构的大小（以字节为单位）
 * 
 * 当前实现读取以下结构：
 * - PlcBtePapx: 段落属性
 * - Clx: 文档内容
 */
const readFibRgFcLcbBlob = (buffer: Buffer): FibRgFcLcb => {
  let offset = 0;
  // 跳过前 13 个 8 字节结构
  offset += 8 * 13;

  // 读取段落属性的位置和大小
  const fcPlcfBtePapx = buffer.readUInt32LE(offset);
  offset += 4;
  const lcbPlcfBtePapx = buffer.readUInt32LE(offset);
  offset += 4;

  // 跳过接下来的 19 个 8 字节结构
  offset += 8 * 19;

  // 验证偏移量
  if (offset !== 33 * 8) {
    throw new Error("Could not read FibRgFcLcb");
  }

  // 读取文档内容的位置和大小
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
 * The FibRgCswNew structure specifies the new version number of the file format.
 * 
 * nFibNew (2 bytes): 新的文件格式版本号，必须是以下值之一：
 * - 0x00D9
 * - 0x0101
 * - 0x010C
 * - 0x0112
 */
const readFibRgCswNew = (buffer: Buffer): FibRgCswNew => {
  const nFibNew = buffer.readUInt16LE(0);
  return {
    nFibNew
  };
}; 