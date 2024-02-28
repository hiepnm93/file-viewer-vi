/**
 * 渲染mp4
 */
export default function(buffer: ArrayBuffer, target: HTMLDivElement) {
  const mp4 = document.createElement('video')
  mp4.width = 840
  mp4.height = 480
  mp4.controls = true
  Object.assign(mp4.style, {
    margin: '40px auto',
    display: 'block'
  })
  const source = document.createElement('source')
  source.src = URL.createObjectURL(new Blob([buffer]))
  mp4.appendChild(source)
  target.appendChild(mp4)
}
