<script>
  import { createEventDispatcher, onDestroy, onMount } from 'svelte'
  import { mountViewerFrame } from '@file-viewer/web'

  export let viewerUrl = undefined
  export let url = undefined
  export let file = undefined
  export let name = undefined
  export let from = undefined
  export let targetOrigin = undefined
  export let params = undefined
  export let cacheKey = undefined
  export let options = undefined
  export let onViewerEvent = undefined
  export let className = ''
  export let containerStyle = ''
  export let iframeClassName = undefined
  export let iframeStyle = undefined
  export let iframeTitle = undefined

  const dispatch = createEventDispatcher()
  let container
  let controller = null

  $: frameOptions = {
    viewerUrl,
    url,
    file,
    name,
    from,
    targetOrigin,
    params,
    cacheKey,
    options,
    className: iframeClassName,
    style: iframeStyle,
    title: iframeTitle,
    onEvent(payload, event) {
      if (onViewerEvent) {
        onViewerEvent(payload, event)
      }
      dispatch('viewerEvent', { payload, event })
    }
  }

  const dispose = () => {
    controller?.destroy()
    controller = null
  }

  onMount(() => {
    controller = mountViewerFrame(container, frameOptions)
    return dispose
  })

  onDestroy(dispose)

  $: if (controller) {
    controller.update(frameOptions)
  }

  export function getController() {
    return controller
  }

  export function getIframe() {
    return controller?.frame ?? null
  }

  export function update(nextOptions) {
    return controller?.update(nextOptions) ?? ''
  }

  export function postFile() {
    return controller?.postFile() ?? false
  }

  export function reload() {
    controller?.reload()
  }

  export function destroy() {
    dispose()
  }
</script>

<div
  bind:this={container}
  class={className}
  style={`width: 100%; height: 100%; min-height: 0; ${containerStyle}`}
/>
