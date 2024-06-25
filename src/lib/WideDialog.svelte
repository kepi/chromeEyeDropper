<script lang="ts">
  import { popupDialog } from "../store"
  import PaletteWipe from "./PaletteWipe.svelte"
  import PalettePalettes from "./PalettePalettes.svelte"
  import PaletteEdit from "./PaletteEdit.svelte"
  import PaletteExport from "./PaletteExport.svelte"
  import PaletteSort from "./PaletteSort.svelte"
</script>

<div class="bg-slate-100 px-4 py-2 rounded prose prose-sm">
  {#if $popupDialog === "palettes"}
    <PalettePalettes />
  {:else if $popupDialog === "wipe"}
    <PaletteWipe />
  {:else if $popupDialog === "sort"}
    <PaletteSort />
  {:else if $popupDialog === "edit"}
    <PaletteEdit />
  {:else if $popupDialog === "export"}
    <PaletteExport />
  {/if}
</div>
