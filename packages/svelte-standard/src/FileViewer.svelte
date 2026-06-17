<script>
  import { createEventDispatcher, onDestroy, onMount } from 'svelte'
  import { createViewerMountedFrameHandle, mountViewerFrame, toViewerFrameOptions } from '@file-viewer/web'

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

  $: frameOptions = toViewerFrameOptions({
    viewerUrl,
    url,
    file,
    name,
    from,
    targetOrigin,
    params,
    cacheKey,
    options,
    onViewerEvent,
    iframeClassName,
    iframeStyle,
    iframeTitle
  }, {
    onEvent(payload, event) {
      dispatch('viewerEvent', { payload, event })
    }
  })

  const dispose = () => {
    controller?.destroy()
    controller = null
  }

  const handle = createViewerMountedFrameHandle(() => controller, dispose)

  onMount(() => {
    controller = mountViewerFrame(container, frameOptions)
    return dispose
  })

  onDestroy(dispose)

  $: if (controller) {
    controller.update(frameOptions)
  }

  export function getController() {
    return handle.getController()
  }

  export function getIframe() {
    return handle.getIframe()
  }

  export function update(nextOptions) {
    return handle.update(nextOptions)
  }

  export function postFile() {
    return handle.postFile()
  }

  export function reload() {
    handle.reload()
  }

  export function destroy() {
    handle.destroy()
  }
</script>

<div
  bind:this={container}
  class={className}
  style={`width: 100%; height: 100%; min-height: 0; ${containerStyle}`}
/>
