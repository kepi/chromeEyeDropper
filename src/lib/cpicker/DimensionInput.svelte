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
  value={roundedValue}
  min={dim.data.extent[0]}
  max={dim.data.extent[1]}
  on:change={onChange}
/>

<style>
  input[type="number"] {
    display: inline-block;
    margin: 0 0 0 5px;
    padding: 5px 0 5px 5px;
    width: 60px;
    height: 30px;
  }
</style>
