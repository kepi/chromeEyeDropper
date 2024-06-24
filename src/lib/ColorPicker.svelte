<script lang="ts">
  import PaletteDialog from "./PaletteDialog.svelte"
  import ColorPicker from "./cpicker/ColorPick.svelte"
  import { newColor } from "../store"
  import { paletteSetColor } from "../palette"

  export let toggle: boolean

  const dialogToggle = () => {
    toggle = !toggle
  }

  const handleClick = (event) => {
    paletteSetColor($newColor, "cp")
  }
</script>

<PaletteDialog bind:toggle>
  <ColorPicker bind:color={$newColor} showHex={false} showLabels={true} />

  <button class="btn btn-primary" on:click={handleClick}>Add to palette</button>
</PaletteDialog>
