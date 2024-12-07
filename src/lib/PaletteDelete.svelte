<script lang="ts">
  import pStore from "~/allPalettesStore"

  interface Props {
    paletteId: number
    show: boolean
  }

  let { paletteId = $bindable(), show = $bindable() }: Props = $props()

  function reallyDeletePalette() {
    // we have to use pStore function as we need to remove it first from store,
    // than from synced store
    pStore.destroyPalette(paletteId)

    // reset id and close dialog
    paletteId = -1
    show = false
  }
</script>

{#if paletteId > -1 && show}
  <h4>
    Really delete palette "<span class="font-mono"
      >#{$pStore[paletteId].id} {$pStore[paletteId].name}"?</span
    >
  </h4>
  <button class="btn btn-error" onclick={() => reallyDeletePalette()}
    >Yes, I know it can't be restored.</button
  >
{/if}
