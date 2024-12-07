<script lang="ts">
  import { TinyColor } from "@ctrl/tinycolor"
  import { selectedColor, newColor } from "~/store"

  type Props = {
    class?: string
    color: string
    passive?: boolean
    small?: boolean
  }
  let { class: classes, color, passive = false, small = false }: Props = $props()

  let tinyColor = $derived(new TinyColor(color))
  let colorHex = $derived(tinyColor.toHexString())

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
  class={`${classes} box-content rounded-full border-4 border-gray-200 text-gray-700 hover:border-double`}
  class:h-6={!small}
  class:w-6={!small}
  class:h-4={small}
  class:w-4={small}
  style="background-color: {colorHex}"
  data-color={colorHex}
  onmouseover={passive ? null : handleOver}
  onfocus={passive ? null : handleOver}
  onclick={passive ? null : handleClick}
  aria-label="Select color {colorHex}"
>
  &nbsp;
</button>
