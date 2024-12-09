<script lang="ts">
  import { TinyColor } from "@ctrl/tinycolor"
  import ColorBoxValue from "./ColorBoxValue.svelte"

  type Props = {
    color?: string
    label: string
  }
  let { color, label }: Props = $props()

  let tinyColor = $derived(new TinyColor(color ?? "#75bb75"))
  let colorName = $derived(tinyColor.toName())

  let hex = $derived(tinyColor.toHexString())
  let hslString = $derived(tinyColor.toHslString())
  let hsvString = $derived(tinyColor.toHsvString())
  let rgbString = $derived(tinyColor.toRgbString())
</script>

<div class="mb-2 flex w-[9.2rem] flex-row-reverse">
  <div
    class="shadow-lg flex w-32 flex-wrap gap-2 rounded p-2 text-xs"
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
  <div class="text-xs w-4 [writing-mode:vertical-lr] text-center rotate-180 font-mono">
    {label}
  </div>
</div>
