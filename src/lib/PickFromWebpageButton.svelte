<script lang="ts">
  import { capitalize, isProtoRestricted, isSiteRestricted } from "@/helpers"
  import browser from "webextension-polyfill"
  import { getTab } from "~/entrypoints/background"
  import PickFromWpButton from "~/lib/PickFromWpButton.svelte"

  const browserName = capitalize(import.meta.env.BROWSER)
</script>

{#await getTab() then tab}
  {#if tab.url === undefined}
    <PickFromWpButton
      reason="Can't pick from this page. Your browser won't allow me to access it."
    />
  {:else if tab.url === "about:blank"}
    <PickFromWpButton
      reason="Can't pick from new blank page. Your browser won't allow me to access it."
    />
  {:else if tab.url === browser.runtime.getURL("/popup.html")}
    <div class="-mt-6"></div>
  {:else}
    {@const url = new URL(tab.url)}
    {#if url.protocol === "view-source"}
      <PickFromWpButton
        reason="Can't pick form source view page. Your browser won't allow me to access it."
      />
    {:else if url.protocol === "file"}
      {#await browser.extension.isAllowedFileSchemeAccess() then isAllowedAccess}
        {#if isAllowedAccess}
          <PickFromWpButton tabId={tab.id} />
        {:else}
          <PickFromWpButton
            reason="You have to allow access to file URL's first if you want to pick color from local files."
            href="https://eyedropper.org/help/file-urls"
          />
        {/if}
      {/await}
    {:else if isProtoRestricted(url.protocol)}
      <PickFromWpButton
        reason="{browserName} extensions are not allowed to interact with {url.protocol} pages."
      />
    {:else if isSiteRestricted(url)}
      <PickFromWpButton
        reason="{browserName} extensions are not allowed to interact with restricted sites."
      />
    {:else if tab.url.startsWith("data:image")}
      <PickFromWpButton
        reason="Root of the page is inline data image and I can't interact with it yet."
        issueId={264}
      />
    {:else if tab.url.endsWith(".svg")}
      <PickFromWpButton
        reason="Root of the page is SVG image and I can't interact with it yet."
        issueId={213}
      />
    {:else if tab.id !== undefined}
      <PickFromWpButton tabId={tab.id} />
    {/if}
  {/if}
{/await}
