<script setup lang='ts'>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import $ from 'jquery'
import { DefaultOptions } from './options.js'
import './styles/pptxjs.css'
import { displayChart } from './support/chart'
import PptxWorker from './worker'

const props = withDefaults(defineProps<{
  // 二进制数据
  data: ArrayBuffer,
  // 默认配置，支持扩展
  options?: Function,
}>(), {
  options: DefaultOptions
})

const wrapper = ref<null | HTMLDivElement>(null);

// 使用闭包避免暴露
(() => {
  const data = {
    isDone: false as boolean,
    thumbElement: null as null | HTMLImageElement,
    worker: null as null | Worker,
    timer: null as null | number,
    resizeObserver: null as null | ResizeObserver,
    resizeFrame: 0
  }

  const methods = {
    // 启动worker逻辑
    startWorker(): void {
      // 真实的web worker - 使用该方式，我们必须通过blob的方式进行通信
      if (data.worker) data.worker.terminate()
      if (data.timer) clearInterval(data.timer)
      const worker = data.worker = PptxWorker.create()
      worker.addEventListener('message', event => {
        this.processMessage(event.data)
      }, false)
      worker.addEventListener('error', ev => {
        console.error(ev)
      }, false)
      // 通知worker开始工作
      worker.postMessage({
        type: 'processPPTX',
        data: props.data,
        IE11: 'MSInputMethodContext' in window && 'documentMode' in document,
        options: props.options()
      })
      // 定时检测执行情况，发现完成则及时关闭
      data.timer = window.setInterval(this.stopWorker, 500) as unknown as number
    },
    // 停止worker逻辑
    stopWorker(): void {
      if (data.isDone) {
        data.worker?.terminate()
        console.log('worker terminated')
        if (data.timer) clearInterval(data.timer)
      }
    },
    // 窗口拖动大小，自动调整位置
    scheduleResize() {
      window.cancelAnimationFrame(data.resizeFrame)
      data.resizeFrame = window.requestAnimationFrame(() => {
        this.resize()
      })
    },
    resize() {
      if (wrapper.value) {
        const $wrapper = $(wrapper.value)
        const slidesWidth = Math.max(...Array.from($wrapper.children('.slide, section')).map(s => s.offsetWidth), 0)
        const wrapperWidth = $wrapper[0].offsetWidth
        if (!slidesWidth || !wrapperWidth) {
          return
        }
        $wrapper.css({
          'transform': `scale(${Math.min(1, wrapperWidth / slidesWidth)})`,
          'transform-origin': 'top left'
        })
      }
    },
    // 核心处理逻辑
    processMessage(msg: any) {
      if (data.isDone || !wrapper.value) return
      const $wrapper = $(wrapper.value)
      const { thumbElement } = data
      switch (msg.type) {
        case 'slide':
          console.log('正在处理:', msg.slide_num)
          $wrapper.append(msg.data)
          nextTick(() => {
            this.scheduleResize()
          })
          break
        case 'pptx-thumb':
          if (thumbElement) $(thumbElement).attr('src', `data:image/jpeg;base64,${msg.data}`)
          break
        case 'slideSize':
          break
        case 'globalCSS':
          $wrapper.append(`<style>${msg.data}</style>`)
          break
        case 'ExecutionTime':
        case 'Done':
          console.log('pptx渲染完成，耗时', msg.data)
          displayChart(msg.charts)
          data.isDone = true
          nextTick(() => {
            this.scheduleResize()
          })
          break
        case 'WARN':
          console.warn('PPTX processing warning: ', msg.data)
          break
        case 'ERROR':
          data.isDone = true
          console.error('PPTX processing error: ', msg.data)
          break
        case 'DEBUG':
          console.debug('Worker: ', msg.data)
          break
        case 'INFO':
        default:
          console.info('Worker: ', msg.data)
      }
    }
  }

  onMounted(() => {
    methods.startWorker()
    if (wrapper.value) {
      data.resizeObserver = new ResizeObserver(() => {
        methods.scheduleResize()
      })
      data.resizeObserver.observe(wrapper.value)
      if (wrapper.value.parentElement) {
        data.resizeObserver.observe(wrapper.value.parentElement)
      }
    }
  })

  onBeforeUnmount(() => {
    data.worker?.terminate()
    if (data.timer) clearInterval(data.timer)
    window.cancelAnimationFrame(data.resizeFrame)
    data.resizeObserver?.disconnect()
  })
})()
</script>

<template>
  <div class='pptx-wrapper' ref='wrapper' />
</template>

<style scoped>
.pptx-wrapper {
    max-width: 100%;
    margin: 0 auto;
    min-width: 0;
}
</style>
