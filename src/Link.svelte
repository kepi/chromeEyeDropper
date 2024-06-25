<script lang="ts">
  import browser from "webextension-polyfill"
  export let href: string
  export let classes = $$props.class
  export let dataTip = $$props["data-tip"]
</script>

<button
  class={classes}
  data-tip={dataTip}
  on:click={async (e) => {
    browser.tabs.create({
      url: href,
    })
    e.preventDefault()
  }}><slot /></button
>
