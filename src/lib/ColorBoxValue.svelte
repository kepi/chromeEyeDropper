<script lang="ts">
  import { Icon } from "@steeze-ui/svelte-icon"
  import { Clipboard } from "@steeze-ui/lucide-icons"
  import { copyToClipboard } from "../clipboard"
  export let value: string

  const copy = () => {
    copyToClipboard(value)
  }
</script>

<div
  class="text-black overflow-visible flex gap-1 tooltip tooltip-bottom"
  data-tip="copy to clipboard"
>
  <button
    class="bg-white rounded px-1 text-nowrap hover:bg-neutral hover:text-white"
    on:click={copy}
  >
    {value}
  </button>
</div>
