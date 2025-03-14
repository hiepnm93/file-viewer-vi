import type { Clx } from './clx';
import type { Fib } from './fib';

/** Text Run */
export interface WJSTextRun {
    t: "s";
    /** Text content */
    v: string;
    /** Formatting */
    formatting: CharacterFormatting[];
}

/** Table Cell */
export interface WJSTableCell {
    t: "c";
    /** Body */
    p: WJSPara[];
}

/** Table Row */
export interface WJSTableRow {
    t: "r";
    /** Cells */
    c: WJSTableCell[];
}

/** Table */
export interface WJSTable {
    t: "t";
    /** Rows */
    r: WJSTableRow[];
}

/** Element */
export interface WJSElement {
    t: "e";
}

/** Children elements of a Paragraph */
export declare type WJSParaElement = WJSTextRun | WJSTable | WJSElement;

/** Paragraph */
export interface WJSPara {
    /** Children */
    elts: WJSParaElement[];
    /** 起始位置 */
    startOffset?: number;
    /** 结束位置 */
    endOffset?: number;
    /** 段落格式化信息 */
    formatting?: CharacterFormatting[];
}

/** WordJS Document */
export interface WJSDoc {
    /** 段落数组 */
    p: WJSPara[];
    /** FIB 结构 */
    fib?: Fib;
    /** clx 结构 */
    clx?: Clx;
}

/** 字符格式化 */
export interface CharacterFormatting {
    sprm: {
        sgc: number;
        [key: string]: any;
    };
    value: any;
}

/** 格式化字符 */
export interface FormattedChar {
    char: string;
    formatting: CharacterFormatting[];
}

/** 文本运行 */
export interface TextRun {
   text: string;           // 文本内容
   startOffset?: number;    // 起始位置
   endOffset?: number;      // 结束位置
   formatting: CharacterFormatting[]; // 格式信息
}

/** 段落运行 */
export interface ParagraphRun {
   text: string;           // 文本内容
   startOffset: number;    // 起始位置
   endOffset: number;      // 结束位置
   formatting: CharacterFormatting[]; // 格式信息
}

export type * from './clx';
export type * from './fib';