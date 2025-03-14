import type { WJSDoc, WJSPara, WJSTable, WJSTableRow, WJSTableCell } from './types';

/**
 * 颜色映射表
 */
const COLOR_MAP: Record<number, string> = {
  1: '#000000', // 黑色
  2: '#0000FF', // 蓝色
  3: '#00FFFF', // 青色
  4: '#00FF00', // 绿色
  5: '#FF00FF', // 洋红
  6: '#FF0000', // 红色
  7: '#FFFF00', // 黄色
  8: '#FFFFFF', // 白色
  9: '#000080', // 深蓝色
  10: '#008080', // 深青色
  11: '#008000', // 深绿色
  12: '#800080', // 深洋红
  13: '#800000', // 深红色
  14: '#808000', // 橄榄色
  15: '#808080', // 灰色
  16: '#C0C0C0', // 银色
};

/**
 * 对齐方式映射表
 */
const ALIGN_MAP: Record<number, string> = {
  0: 'left',
  1: 'center',
  2: 'right',
  3: 'justify'
};

/**
 * 处理文本格式化
 * 将 WJSTextRun 中的格式信息转换为 HTML 样式
 * @param text 文本内容
 * @param formatting 格式化数组
 * @param inheritedStyles 从段落继承的样式
 */
export const applyFormatting = (
    text: string, 
    formatting: any[],
    inheritedStyles: string = ''
): string => {
    if (!text) return ''; // 返回空字符串而不是 null，保持空白

    let styles = inheritedStyles;

    // 处理各种格式
    if (formatting && formatting.length > 0) {
        formatting.forEach(format => {
            if (!format.sprm || !format.sprm.sprmCode) return;

            switch (format.sprm.sprmCode) {
                case 'bold':
                    if (format.value) styles += 'font-weight: bold;';
                    break;
                case 'italic':
                    if (format.value) styles += 'font-style: italic;';
                    break;
                case 'underline':
                    if (format.value) styles += 'text-decoration: underline;';
                    break;
                case 'strike':
                    if (format.value) styles += 'text-decoration: line-through;';
                    break;
                case 'fontSize':
                    if (format.value) styles += `font-size: ${format.value}pt;`;
                    break;
                case 'color':
                    if (format.value !== undefined && COLOR_MAP[format.value]) {
                        styles += `color: ${COLOR_MAP[format.value]};`;
                    }
                    break;
                // 移除段落级样式，这些应该在段落级别处理
                // case 'alignment':
                // case 'spacingBefore':
                // case 'spacingAfter':
                // case 'lineSpacing':
                // case 'leftIndent':
                // case 'rightIndent':
                // case 'firstLineIndent':
            }
        });
    }

    // 如果有样式，则应用样式
    if (styles) {
        // 使用 white-space: pre-wrap 保持空白和换行
        styles += 'white-space: pre-wrap;';
        return `<span style="${styles}">${text}</span>`;
    }

    // 即使没有样式也要保持空白
    return `<span style="white-space: pre-wrap;">${text}</span>`;
};

/**
 * 应用段落样式
 * 将段落格式信息转换为 HTML 样式
 */
export const applyParagraphFormatting = (para: WJSPara): string => {
    let styles = 'margin: 0; padding: 0; text-indent: 2em;'; // 添加默认首行缩进

    if (para.formatting && para.formatting.length > 0) {
        para.formatting.forEach((format: any) => {
            if (!format.sprm || !format.sprm.sprmCode) return;

            switch (format.sprm.sprmCode) {
                case 'alignment':
                    if (format.value !== undefined && ALIGN_MAP[format.value]) {
                        styles += `text-align: ${ALIGN_MAP[format.value]};`;
                    }
                    break;
                case 'spacingBefore':
                    if (format.value) {
                        const spacing = format.value / 20;
                        styles += `margin-top: ${spacing}pt;`;
                    }
                    break;
                case 'spacingAfter':
                    if (format.value) {
                        const spacing = format.value / 20;
                        styles += `margin-bottom: ${spacing}pt;`;
                    }
                    break;
                case 'lineSpacing':
                    if (format.value) {
                        // 负值表示精确行距，正值表示最小行距
                        const lineHeight = Math.abs(format.value) / 20;
                        // 使用 em 单位来设置行高，这样会相对于字体大小自动调整
                        styles += `line-height: ${lineHeight / 12}em;`;
                    }
                    break;
                case 'leftIndent':
                    if (format.value) {
                        const indent = format.value / 20;
                        styles += `margin-left: ${indent}pt;`;
                    }
                    break;
                case 'rightIndent':
                    if (format.value) {
                        const indent = format.value / 20;
                        styles += `margin-right: ${indent}pt;`;
                    }
                    break;
                case 'firstLineIndent':
                    if (format.value) {
                        const indent = format.value / 20;
                        // 使用 em 单位来设置首行缩进，这样会相对于字体大小自动调整
                        styles += `text-indent: ${indent / 12}em;`;
                    }
                    break;
                case 'indentLevel':
                    if (format.value) {
                        const padding = format.value * 20;
                        styles += `padding-left: ${padding}pt;`;
                    }
                    break;
                case 'keepLines':
                    if (format.value) {
                        styles += 'page-break-inside: avoid;';
                        // 添加额外的分页控制
                        styles += 'break-inside: avoid;';
                    }
                    break;
                case 'keepNext':
                    if (format.value) {
                        styles += 'page-break-after: avoid;';
                        // 添加额外的分页控制
                        styles += 'break-after: avoid;';
                    }
                    break;
                case 'widowControl':
                    if (format.value) {
                        styles += 'orphans: 2; widows: 2;';
                        // 添加额外的孤行控制
                        styles += 'min-height: 2em;';
                    }
                    break;
                case 'outlineLevel':
                    if (format.value !== undefined) {
                        styles += `outline-level: ${format.value};`;
                        // 添加大纲级别的视觉提示
                        const level = format.value;
                        if (level > 0) {
                            styles += `font-weight: ${Math.max(400, 700 - level * 100)};`;
                            styles += `margin-left: ${(level - 1) * 20}pt;`;
                        }
                    }
                    break;
                case 'shading':
                    if (format.value) {
                        const { color, pattern } = format.value;
                        if (color && COLOR_MAP[color]) {
                            styles += `background-color: ${COLOR_MAP[color]};`;
                        }
                        if (pattern) {
                            styles += `background-pattern: ${pattern};`;
                        }
                    }
                    break;
                case 'frame':
                    if (format.value) {
                        const { width, height, position } = format.value;
                        if (width) styles += `width: ${width}pt;`;
                        if (height) styles += `height: ${height}pt;`;
                        if (position) styles += `position: ${position};`;
                    }
                    break;
                case 'border':
                    if (format.value) {
                        const { top, right, bottom, left } = format.value;
                        if (top) styles += `border-top: ${top.width}pt ${top.style} ${COLOR_MAP[top.color] || '#000000'};`;
                        if (right) styles += `border-right: ${right.width}pt ${right.style} ${COLOR_MAP[right.color] || '#000000'};`;
                        if (bottom) styles += `border-bottom: ${bottom.width}pt ${bottom.style} ${COLOR_MAP[bottom.color] || '#000000'};`;
                        if (left) styles += `border-left: ${left.width}pt ${left.style} ${COLOR_MAP[left.color] || '#000000'};`;
                    }
                    break;
            }
        });
    }

    // 添加默认的段落样式
    styles += 'box-sizing: border-box;';

    return styles;
};

/**
 * 解析表格行，处理连续制表符作为行分隔符
 */
export const parseTable = (line: string): string => {
  let table = '<table class="doc-table" style="border-collapse: collapse; width: 100%;">';
  // 将连续的制表符替换为特殊标记，以便后续处理
  const processedLine = line.replace(/\x07\x07/g, '\x07@NEWROW\x07');
  // 按特殊标记分割获取多行数据
  const rows = processedLine.split('@NEWROW');

  // 过滤掉空行，并处理每一行
  rows.filter(row => row.trim() !== '').forEach(row => {
    const cells = row.split('\x07').filter(cell => cell !== '');
    if (cells.length > 0) {
      table += '<tr>';
      cells.forEach(cell => {
        table += `<td style="border: 1px solid #ddd; padding: 8px;">${cell.trim() || '&nbsp;'}</td>`;
      });
      table += '</tr>';
    }
  });

  return table + '</table>';
};

/**
 * 处理表格元素
 * 将 WJSTable 转换为 HTML 表格
 */
export const formatTable = (table: WJSTable): string => {
  let tableHtml = '<table class="doc-table" style="border-collapse: collapse; width: 100%;">';
  
  // 处理表格行
  if (table.r && Array.isArray(table.r)) {
    table.r.forEach((row: WJSTableRow) => {
      const rowStyles = [];
      
      // 处理行属性
      if (row.height) {
        rowStyles.push(`height: ${row.height}pt`);
      }
      if (row.header) {
        rowStyles.push('background-color: #f5f5f5');
        rowStyles.push('font-weight: bold');
      }
      
      tableHtml += rowStyles.length > 0 
        ? `<tr style="${rowStyles.join('; ')}">`
        : '<tr>';
      
      // 处理单元格
      if (row.c && Array.isArray(row.c)) {
        row.c.forEach((cell: WJSTableCell) => {
          const cellStyles = [];
          
          // 处理单元格属性
          if (cell.width) {
            cellStyles.push(`width: ${cell.width}pt`);
          }
          
          // 处理单元格合并
          if (cell.merge) {
            if (cell.merge.horizontal > 1) {
              cellStyles.push(`colspan: ${cell.merge.horizontal}`);
            }
            if (cell.merge.vertical > 1) {
              cellStyles.push(`rowspan: ${cell.merge.vertical}`);
            }
          }
          
          // 处理单元格边框
          if (cell.borders) {
            const { top, left, bottom, right } = cell.borders;
            if (top) cellStyles.push(`border-top: ${top.width}pt ${top.style} ${COLOR_MAP[top.color] || '#000000'}`);
            if (left) cellStyles.push(`border-left: ${left.width}pt ${left.style} ${COLOR_MAP[left.color] || '#000000'}`);
            if (bottom) cellStyles.push(`border-bottom: ${bottom.width}pt ${bottom.style} ${COLOR_MAP[bottom.color] || '#000000'}`);
            if (right) cellStyles.push(`border-right: ${right.width}pt ${right.style} ${COLOR_MAP[right.color] || '#000000'}`);
          }
          
          // 处理单元格背景色
          if (cell.shading && cell.shading.color) {
            cellStyles.push(`background-color: ${COLOR_MAP[cell.shading.color] || '#ffffff'}`);
          }
          
          // 处理单元格对齐方式
          if (cell.alignment) {
            cellStyles.push(`text-align: ${cell.alignment}`);
          }
          
          // 处理单元格垂直对齐
          if (cell.verticalAlignment) {
            cellStyles.push(`vertical-align: ${cell.verticalAlignment}`);
          }
          
          // 添加默认的单元格样式
          cellStyles.push('padding: 8px');
          cellStyles.push('border: 1px solid #ddd');
          
          tableHtml += cellStyles.length > 0 
            ? `<td style="${cellStyles.join('; ')}">`
            : '<td>';
          
          // 处理单元格内容（可能包含多个段落）
          if (cell.p && Array.isArray(cell.p)) {
            cell.p.forEach((cellPara: WJSPara) => {
              let cellContent = '';
              
              // 处理单元格段落中的每个元素
              if (cellPara.elts && Array.isArray(cellPara.elts)) {
                cellPara.elts.forEach((cellElt: any) => {
                  if (cellElt.t === 's') {
                    cellContent += applyFormatting(cellElt.v, cellElt.formatting || []);
                  }
                });
              }
              
              if (cellContent) {
                tableHtml += `<p style="margin: 0;">${cellContent}</p>`;
              }
            });
          }
          
          tableHtml += '</td>';
        });
      }
      
      tableHtml += '</tr>';
    });
  }
  
  tableHtml += '</table>';
  return tableHtml;
};

/**
 * 处理段落格式化
 * 将段落中的所有文本运行转换为 HTML
 */
export const formatParagraph = (para: WJSPara): string => {
    // 即使是空段落也要保留，因为可能用于排版
    if (!para) return '<p style="margin: 0;">&nbsp;</p>';

    // 获取段落样式
    const paraStyles = applyParagraphFormatting(para);
    let html = '';

    // 处理段落中的每个元素
    if (para.elts && para.elts.length > 0) {
        para.elts.forEach((elt: any) => {
            if (elt.t === 's') {
                // 文本运行，传入段落样式作为继承样式
                html += applyFormatting(elt.v, elt.formatting || [], paraStyles);
            } else if (elt.t === 't') {
                // 表格元素
                html += formatTable(elt);
            }
        });
    } else {
        // 空段落使用 &nbsp; 保持高度
        html = '&nbsp;';
    }

    // 应用段落样式
    return `<p style="${paraStyles}">${html}</p>`;
};

/**
 * 处理文本中的换行符和制表符
 */
export const processLineBreaks = (text: string): string => {
  // 按换行符分割文本
  const lines = text.split('\r');
  let result = '';

  for (const line of lines) {
    // 检查是否包含制表符
    if (line.includes('\x07')) {
      // 处理表格行
      result += parseTable(line);
    } else if (line.trim()) {
      // 处理普通段落
      result += `<p>${line}</p>`;
    }
  }

  return result;
};

/**
 * 将 Word 文档转换为 HTML
 * @param doc Word 文档对象
 * @param options 渲染选项
 * @returns HTML 字符串
 */
export const renderWordToHtml = (
  doc: WJSDoc, 
  options: {
    batchSize?: number;
    initialBatchSize?: number;
    onProgress?: (html: string, progress: number) => void;
  } = {}
): Promise<string> => {
  return new Promise((resolve) => {
    if (!doc || !doc.p || !doc.p.length) {
      resolve('');
      return;
    }

    const batchSize = options.batchSize || 50;
    const initialBatchSize = options.initialBatchSize || 100;
    const totalParagraphs = doc.p.length;
    
    // 先渲染初始批次
    const initialBatchCount = Math.min(initialBatchSize, totalParagraphs);
    const initialHtml = doc.p.slice(0, initialBatchCount).map(para => 
      formatParagraph(para)
    ).join('');
    
    if (options.onProgress) {
      options.onProgress(initialHtml, initialBatchCount / totalParagraphs);
    }
    
    // 如果文档很小，直接返回结果
    if (totalParagraphs <= initialBatchSize) {
      resolve(initialHtml);
      return;
    }
    
    // 分批处理剩余段落
    let html = initialHtml;
    let processedCount = initialBatchCount;
    
    const processNextBatch = () => {
      const batchEnd = Math.min(processedCount + batchSize, totalParagraphs);
      const batch = doc.p.slice(processedCount, batchEnd);
      const batchHtml = batch.map(para => 
        formatParagraph(para)
      ).join('');
      
      html += batchHtml;
      processedCount = batchEnd;
      
      if (options.onProgress) {
        options.onProgress(html, processedCount / totalParagraphs);
      }
      
      if (processedCount < totalParagraphs) {
        // 继续处理下一批
        setTimeout(processNextBatch, 0);
      } else {
        // 所有段落处理完成
        resolve(html);
      }
    };
    
    // 开始处理剩余段落
    setTimeout(processNextBatch, 0);
  });
}; 