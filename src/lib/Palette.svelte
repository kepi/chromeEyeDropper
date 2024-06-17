<script lang="ts">
  import Square from "./Square.svelte"
  import { sortBy, paletteColors, sortedColors, paletteId } from "../store"
  import { paletteWipe, paletteSort } from "../palette"
  import storage from "../storage"
  import syncedWritable from "../syncedWritable"

  let showWipe = false

  const wipeAsk = (_event) => {
    showWipe = !showWipe
  }

  const wipeClean = (_event) => {
    paletteWipe($paletteId)
    showWipe = false
  }

  const wipeDefault = (_event) => {
    paletteWipe($paletteId, true)
    showWipe = false
  }

  const sort = (_event) => {
    console.log($paletteId)
    paletteSort($paletteId)
  }

  let showTipClick = false
</script>

<div>
  <div>
    Palette: default (palettes | <a on:click={sort}
      >sort <span>
        {#if $sortBy === "asc"}
          ↑
        {:else if $sortBy === "desc"}
          ↓
        {/if}
      </span></a
    >
    | edit | export | <a on:click={wipeAsk}>wipe</a>)
  </div>

  <div class="my-4 max-w-96">
    {#if showWipe}
      <div class="bg-slate-200 p-4 rounded prose prose-sm relative">
        <h4>Wipe your palette clean?</h4>
        <p>
          There is no comming back! All colors in your current palette <b>will be deleted</b>.
        </p>
        <p>
          <b>You can't restore them after wipe!</b>
        </p>
        <div class="gap-2 flex flex-wrap">
          <button class="btn btn-sm btn-secondary" on:click={wipeClean}>wipe clean</button>
          <button class="btn btn-sm btn-secondary" on:click={wipeDefault}
            >wipe and add default colors</button
          >
        </div>
        <div class="flex gap-2 items-center mt-2">
          <p>I changed my mind,</p>
          <button class="btn btn-sm btn-primary">leave my colors alone.</button>
        </div>
        <div
          class="absolute right-0 top-0 w-8 h-8 hover:text-red-500 items-center justify-center flex"
          on:click={wipeAsk}
        >
          ✖
        </div>
      </div>
    {:else if $paletteColors.length === 0}
      <div class="p-4 rounded prose prose-sm">
        <h4>Your palette is clean</h4>

        <p>Maybe too clean? Try to pick some color from webpage or switch to different palette?</p>
      </div>
    {:else}
      <div
        class="flex flex-wrap gap-2"
        on:mouseover={() => {
          showTipClick = true
        }}
        on:mouseout={() => {
          showTipClick = false
        }}
      >
        {#each $sortedColors as color (color)}
          <Square color={color.h} />
        {/each}

        <div class="text-xs">
          {#if showTipClick}
            <b>Click</b> on color to set it as
            <span class="font-mono font-bold">Selected</span>.
          {:else}
            <b>Hover</b> over colors to preview a color in
            <span class="font-mono font-bold">New</span> square →
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>
