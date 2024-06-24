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

<button class="btn btn-primary shadow-md" on:click={handleClick}> Pick color from webpage </button>
