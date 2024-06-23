<script lang="ts">
  import PaletteDialog from "./PaletteDialog.svelte"
  import { getPalettesForExport } from "../palette"

  export let toggle: boolean

  const dialogToggle = () => {
    toggle = !toggle
  }

  let promise = Promise.resolve(getPalettesForExport())
</script>

<PaletteDialog bind:toggle>
  <div class="bg-slate-200 p-4 rounded prose prose-sm relative">
    <h4>Export your palette</h4>
    {#await promise}
      <p>...waiting</p>
    {:then jsonExport}
      <pre class="overflow-y-scroll overflow-x-hidden h-48">
{JSON.stringify(jsonExport, null, 2)}
    </pre>
    {/await}
  </div>
</PaletteDialog>
