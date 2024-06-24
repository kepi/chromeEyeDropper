<script lang="ts">
  import PaletteDialog from "./PaletteDialog.svelte"
  import { paletteSort, sortByInfo, type StorePaletteSortBy } from "../palette"
  import { Icon } from "@steeze-ui/svelte-icon"

  export let toggle: boolean

  const dialogToggle = () => {
    toggle = !toggle
  }

  const sortByKeys = Object.keys(sortByInfo) as StorePaletteSortBy[]
</script>

<PaletteDialog bind:toggle>
  <div class="bg-slate-200 p-4 rounded prose prose-sm relative">
    <h4>Sort your palette by</h4>

    <ul>
      {#each sortByKeys as sortBy}
        <li>
          <button
            class="cursor-pointer hover:text-primary flex gap-1 items-center"
            on:click={() => {
              paletteSort(undefined, sortBy)
              dialogToggle()
            }}
          >
            <Icon src={sortByInfo[sortBy].icon} class="w-4 h-4" />
            <Icon src={sortByInfo[sortBy].iconOrder} class="w-4 h-4" />
            {sortByInfo[sortBy].text}
          </button>
        </li>
      {/each}
    </ul>
  </div>
</PaletteDialog>
