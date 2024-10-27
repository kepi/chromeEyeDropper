<script lang="ts">
  import browser from "webextension-polyfill"
  import { getTab } from "~/entrypoints/background"
  import PickFromWpButton from "~/lib/PickFromWpButton.svelte"
</script>

{#await getTab() then tab}
  {#if tab.url === undefined}
    <PickFromWpButton
      reason="Can't pick from this page. Your browser won't allow me to access it."
    />
  {:else if tab.url.indexOf("chrome") == 0}
    <PickFromWpButton
      reason="Can't pick from this page. Extensions can't interact with special browser pages."
    />
  {:else if tab.url.indexOf("https://chrome.google.com/webstore") == 0}
    <PickFromWpButton
      reason="Can't pick from this page. Extensions can't interact with Chrome Web Store."
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
