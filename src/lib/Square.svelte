<script lang="ts">
  import { TinyColor } from "@ctrl/tinycolor"
  import { selectedColor, newColor } from "../store"

  export let color

  $: tinyColor = new TinyColor(color)
  $: colorHex = tinyColor.toHexString()

  const handleOver = (event) => {
    const color = event.target.getAttribute("data-color")
    newColor.update(() => color)
  }

  const handleClick = (event) => {
    const color = event.target.getAttribute("data-color")
    selectedColor.update(() => color)
  }
</script>

<div
  class="box-content h-6 w-6 rounded-full border-4 border-gray-200 text-gray-700 hover:border-double"
  style="background-color: {colorHex}"
  on:mouseover={handleOver}
  on:click={handleClick}
  data-color={colorHex}
>
  &nbsp;
</div>
