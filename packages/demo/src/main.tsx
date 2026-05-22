import React, { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import FileViewer from '@flyfish-group/file-viewer-react'
import { mountViewerFrame, type ViewerFrameController } from '@flyfish-group/file-viewer-web'
import './styles.css'

const previewUrl = '/example/preview.md'

function WebViewerPanel() {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const controller: ViewerFrameController = mountViewerFrame(containerRef.current, {
      url: previewUrl
    })

    return () => {
      controller.destroy()
    }
  }, [])

  return <div ref={containerRef} className="viewer-host" data-testid="web-viewer-host" />
}

function App() {
  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <h1>Flyfish Viewer</h1>
          <p>Private adapter smoke test</p>
        </div>
        <a href="/file-viewer/index.html?url=%2Fexample%2Fpreview.md" target="_blank" rel="noreferrer">
          Open viewer
        </a>
      </header>

      <section className="viewer-grid" aria-label="Adapter preview">
        <article className="viewer-panel">
          <h2>React</h2>
          <div className="viewer-frame">
            <FileViewer url={previewUrl} data-testid="react-viewer" />
          </div>
        </article>

        <article className="viewer-panel">
          <h2>Web</h2>
          <div className="viewer-frame">
            <WebViewerPanel />
          </div>
        </article>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
