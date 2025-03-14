import { Buffer } from 'buffer';
import cfb from 'cfb';
import { parseClx, getDocumentText } from './clx';
import { readFib } from './fib';
import { getAllTextRuns, getAllParagraphRuns } from './formatting';
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

    // 添加调试信息
    console.log(`
=== 文档流信息 ===
Main Stream (WordDocument):
  - 长度: ${wordStream.length} 字节
  
Table Stream (${tableName}):
  - 长度: ${tableStream.length} 字节
  - 最大页数 (每页 512 字节): ${Math.floor(tableStream.length / 512)}
  
FIB 信息:
  - fcPlcfBtePapx: ${fib.fibRgFcLcbBlob.fcPlcfBtePapx} (Table Stream 中的偏移量)
  - lcbPlcfBtePapx: ${fib.fibRgFcLcbBlob.lcbPlcfBtePapx} (PlcfBtePapx 的长度)
  - fcClx: ${fib.fibRgFcLcbBlob.fcClx} (Table Stream 中的偏移量)
  - lcbClx: ${fib.fibRgFcLcbBlob.lcbClx} (Clx 的长度)
=== 结束信息 ===
    `);

    const clxData = tableStream.subarray(fib.fibRgFcLcbBlob.fcClx, fib.fibRgFcLcbBlob.fcClx + fib.fibRgFcLcbBlob.lcbClx);
    const clx = parseClx(clxData);

    const text = getDocumentText(clx, wordStream);
    if (!text) {
        throw new Error("Invalid Word document: Unable to extract text");
    }

    /* 处理特殊字符和格式化 */
    const processedText = text
        .replace(/\x13.*?\x14(.*?)\x15/g, "$1")
        .replace(/\x13.*?\x15/g, "")
        .replace(/[\x01\x08]/g, "");

    // 添加文本信息
    console.log(`
=== 文本信息 ===
  - 提取的文本长度: ${text.length} 字符
  - 处理后的文本长度: ${processedText.length} 字符
=== 结束信息 ===
    `);

    const doc: WJSDoc = { p: [], clx, fib };

    try {
        // 1. 首先获取所有段落运行（papxFkp）
        const paragraphRuns = getAllParagraphRuns(wordStream, tableStream, fib);
        if (!paragraphRuns.length) {
            throw new Error("No paragraph runs found");
        }

        // 2. 获取所有文本运行（chpxFkp）
        const textRuns = getAllTextRuns(tableStream, wordStream, fib, clx);

        // 3. 按段落组织文档结构
        for (const paragraphRun of paragraphRuns) {
            // 创建新段落
            const paragraph: WJSPara = {
                elts: [],
                startOffset: paragraphRun.startOffset,
                endOffset: paragraphRun.endOffset,
                formatting: paragraphRun.formatting || [] // 应用段落格式
            };

            // 4. 查找属于当前段落的所有文本运行
            const paragraphTextRuns = textRuns.filter(run => 
                run.startOffset !== undefined && 
                run.endOffset !== undefined &&
                run.startOffset >= paragraphRun.startOffset && 
                run.endOffset <= paragraphRun.endOffset
            );


            // 5. 处理段落内的文本运行
            if (paragraphTextRuns.length > 0) {
                // 按照偏移量排序文本运行
                paragraphTextRuns.sort((a, b) => 
                    (a.startOffset || 0) - (b.startOffset || 0)
                );

                // 添加每个文本运行
                for (const textRun of paragraphTextRuns) {
                    paragraph.elts.push({
                        t: "s",
                        v: textRun.text || "", // 即使是空文本也保留
                        formatting: textRun.formatting || [] // 应用字符格式（会覆盖段落格式）
                    });
                }
            } else {
                // 如果没有找到文本运行，使用段落范围内的原始文本
                const paragraphText = processedText.slice(
                    paragraphRun.startOffset, 
                    paragraphRun.endOffset
                );
                
                paragraph.elts.push({
                    t: "s",
                    v: paragraphText || "", // 即使是空文本也保留
                    formatting: [] // 只使用段落格式
                });
            }

            // 添加段落，无论是否为空
            doc.p.push(paragraph);
        }

        // 6. 如果没有找到任何段落，创建一个默认段落
        if (doc.p.length === 0) {
            doc.p.push({
                elts: [{
                    t: "s",
                    v: processedText,
                    formatting: []
                }]
            });
        }

    } catch (error) {
        console.error('Error processing document structure:', error);
        // 发生错误时，返回纯文本文档
        doc.p.push({
            elts: [{
                t: "s",
                v: processedText,
                formatting: []
            }]
        });
    }

    return doc;
}

export type { Fib };
