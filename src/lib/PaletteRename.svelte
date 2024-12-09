<script lang="ts">
  import { paletteSetName } from "@/palette"
  import pStore from "~/allPalettesStore"

  interface Props {
    paletteId: number
    show: boolean
  }

  let { paletteId = $bindable(), show = $bindable() }: Props = $props()
  let palette = $derived($pStore[paletteId])
  let newPaletteName = $state($pStore[paletteId].name)

  const changePaletteName = async (event: Event) => {
    event.preventDefault()
    paletteSetName(paletteId, newPaletteName)

    // reset id and close dialog
    paletteId = -1
    show = false
  }
</script>

{#if palette && show}
  <h4>Rename palette #{paletteId}: {palette.name}</h4>
  <form class="">
    <input
      class="input input-sm w-48"
      type="text"
      name="newPaletteName"
      bind:value={newPaletteName}
      placeholder="name of new palette"
    />
    <button type="submit" class="btn btn-sm btn-secondary" onclick={changePaletteName}
      >rename</button
    >
  </form>
{/if}
