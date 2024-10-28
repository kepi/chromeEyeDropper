<script lang="ts">
  import browser from "webextension-polyfill"
  import { sendMessage } from "~/messaging"

  export let reason = "Pick color from active tab"
  export let tabId = -1
  export let href = ""

  $: disabled = tabId === -1 && href === ""
  $: help = tabId === -1 && href !== ""

  $: fullReason = help ? `${reason} Click for more info.` : reason

  const pickFromWeb = async () => {
    await sendMessage("pickFromWeb", tabId)
    window.close()
  }

  const action = async (e: MouseEvent) => {
    // we have tabId -> we can pick from web
    if (tabId !== -1) {
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
    on:click={action}>Web Page</button
  >
</div>
