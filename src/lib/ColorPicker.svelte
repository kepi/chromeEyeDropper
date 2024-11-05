<script lang="ts">
  import ColorPick from "~/lib/cpicker/ColorPick.svelte"
  import { newColor } from "~/store"
  import { paletteSetColor } from "~/palette"
  import { popupDialog } from "~/store"

  const close = () => {
    $popupDialog = "palette"
  }

  const handleClick = () => {
    if (!$newColor) return
    paletteSetColor($newColor, "cp")
  }
</script>

{#if $newColor !== null}
  <ColorPick bind:color={$newColor} />

  <div class="mt-4 flex gap-2">
    <button class="btn btn-sm btn-secondary" onclick={handleClick}>Add to palette</button>
    <button class="btn btn-sm" onclick={close}>Close</button>
  </div>
{/if}
