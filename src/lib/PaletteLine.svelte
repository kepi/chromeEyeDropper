<script lang="ts">
  import pStore from "~/allPalettesStore"
  import { popupDialog } from "~/store"
  import { paletteSetActive } from "~/palette"
  import { Icon } from "@steeze-ui/svelte-icon"
  import { Move } from "@steeze-ui/lucide-icons"
  import Square from "./Square.svelte"

  interface Props {
    deleteAction: any
    paletteId: number
  }

  let { deleteAction, paletteId }: Props = $props()
  let palette = $derived($pStore[paletteId])
  let active = $derived(paletteId === $pStore.active?.id)

  async function switchPalette(paletteId: number) {
    paletteSetActive(paletteId)
    $popupDialog = "palette"
  }
</script>

<div class="flex group gap-2 py-1 rounded hover:bg-slate-300 items-center bg-white">
  <div class="shrink invisible group-hover:visible">
    <Icon src={Move} class="w-4 h-4 stroke-slate-600 hover:stroke-primary" />
  </div>
  <div class="w-7 text-xs text-right font-mono">
    #{palette.id}:
  </div>

  <div class="w-48">
    <button
      class="link text-left hover:text-primary"
      class:font-bold={active}
      onclick={() => switchPalette(palette.id)}
    >
      {$pStore[paletteId].name}
    </button>
    <div>
      {#each palette.colors.toSpliced(14) as color (color.h)}
        <span
          class="inline-block rounded-full text-gray-700 border-gray-200 hover:border-double border-2 w-3 h-3"
          style="background-color: {color.h}"
        >
          &nbsp;
        </span>
      {/each}
    </div>
  </div>

  <button
    data-paletteid={paletteId}
    disabled={active}
    class="btn btn-xs btn-error"
    onclick={deleteAction}>delete</button
  >
</div>
