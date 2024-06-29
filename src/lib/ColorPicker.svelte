<script lang="ts">
  import ColorPicker from "./cpicker/ColorPick.svelte"
  import { newColor } from "../store"
  import { paletteSetColor } from "../palette"
  import { popupDialog } from "../store"

  const close = () => {
    $popupDialog = "palette"
  }

  const handleClick = () => {
    if ($newColor === null) return
    paletteSetColor($newColor, "cp")
  }
</script>

{#if $newColor !== null}
  <ColorPicker bind:color={$newColor} showLabels={true} />

  <button class="btn btn-primary" on:click={handleClick}>Add to palette</button>
  <button class="btn" on:click={close}>Close</button>
{/if}
