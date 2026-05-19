// 异步模块加载
import type { Options, renderAsync } from 'docx-preview'
import type { AppWrapper } from '@/package/common/type'

const loadLibrary = (() => {
  const loader = {
    module: null as null | Promise<{defaultOptions: Options, renderAsync: typeof renderAsync}>,
    async load() {
      if (!this.module) {
        this.module = import('docx-preview');
      }
      return this.module;
    }
  }
  return async () => {
    return await loader.load();
  }
})()

const DOCX_RESPONSIVE_CSS = `
.docx-fit-viewer {
  box-sizing: border-box;
  height: 100%;
  overflow: auto;
  background: #ececec;
}
.docx-fit-viewer .docx-wrapper {
  box-sizing: border-box;
  min-width: 0 !important;
  width: 100% !important;
  padding: 24px 14px 40px !important;
  background: transparent !important;
}
.docx-fit-viewer .docx-page-frame {
  position: relative;
  width: 100%;
  min-width: 0;
  margin: 0 auto 24px;
  overflow: visible;
}
.docx-fit-viewer .docx-page-frame > section.docx {
  position: absolute;
  top: 0;
  left: 50%;
  margin: 0 !important;
  transform-origin: top center;
}
`

function installResponsiveStyle(target: HTMLDivElement) {
  const style = document.createElement('style')
  style.textContent = DOCX_RESPONSIVE_CSS
  target.prepend(style)
  return style
}

function wrapDocxPages(target: HTMLDivElement) {
  const wrapper = target.querySelector('.docx-wrapper')
  if (!wrapper) {
    return []
  }

  return Array.from(wrapper.children).flatMap(child => {
    if (!(child instanceof HTMLElement) || !child.matches('section.docx')) {
      return []
    }

    const frame = document.createElement('div')
    frame.className = 'docx-page-frame'
    child.before(frame)
    frame.appendChild(child)
    return [frame]
  })
}

function makeDocxResponsive(target: HTMLDivElement) {
  target.classList.add('docx-fit-viewer')
  const style = installResponsiveStyle(target)
  const frames = wrapDocxPages(target)
  let resizeFrame = 0

  const resize = () => {
    window.cancelAnimationFrame(resizeFrame)
    resizeFrame = window.requestAnimationFrame(() => {
      frames.forEach(frame => {
        const page = frame.firstElementChild
        if (!(page instanceof HTMLElement)) {
          return
        }

        page.style.transform = 'translateX(-50%)'

        const pageWidth = page.offsetWidth
        const pageHeight = page.offsetHeight
        if (!pageWidth || !pageHeight) {
          return
        }
        const availableWidth = Math.max(frame.clientWidth - 8, 120)
        const scale = Math.min(1, Math.max(0.24, availableWidth / pageWidth))

        page.style.transform = `translateX(-50%) scale(${scale})`
        frame.style.height = `${Math.ceil(pageHeight * scale)}px`
      })
    })
  }

  const observer = new ResizeObserver(resize)
  observer.observe(target)
  frames.forEach(frame => observer.observe(frame))
  resize()

  return () => {
    window.cancelAnimationFrame(resizeFrame)
    observer.disconnect()
    style.remove()
    target.classList.remove('docx-fit-viewer')
  }
}

/**
 * 渲染docx文件
 */
export default async function(buffer: ArrayBuffer, target: HTMLDivElement): Promise<AppWrapper> {
  const { defaultOptions, renderAsync } = await loadLibrary()
  const docxOptions = Object.assign(defaultOptions, {
    debug: true,
    experimental: true
  })
  await renderAsync(buffer, target, undefined, docxOptions)
  const disposeResponsive = makeDocxResponsive(target)

  return {
    $el: target,
    unmount() {
      disposeResponsive()
      target.innerHTML = ''
    }
  }
}
