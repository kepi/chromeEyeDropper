<script lang="ts">
  import pStore from "../allPalettesStore"
  import PaletteDialog from "./PaletteDialog.svelte"
  import PaletteDelete from "./PaletteDelete.svelte"
  import PaletteLine from "./PaletteLine.svelte"

  export let toggle: boolean

  const dialogToggle = () => {
    toggle = !toggle
  }

  function isNumber(input: unknown): input is number {
    return !isNaN(Number(input))
  }

  let newPaletteName: string

  const newPalette = async () => {
    pStore.createPalette(newPaletteName)
    newPaletteName = ""
    dialogToggle()
  }

  const deletePaletteDialog = (event: MouseEvent) => {
    if (event.target === undefined) return

    showPaletteDelete = true
    paletteIdToDelete = Number((event.target as HTMLElement).getAttribute("data-paletteid"))
  }

  let showPaletteDelete = false
  let paletteIdToDelete: number = -1
</script>

{#if showPaletteDelete}
  <PaletteDelete bind:paletteId={paletteIdToDelete} bind:show={showPaletteDelete} />
{:else}
  <PaletteDialog bind:toggle>
    <h4>Switch to Palette:</h4>
    <ul>
      <li>
        <form>
          <input
            class="input input-sm"
            type="text"
            name="newPaletteName"
            bind:value={newPaletteName}
            placeholder="new palette"
          />
          <button type="submit" class="btn btn-sm btn-primary" on:click|preventDefault={newPalette}
            >create</button
          >
        </form>
      </li>
      {#each Object.keys($pStore).filter(isNumber) as id}
        <PaletteLine bind:toggle paletteId={Number(id)} deleteAction={deletePaletteDialog} />
      {/each}
    </ul>
  </PaletteDialog>
{/if}
