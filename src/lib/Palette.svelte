<script lang="ts">
  import pStore from "../allPalettesStore"
  import PaletteWipe from "./PaletteWipe.svelte"
  import PalettePalettes from "./PalettePalettes.svelte"
  import PaletteEdit from "./PaletteEdit.svelte"
  import PaletteExport from "./PaletteExport.svelte"
  import PaletteSort from "./PaletteSort.svelte"
  import ColorPicker from "./ColorPicker.svelte"
  import Square from "./Square.svelte"
  import { sortByInfo } from "../palette"
  import { Icon } from "@steeze-ui/svelte-icon"
  import { Download, LayoutGrid, Move, SlidersHorizontal, Trash2 } from "@steeze-ui/lucide-icons"

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

  $: sortBy = $pStore.active?.sortBy ?? "m:asc"
  $: sortInfo = sortByInfo[sortBy]
</script>

<div>
  <div class="flex items-center gap-2">
    {#if $pStore.active}
      <div>
        Palette #{$pStore.active.id}: <b>{$pStore.active.name}</b>
      </div>

      <div class="tooltip tooltip-bottom" data-tip="Manage Palettes">
        <button
          class="flex"
          on:click={() => {
            toggle("palettes")
          }}
        >
          <Icon src={LayoutGrid} class="w-4 h-4 hover:stroke-primary" />
        </button>
      </div>

      <div>|</div>

      <div class="tooltip tooltip-bottom" data-tip="Change sorting of active Palette">
        <button class="flex gap-1 group" on:click={() => toggle("sort")}>
          <Icon src={sortInfo.icon} class="w-4 h-4 group-hover:stroke-primary" />
          <Icon src={sortInfo.iconOrder} class="w-4 h-4 group-hover:stroke-primary" />
        </button>
      </div>
      |
      <div class="tooltip tooltip-bottom" data-tip="Reorder or delete colors in Palette">
        <button
          class="flex"
          on:click={() => {
            toggle("edit")
          }}
        >
          <Icon src={Move} class="w-4 h-4 hover:stroke-primary" />
        </button>
      </div>
      |
      <div class="tooltip tooltip-bottom" data-tip="Export your Palettes">
        <button
          class="flex"
          on:click={() => {
            toggle("exp")
          }}
        >
          <Icon src={Download} class="w-4 h-4 hover:stroke-primary" />
        </button>
      </div>
      |
      <div class="tooltip tooltip-bottom" data-tip="Wipe colors from active Palette">
        <button
          class="flex"
          on:click={() => {
            toggle("wipe")
          }}
        >
          <Icon src={Trash2} class="w-4 h-4 hover:stroke-primary" />
        </button>
      </div>
      |
      <div class="tooltip tooltip-bottom" data-tip="Pick color from Color Picker">
        <button
          class="flex"
          on:click={() => {
            toggle("cp")
          }}
        >
          <Icon src={SlidersHorizontal} class="w-4 h-4 hover:stroke-primary" />
        </button>
      </div>
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
