<script lang="ts">
  import browser from "webextension-polyfill"
  import { getTabId } from "../background"

  function handleClick() {
    console.log("clicked pick color from webpage")

    const pickFromWeb = async () => {
      const tabId = await getTabId()
      const response = await browser.runtime.sendMessage({ command: "pick-from-web", tabId })
      console.log(response)
      window.close()
    }
    pickFromWeb()
  }
</script>

<button
  class="rounded-lg bg-green-500 px-6 py-3 font-semibold text-white shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
  on:click={handleClick}
>
  Pick color from webpage
</button>
