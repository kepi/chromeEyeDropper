<script lang="ts">
  import Square from "./Square.svelte"
  import { colors } from "../store"
</script>

<div>
  Palette: default

  <div class="my-4 flex flex-wrap gap-2 max-w-72">
    {#each $colors as color (color)}
      <Square {color} />
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
