<script lang="ts">
  import pStore from "~/allPalettesStore"
  import PaletteHeader from "~/lib/PaletteHeader.svelte"
  import ColorPicker from "~/lib/ColorPicker.svelte"
  import Square from "~/lib/Square.svelte"
  import { popupDialog } from "~/store"

  let showTipClick = false
</script>

<div>
  <PaletteHeader />
  <div class="my-4 max-w-md">
    {#if $popupDialog === "picker"}
      <ColorPicker />
    {:else if $pStore.active?.colors.length === 0}
      <div class="p-4 rounded prose prose-sm">
        <h4>Your palette is clean</h4>

        <p>
          Maybe too clean? Try to pick some color or <button
            class="link"
            on:click={() => {
              $popupDialog = "palettes"
            }}>switch to different palette</button
          >?
        </p>
      </div>
    {:else if $pStore.active}
      <div
        class="flex flex-wrap gap-2"
        role="tooltip"
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
