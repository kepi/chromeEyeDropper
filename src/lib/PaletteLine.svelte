<script lang="ts">
  import pStore from "~/allPalettesStore"
  import { popupDialog } from "~/store"
  import { paletteSetActive } from "~/palette"

  interface Props {
    deleteAction: any;
    paletteId: number;
  }

  let { deleteAction, paletteId }: Props = $props();

  async function switchPalette(paletteId: number) {
    paletteSetActive(paletteId)
    $popupDialog = "palette"
  }
</script>

<li class="flex items-center gap-2 px-2 py-1 mt-1 rounded hover:bg-slate-300">
  <div class="w-6 text-right font-mono">
    #{$pStore[paletteId].id}:
  </div>

  <div class="text-base">
    {#if paletteId === $pStore.active?.id}
      <b>➤ {$pStore[paletteId].name}</b>
    {:else}
      <button
        class="link font-bold text-neutral hover:text-primary"
        onclick={() => switchPalette($pStore[paletteId].id)}
      >
        {$pStore[paletteId].name}
      </button>
    {/if}
    <span class="text-xs ml-2 mr-4">({$pStore[paletteId].colors.length} colors)</span>
  </div>

  <button
    disabled={paletteId === $pStore.active?.id}
    class="btn btn-xs btn-error"
    data-paletteid={$pStore[paletteId].id}
    onclick={deleteAction}>delete</button
  >
</li>
