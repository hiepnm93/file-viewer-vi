/**
 * [MS-DOC] 2.5.1 Fib
 */
interface Fib {
    base: FibBase;
    fibRgLw: FibRgLw97;
    fibRgFcLcbBlob: FibRgFcLcb;
    fibRgCswNew?: FibRgCswNew;
}
/**
 * [MS-DOC] 2.5.2 FibBase
 */
interface FibBase {
    /**
     * nFib (2 bytes): An unsigned integer that specifies the version number of
     * the file format used. Superseded by FibRgCswNew.nFibNew if it is present.
     * This value SHOULD be 0x00C1. Could possibly be 0x00C0 or 0x00C2 but should
     * be treated as if it were 0x00C1.
     */
    nFib: number;
    /**
     * G - fWhichTblStm (1 bit): Specifies the Table stream to which the FIB
     * refers. When this value is set to 1, use 1Table; when this value is set to
     * 0, use 0Table.
     */
    fWhichTblStm: number;
}
/**
 * [MS-DOC] 2.5.4 FibRgLw97
 */
interface FibRgLw97 {
    /**
     * ccpText (4 bytes): A signed integer that specifies the count of CPs in the
     * main document. This value MUST be zero, 1, or greater.
     */
    ccpText: number;
    /**
     * ccpFtn (4 bytes): A signed integer that specifies the count of CPs in the
     * footnote subdocument. This value MUST be zero, 1, or greater.
     */
    ccpFtn: number;
    /**
     * ccpHdd (4 bytes): A signed integer that specifies the count of CPs in the
     * header subdocument. This value MUST be zero, 1, or greater.
     */
    ccpHdd: number;
    /**
     * ccpAtn (4 bytes): A signed integer that specifies the count of CPs in the
     * comment subdocument. This value MUST be zero, 1, or greater.
     */
    ccpAtn: number;
    /**
     * ccpEdn (4 bytes): A signed integer that specifies the count of CPs in the
     * endnote subdocument. This value MUST be zero, 1, or greater.
     */
    ccpEdn: number;
    /**
     * ccpTxbx (4 bytes): A signed integer that specifies the count of CPs in the
     * textbox subdocument of the main document. This value MUST be zero, 1, or
     * greater.
     */
    ccpTxbx: number;
    /**
     * ccpHdrTxbx (4 bytes): A signed integer that specifies the count of CPs in
     * the textbox subdocument of the header. This value MUST be zero, 1, or
     * greater.
     */
    ccpHdrTxbx: number;
}
/**
 * [MS-DOC] 2.5.6 FibRgFcLcb97
 */
interface FibRgFcLcb {
    /**
     * [MS-DOC] 2.9.271 STSH - Stylesheet
     * fcStshf (4 bytes): 指向样式表在 Table Stream 中的起始位置
     * lcbStshf (4 bytes): 样式表的大小（以字节为单位）
     */
    fcStshf: number;
    lcbStshf: number;

    /**
     * [MS-DOC] 2.9.178 PlcBtePapx
     * fcPlcfBtePapx (4 bytes): 指向段落属性在 Table Stream 中的起始位置
     * lcbPlcfBtePapx (4 bytes): 段落属性的大小（以字节为单位）
     */
    fcPlcfBtePapx: number;
    lcbPlcfBtePapx: number;

    /**
     * [MS-DOC] 2.9.177 PlcBteChpx
     * fcPlcfBteChpx (4 bytes): 指向字符属性在 Table Stream 中的起始位置
     * lcbPlcfBteChpx (4 bytes): 字符属性的大小（以字节为单位）
     */
    fcPlcfBteChpx: number;
    lcbPlcfBteChpx: number;

    /**
     * [MS-DOC] 2.9.38 Clx
     * fcClx (4 bytes): 指向文档内容在 Table Stream 中的起始位置
     * lcbClx (4 bytes): 文档内容的大小（以字节为单位）
     */
    fcClx: number;
    lcbClx: number;
}
/**
 * [MS-DOC] 2.5.11 FibRgCswNew
 */
interface FibRgCswNew {
    /**
     * nFibNew (2 bytes): An unsigned integer that specifies the version number
     * of the file format that is used. This value MUST be one of the following.
     * 0x00D9, 0x0101, 0x010C, 0x0112.
     */
    nFibNew: number;
}

export type { Fib, FibBase, FibRgLw97, FibRgFcLcb, FibRgCswNew };
