/** Text Run */
export interface WJSTextRun {
    t: "s";
    /** Text content */
    v: string;
    /** Formatting */
    formatting: CharacterFormatting[];
}
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
export interface WJSElement {
    t: "e";
}

/** Children elements of a Paragraph */
export declare type WJSParaElement = WJSTextRun | WJSTable | WJSElement;
/** Paragraph */
export interface WJSPara {
    /** Children */
    elts: WJSParaElement[];
}
/** WordJS Document */
export interface WJSDoc {
    p: WJSPara[];
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
    text: string;
    formatting: CharacterFormatting[];
}