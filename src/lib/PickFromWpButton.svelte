<script lang="ts">
  import { enableErrorReportingTab } from "~/store"
  import browser from "webextension-polyfill"
  import { sendMessage } from "~/messaging"
  import { Pipette as Dropper } from "@steeze-ui/lucide-icons"
  import { Icon } from "@steeze-ui/svelte-icon"

  interface Props {
    reason?: string
    tabId?: any
    href?: string
    error?: boolean
    issueId?: number
  }

  let {
    reason = $bindable("Pick a color from active tab"),
    tabId = -1,
    href = $bindable(""),
    issueId = 0,
    error = $bindable(false),
  }: Props = $props()

  let disabled = $derived(tabId === -1 && href === "")
  let help = $derived(tabId === -1 && href !== "")

  const pickFromWeb = async () => {
    const received = await sendMessage("pickFromWeb", tabId)
    console.log("Received", received)
    if (received.status === "ok") {
      window.close()
    } else {
      const url = `https://eyedropper.org/error/?status=${received.status}&error=${received.error}&version=${__APP_VERSION__}`
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
    } else if (issueId > 0) {
      browser.tabs.create({
        url: `https://github.com/kepi/chromeEyeDropper/issues/${issueId}`,
      })
    }
    // else do nothing
    e.preventDefault()
  }
</script>

<div>
  {#if help || disabled}
    <div class="-mt-2 mb-2 p-2 rounded bg-yellow-300 border-2 btn-warning prose prose-sm text-sm">
      <div><strong>Sorry, you can't pick from this page</strong></div>
      <div class="mt-2 text-xs leading-5">
        {reason}
        {#if help || issueId > 0}
          <button class="btn btn-xs bg-slate-700 hover:bg-orange-700 text-white" onclick={action}>
            {help ? "Read why" : `See issue #${issueId}`}
          </button>
        {/if}
      </div>
    </div>
  {:else}
    <div class="before:left-24">
      <button
        {disabled}
        class="btn btn-sm btn-success hover:btn-accent shadow-md font-bold"
        class:bg-neutral-300={help}
        class:border-neutral-300={help}
        class:hover:bg-neutral-300={help}
        class:hover:border-neutral-300={help}
        class:bg-red-300={error}
        class:hover:bg-red-500={error}
        onclick={action}
      >
        {#if error}
          Sorry, picking a color failed
        {:else}
          <Icon class="hover:stroke-primary w-4 h-4 hover:scale-125" src={Dropper} />
          Pick a color from this web
        {/if}
      </button>
    </div>
  {/if}
</div>
