<script lang="ts">
  import browser from "webextension-polyfill"
  export let href: string
</script>

<a
  {href}
  on:click={async (e) => {
    browser.tabs.create({
      url: href,
    })
    e.preventDefault()
  }}><slot /></a
>
