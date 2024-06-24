<script lang="ts">
  import pStore from "../allPalettesStore"
  import PaletteDialog from "./PaletteDialog.svelte"

  export let paletteId: number
  export let show: boolean

  function reallyDeletePalette(id: number) {
    // we have to use pStore function as we need to remove it first from store,
    // than from synced store
    pStore.destroyPalette(id)

    // reset id and close dialog
    paletteId = -1
    show = false
  }
</script>

<PaletteDialog bind:toggle={show}>
  {#if paletteId > -1}
    <h4>Really delete palette {$pStore[paletteId].name}?</h4>
    <button on:click={() => reallyDeletePalette(paletteId)}>YES</button>
  {/if}
</PaletteDialog>
