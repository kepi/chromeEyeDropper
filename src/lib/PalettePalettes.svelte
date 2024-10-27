<script lang="ts">
  import pStore from "~/allPalettesStore"
  import PaletteDelete from "~/lib/PaletteDelete.svelte"
  import PaletteLine from "~/lib/PaletteLine.svelte"
  import { popupDialog } from "~/store"

  function isNumber(input: unknown): input is number {
    return !isNaN(Number(input))
  }

  let newPaletteName: string

  const newPalette = async () => {
    pStore.createPalette(newPaletteName)
    newPaletteName = ""
    $popupDialog = "palette"
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
  <h4 class="mb-4">Switch to Palette:</h4>
  <ul class="not-prose ml-2">
    <form>
      <li class="flex items-center gap-2 px-2 py-1 mt-1 rounded hover:bg-slate-300">
        <div class="w-6 text-right font-mono">#?:</div>
        <input
          class="input input-sm"
          type="text"
          name="newPaletteName"
          bind:value={newPaletteName}
          placeholder="name of new palette"
        />
        <button type="submit" class="btn btn-sm btn-secondary" on:click|preventDefault={newPalette}
          >create</button
        >
      </li>
    </form>
    {#each Object.keys($pStore).filter(isNumber) as id}
      <PaletteLine paletteId={Number(id)} deleteAction={deletePaletteDialog} />
    {/each}
  </ul>
{/if}
