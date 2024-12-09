<script lang="ts">
  import { popupDialog } from "~/store"
  import PaletteWipe from "~/lib/PaletteWipe.svelte"
  import PalettePalettes from "~/lib/PalettePalettes.svelte"
  import PaletteEdit from "~/lib/PaletteEdit.svelte"
  import PaletteExport from "~/lib/PaletteExport.svelte"
  import PaletteSort from "~/lib/PaletteSort.svelte"
  import PaletteImport from "./PaletteImport.svelte"
</script>

<div class="px-4 py-2 rounded prose prose-sm">
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
  {:else if $popupDialog === "import"}
    <PaletteImport />
  {/if}
</div>
