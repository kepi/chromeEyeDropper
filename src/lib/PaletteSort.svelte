<script lang="ts">
  import PaletteDialog from "./PaletteDialog.svelte"
  import {
    storePaletteSortBy,
    paletteSort,
    paletteSortByIcon,
    type StorePaletteSortBy,
  } from "../palette"

  export let toggle: boolean

  const dialogToggle = () => {
    toggle = !toggle
  }

  const sortByKeys = Object.keys(storePaletteSortBy) as StorePaletteSortBy[]
</script>

<PaletteDialog bind:toggle>
  <div class="bg-slate-200 p-4 rounded prose prose-sm relative">
    <h4>Sort your palette by</h4>

    <ul>
      {#each sortByKeys as sortBy}
        <li>
          <button
            class="cursor-pointer hover:text-primary"
            on:click={() => {
              paletteSort(undefined, sortBy)
              dialogToggle()
            }}
          >
            {paletteSortByIcon(sortBy)}
            {storePaletteSortBy[sortBy].text}
          </button>
        </li>
      {/each}
    </ul>
  </div>
</PaletteDialog>
