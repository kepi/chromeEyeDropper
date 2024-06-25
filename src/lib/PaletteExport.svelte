<script lang="ts">
  import { getPalettesForExport } from "../palette"
  import { Icon } from "@steeze-ui/svelte-icon"
  import { Clipboard } from "@steeze-ui/lucide-icons"
  import { copyToClipboard } from "../clipboard"

  let promise = Promise.resolve(getPalettesForExport())
</script>

{#await promise}
  <p>...loading state</p>
{:then jsonExport}
  {@const value = JSON.stringify(jsonExport, null, 2)}
  <div class="flex flex-row not-prose justify-between items-center">
    <div><h4 class="font-bold pt-2">Export your palette</h4></div>
    <button
      on:click={() => {
        copyToClipboard(value)
      }}><Icon class="hover:stroke-primary w-4 h-4 hover:scale-125" src={Clipboard} /></button
    >
  </div>
  <div>
    <pre class="overflow-y-scroll overflow-x-hidden h-48">
{value}
    </pre>
  </div>
{/await}
