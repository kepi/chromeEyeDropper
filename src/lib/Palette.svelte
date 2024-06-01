<script lang="ts">
  import Square from "./Square.svelte"
  import { colors } from "../store"
</script>

<div>
  Palette: default

  <div class="my-4 flex gap-2">
    {#each $colors as color (color)}
      <Square {color} />
    {/each}
  </div>
  <div class="text-xs italic">Hover over color squares for preview in New.</div>
  <div class="text-xs italic">Click to set New as Selected.</div>
</div>
