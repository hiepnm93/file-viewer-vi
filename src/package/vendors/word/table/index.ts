import type { WJSTable, WJSTableRow, WJSTableCell, WJSPara, CharacterFormatting, TextRun, ParagraphRun } from "../types";

declare type TableBuilderCallback = (table: WJSTable, start?: number, end?: number) => void;

/**
 * 表格构建器
 * 用于构建 Word 文档中的表格结构
 */
export class TableBuilder {

    // 表格
    private table: WJSTable = {
        t: "t",
        r: []
    };

    // 当前行
    private currentRow: WJSTableRow = {
        t: "r",
        c: []
    };

    // 当前单元格
    private currentCell: WJSTableCell = {
        t: "c",
        p: []
    };

    // 是否正在构建
    private isBuilding: boolean = false;

    // 开始偏移量
    private startOffset?: number;

    // 回调函数
    private cb: TableBuilderCallback;

    constructor(cb: TableBuilderCallback) {
        this.cb = cb;
    }

    init() {
        this.table = {
            t: "t",
            r: []
        };
        this.currentRow = {
            t: "r",
            c: []
        };
        this.currentCell = {
            t: "c",
            p: []
        };
    }

    /**
     * 开始构建表格
     */
    startBuilding(start?: number) {
        this.init();
        this.isBuilding = true;
        this.startOffset = start;
    }

    /**
     * 添加单元格内容
     * @param text 单元格文本
     * @param formatting 文本格式
     */
    attempt(text: string, paragraph: WJSPara) : boolean {
        if (text.endsWith('\x07')) {
            // 表格 (todo 暂未添加样式渲染)
            if (!this.isBuilding) {
                this.startBuilding(paragraph.startOffset);
            }
            // 换行
            if (text === '\x07') {
                this.finishRow();
                return true;
            }
            // 添加文本运行
            this.currentCell.p.push(paragraph);
            this.finishCell();
            return true;
        } else {
            // 文本，结束构建
            if (this.isBuilding) {
                this.isBuilding = false;
                this.cb(this.table, this.startOffset, paragraph.endOffset);
            }
        }

        return false;
    }

    /**
     * 完成当前单元格
     */
    finishCell() {
        if (this.currentCell.p.length > 0) {
            this.currentRow.c.push(this.currentCell);
            this.currentCell = {
                t: "c",
                p: []
            };
        }
    }

    /**
     * 完成当前行
     */
    finishRow() {
        if (this.currentRow.c.length > 0) {
            this.table.r.push(this.currentRow);
            this.currentRow = {
                t: "r",
                c: []
            };
        }
    }

    /**
     * 完成表格构建
     * @returns 构建完成的表格
     */
    finish(): WJSTable {
        if (!this.isBuilding) {
            return this.table;
        }

        // 确保最后一个单元格和行都被添加
        this.finishCell();
        this.finishRow();
        this.isBuilding = false;
        return this.table;
    }

    /**
     * 检查是否正在构建表格
     */
    isActive(): boolean {
        return this.isBuilding;
    }
}

/**
 * 解析表格文本
 * @param text 包含表格内容的文本
 * @returns 解析后的表格对象
 */
export const parseTable = (text: string): WJSTable => {
    const builder = new TableBuilder();
    const cells = text.split('\x07');
    
    cells.forEach(cell => {
        if (cell.trim()) {
            builder.attempt(cell.trim());
            builder.finishCell();
        }
    });
    
    return builder.finish();
};

