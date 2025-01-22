<script setup lang='ts'>
import cfb from 'cfb'
import { onMounted, ref } from 'vue'
import { Buffer } from 'buffer'
import { parse_cfb, to_text } from './cfb'

const props = defineProps<{
  data: ArrayBuffer,
}>()


const content = ref('')

/**
 * 解析表格行，处理连续制表符作为行分隔符
 */
const parseTable = (line: string): string => {
    let table = '<table class="doc-table">';
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
                table += `<td>${cell.trim() || '&nbsp;'}</td>`;
            });
            table += '</tr>';
        }
    });

    return table + '</table>';
};

/**
 * 处理文本中的换行符和制表符
 */
const processLineBreaks = (text: string): string => {
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

const loadDocument = async () => {
  try {
    const buffer = Buffer.from(props.data)
    const file = cfb.read(buffer, { type: 'buffer' })
    const doc = parse_cfb(file)
    content.value = processLineBreaks('\ufeff' + to_text(doc))
    console.log(content.value)
  } catch (error) {
    console.error('加载文档时出错:', error)
  }
}


onMounted(() => {
  if (props.data) {
    loadDocument()
  }
})
</script>

<template>
  <div class="doc-viewer">
    <div class="doc-content" v-if="content" v-html="content" />
    <div class="error-message" v-else>
      暂无内容
    </div>
  </div>
</template>

<style lang="scss">
@use "sass:color";

// 变量定义
$font-family: "Calibri", "Microsoft YaHei", Arial, sans-serif;
$base-font-size: 12pt;
$base-line-height: 1.5;
$primary-color: #333;
$border-color: #ddd;
$shadow-color: rgba(0, 0, 0, 0.1);
$background-color: white;
$hover-color: #f8f8f8;
$header-color: #e6e6e6;

// 混入
@mixin box-shadow($opacity: 0.1) {
  box-shadow: 0 2px 4px rgba(0, 0, 0, $opacity);
}

@mixin border($width: 1px, $style: solid, $color: $border-color) {
  border: $width $style $color;
}

// 文档查看器样式
.doc-viewer {
  width: 100%;
  height: 100%;
  overflow: auto;
  padding: 20px;
}

.doc-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: $font-family;
  font-size: $base-font-size;
  line-height: $base-line-height;
  padding: 72pt 90pt;
  width: 595.3pt;
  min-height: 841.9pt;
  margin: 30px auto;
  background-color: $background-color;
  @include box-shadow;
  @include border;
  text-indent: 2em;
  text-align: justify;
  letter-spacing: 0.05em;

  // 段落样式
  p {
    margin: 5px 0;
    padding: 0;
  }

  // 表格样式
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
    text-indent: 0;
    table-layout: fixed;
    @include border(2px);
    @include box-shadow(0.05);

    // 单元格样式
    td {
      @include border;
      padding: 12px;
      text-align: left;
      word-break: break-word;
      vertical-align: top;
      min-width: 100px;
      background-color: $background-color;
      line-height: 1.4;
      color: $primary-color;
    }

    // 行样式
    tr {
      @include border(1px, solid, $border-color);
      border-width: 0 0 1px 0;

      &:first-child {
        background-color: $header-color;
        font-weight: 600;
        td {
          background-color: $header-color;
          color: color.adjust($primary-color, $lightness: -10%);
        }
      }

      &:nth-child(even) {
        background-color: rgba($header-color, 0.3);
      }

      &:hover {
        background-color: $hover-color;
      }

      &:last-child {
        border-bottom: none;
      }
    }
  }
}

.error-message {
  text-align: center;
  color: color.adjust($primary-color, $lightness: 20%);
  padding: 20px;
}
</style>
