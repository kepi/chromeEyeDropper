<script lang="ts">
  import pStore from "../allPalettesStore"
  import PaletteWipe from "./PaletteWipe.svelte"
  import PalettePalettes from "./PalettePalettes.svelte"
  import PaletteEdit from "./PaletteEdit.svelte"
  import PaletteExport from "./PaletteExport.svelte"
  import PaletteSort from "./PaletteSort.svelte"
  import ColorPicker from "./ColorPicker.svelte"
  import Square from "./Square.svelte"
  import { paletteSortByIcon } from "../palette"

  let showTipClick = false
  let toggles = {
    wipe: false,
    palettes: false,
    edit: false,
    sort: false,
    exp: false,
    cp: false,
  }

  type Toggles = typeof toggles
  const toggle = (what: keyof Toggles) => {
    toggles[what] = !toggles[what]
  }
</script>

<div>
  <div>
    {#if $pStore.active}
      Palette #{$pStore.active.id}: <b>{$pStore.active.name}</b>
      <button
        on:click={() => {
          toggle("palettes")
        }}>palettes</button
      >
      |
      <button on:click={() => toggle("sort")}
        >sort <span>{paletteSortByIcon($pStore.active.sortBy)} </span></button
      >
      |
      <button
        on:click={() => {
          toggle("edit")
        }}>edit</button
      >
      |
      <button
        on:click={() => {
          toggle("exp")
        }}>export</button
      >
      |
      <button
        on:click={() => {
          toggle("wipe")
        }}>wipe</button
      >
      |
      <button
        on:click={() => {
          toggle("cp")
        }}>pick</button
      >
    {/if}
  </div>

  <div class="my-4 max-w-md">
    {#if toggles.palettes}
      <PalettePalettes bind:toggle={toggles.palettes} />
    {:else if toggles.wipe}
      <PaletteWipe bind:toggle={toggles.wipe} />
    {:else if toggles.sort}
      <PaletteSort bind:toggle={toggles.sort} />
    {:else if toggles.edit}
      <PaletteEdit bind:toggle={toggles.edit} />
    {:else if toggles.exp}
      <PaletteExport bind:toggle={toggles.exp} />
    {:else if toggles.cp}
      <ColorPicker bind:toggle={toggles.cp} />
    {:else if $pStore.active?.colors.length === 0}
      <div class="p-4 rounded prose prose-sm">
        <h4>Your palette is clean</h4>

        <p>
          Maybe too clean? Try to pick some color or <button
            class="link"
            on:click={() => {
              toggle("palettes")
            }}>switch to different palette</button
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
        on:focus={() => {
          showTipClick = true
        }}
        on:blur={() => {
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
