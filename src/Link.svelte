<script lang="ts">
  import browser from "webextension-polyfill"

  let props = $props()
  let tip = props["data-tip"]
</script>

<button
  class={props.class}
  data-tip={tip}
  onclick={async (event) => {
    browser.tabs.create({
      url: props.href,
    })
    event.preventDefault()
  }}
>
  {@render props.children()}
</button>
