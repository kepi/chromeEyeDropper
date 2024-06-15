<script lang="ts">
  import Square from "./Square.svelte"
  import { paletteColors, paletteId } from "../store"
  import { paletteWipe } from "../palette"
  import storage from "../storage"
  import syncedWritable from "../syncedWritable"

  let last = true

  const wipeClean = (_event) => {
    console.log("wiping")
    last = last ? false : true
    paletteWipe($paletteId, last)
  }
</script>

<div>
  Palette: default (palettes | sort | edit | export | <a on:click={wipeClean}>wipe</a>)

  <div class="my-4 flex flex-wrap gap-2 max-w-72">
    {#each $paletteColors as color (color)}
      <Square color={color.h} />
    {/each}
  </div>
  <div class="text-xs">
    <b>Hover</b> over color squares for preview in <span class="font-mono">New</span>.
  </div>
  <div class="text-xs">
    <b>Click</b> to set <span class="font-mono">New</span> as
    <span class="font-mono">Selected</span>.
  </div>
</div>
