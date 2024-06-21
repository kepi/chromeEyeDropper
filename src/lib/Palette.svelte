<script lang="ts">
  import { derived } from "svelte/store"
  import paletteStore from "../paletteStore"
  import pStore from "../allPalettesStore"
  import PaletteDialog from "./PaletteDialog.svelte"
  import PaletteWipe from "./PaletteWipe.svelte"
  import PalettePalettes from "./PalettePalettes.svelte"
  import Square from "./Square.svelte"
  import { paletteSort } from "../palette"
  import storage from "../storage"
  import syncedWritable from "../syncedWritable"

  let showTipClick = false
  let toggles = {
    wipe: false,
    palettes: false,
  }

  type Toggles = typeof toggles
  const toggle = (what: keyof Toggles) => {
    toggles[what] = !toggles[what]
  }
</script>

<div>
  <div>
    {#if $pStore.active}
      Palette #{$pStore.active.id}: <b>{$pStore.active.name}</b> (<a
        on:click={() => {
          toggle("palettes")
        }}>palettes</a
      >
      |
      <a on:click={() => paletteSort($pStore.active.id)}
        >sort <span>
          {#if $pStore.active.sortBy === "asc"}
            ↑
          {:else if $pStore.active.sortBy === "desc"}
            ↓
          {/if}
        </span></a
      >
      | edit | export |
      <a
        on:click={() => {
          toggle("wipe")
        }}>wipe</a
      >)
    {/if}
  </div>

  <div class="my-4 max-w-96">
    {#if toggles.palettes}
      <PalettePalettes bind:toggle={toggles.palettes} />
    {:else if toggles.wipe}
      <PaletteWipe bind:toggle={toggles.wipe} />
    {:else if $pStore.active?.colors.length === 0}
      <div class="p-4 rounded prose prose-sm">
        <h4>Your palette is clean</h4>

        <p>
          Maybe too clean? Try to pick some color or <a
            class="link"
            on:click={() => {
              toggle("palettes")
            }}>switch to different palette</a
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
