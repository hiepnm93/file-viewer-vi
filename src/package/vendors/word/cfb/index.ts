import { Buffer } from 'buffer';
import cfb from 'cfb';
import { parseClx, getTxt } from './clx';
import { readFib } from './fib';
import { getCharacterFormatting } from './formatting';
import type { Fib } from '../types/fib';
import type { WJSPara, WJSDoc, FormattedChar, TextRun } from '../types';

export { write_str as to_text } from './txt';

/**
 * 解析cfb
 * @param file CFB 容器
 * @returns 解析后的文档结构
 */
export function parse_cfb(file: cfb.CFB$Container): WJSDoc {
    /* [MS-DOC] 2.4.1 Retrieving Text */
    const wordDocument = cfb.find(file, "/WordDocument");
    if (!wordDocument || !wordDocument.content) {
        throw new Error("Invalid Word document: WordDocument stream not found");
    }

    const wordStream = Buffer.from(wordDocument.content as Uint8Array);
    const fib = readFib(wordStream);
    if (!fib || !fib.base) {
        throw new Error("Invalid Word document: Unable to read FIB");
    }

    const tableName = fib.base.fWhichTblStm === 1 ? "/1Table" : "/0Table";
    const table = cfb.find(file, tableName);
    if (!table || !table.content) {
        throw new Error(`Invalid Word document: ${tableName} stream not found`);
    }

    const tableStream = Buffer.from(table.content as Uint8Array);
    const clx = tableStream.slice(fib.fibRgFcLcbBlob.fcClx, fib.fibRgFcLcbBlob.fcClx + fib.fibRgFcLcbBlob.lcbClx);
    const plcPcd = parseClx(clx);
    const text = getTxt(fib.fibRgLw, plcPcd, wordStream);
    if (!text) {
        throw new Error("Invalid Word document: Unable to extract text");
    }

    /* 处理特殊字符和格式化 */
    const processedText = text
        .replace(/\x13.*?\x14(.*?)\x15/g, "$1")
        .replace(/\x13.*?\x15/g, "")
        .replace(/[\x01\x08]/g, "")
        // .replace(/\x07/g, "\t");

    const doc: WJSDoc = { p: [] };
    const para: WJSPara = { elts: [] };

    try {
        // 获取每个字符的格式化信息
        const formattedText: FormattedChar[] = [];
        for (let cp = 0; cp < processedText.length; cp++) {
            const formatting = getCharacterFormatting(cp, fib, wordStream, tableStream);
            formattedText.push({
                char: processedText[cp],
                formatting: formatting || []
            });
        }

        // 将格式化文本分组
        let currentRun: TextRun = { text: '', formatting: [] };
        const runs: TextRun[] = [];

        formattedText.forEach((char, i) => {
            const currentFormatting = JSON.stringify(char.formatting);
            const prevFormatting = JSON.stringify(currentRun.formatting);
            
            if (i === 0 || currentFormatting !== prevFormatting) {
                if (currentRun.text) {
                    runs.push({ ...currentRun });
                }
                currentRun = {
                    text: char.char,
                    formatting: char.formatting
                };
            } else {
                currentRun.text += char.char;
            }
        });
        
        if (currentRun.text) {
            runs.push(currentRun);
        }

        // 将运行添加到段落中
        if (runs.length > 0) {
            runs.forEach(run => {
                para.elts.push({
                    t: "s",
                    v: run.text,
                    formatting: run.formatting
                });
            });
        } else {
            // 如果没有任何运行，至少添加纯文本
            para.elts.push({
                t: "s",
                v: processedText,
                formatting: []
            });
        }

    } catch (error) {
        console.error('Error processing character formatting:', error);
        // 发生错误时，至少返回纯文本
        para.elts.push({
            t: "s",
            v: processedText,
            formatting: []
        });
    }

    doc.p.push(para);
    return doc;
}

export type { Fib }; 