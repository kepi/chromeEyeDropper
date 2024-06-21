<script lang="ts">
  import { SortableList } from "@sonderbase/svelte-sortablejs"

  import pStore from "../allPalettesStore"
  import Square from "./Square.svelte"

  export let toggle: boolean

  let dragging = false

  const dialogToggle = () => {
    toggle = !toggle
  }

  const onEnd = (event) => {
    const fromTrash = event.from.classList.contains("trash-area")
    const toTrash = event.to.classList.contains("trash-area")

    pStore.manualSort($pStore.active, fromTrash, toTrash, event.oldIndex, event.newIndex)
  }
</script>

<div class="bg-slate-200 pt-8 rounded prose prose-sm relative border p-1">
  <div class="bg-white p-2 pt-4">
    <div class="colors-area flex justify-between gap-4">
      <SortableList
        class="flex flex-wrap gap-2"
        group="colors"
        dataIdAttr="data-color"
        animation={150}
        {onEnd}
      >
        {#each $pStore.active.unsorted as color (color)}
          <Square color={color.h} passive />
        {/each}
      </SortableList>
      <SortableList
        class="trash-area p-0 border-4 border-dotted rounded w-20 min-w-20 h-auto min-h-24 items-center content-start justify-left flex flex-wrap bg-[url('/icon/trash.svg')] bg-no-repeat bg-center bg-blend-soft-light bg-slate-100"
        group="colors"
        {onEnd}
      >
        {#each $pStore.active.deleted as color (color)}
          <Square color={color.h} passive small />
        {/each}
      </SortableList>
    </div>

    <div class="text-xs mt-4">
      <p>
        You can manually sort your palette. Just <b>drag</b> a color to position you want it at. Or
        <b>drop</b>
        it to
        <i>trash bin</i> area to mark it as deleted.
      </p>
    </div>
  </div>
  <div
    class="absolute right-0 top-0 w-8 h-8 hover:text-red-500 items-center justify-center flex cursor-pointer"
    on:click={dialogToggle}
  >
    ✖
  </div>
</div>
