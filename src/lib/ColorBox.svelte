<script lang="ts">
  import { TinyColor } from "@ctrl/tinycolor"
  import ColorBoxValue from "./ColorBoxValue.svelte"

  export let color
  export let label

  $: tinyColor = new TinyColor(color ? color : "#75bb75")
  $: colorName = tinyColor.toName()

  $: hex = tinyColor.toHexString()
  $: hslString = tinyColor.toHslString()
  $: hsvString = tinyColor.toHsvString()
  $: rgbString = tinyColor.toRgbString()
</script>

<div class="mb-2 flex">
  <div class="text-xs w-4 [writing-mode:vertical-lr] text-center rotate-180 font-mono">
    {label}
  </div>
  <div
    class="shadow-lg flex w-36 flex-wrap gap-2 rounded p-2 text-xs"
    style="background-color: {hex}"
  >
    <ColorBoxValue value={hex} />

    {#if colorName}
      <ColorBoxValue value={colorName} />
    {/if}
    <ColorBoxValue value={rgbString} />
    <ColorBoxValue value={hslString} />
    <ColorBoxValue value={hsvString} />
  </div>
</div>
