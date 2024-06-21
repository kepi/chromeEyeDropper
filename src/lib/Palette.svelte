<script lang="ts">
  import { derived } from "svelte/store"
  import paletteStore from "../paletteStore"
  import pStore from "../allPalettesStore"
  import PaletteDialog from "./PaletteDialog.svelte"
  import PaletteDelete from "./PaletteDelete.svelte"
  import PaletteWipe from "./PaletteWipe.svelte"
  import PaletteLine from "./PaletteLine.svelte"
  import Square from "./Square.svelte"
  import {
    paletteSort,
    paletteSetActive,
    paletteCreate,
    paletteDelete,
    paletteGetName,
  } from "../palette"
  import storage from "../storage"
  import syncedWritable from "../syncedWritable"

  function isNumber(input: unknown): input is number {
    return !isNaN(Number(input))
  }

  let showWipe = false
  let showPalettePicker = false
  let showTipClick = false

  // Wiping
  const wipeAsk = (_event) => {
    showWipe = !showWipe
  }

  // Sorting
  const sort = (_event) => {
    paletteSort($pStore.active.id)
  }

  // Switching
  const pickPalette = (_event) => {
    showPalettePicker = !showPalettePicker
  }

  let newPaletteName: string
  function isPaletteNameOk(name) {
    return newPaletteName?.trim()
  }

  const newPalette = async (event) => {
    const newPaletteId = await pStore.createPalette(newPaletteName)
    newPaletteName = ""
    pickPalette()
  }

  const deletePaletteDialog = (event) => {
    showPaletteDelete = true
    paletteIdToDelete = event.target.getAttribute("data-paletteid")
  }

  let showPaletteDelete = false
  let paletteIdToDelete: number
</script>

<div>
  <div>
    {#if $pStore.active}
      Palette #{$pStore.active.id}: <b>{$pStore.active.name}</b> (<a on:click={pickPalette}
        >palettes</a
      >
      |
      <a on:click={sort}
        >sort <span>
          {#if $pStore.active.sortBy === "asc"}
            ↑
          {:else if $pStore.active.sortBy === "desc"}
            ↓
          {/if}
        </span></a
      >
      | edit | export | <a on:click={wipeAsk}>wipe</a>)
    {/if}
  </div>

  <div class="my-4 max-w-96">
    {#if showPaletteDelete}
      <PaletteDelete bind:paletteId={paletteIdToDelete} bind:show={showPaletteDelete} />
    {:else if showPalettePicker}
      <PaletteDialog bind:toggle={showPalettePicker}>
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
              <button
                type="submit"
                disabled={!isPaletteNameOk(newPaletteName)}
                class="btn btn-sm btn-primary"
                on:click|preventDefault={newPalette}>create</button
              >
            </form>
          </li>
          {#each Object.keys($pStore).filter(isNumber) as id}
            <PaletteLine
              bind:toggle={showPalettePicker}
              paletteId={Number(id)}
              deleteAction={deletePaletteDialog}
            />
          {/each}
        </ul>
      </PaletteDialog>
    {:else if showWipe}
      <PaletteDialog bind:toggle={showWipe}>
        <PaletteWipe bind:toggle={showWipe} />
      </PaletteDialog>
    {:else if $pStore.active?.colors.length === 0}
      <div class="p-4 rounded prose prose-sm">
        <h4>Your palette is clean</h4>

        <p>
          Maybe too clean? Try to pick some color or <a class="link" on:click={pickPalette}
            >switch to different palette</a
          >?
        </p>
      </div>
    {:else if $pStore.active}
      <div
        class="flex flex-wrap gap-2"
        on:mouseover={() => {
          showTipClick = true
        }}
        on:mouseout={() => {
          showTipClick = false
        }}
      >
        {#each $pStore.active.colors as color (color)}
          <Square color={color.h} />
        {/each}
      </div>
      <div class="text-xs mt-4">
        {#if showTipClick}
          <b>Click</b> on color to set it as
          <span class="font-mono font-bold">Selected</span>.
        {:else}
          <b>Hover</b> over colors to preview a color in
          <span class="font-mono font-bold">New</span> square →
        {/if}
      </div>
    {:else}
      <p>
        no active palette... This is embarassing and should never happen, please report the bug.
      </p>
    {/if}
  </div>
</div>
