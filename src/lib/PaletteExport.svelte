<script lang="ts">
  import { getPalettesForExport } from "~/palette"
  import { Icon } from "@steeze-ui/svelte-icon"
  import { Clipboard, Download } from "@steeze-ui/lucide-icons"
  import { copyToClipboard } from "~/clipboard"

  let promise = Promise.resolve(getPalettesForExport())

  const downloadJson = (value: string) => {
    const timestamp = new Date().toISOString()

    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(value))
    element.setAttribute("download", `eyedropper_palettes_export_${timestamp}.json`)

    element.style.display = "none"
    document.body.appendChild(element)

    element.click()

    document.body.removeChild(element)
  }
</script>

{#await promise}
  <p>...loading state</p>
{:then jsonExport}
  {@const value = JSON.stringify(jsonExport, null, 2)}
  <div class="flex flex-row not-prose justify-between items-center">
    <div><h4 class="font-bold pt-2">Export your palette</h4></div>
  </div>
  <div>
    <pre class="overflow-y-scroll overflow-x-hidden h-48">
      {value}
    </pre>
  </div>

  <button
    class="btn"
    onclick={() => {
      copyToClipboard(value)
    }}><Icon class="w-4 h-4 " src={Clipboard} /> Copy to clipboard</button
  >
  <button
    class="btn"
    onclick={() => {
      downloadJson(value)
    }}><Icon class="w-4 h-4 " src={Download} /> Download as file</button
  >
{/await}
