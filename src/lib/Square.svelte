<script lang="ts">
  import { TinyColor } from "@ctrl/tinycolor"
  import { selectedColor, newColor } from "../store"

  export let color
  export let passive: boolean = false
  export let classes = $$props.class
  export let small: boolean = false

  $: tinyColor = new TinyColor(color)
  $: colorHex = tinyColor.toHexString()

  const handleOver = (event: MouseEvent | FocusEvent) => {
    if (!event.target) return

    const color = (event.target as HTMLElement).getAttribute("data-color")
    if (color) {
      newColor.update(() => color)
    }
  }

  const handleClick = (event: MouseEvent) => {
    if (!event.target) return

    const color = (event.target as HTMLElement).getAttribute("data-color")
    if (color) {
      selectedColor.update(() => color)
    }
  }
</script>

<button
  class={`${classes} box-content h-6 w-6 rounded-full border-4 border-gray-200 text-gray-700 hover:border-double`}
  class:h-6={!small}
  class:w-6={!small}
  class:h-4={small}
  class:w-4={small}
  style="background-color: {colorHex}"
  data-color={colorHex}
  on:mouseover={passive ? null : handleOver}
  on:focus={passive ? null : handleOver}
  on:click={passive ? null : handleClick}
>
  &nbsp;
</button>
