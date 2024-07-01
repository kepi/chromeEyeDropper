<script>
  import { getColorData } from "../../color"
  import { getDimension } from "./dimensions"

  export let color = "#00ff00"
  export let dimension = "hsl.h"

  $: dim = getDimension(dimension)
  $: colBaseData = getColorData(dim.scale, color)
  $: value = colBaseData[dim.dim] * dim.data.scale
  $: roundedValue = Math.round(value)

  function onChange(e) {
    let v = +e.target.value
    console.log(v)
    color = new TinyColor(
      color.alterDimension(dim.scale, dim.dim, v / dim.data.scale),
    ).toHexString()
  }
</script>

<input
  type="number"
  class="w-12 text-right"
  value={roundedValue}
  min={dim.data.extent[0]}
  max={dim.data.extent[1]}
  on:change={onChange}
/>
