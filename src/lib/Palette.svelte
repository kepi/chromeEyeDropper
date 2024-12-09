<script lang="ts">
  import pStore from "~/allPalettesStore"
  import ColorPicker from "~/lib/ColorPicker.svelte"
  import Square from "~/lib/Square.svelte"
  import { popupDialog } from "~/store"
  import PaletteTools from "./PaletteTools.svelte"

  let showTipClick = $state(false)

  // in case there isn't active palette, set some
  // this shouldn't happen, but as it would lead to broken view for user,
  // lets make sure
  if ($pStore.active === undefined) {
    pStore.switchPalette(Number(Object.keys($pStore)[0]))
  }
</script>

<div class="">
  {#if $pStore.active}
    <div class="flex justify-between h-8 pt-1">
      <div class="flex pl-2">
        <PaletteTools />
      </div>
      <div class="items-center flex text-slate-700 text-sm mr-5 truncate max-w-64">
        #{$pStore.active.id}: {$pStore.active.name}
      </div>
    </div>
  {/if}
  <div class="my-4">
    {#if $popupDialog === "picker"}
      <ColorPicker />
    {:else if $pStore.active?.colors.length === 0}
      <div class="p-4 rounded prose prose-sm">
        <h4>Your palette is clean</h4>

        <p>
          Maybe too clean? Try to pick some color or <button
            class="link"
            onclick={() => {
              $popupDialog = "palettes"
            }}>switch to different palette</button
          >?
        </p>
      </div>
    {:else if $pStore.active}
      <div
        class="flex flex-wrap gap-2"
        role="tooltip"
        onmouseover={() => {
          showTipClick = true
        }}
        onmouseout={() => {
          showTipClick = false
        }}
        onfocus={() => {
          showTipClick = true
        }}
        onblur={() => {
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
