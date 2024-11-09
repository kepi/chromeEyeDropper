<script lang="ts">
  import browser from "webextension-polyfill"
  import { getTab } from "~/entrypoints/background"
  import PickFromWpButton from "~/lib/PickFromWpButton.svelte"

  const isChrome = import.meta.env.CHROME || import.meta.env.OPERA
  const isFirefox = import.meta.env.FIREFOX
  const isEdge = import.meta.env.EDGE
</script>

{#await getTab() then tab}
  {#if tab.url === undefined}
    <PickFromWpButton
      reason="Can't pick from this page. Your browser won't allow me to access it."
    />
  {:else if tab.url === browser.runtime.getURL("/popup.html")}
    <div class="-mt-6"></div>
  {:else if isChrome && tab.url.startsWith("chrome")}
    <PickFromWpButton reason="Extensions are not allowed to interact with special browser pages." />
  {:else if isEdge && tab.url.startsWith("edge")}
    <PickFromWpButton reason="Extensions are not allowed to interact with edge:" />
  {:else if isFirefox && tab.url.startsWith("about:")}
    <PickFromWpButton reason="Extensions are not allowed to interact with about: pages." />
  {:else if isChrome && tab.url.startsWith("https://chromewebstore.google.com")}
    <PickFromWpButton
      reason="Chrome extensions are not allowed to interact with Chrome Web Store."
    />
  {:else if isFirefox && tab.url.startsWith("https://addons.mozilla.org")}
    <PickFromWpButton
      reason="Firefox extensions are not allowed to interact with Mozilla Addons page."
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
  {:else if tab.url.indexOf("file") === 0}
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
  {:else if tab.id !== undefined}
    <PickFromWpButton tabId={tab.id} />
  {/if}
{/await}
