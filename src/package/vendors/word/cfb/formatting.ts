import type { Fib, CharacterFormatting, TextRun, ParagraphRun, Clx } from '../types';
import { Buffer } from 'buffer';
import { parseSprmProperty, parseParagraphProperty } from '../types/sprm';
import { retrieveText } from './clx';

// 缓存机制
const textRunsCache = new Map<string, TextRun[]>();
const paragraphRunsCache = new Map<string, ParagraphRun[]>();

/**
 * 获取所有文本运行
 * 优化版本：减少不必要的计算和内存使用
 */
function getAllTextRuns(
    tableStream: Buffer,
    mainStream: Buffer,
    fib: Fib,
    clx: Clx
): TextRun[] {
    // 生成缓存键
    const cacheKey = `${fib.fibRgFcLcbBlob.fcPlcfBteChpx}_${fib.fibRgFcLcbBlob.lcbPlcfBteChpx}`;
    
    // 检查缓存
    if (textRunsCache.has(cacheKey)) {
        return textRunsCache.get(cacheKey)!;
    }
    
    const { fcPlcfBteChpx, lcbPlcfBteChpx } = fib.fibRgFcLcbBlob;

    // 快速路径：如果没有格式化信息，直接返回整个文档作为一个运行
    if (fcPlcfBteChpx === 0 || lcbPlcfBteChpx === 0 || fcPlcfBteChpx >= tableStream.length) {
        const result = [{
            text: mainStream.toString('utf16le'),
            startOffset: 0,
            endOffset: mainStream.length,
            formatting: []
        }];
        textRunsCache.set(cacheKey, result);
        return result;
    }

    const textRuns: TextRun[] = [];
    
    try {
        // 性能优化：限制处理的最大文本运行数量
        const MAX_TEXT_RUNS = 1000; // 设置一个合理的上限
        
        // 读取 PlcBteChpx 结构
        const plcBteChpx = tableStream.subarray(fcPlcfBteChpx, fcPlcfBteChpx + lcbPlcfBteChpx);
        
        // 计算 FC 数组的数量 (n + 1 个 FC，n 个 PnFkpChpx)
        const pnCount = Math.min(Math.floor(lcbPlcfBteChpx / 8), MAX_TEXT_RUNS);
        const fcCount = pnCount + 1;

        // 1. 读取所有的 FC 值
        const fcArray: number[] = [];
        for (let i = 0; i < fcCount; i++) {
            if (i * 4 < plcBteChpx.length) {
                const fc = plcBteChpx.readUInt32LE(i * 4);
                fcArray.push(fc);
            }
        }

        // 2. 读取所有的 PnFkpChpx 值
        const pnArray: number[] = [];
        const pnStart = fcCount * 4;
        for (let i = 0; i < pnCount; i++) {
            if (pnStart + i * 4 < plcBteChpx.length) {
                const pnFkpChpx = plcBteChpx.readUInt32LE(pnStart + i * 4) & 0x3FFFFF;
                pnArray.push(pnFkpChpx);
            }
        }

        // 3. 处理每个文本运行
        // 性能优化：批量处理文本运行，而不是一个一个处理
        const batchSize = 10; // 每批处理的运行数量
        
        for (let batchStart = 0; batchStart < pnCount; batchStart += batchSize) {
            const batchEnd = Math.min(batchStart + batchSize, pnCount);
            
            // 处理当前批次
            for (let i = batchStart; i < batchEnd; i++) {
                if (i >= pnArray.length || i >= fcArray.length) continue;
                
                const pn = pnArray[i];
                const fc = fcArray[i];
                const nextFc = (i + 1 < fcArray.length) ? fcArray[i + 1] : mainStream.length;
                
                // 跳过无效的范围
                if (fc >= nextFc) continue;
                
                // 读取 ChpxFkp
                const chpxFkp = readChpxFkp(mainStream, pn);
                
                // 跳过无效的 ChpxFkp
                if (!chpxFkp || chpxFkp.crun === 0 || chpxFkp.rgfc.length <= 1) continue;
                
                // 处理 ChpxFkp 中的每个文本运行
                for (let j = 0; j < chpxFkp.crun && j + 1 < chpxFkp.rgfc.length; j++) {
                    const runStart = chpxFkp.rgfc[j];
                    const runEnd = chpxFkp.rgfc[j + 1];
                    
                    if (runStart === runEnd) continue;

                    try {
                        // 检查压缩标志 (0x40000000)
                        const text = retrieveText(mainStream, clx, runStart, runEnd);
                      
                        // 跳过空文本
                        if (!text || text.length === 0) {
                            continue;
                        }
                 

                        // 获取格式信息
                        let formatting: CharacterFormatting[] = [];
                        if (j < chpxFkp.rgb.length && chpxFkp.rgb[j] > 0 && 
                            j < chpxFkp.chpxOffset.length && chpxFkp.chpxOffset[j] > 0) {
                            formatting = readCharacterProperties(mainStream, chpxFkp.chpxOffset[j]);
                        }
                    
                        textRuns.push({
                            text,
                            startOffset: runStart,
                            endOffset: runEnd,
                            formatting
                        });
                        
                        // 性能优化：如果文本运行数量过多，提前退出
                        if (textRuns.length >= MAX_TEXT_RUNS) {
                            console.warn(`Warning: Reached maximum text run limit (${MAX_TEXT_RUNS}), truncating...`);
                            break;
                        }
                    } catch (error) {
                        console.error(`Error processing text run at offset ${runStart}:`, error);
                    }
                }
                
                // 如果已经达到最大运行数量，提前退出
                if (textRuns.length >= MAX_TEXT_RUNS) break;
            }
            
            // 如果已经达到最大运行数量，提前退出
            if (textRuns.length >= MAX_TEXT_RUNS) break;
        }
    } catch (error) {
        console.error('Error reading text runs:', error);
    }
    
    // 如果没有找到任何文本运行，返回整个文档作为一个运行
    if (textRuns.length === 0) {
        textRuns.push({
            text: mainStream.toString('utf16le'),
            startOffset: 0,
            endOffset: mainStream.length,
            formatting: []
        });
    }
    
    // 存入缓存
    textRunsCache.set(cacheKey, textRuns);
    return textRuns;
}

/**
 * ChpxFkp 结构
 * [MS-DOC] 2.9.23 ChpxFkp
 */
interface ChpxFkp {
    rgfc: number[];       // 文本运行偏移量数组
    rgb: number[];        // 属性偏移量数组
    chpxOffset: number[]; // Chpx 的实际偏移量
    crun: number;         // 文本运行数量
}

/**
 * 读取 ChpxFkp 结构
 * [MS-DOC] 2.9.23 ChpxFkp
 * 
 * ChpxFkp 是一个固定大小的结构(512字节)，存储在 WordDocument 流中
 * 它包含文本运行的字符属性信息
 */
function readChpxFkp(mainStream: Buffer, pn: number): ChpxFkp {
    // ChpxFkp 位于 pn * 512 的位置
    const offset = pn * 512;
    
    // 创建一个空的 ChpxFkp 结构
    const chpxFkp: ChpxFkp = {
        rgfc: [],
        rgb: [],
        chpxOffset: [],
        crun: 0
    };
    
    // 验证偏移量和页面大小
    if (offset < 0 || offset + 512 > mainStream.length) {
        console.warn(`Warning: Invalid ChpxFkp offset or size (offset=${offset}, mainStream.length=${mainStream.length})`);
        return chpxFkp;
    }
    
    try {
        // 1. 读取 crun (最后一个字节，偏移量 511)
        chpxFkp.crun = mainStream.readUInt8(offset + 511);
        
        // 验证 crun 的有效性 (根据规范，不应超过 100)
        if (chpxFkp.crun === 0 || chpxFkp.crun > 100) {
            console.warn(`Warning: Invalid crun value ${chpxFkp.crun} at offset ${offset + 511}`);
            return chpxFkp;
        }
        
        // 2. 读取 rgfc 数组 (crun + 1 个 FC 值)
        // rgfc 数组存储在 ChpxFkp 的开始位置
        for (let i = 0; i <= chpxFkp.crun; i++) {
            const fcOffset = offset + i * 4;
            if (fcOffset + 4 <= offset + 512) {
                const fc = mainStream.readUInt32LE(fcOffset);
                
                // 验证 FC 值的顺序
                if (i > 0 && fc < chpxFkp.rgfc[i - 1]) {
                    console.warn(`Warning: Non-ascending FC values at index ${i}`);
                    continue;
                }
                
                chpxFkp.rgfc.push(fc);
            }
        }
        
        // 3. 读取 rgb 数组 (crun 个字节偏移量)
        // rgb 数组紧跟在 rgfc 数组之后
        const rgbStart = offset + (chpxFkp.crun + 1) * 4;
        for (let i = 0; i < chpxFkp.crun; i++) {
            const rgbOffset = rgbStart + i;
            if (rgbOffset < offset + 512) {
                const rgb = mainStream.readUInt8(rgbOffset);
                chpxFkp.rgb.push(rgb);
                
                // 4. 计算 Chpx 的实际偏移量
                // 如果 rgb 为 0，表示没有字符属性
                if (rgb === 0) {
                    chpxFkp.chpxOffset.push(0);
                } else {
                    // rgb 值需要乘以 2 来获取实际的偏移量
                    const chpxOffset = offset + rgb * 2;
                    
                    // 验证 chpxOffset 是否在有效范围内
                    if (chpxOffset >= offset && chpxOffset < offset + 512) {
                        chpxFkp.chpxOffset.push(chpxOffset);
                    } else {
                        console.warn(`Warning: Invalid chpx offset ${chpxOffset} at index ${i}`);
                        chpxFkp.chpxOffset.push(0);
                    }
                }
            }
        }
        
        // 验证数组长度的一致性
        if (chpxFkp.rgfc.length !== chpxFkp.crun + 1 || 
            chpxFkp.rgb.length !== chpxFkp.crun || 
            chpxFkp.chpxOffset.length !== chpxFkp.crun) {
            console.warn(`Warning: Inconsistent array lengths in ChpxFkp (rgfc=${chpxFkp.rgfc.length}, rgb=${chpxFkp.rgb.length}, chpxOffset=${chpxFkp.chpxOffset.length}, crun=${chpxFkp.crun})`);
        }
        
    } catch (error) {
        console.error(`Error reading ChpxFkp at offset ${offset}:`, error);
    }
    
    return chpxFkp;
}

/**
 * 读取字符属性
 * [MS-DOC] 2.6.1 Character Properties
 * 优化版本：减少不必要的计算和验证
 */
function readCharacterProperties(
    mainStream: Buffer,
    offset: number
): CharacterFormatting[] {
    // 使用 Map 缓存结果，避免重复计算
    const cacheKey = `chpx_${offset}`;
    const cachedResult = propertiesCache.get(cacheKey);
    if (cachedResult) {
        return cachedResult;
    }
    
    const properties: CharacterFormatting[] = [];
    
    // 快速路径：验证基本参数
    if (offset <= 0 || offset >= mainStream.length) {
        return properties;
    }
    
    try {
        // 读取 cb (属性长度)
        const cb = mainStream.readUInt8(offset);
        if (cb === 0 || cb > 0xFF) {
            return properties;
        }

        // 读取 grpprl（属性数组）
        let grpprlOffset = offset + 1;
        const grpprlEnd = grpprlOffset + cb;

        // 验证结束位置是否超出缓冲区
        if (grpprlEnd > mainStream.length) {
            return properties;
        }

        // 性能优化：预先分配足够的空间
        const maxProperties = Math.floor(cb / 3); // 每个属性至少需要3字节 (2字节sprm + 1字节操作数)
        properties.length = 0; // 确保数组为空
        
        // 性能优化：限制处理的最大属性数量
        const MAX_PROPERTIES = 50;
        let propertyCount = 0;

        while (grpprlOffset < grpprlEnd && propertyCount < MAX_PROPERTIES) {
            // 确保至少有2字节可读
            if (grpprlOffset + 2 > grpprlEnd) break;

            // 读取 sprm
            const sprm = mainStream.readUInt16LE(grpprlOffset);
            const sprmType = (sprm >> 13) & 0x7;
            
            // 验证sprm类型
            if (sprmType > 7) {
                break;
            }

            grpprlOffset += 2;

            // 获取操作数大小
            const operandSize = getOperandSize(sprm);
            if (operandSize === 0 || grpprlOffset + operandSize > grpprlEnd) {
                break;
            }

            // 读取操作数
            const operand = mainStream.subarray(grpprlOffset, grpprlOffset + operandSize);
            grpprlOffset += operandSize;

            // 解析属性
            const property = parseSprmProperty(sprm, operand);
            if (property) {
                properties.push(property);
                propertyCount++;
            }
        }
        
        // 缓存结果
        propertiesCache.set(cacheKey, properties);
    } catch (error) {
        console.error('Error reading character properties:', error);
    }

    return properties;
}

// 添加属性缓存
const propertiesCache = new Map<string, CharacterFormatting[]>();

/**
 * 获取所有段落运行
 * [MS-DOC] 2.8.10 PlcBtePapx
 * 
 * PlcBtePapx 是一个 Plc 结构，存储在 Table Stream 中
 * 它包含指向 WordDocument 流中 PapxFkp 结构的指针
 * 
 * @param mainStream WordDocument 流缓冲区
 * @param tableStream Table Stream 缓冲区
 * @param fib FIB 结构
 * @returns 段落运行数组
 */
function getAllParagraphRuns(
    mainStream: Buffer,
    tableStream: Buffer,
    fib: Fib
): ParagraphRun[] {
    const paragraphRuns: ParagraphRun[] = [];
    
    // 获取 PlcBtePapx 的位置和大小
    const fcPlcfBtePapx = fib.fibRgFcLcbBlob.fcPlcfBtePapx;
    const lcbPlcfBtePapx = fib.fibRgFcLcbBlob.lcbPlcfBtePapx;
    
    // 验证 PlcBtePapx 的位置和大小
    if (fcPlcfBtePapx <= 0 || lcbPlcfBtePapx <= 0) {
        console.warn(`Warning: Invalid PlcfBtePapx position or size (fcPlcfBtePapx=${fcPlcfBtePapx}, lcbPlcfBtePapx=${lcbPlcfBtePapx})`);
        return paragraphRuns;
    }
    
    // 验证 PlcfBtePapx 是否超出 tableStream 的范围
    if (fcPlcfBtePapx + lcbPlcfBtePapx > tableStream.length) {
        console.warn(`Warning: PlcfBtePapx extends beyond tableStream (fcPlcfBtePapx=${fcPlcfBtePapx}, lcbPlcfBtePapx=${lcbPlcfBtePapx}, tableStream.length=${tableStream.length})`);
        return paragraphRuns;
    }
    
    // 计算 PlcBtePapx 中的条目数
    // 根据规范，PlcBtePapx 的结构为：
    // aFC (4 * (n+1) 字节) + aPnBtePapx (4 * n 字节)
    // 其中 n 是条目数
    // 因此，lcbPlcfBtePapx = 4 * (n+1) + 4 * n = 8n + 4
    // n = (lcbPlcfBtePapx - 4) / 8
    const pnCount = Math.floor((lcbPlcfBtePapx - 4) / 8);
    
    // 验证条目数的有效性
    if (pnCount <= 0 || pnCount > 1000) { // 设置一个合理的上限
        console.warn(`Warning: Unreasonable pnCount ${pnCount} for PlcfBtePapx`);
        return paragraphRuns;
    }
    
    // 读取 aFC 数组（文件位置数组）
    // aFC 数组包含 n+1 个元素，每个元素是一个 4 字节的整数
    const aFC: number[] = [];
    for (let i = 0; i <= pnCount; i++) {
        const fcOffset = fcPlcfBtePapx + i * 4;
        if (fcOffset + 4 <= tableStream.length) {
            aFC.push(tableStream.readUInt32LE(fcOffset));
        } else {
            console.warn(`Warning: Cannot read aFC[${i}] at offset ${fcOffset} in tableStream`);
            break;
        }
    }
    
    // 读取 aPnBtePapx 数组（页码数组）
    // aPnBtePapx 数组包含 n 个元素，每个元素是一个 4 字节的整数
    const aPnBtePapx: number[] = [];
    for (let i = 0; i < pnCount; i++) {
        const pnOffset = fcPlcfBtePapx + (pnCount + 1) * 4 + i * 4;
        if (pnOffset + 4 <= tableStream.length) {
            const pnFkpPapx = tableStream.readUInt32LE(pnOffset);
            
            // 根据 MS-DOC 规范，PnFkpPapx 的结构为：
            // - 低22位：pn (用于计算 PapxFkp 的偏移量)
            // - 高10位：unused (未使用)
            // 使用位运算获取低22位
            const pn = pnFkpPapx & 0x3FFFFF;

            // 验证 pn 的有效性
            if (pn >= 0) {
                aPnBtePapx.push(pn);
            } else {
                console.warn(`Warning: Invalid pn value ${pn} for aPnBtePapx[${i}]`);
            }
        } else {
            console.warn(`Warning: Cannot read aPnBtePapx[${i}] at offset ${pnOffset} in tableStream`);
            break;
        }
    }

    // 读取 STSH
    const stsh = readSTSH(
        tableStream, 
        fib.fibRgFcLcbBlob.fcStshf, 
        fib.fibRgFcLcbBlob.lcbStshf
    );

    // 处理每个段落运行
    for (let i = 0; i < aPnBtePapx.length; i++) {
        const pn = aPnBtePapx[i];
        const fcStart = aFC[i];
        const fcEnd = aFC[i + 1];
        
        // 验证 fcStart 和 fcEnd 的有效性
        if (fcStart < 0 || fcEnd < 0 || fcStart >= fcEnd) {
            console.warn(`Warning: Invalid FC range for paragraph run ${i} (fcStart=${fcStart}, fcEnd=${fcEnd})`);
            continue;
        }

        // 读取 PapxFkp 结构
        // PapxFkp 结构存储在 WordDocument 流中，而不是 Table Stream 中
        // pn 是 PapxFkp 在 WordDocument 流中的页码，每页 512 字节
        const papxFkp = readPapxFkp(mainStream, pn);
        
        // 处理 PapxFkp 中的每个段落
        for (const paragraph of papxFkp.paragraphs) {
            // 验证段落的 FC 范围是否与当前段落运行的 FC 范围重叠
            if (paragraph.fcStart >= fcStart && paragraph.fcStart < fcEnd) {
                // 读取段落属性
                let properties: CharacterFormatting[] = [];
                if (paragraph.papxOffset > 0) {
                    properties = readParagraphProperties(mainStream, paragraph.papxOffset, stsh);
                }
                
                // 从 mainStream 中读取文本内容
                // 注意：这里需要处理压缩标志 (0x40000000)
                const isCompressed = (paragraph.fcStart & 0x40000000) !== 0;
                const realStart = paragraph.fcStart & ~0x40000000;  // 移除压缩标志
                const realEnd = paragraph.fcEnd & ~0x40000000;      // 移除压缩标志
                
                // 验证偏移量的有效性
                if (realStart >= mainStream.length || realEnd > mainStream.length || realStart >= realEnd) {
                    console.warn(`Warning: Invalid paragraph offsets (start=${realStart}, end=${realEnd}, mainStream.length=${mainStream.length})`);
                    continue;
                }
                
                // 读取文本内容
                let text: string;
                if (isCompressed) {
                    // 压缩文本使用 1 字节表示一个字符
                    const length = realEnd - realStart;
                    text = mainStream.subarray(realStart, realStart + length).toString('binary');
                } else {
                    // 非压缩文本使用 2 字节表示一个字符 (UTF-16LE)
                    const length = realEnd - realStart;
                    text = mainStream.subarray(realStart, realStart + length).toString('utf16le');
                }
                
                // 创建段落运行
                paragraphRuns.push({
                    text,
                    startOffset: realStart,
                    endOffset: realEnd,
                    formatting: properties
                });
            }
        }
    }
    
    return paragraphRuns;
}

/**
 * PapxFkp 结构
 * [MS-DOC] 2.9.36 PapxFkp
 */
interface PapxFkp {
    cpara: number;
    rgfc: number[];
    rgbx: number[];
    papxOffset: number[];
    paragraphs: {
        fcStart: number;
        fcEnd: number;
        papxOffset: number;
    }[];
}

/**
 * 读取 PapxFkp 结构
 * [MS-DOC] 2.9.36 PapxFkp
 * 
 * PapxFkp 是一个结构，存储在 WordDocument 流中
 * 它包含段落格式化信息
 * 
 * @param mainStream WordDocument 流缓冲区
 * @param pn 页码
 * @returns PapxFkp 结构
 */
function readPapxFkp(mainStream: Buffer, pn: number): PapxFkp {
    // 计算 PapxFkp 在 WordDocument 流中的偏移量
    // 根据规范，PapxFkp 的大小是 512 字节，所以偏移量是 pn * 512
    const offset = pn * 512;
    
    // 创建一个空的 PapxFkp 结构
    const result: PapxFkp = {
        cpara: 0,
        rgfc: [],
        rgbx: [],
        papxOffset: [],
        paragraphs: []
    };
    
    // 验证 pn 的有效性
    if (pn < 0) {
        console.warn(`Warning: Invalid pn value ${pn} for PapxFkp`);
        return result;
    }
    
    // 验证偏移量的有效性
    if (offset >= mainStream.length) {
        console.warn(`Warning: PapxFkp at offset ${offset} extends beyond mainStream length ${mainStream.length}`);
        return result;
    }
    
    try {
        // 1. 读取 cpara（段落数量）
        // 根据规范，cpara 是 PapxFkp 的最后一个字节
        const cparaOffset = offset + 511;
        if (cparaOffset < mainStream.length) {
            result.cpara = mainStream.readUInt8(cparaOffset);
        } else {
            console.warn(`Warning: Cannot read cpara at offset ${cparaOffset} in mainStream`);
            return result;
        }
        
        // 验证 cpara 的有效性
        if (result.cpara > 0x1D) { // 根据规范，cpara 最大值为 0x1D
            console.warn(`Warning: Invalid cpara value ${result.cpara} at offset ${cparaOffset}, should not exceed 0x1D`);
            return result;
        }
        
        // 2. 读取 rgfc 数组（文件位置数组）
        // rgfc 数组包含 cpara+1 个元素，每个元素是一个 4 字节的整数
        for (let i = 0; i <= result.cpara; i++) {
            const fcOffset = offset + i * 4;
            if (fcOffset + 4 <= offset + 512) {
                result.rgfc.push(mainStream.readUInt32LE(fcOffset));
            }
        }
        
        // 3. 读取 rgbx 数组（字节索引数组）
        // rgbx 数组包含 cpara 个元素，每个元素是一个 13 字节的 BxPap 结构
        const rgbxStart = offset + (result.cpara + 1) * 4;
        for (let i = 0; i < result.cpara; i++) {
            const bxOffset = rgbxStart + i * 13; // BxPap 结构是 13 字节
            if (bxOffset + 13 <= offset + 511) { // 确保不超过 cpara
                // 读取 BxPap.bOffset
                const bOffset = mainStream.readUInt8(bxOffset);
                result.rgbx.push(bOffset);
                
                // 计算 Papx 的实际偏移量
                if (bOffset === 0) {
                    result.papxOffset.push(0);
                } else {
                    // 根据规范，实际偏移量 = FkpPapx 的起始位置 + (bOffset * 2)
                    const papxOffset = offset + (bOffset * 2);
                    result.papxOffset.push(papxOffset);
                }
            }
        }
        
        // 4. 构建 paragraphs 数组
        for (let i = 0; i < result.cpara; i++) {
            if (i < result.rgfc.length - 1 && i < result.papxOffset.length) {
                result.paragraphs.push({
                    fcStart: result.rgfc[i],
                    fcEnd: result.rgfc[i + 1],
                    papxOffset: result.papxOffset[i]
                });
            }
        }
        
    } catch (error) {
        console.error(`Error reading PapxFkp at offset ${offset} in mainStream:`, error);
    }
    
    return result;
}

/**
 * 读取段落属性
 * [MS-DOC] 2.9.178 Papx
 * 
 * Papx 是一个结构，存储段落的格式化属性
 * 它由一个字节的 cb/cb' 值和一个 GrpPrlAndIstd 结构组成
 * 
 * @param mainStream WordDocument 流缓冲区
 * @param offset Papx 在 WordDocument 流中的偏移量
 * @returns 段落格式化属性数组
 */
function readParagraphProperties(
    mainStream: Buffer,
    offset: number,
    stsh?: STSH | null
): CharacterFormatting[] {
    const properties: CharacterFormatting[] = [];
    
    if (offset <= 0 || offset >= mainStream.length) {
        return properties;
    }
    
    try {
        // 1. 读取 cb (属性长度)
        const cb = mainStream.readUInt8(offset);
        
        // 2. 处理 cb 和 cb'
        let grpprlSize: number;
        let grpprlOffset: number;
        
        if (cb === 0) {
            const cbPrime = mainStream.readUInt8(offset + 1);
            grpprlSize = cbPrime * 2;
            grpprlOffset = offset + 2;
        } else {
            grpprlSize = cb - 1;
            grpprlOffset = offset + 1;
        }
        
        // 3. 读取 istd (样式标识符)
        const istd = mainStream.readUInt16LE(grpprlOffset);
        grpprlOffset += 2;
        
        // 4. 应用样式属性（如果有STSH）
        if (stsh?.styleDefinitions) {
            const styleDefinition = stsh.styleDefinitions.get(istd);
            if (styleDefinition) {
                // 首先应用基础样式
                if (styleDefinition.baseStyle !== undefined) {
                    const baseStyle = stsh.styleDefinitions.get(styleDefinition.baseStyle);
                    if (baseStyle) {
                        properties.push(...baseStyle.properties);
                    }
                }
                // 然后应用当前样式
                properties.push(...styleDefinition.properties);
            }
        }
        
        // 5. 读取直接格式化属性
        const grpprlEnd = grpprlOffset + grpprlSize;
        while (grpprlOffset < grpprlEnd) {
            if (grpprlOffset + 2 > grpprlEnd) break;
            
            const sprm = mainStream.readUInt16LE(grpprlOffset);
            const sprmType = (sprm >> 13) & 0x7;
            grpprlOffset += 2;
            
            const operandSize = getOperandSize(sprm);
            if (operandSize === 0 || grpprlOffset + operandSize > grpprlEnd) {
                break;
            }
            
            const operand = mainStream.subarray(grpprlOffset, grpprlOffset + operandSize);
            grpprlOffset += operandSize;
            
            if (sprmType === 1) {
                const property = parseParagraphProperty(sprm, operand);
                if (property) {
                    // 直接格式化属性覆盖样式属性
                    const index = properties.findIndex(p => 
                        p.sprm.sgc === property.sprm.sgc && 
                        p.sprm.sprmCode === property.sprm.sprmCode
                    );
                    if (index >= 0) {
                        properties[index] = property;
                    } else {
                        properties.push(property);
                    }
                }
            }
        }
    } catch (error) {
        console.error(`Error reading paragraph properties at offset ${offset}:`, error);
    }
    
    return properties;
}

interface StyleDefinition {
    istd: number;         // 样式标识符
    baseStyle?: number;   // 基础样式的istd
    properties: CharacterFormatting[]; // 样式属性
}

interface STSH {
    ftcAsci: number;      // ASCII字体代码
    ftcFE: number;        // 远东字体代码
    ftcOther: number;     // 其他字体代码
    styleDefinitions: Map<number, StyleDefinition>; // 样式定义映射
}

/**
 * 读取 STSH 结构
 */
function readSTSH(tableStream: Buffer, offset: number, size: number): STSH | null {
    try {
        if (offset + 18 > tableStream.length) {
            console.warn('STSH structure extends beyond table stream');
            return null;
        }

        // 读取 STSH 头部
        const cbStshi = tableStream.readUInt16LE(offset);
        const stsh = tableStream.subarray(offset + 2, offset + size);
        
        // 读取字体信息
        const ftcAsci = stsh.readUInt16LE(10);
        const ftcFE = stsh.readUInt16LE(12);
        const ftcOther = stsh.readUInt16LE(14);

        // 读取样式定义
        const styleDefinitions = new Map<number, StyleDefinition>();
        let currentOffset = cbStshi + 2;  // 跳过STSHI

        while (currentOffset < size) {
            // 读取样式定义头部
            const istd = stsh.readUInt16LE(currentOffset);
            const cbStd = stsh.readUInt16LE(currentOffset + 2);
            
            if (cbStd === 0) break;

            // 读取基础样式
            const baseStyle = stsh.readUInt16LE(currentOffset + 4);
            
            // 读取样式属性
            const properties: CharacterFormatting[] = [];
            let grpprlOffset = currentOffset + 6;
            const grpprlEnd = grpprlOffset + cbStd - 4;

            while (grpprlOffset < grpprlEnd) {
                const sprm = stsh.readUInt16LE(grpprlOffset);
                const sprmType = (sprm >> 13) & 0x7;
                grpprlOffset += 2;

                const operandSize = getOperandSize(sprm);
                if (operandSize === 0 || grpprlOffset + operandSize > grpprlEnd) break;

                const operand = stsh.subarray(grpprlOffset, grpprlOffset + operandSize);
                grpprlOffset += operandSize;

                // 解析属性
                const property = sprmType === 1 ? 
                    parseParagraphProperty(sprm, operand) : 
                    parseSprmProperty(sprm, operand);
                
                if (property) {
                    properties.push(property);
                }
            }

            // 保存样式定义
            styleDefinitions.set(istd, {
                istd,
                baseStyle: baseStyle !== 0xFFFF ? baseStyle : undefined,
                properties
            });

            currentOffset += cbStd + 4;
        }

        return {
            ftcAsci,
            ftcFE,
            ftcOther,
            styleDefinitions
        };
    } catch (error) {
        console.error('Error reading STSH:', error);
        return null;
    }
}

/**
 * 应用字体信息
 */
function applyFontInfo(stsh: STSH): CharacterFormatting[] {
    const fontProperties: CharacterFormatting[] = [];

    // 添加ASCII字体
    if (stsh.ftcAsci !== 0) {
        fontProperties.push({
            sprm: {
                sgc: 2,
                sprmCode: 'fontFamily'
            },
            value: stsh.ftcAsci
        });
    }

    // 添加远东字体
    if (stsh.ftcFE !== 0) {
        fontProperties.push({
            sprm: {
                sgc: 2,
                sprmCode: 'fontFamilyFE'
            },
            value: stsh.ftcFE
        });
    }

    // 添加其他字体
    if (stsh.ftcOther !== 0) {
        fontProperties.push({
            sprm: {
                sgc: 2,
                sprmCode: 'fontFamilyOther'
            },
            value: stsh.ftcOther
        });
    }

    return fontProperties;
}

/**
 * 合并格式化属性
 */
function mergeFormatting(base: CharacterFormatting[], overlay: CharacterFormatting[]): CharacterFormatting[] {
    const result = [...base];
    
    for (const prop of overlay) {
        const index = result.findIndex(p => 
            p.sprm.sgc === prop.sprm.sgc && 
            p.sprm.sprmCode === prop.sprm.sprmCode
        );
        
        if (index >= 0) {
            result[index] = prop;  // 覆盖已存在的属性
        } else {
            result.push(prop);     // 添加新属性
        }
    }
    
    return result;
}

/**
 * 获取操作数大小
 * [MS-DOC] 2.6.2 Sprm Structure
 */
function getOperandSize(sprm: number): number {
    const sprmType = (sprm >> 13) & 0x7;
    switch (sprmType) {
        case 0: case 1: return 1;  // byte
        case 2: case 4: case 5: return 2;  // word
        case 3: return 4;  // dword
        case 7: return (sprm & 0x1000) ? 3 : 1;  // three bytes or byte
        default: return 1;
    }
}

// 添加清除缓存的函数
/**
 * 清除所有缓存
 */
function clearAllCaches(): void {
    textRunsCache.clear();
    paragraphRunsCache.clear();
    propertiesCache.clear();
}

// 修改导出部分
export { 
    getAllTextRuns,
    getAllParagraphRuns,
    mergeFormatting, 
    clearAllCaches 
};