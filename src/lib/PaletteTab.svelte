<script lang="ts">
  import pStore from "~/allPalettesStore"
  import { paletteSetActive } from "~/palette"
  import { popupDialog } from "~/store"

  interface Props {
    paletteId: number
    shortName: string
  }

  let { paletteId = $bindable(), shortName }: Props = $props()
  let palette = $derived($pStore[paletteId])
  let active = $derived(($pStore.active?.id ?? 0) === paletteId && $popupDialog != "palettes")
</script>

{#if palette?.id !== undefined}
  <div
    class="text-nowrap max-w-14 h-6 tab [--tab-bg:#fff] [--tab-border-color:#cbd5e1]"
    class:tab-active={active}
    role="tab"
  >
    <button
      class="text-sm hover:text-primary tooltip tooltip-bottom flex gap-1 items-center"
      data-tip={`#${palette.id}: ${palette.name}`}
      onclick={() => {
        paletteSetActive(palette.id)
        $popupDialog = "palette"
      }}
    >
      <div class="truncate max-w-[48px] shadow-black" class:text-shadow={active}>
        {shortName}
      </div>
    </button>
  </div>
{/if}
