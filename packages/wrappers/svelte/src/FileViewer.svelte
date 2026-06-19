<script>
  import { createEventDispatcher, onDestroy, onMount } from 'svelte'
  import { createViewerControllerHandle, mountViewer as mountCoreViewer } from './controller.js'
  import { fileViewerCoreRendererRegistry } from '@file-viewer/core'

  export let url = undefined
  export let file = undefined
  export let buffer = undefined
  export let name = undefined
  export let filename = undefined
  export let type = undefined
  export let size = undefined
  export let options = undefined
  export let onEvent = undefined
  export let className = ''
  export let containerStyle = ''

  const dispatch = createEventDispatcher()
  let container
  let controller = null
  const viewerCoreOptions = {
    registry: fileViewerCoreRendererRegistry
  }

  $: viewerOptions = {
    url,
    file,
    buffer,
    name,
    filename,
    type,
    size,
    options,
    onEvent(event) {
      onEvent?.(event)
      dispatch('viewerEvent', event)
    }
  }

  const dispose = () => {
    controller?.destroy()
    controller = null
  }

  const handle = createViewerControllerHandle(() => controller, dispose)

  onMount(() => {
    controller = mountCoreViewer(container, viewerOptions, viewerCoreOptions)
    return dispose
  })

  onDestroy(dispose)

  $: if (controller) {
    controller.update(viewerOptions)
  }

  export function getController() {
    return handle.getController()
  }

  export function getApi() {
    return handle.getApi()
  }

  export function load(nextOptions) {
    return handle.load(nextOptions)
  }

  export function update(nextOptions) {
    return handle.update(nextOptions)
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
