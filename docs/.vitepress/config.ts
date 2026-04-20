import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: 'Flyfish Viewer',
  description: '一款纯前端 Serverless 的全能文档预览器（Vue3 + TypeScript + Vite）',
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    logo: '/_media/logo.svg',
    nav: [
      { text: '项目主页', link: 'https://viewer.flyfish.dev' },
      { text: '快速开始', link: '/guide/quickstart' },
      { text: '工作室主页', link: 'https://flyfish.dev' },
      { text: '联系我们', link: 'https://contact.flyfish.dev' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: '入门',
          items: [
            { text: '概述', link: '/guide/overview' },
            { text: '快速开始', link: '/guide/quickstart' }
          ]
        },
        {
          text: '集成',
          items: [
            { text: 'Vue3 集成', link: '/guide/quickstart-vue3' },
            { text: 'Vue2（历史版本）', link: '/guide/quickstart-vue2' },
            { text: 'Iframe 嵌入（推荐）', link: '/guide/iframe' }
          ]
        },
        {
          text: '使用',
          items: [
            { text: '组件用法（url / file）', link: '/guide/usage' },
            { text: '支持格式', link: '/guide/formats' },
            { text: '常见问题', link: '/guide/faq' }
          ]
        },
        {
          text: '其他',
          items: [
            { text: '更新日志', link: '/changelog' },
            { text: '捐赠支持', link: '/donate' }
          ]
        }
      ]
    },
    outline: { level: [2, 3] },
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索',
                buttonAriaLabel: '搜索'
              },
              modal: {
                displayDetails: '显示详情',
                resetButtonTitle: '清空搜索',
                backButtonTitle: '返回',
                noResultsText: '没有结果',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭'
                }
              }
            }
          }
        }
      }
    },
    socialLinks: [
      {
        icon: {
          svg: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z"></path></svg>'
        },
        link: 'https://git.flyfish.dev/flyfish-group/file-viewer'
      }
    ]
  }
})
