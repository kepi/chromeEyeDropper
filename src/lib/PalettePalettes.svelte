<script lang="ts">
  import { arrayMoveItem, visibleTabNames } from "~/popupHelpers"
  import { paletteSetWeight } from "~/palette"
  import { SortableList } from "@sonderbase/svelte-sortablejs"
  import pStore from "~/allPalettesStore"
  import PaletteDelete from "~/lib/PaletteDelete.svelte"
  import PaletteLine from "~/lib/PaletteLine.svelte"
  import { popupDialog } from "~/store"
  import PaletteRename from "./PaletteRename.svelte"

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

  const renamePaletteDialog = (event: MouseEvent) => {
    if (event.target === undefined) return

    console.log(event.target)
    showPaletteRename = true
    paletteIdForAction = Number((event.target as HTMLElement).getAttribute("data-paletteid"))
  }

  const deletePaletteDialog = (event: MouseEvent) => {
    if (event.target === undefined) return

    console.log(event.target)
    showPaletteDelete = true
    paletteIdForAction = Number((event.target as HTMLElement).getAttribute("data-paletteid"))
  }

  let showPaletteDelete = $state(false)
  let showPaletteRename = $state(false)
  let paletteIdForAction: number = $state(-1)
</script>

{#if showPaletteDelete}
  <PaletteDelete bind:paletteId={paletteIdForAction} bind:show={showPaletteDelete} />
{:else if showPaletteRename}
  <PaletteRename bind:paletteId={paletteIdForAction} bind:show={showPaletteRename} />
{:else}
  <h4 class="mb-4">Switch to Palette:</h4>
  <div class="not-prose">
    <form class="">
      <div
        class="flex group gap-2 py-1 rounded hover:bg-slate-300 items-center bg-white border-b border-dashed"
      >
        <div class="shrink invisible w-4 h-4">&nbsp;</div>
        <div class="w-7 text-right font-mono">#?:</div>
        <input
          class="input input-sm w-48"
          type="text"
          name="newPaletteName"
          bind:value={newPaletteName}
          placeholder="name of new palette"
        />
        <button type="submit" class="btn btn-sm btn-secondary" onclick={newPalette}>create</button>
      </div>
    </form>

    <SortableList
      group="palettes"
      dataIdAttr="data-paletteid"
      class="divide-y divide-dashed"
      {onEnd}
    >
      {#each ids as id (id)}
        <PaletteLine
          paletteId={Number(id)}
          deleteAction={deletePaletteDialog}
          renameAction={renamePaletteDialog}
        />
      {/each}
    </SortableList>
  </div>
{/if}
