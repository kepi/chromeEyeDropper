<script lang="ts">
  import { TinyColor } from "@ctrl/tinycolor"
  import ColorBoxValue from "./ColorBoxValue.svelte"

  export let label
  export let store

  let color

  store.subscribe((value) => {
    color = value
  })

  $: tinyColor = new TinyColor(color)
  $: colorName = tinyColor.toName()

  // short hex - render only if exact match
  $: hex = tinyColor.toHexString()
  $: hslString = tinyColor.toHslString()
  $: hsvString = tinyColor.toHsvString()
  $: rgbString = tinyColor.toRgbString()
</script>

<div class="relative mb-2 shadow-lg">
  <div class="absolute bottom-2 left-0 origin-bottom-left -rotate-90 transform text-xs">
    {label}
  </div>
  <div class="flex w-36 flex-wrap gap-2 rounded p-2 text-xs" style="background-color: {hex}">
    <ColorBoxValue value={hex} />

    {#if colorName}
      <ColorBoxValue value={colorName} />
    {/if}
    <ColorBoxValue value={rgbString} />
    <ColorBoxValue value={hslString} />
    <ColorBoxValue value={hsvString} />
  </div>
</div>
