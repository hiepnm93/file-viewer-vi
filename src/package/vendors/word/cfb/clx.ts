import type { Clx, Pcd, PlcPcd } from '../types/clx';
import type { FibRgLw97 } from '../types/fib';
import { Buffer } from 'buffer';

/**
 * 解析 CLX 结构
 * [MS-DOC] 2.9.38 Clx
 */
export function parseClx(clxBuffer: Buffer): Clx {
    let offset = 0;
    
    // 跳过 RgPrc
    while (clxBuffer.readUInt8(offset) === 0x1) {
        offset++;
        const cbGrpGpl = clxBuffer.readInt16LE(offset);
        if (cbGrpGpl > 0x3fa2) {
            throw new Error("Invalid cbGrpGpl value in RgPrc");
        }
        offset += 2 + cbGrpGpl;
    }

    // 验证 Pcdt 标记
    if (clxBuffer.readUInt8(offset) !== 0x2) {
        throw new Error("Invalid Pcdt marker");
    }

    // 读取 Pcdt
    const lcb = clxBuffer.readUInt32LE(offset + 1);
    const plcPcdBuffer = clxBuffer.subarray(offset + 5, offset + 5 + lcb);
    
    return {
        pcdt: {
            clxt: 0x2,
            lcb,
            plcPcd: parsePlcPcd(plcPcdBuffer)
        }
    };
}

/**
 * 解析 PlcPcd 结构
 * [MS-DOC] 2.8.35 PlcPcd
 * 
 * PlcPcd 的结构如下：
 * - aCP: 字符位置数组，每个元素 4 字节
 * - aPcd: Piece Descriptor 数组，每个元素 8 字节
 * 
 * PCD 的结构 (8 字节):
 * - 前 2 字节: 标志位 (fNoParaLast, fRaw, fCompressed 等)
 * - 中间 2 字节: prm (Property Modifier)
 * - 后 4 字节: fc (File Character Position)
 *   - 最高位 (bit 31): 保留位 (r1)
 *   - 次高位 (bit 30): fCompressed 标志
 *   - 低30位 (bits 0-29): fc 值
 */
function parsePlcPcd(plcPcdBuffer: Buffer): PlcPcd {
    const CP_SIZE = 4;   // 每个 CP 占用 4 字节
    const PCD_SIZE = 8;  // 每个 PCD 占用 8 字节
    
    if (plcPcdBuffer.length < CP_SIZE) {
        throw new Error("PlcPcd buffer too small");
    }
    
    // 计算 PCD 的数量
    // PlcPcd = (n + 1) * CP_SIZE + n * PCD_SIZE
    // 其中 n 是 piece 的数量
    const pcdCount = Math.floor((plcPcdBuffer.length - CP_SIZE) / (CP_SIZE + PCD_SIZE));
    
    if (pcdCount < 0 || plcPcdBuffer.length !== (pcdCount + 1) * CP_SIZE + pcdCount * PCD_SIZE) {
        throw new Error("Invalid PlcPcd buffer size");
    }
    
    // 读取 CP 数组 (character positions)
    const acp: number[] = [];
    const ranges: [number, number][] = [];
    let pos = 0;

    // 按照 Python 实现的方式，成对读取 CP 值
    for (let i = 0; i < pcdCount; i++) {
        const start = plcPcdBuffer.readUInt32LE(pos);
        const end = plcPcdBuffer.readUInt32LE(pos + 4);
        
        // 验证 CP 值的有效性
        if (i === 0 && start !== 0) {
            throw new Error(`PlcPcd starts with invalid CP (${start}) rather than zero`);
        }
        if (i > 0 && start <= acp[i - 1]) {
            throw new Error(`PlcPcd contains non contiguous CP (${start}) at position ${i}`);
        }
        
        ranges.push([start, end]);
        acp.push(start);
        pos += 4;
    }
    // 读取最后一个 CP
    acp.push(plcPcdBuffer.readUInt32LE(pos));
    pos += 4;

    // 读取 PCD 数组 (piece descriptors)
    const pcds: Pcd[] = [];
    
    for (let i = 0; i < pcdCount; i++) {
        const flags = plcPcdBuffer.readUInt16LE(pos);
        const fc = plcPcdBuffer.readUInt32LE(pos + 2);
        
        // 解析 PCD 结构
        // [MS-DOC] 2.8.35 Pcd
        const pcd: Pcd = {
            // 标志位解析
            fNoParaLast: (flags & 0x01) !== 0,    // 是否没有段落结束标记
            fRaw: (flags & 0x02) !== 0,           // 是否为原始数据
            // fc 的 bit 30 用于表示压缩状态
            fCompressed: (fc & (1 << 30)) !== 0,  // 是否压缩
            // fc (File Character Position)
            // 只取低30位作为实际的 fc 值
            fc: fc & 0x3FFFFFFF,
            // prm (Property Modifier)
            prm: plcPcdBuffer.readUInt16LE(pos + 6),
        };
        
        pcds.push(pcd);
        pos += PCD_SIZE;
    }

    return { acp, pcds, ranges };
}

/**
 * 获取最后一个 CP 的位置
 */
function getLastCp(fibRgLw: FibRgLw97): number {
    const [ccpText, ...ccpOther] = Object.values(fibRgLw);
    const ccpSum = ccpOther.reduce((a, b) => a + b, 0);
    return ccpSum !== 0 ? ccpSum + ccpText + 1 : ccpText;
}

/**
 * 获取文档的完整文本
 */
export function getDocumentText(clx: Clx, doc: Buffer): string {
    let text = '';
    const { acp, pcds } = clx.pcdt.plcPcd;

    for (let i = 0; i < pcds.length; i++) {
        const pcd = pcds[i];
        const start = acp[i];
        const end = acp[i + 1];
        const strlen = end - start;

        // 移除压缩标志位
        const fc = pcd.fc & ~(0x1 << 30);

        if (pcd.fCompressed) {
            text += getTxtCompressed(doc, fc, strlen);
        } else {
            text += getTxtNotCompressed(doc, fc, strlen);
        }
    }

    return text;
}

/**
 * 获取压缩文本
 */
function getTxtCompressed(doc: Buffer, fc: number, strlen: number): string {
    return fixFcString(doc.slice(fc / 2, fc / 2 + strlen).toString("binary"));
}

/**
 * 获取非压缩文本
 */
function getTxtNotCompressed(doc: Buffer, fc: number, strlen: number): string {
    return doc.slice(fc, fc + 2 * strlen).toString("utf16le");
}

/**
 * 字符替换映射表
 */
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

/**
 * 修复压缩文本中的特殊字符
 */
function fixFcString(str: string): string {
    return str.replace(/[\x82-\x8C\x91-\x9C\x9F]/g, ch => REPLACEMENTS[ch] || ch);
}


/**
 * 将文件偏移量转换为字符位置
 * 参考 Python 实现的 __offsetToCP
 */
function fcToCp(clx: Clx, offset: number): number | null {
    const { ranges, pcds } = clx.pcdt.plcPcd;
    
    // 遍历所有范围
    for (let i = 0; i < ranges.length; i++) {
        let [start, end] = ranges[i];
        // 最后一个 CP 实际上不包含在范围内
        end -= 1;
        
        // 获取起始偏移量和压缩状态
        const pcd = pcds[i];
        const startOffset = pcd.fCompressed ? 
            Math.floor(pcd.fc / 2) + (start - start) : // start - start = 0
            pcd.fc + 2 * (start - start);  // start - start = 0
        
        // 获取结束偏移量
        const endOffsetBase = pcd.fCompressed ?
            Math.floor(pcd.fc / 2) + (end - start) :
            pcd.fc + 2 * (end - start);
            
        // 根据压缩状态调整结束偏移量
        const endOffset = pcd.fCompressed ? endOffsetBase + 1 : endOffsetBase + 2;
        
        // 检查偏移量是否在当前范围内
        if (offset >= startOffset && offset <= endOffset) {
            const divider = pcd.fCompressed ? 1 : 2;
            return start + Math.floor((offset - startOffset) / divider);
        }
    }
    
    return null;
}

/**
 * 将字符位置转换为文件偏移量
 * 参考 Python 实现的 __cpToOffset
 */
function cpToFc(clx: Clx, cp: number): [number, boolean] | null {
    const { acp, pcds } = clx.pcdt.plcPcd;
    
    // 使用二分查找找到正确的区间
    let left = 0;
    let right = acp.length;
    
    while (left < right) {
        const mid = Math.floor((left + right) / 2);
        if (acp[mid] <= cp) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    
    const index = left - 1;
    if (index < 0 || index >= pcds.length) {
        return null;
    }
    
    const pcd = pcds[index];
    const fc = pcd.fc;
    
    if (pcd.fCompressed) {
        const pos = Math.floor(fc / 2) + (cp - acp[index]);
        return [pos, true];
    } else {
        const pos = fc + 2 * (cp - acp[index]);
        return [pos, false];
    }
}

/**
 * 获取指定范围的文本
 */
export function retrieveText(doc: Buffer, clx: Clx, start: number, end: number): string {

    // 获取起始和结束位置的字符位置
    const startCp = fcToCp(clx, start);
    const endCp = fcToCp(clx, end);
    
    // 验证字符位置的有效性
    if (startCp === null || endCp === null || startCp >= endCp) {
        return '';
    }

    // 获取文档指定位置
    const cps = []
    let i = startCp
    // 遍历所有字符位置
    while (i < endCp) {
        const [pos, isCompressed] = cpToFc(clx, i) || [0, false]
        if (isCompressed) {
            cps.push(getTxtCompressed(doc, pos, 1))
        } else {
            cps.push(getTxtNotCompressed(doc, pos, 1))
        }
        i++
    }

    // 返回指定范围的文本
    return cps.join('')
}