<script lang="ts">
  import { TinyColor } from "@ctrl/tinycolor"
  import { alterDimension } from "~/color"
  import { colorTo, dimensions, type DimensionKey } from "./dimensions"

  interface Props {
    color: string
    dimensionKey: DimensionKey
  }

  let { color = $bindable(), dimensionKey }: Props = $props()

  let dim = $derived(dimensions[dimensionKey])
  let colorInColorspace = $derived(colorTo(color, dim.colorspace))
  let roundedValue = $derived(Math.round(colorInColorspace[dim.dimension] * dim.scale))

  function onChange(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
    let v = +e.currentTarget.value
    color = new TinyColor(
      alterDimension(colorInColorspace, dim.dimension, v / dim.scale),
    ).toHexString()
  }
</script>

<input
  type="number"
  class="w-12 text-right"
  value={roundedValue}
  min={dim.extent[0]}
  max={dim.extent[1]}
  onchange={onChange}
/>
