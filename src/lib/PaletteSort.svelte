<script lang="ts">
  import { paletteSort, sortByInfo, type StorePaletteSortBy } from "../palette"
  import { Icon } from "@steeze-ui/svelte-icon"
  import { popupDialog } from "../store"

  const close = () => {
    $popupDialog = "palette"
  }

  const sortByKeys = Object.keys(sortByInfo) as StorePaletteSortBy[]
</script>

<h4>Sort your palette by</h4>

<ul>
  {#each sortByKeys as sortBy}
    <li>
      <button
        class="cursor-pointer hover:text-primary flex gap-1 items-center"
        onclick={() => {
          paletteSort(undefined, sortBy)
          close()
        }}
      >
        <Icon src={sortByInfo[sortBy].icon} class="w-4 h-4" />
        <Icon src={sortByInfo[sortBy].iconOrder} class="w-4 h-4" />
        {sortByInfo[sortBy].text}
      </button>
    </li>
  {/each}
</ul>
