<script setup lang='ts'>
import cfb from 'cfb'
import { onMounted, ref } from 'vue'
import { Buffer } from 'buffer'
import { parse_cfb, to_text } from './cfb'
import { clearAllCaches } from './cfb/formatting'
import { renderWordToHtml, processLineBreaks } from './render'

const props = defineProps<{
  data: ArrayBuffer,
}>()

const content = ref('')
const isLoading = ref(false)
const error = ref('')
const progress = ref(0)

/**
 * 加载文档
 */
const loadDocument = async () => {
  isLoading.value = true;
  error.value = '';
  content.value = '';
  progress.value = 0;
  
  try {
    console.time('解析文档');
    
    // 清除缓存，确保每次加载都是新的
    clearAllCaches();
    
    // 解析 CFB 容器
    const buffer = Buffer.from(props.data);
    const cfbData = cfb.read(buffer, { type: 'buffer' });
    
    // 解析 Word 文档
    const doc = parse_cfb(cfbData);
    console.timeEnd('解析文档');
    
    console.time('渲染文档');
    console.log(doc)
    
    // 使用 render.ts 中的函数渲染文档
    const html = await renderWordToHtml(doc, {
      batchSize: 50,
      initialBatchSize: 100,
      onProgress: (html, progressValue) => {
        content.value = html;
        progress.value = Math.round(progressValue * 100);
      }
    });
    
    content.value = html;
    console.timeEnd('渲染文档');
  } catch (e) {
    console.error('加载文档时出错:', e);
    error.value = `加载文档时出错: ${e instanceof Error ? e.message : String(e)}`;
    
    // 尝试使用纯文本模式作为备用
    try {
      const buffer = Buffer.from(props.data);
      const cfbData = cfb.read(buffer, { type: 'buffer' });
      const text = to_text(cfbData as any);
      if (text) {
        content.value = processLineBreaks(text);
        error.value += '（已切换到纯文本模式）';
      }
    } catch (textError) {
      console.error('纯文本模式也失败:', textError);
    }
  } finally {
    isLoading.value = false;
    progress.value = 100;
  }
}

onMounted(() => {
  loadDocument();
})
</script>

<template>
  <div class="word-viewer">
    <div v-if="isLoading" class="loading">
      <div class="loading-text">正在加载文档，请稍候...</div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
      </div>
    </div>
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    <div v-else class="document-content" v-html="content"></div>
  </div>
</template>

<style lang="scss">
@use "sass:color";

// 变量定义
$font-family: "Calibri", "Microsoft YaHei", Arial, sans-serif;
$base-font-size: 12pt;
$base-line-height: 1.8;
$primary-color: #333;
$border-color: #ddd;
$shadow-color: rgba(0, 0, 0, 0.1);
$background-color: white;
$hover-color: #f8f8f8;
$header-color: #e6e6e6;
$progress-color: #1890ff;

// 混入
@mixin box-shadow($opacity: 0.1) {
  box-shadow: 0 2px 4px rgba(0, 0, 0, $opacity);
}

@mixin border($width: 1px, $style: solid, $color: $border-color) {
  border: $width $style $color;
}

// 文档查看器样式
.word-viewer {
  width: 100%;
  height: 100%;
  overflow: auto;
  padding: 20px;
  box-sizing: border-box;
}

.document-content {
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
  white-space: pre-wrap;
  word-wrap: break-word;

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

.loading, .error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 16px;
  color: #666;
}

.loading-text {
  margin-bottom: 10px;
}

.progress-bar {
  width: 300px;
  height: 6px;
  background-color: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: $progress-color;
  transition: width 0.3s ease;
}

.error {
  color: #ff4d4f;
}
</style>
