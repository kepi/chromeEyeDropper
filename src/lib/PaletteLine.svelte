<script lang="ts">
  import pStore from "~/allPalettesStore"
  import { popupDialog } from "~/store"
  import { paletteSetActive } from "~/palette"
  import { Icon } from "@steeze-ui/svelte-icon"
  import { Move } from "@steeze-ui/lucide-icons"

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

<li
  data-palette={paletteId}
  class="flex items-center gap-2 px-2 py-1 mt-1 rounded hover:bg-slate-300"
>
  <div>
    <Icon src={Move} class="w-4 h-4 stroke-slate-600 hover:stroke-primary" />
  </div>

  <div class="w-6 text-right font-mono">
    #{palette.id}:
  </div>

  <div class="text-base">
    {#if active}
      <b>➤ {palette.name}</b>
    {:else}
      <button
        class="link font-bold text-neutral hover:text-primary"
        onclick={() => switchPalette(palette.id)}
      >
        {$pStore[paletteId].name}
      </button>
    {/if}
    <span class="text-xs ml-2 mr-4">({palette.colors.length} colors)</span>
  </div>

  <button disabled={active} class="btn btn-xs btn-error" onclick={deleteAction}>delete</button>
</li>
