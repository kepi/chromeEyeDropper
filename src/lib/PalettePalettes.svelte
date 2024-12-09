<script lang="ts">
  import { arrayMoveItem, visibleTabNames } from "~/popupHelpers"
  import { paletteSetWeight } from "~/palette"
  import { SortableList } from "@sonderbase/svelte-sortablejs"
  import pStore from "~/allPalettesStore"
  import PaletteDelete from "~/lib/PaletteDelete.svelte"
  import PaletteLine from "~/lib/PaletteLine.svelte"
  import { popupDialog } from "~/store"

  let newPaletteName = $state("")

  const onEnd = (event: SortableEvent) => {
    if (event.oldIndex !== undefined && event.newIndex !== undefined) {
      const newIds = arrayMoveItem(ids, event.oldIndex, event.newIndex)

      newIds.forEach((id, idx) => {
        paletteSetWeight(id, idx + 1)
      })
    }
  }

  let ids = $derived(
    Object.keys($pStore)
      .filter((key) => /^[0-9]+$/.test(key))
      .map((key) => $pStore[Number(key)])
      .sort((a, b) => a.weight - b.weight)
      .map((meta) => meta.id),
  )

  const newPalette = async (event: Event) => {
    event.preventDefault()
    pStore.createPalette(newPaletteName)
    newPaletteName = ""
    $popupDialog = "palette"
  }

  const deletePaletteDialog = (event: MouseEvent) => {
    if (event.target === undefined) return

    console.log(event.target)
    showPaletteDelete = true
    paletteIdToDelete = Number((event.target as HTMLElement).getAttribute("data-paletteid"))
  }

  let showPaletteDelete = $state(false)
  let paletteIdToDelete: number = $state(-1)
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
        <button type="submit" class="btn btn-sm btn-secondary" onclick={newPalette}>create</button>
      </li>
    </form>
    <!-- TODO move to store somehow so it autoupdates -->
    <SortableList group="palettes" dataIdAttr="data-paletteid" class="" {onEnd}>
      {#each ids as id (id)}
        <PaletteLine paletteId={Number(id)} deleteAction={deletePaletteDialog} />
      {/each}
    </SortableList>
  </ul>
{/if}
