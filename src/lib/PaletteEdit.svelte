<script lang="ts">
  import { SortableList } from "@sonderbase/svelte-sortablejs"
  import pStore from "../allPalettesStore"
  import Square from "./Square.svelte"

  const onEnd = (event: SortableEvent) => {
    const fromTrash = event.from.classList.contains("trash-area")
    const toTrash = event.to.classList.contains("trash-area")

    if ($pStore.active && event.oldIndex !== undefined && event.newIndex !== undefined) {
      pStore.manualSort($pStore.active, fromTrash, toTrash, event.oldIndex, event.newIndex)
    }
  }

  $: unsorted = $pStore.active?.unsorted ?? []
  $: deleted = $pStore.active?.deleted ?? []
</script>

<h4>Edit your palette</h4>
<div class="bg-white p-2 pt-4">
  <div class="colors-area flex justify-between gap-4">
    <SortableList
      class="flex flex-wrap gap-2"
      group="colors"
      dataIdAttr="data-color"
      animation={150}
      {onEnd}
    >
      {#each unsorted as color (color)}
        <Square color={color.h} passive />
      {/each}
    </SortableList>
    <SortableList
      class="trash-area p-0 border-4 border-dotted rounded w-20 min-w-20 h-auto min-h-24 items-center content-start justify-left flex flex-wrap bg-[url('/icon/trash.svg')] bg-no-repeat bg-center bg-blend-soft-light bg-slate-100"
      group="colors"
      {onEnd}
    >
      {#each deleted as color (color)}
        <Square color={color.h} passive small />
      {/each}
    </SortableList>
  </div>
</div>
<div class="text-xs mt-4">
  <p>
    You can manually sort your palette. Just <b>drag</b> a color to position you want it at. Or
    <b>drop</b>
    it to
    <i>trash bin</i> area to mark it as deleted.
  </p>
</div>
