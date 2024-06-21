<script lang="ts">
  import pStore from "../allPalettesStore"
  import { paletteSetActive } from "../palette"

  export let deleteAction
  export let paletteId: number
  export let toggle: boolean

  async function switchPalette(paletteId) {
    paletteSetActive(paletteId)
    toggle = !toggle
  }
</script>

<li>
  #{$pStore[paletteId].id}:
  {#if paletteId === $pStore.active.id}
    <b>{$pStore[paletteId].name}</b>
  {:else}
    <a class="link hover:bg-primary" on:click={() => switchPalette($pStore[paletteId].id)}>
      {$pStore[paletteId].name}
    </a>
  {/if}
  ({$pStore[paletteId].colors.length} colors)

  <button
    disabled={paletteId === $pStore.active.id}
    class="btn btn-sm btn-primary"
    data-paletteid={$pStore[paletteId].id}
    on:click={deleteAction}>delete</button
  >
</li>
