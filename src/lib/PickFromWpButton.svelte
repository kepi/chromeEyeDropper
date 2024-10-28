<script lang="ts">
  import { enableErrorReportingTab } from "~/store"
  import browser from "webextension-polyfill"
  import { sendMessage } from "~/messaging"

  export let reason = "Pick color from active tab"
  export let tabId = -1
  export let href = ""
  export let error = false

  $: disabled = tabId === -1 && href === ""
  $: help = tabId === -1 && href !== ""

  $: fullReason = help ? `${reason} Click for more info.` : reason

  const pickFromWeb = async () => {
    const received = await sendMessage("pickFromWeb", tabId)
    console.log("Received", received)
    if (received.status === "ok") {
      window.close()
    } else {
      const url = `https://eyedropper.org/error?status=${received.status}&error=${received.error}`
      if ($enableErrorReportingTab) {
        browser.tabs.create({
          url,
          active: true,
        })
        window.close()
      } else {
        error = true
        reason = "Click to report and get more info"
        href = url
      }
    }
  }

  const action = async (e: MouseEvent) => {
    // no error and we have tabId -> we can pick from web
    if (!error && tabId !== -1) {
      pickFromWeb()
      // we have help href - open link with more info
    } else if (href !== "") {
      browser.tabs.create({
        url: href,
      })
    }
    // else do nothing
    e.preventDefault()
  }
</script>

<div class="tooltip tooltip-bottom before:left-24" data-tip={fullReason}>
  <button
    {disabled}
    class="btn btn-sm btn-primary hover:btn-secondary font-normal shadow-md"
    class:bg-neutral-300={help}
    class:border-neutral-300={help}
    class:hover:bg-neutral-300={help}
    class:hover:border-neutral-300={help}
    class:bg-red-300={error}
    class:hover:bg-red-500={error}
    on:click={action}
  >
    {#if error}
      Picker Failed
    {:else}
      Web Page
    {/if}
  </button>
</div>
