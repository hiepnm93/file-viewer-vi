import type { Fib } from '../types/fib';
import { Buffer } from 'buffer';

/**
 * 字符格式化属性枚举
 */
export enum CharacterFormatting {
    Bold = 'bold',
    Italic = 'italic',
    Underline = 'underline',
    StrikeThrough = 'strikethrough',
    HighLight = 'highlight',
    Color = 'color',
    FontSize = 'fontSize',
    FontFamily = 'fontFamily'
}

/**
 * Sprm (Single Property Modifier) 操作码
 */
const enum SprmCodes {
    sprmCFBold = 0x0835,        // 粗体
    sprmCFItalic = 0x0836,      // 斜体
    sprmCFStrike = 0x0837,      // 删除线
    sprmCKul = 0x2A3E,          // 下划线
    sprmCIco = 0x2A42,          // 颜色
    sprmCHps = 0x4A43,          // 字号
    sprmCRgFtc0 = 0x4A4F        // 字体
}

/**
 * 获取字符的格式化信息
 * @param cp 字符位置
 * @param fib FIB结构
 * @param mainStream 主文档流
 * @param tableStream 表格流
 * @returns 格式化属性数组
 */
export function getCharacterFormatting(
    cp: number,
    fib: Fib,
    mainStream: Buffer,
    tableStream: Buffer
): string[] {
    const formatting: string[] = [];
    
    try {
        // 获取字符属性位置
        const fcIndex = Math.floor(cp / 128) * 8;
        if (fcIndex >= mainStream.length) {
            return formatting;
        }

        // 读取CHPX (Character Property eXceptions)
        const chpxFc = fib.fibRgFcLcbBlob.fcPlcfBteChpx;
        const chpxLcb = fib.fibRgFcLcbBlob.lcbPlcfBteChpx;

        if (chpxFc <= 0 || chpxLcb <= 0) {
            return formatting;
        }

        const chpxData = tableStream.slice(chpxFc, chpxFc + chpxLcb);
        let offset = 0;

        while (offset < chpxData.length) {
            const sprm = chpxData.readUInt16LE(offset);
            const operandSize = getSizeOfOperand(sprm);
            offset += 2;

            if (offset + operandSize > chpxData.length) {
                break;
            }

            const operand = chpxData.slice(offset, offset + operandSize);
            offset += operandSize;

            // 处理不同的Sprm
            switch (sprm) {
                case SprmCodes.sprmCFBold:
                    if (operand[0] !== 0) {
                        formatting.push(CharacterFormatting.Bold);
                    }
                    break;
                case SprmCodes.sprmCFItalic:
                    if (operand[0] !== 0) {
                        formatting.push(CharacterFormatting.Italic);
                    }
                    break;
                case SprmCodes.sprmCFStrike:
                    if (operand[0] !== 0) {
                        formatting.push(CharacterFormatting.StrikeThrough);
                    }
                    break;
                case SprmCodes.sprmCKul:
                    if (operand[0] !== 0) {
                        formatting.push(CharacterFormatting.Underline);
                    }
                    break;
                case SprmCodes.sprmCIco:
                    formatting.push(`${CharacterFormatting.Color}:${operand[0]}`);
                    break;
                case SprmCodes.sprmCHps:
                    const fontSize = operand.readUInt16LE(0);
                    formatting.push(`${CharacterFormatting.FontSize}:${fontSize/2}`);
                    break;
                case SprmCodes.sprmCRgFtc0:
                    const fontIndex = operand.readUInt16LE(0);
                    formatting.push(`${CharacterFormatting.FontFamily}:${fontIndex}`);
                    break;
            }
        }
    } catch (error) {
        console.error('Error in getCharacterFormatting:', error);
    }

    return formatting;
}

/**
 * 获取Sprm操作数的大小
 * @param sprm Sprm操作码
 * @returns 操作数大小(字节)
 */
function getSizeOfOperand(sprm: number): number {
    const sprmType = (sprm >> 13) & 0x7;
    switch (sprmType) {
        case 0: case 1: return 1;  // byte
        case 2: case 4: case 5: return 2;  // word
        case 3: return 4;  // dword
        case 7: 
            if ((sprm & 0x1000) !== 0) {
                return 3;  // three bytes
            }
            return 1;  // byte
        default: return 1;
    }
} 