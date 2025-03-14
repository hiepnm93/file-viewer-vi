/**
 * CLX 结构
 * [MS-DOC] 2.9.38 Clx
 */
export interface Clx {
    pcdt: Pcdt;
}

/**
 * Pcdt 结构
 * [MS-DOC] 2.9.177 Pcdt
 */
export interface Pcdt {
    clxt: number;      // 必须是 0x02
    lcb: number;       // PlcPcd 的大小
    plcPcd: PlcPcd;    // 段落内容描述符位置数组
}

/**
 * PlcPcd 结构
 * [MS-DOC] 2.8.35 PlcPcd
 */
export interface PlcPcd {
    acp: number[];     // CP (Character Position) 数组
    pcds: Pcd[];      // 段落内容描述符数组
    ranges: [number, number][];  // CP 范围数组，每个元素是 [start, end] 对
}

/**
 * Pcd (Piece Descriptor) 结构
 * [MS-DOC] 2.9.178 Pcd
 */
export interface Pcd {
    fNoParaLast: boolean;     // 是否为段落的最后一个片段
    fRaw: boolean;            // 是否为原始文本
    fCompressed: boolean;     // 是否压缩
    prm: number;             // 属性修饰符
    fc: number;              // 文件位置
}
