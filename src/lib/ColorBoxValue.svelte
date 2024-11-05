<script lang="ts">
  import { copyToClipboard } from "~/clipboard"
  interface Props {
    value: string;
  }

  let { value }: Props = $props();

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
    onclick={copy}
  >
    {value}
  </button>
</div>
