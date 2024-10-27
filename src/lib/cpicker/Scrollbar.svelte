<script>
  import { alterDimension, getColorData } from "~/color"
  import { TinyColor } from "@ctrl/tinycolor"
  import { onMount } from "svelte"

  import { getDimension } from "./dimensions"
  import { relativePosition } from "./event"
  import touchToMouse from "./touch"

  export let color = "#00fff00"
  export let dimension = "hsl.h"
  export let detail = 100

  export let width = null
  export let height = null

  let canvas
  let ctx
  let cWidth
  let cHeight

  onMount(() => {
    ctx = canvas.getContext("2d")
    touchToMouse(canvas)
  })

  $: dim = getDimension(dimension)
  $: colBaseData = getColorData(dim.scale, color)

  $: value = colBaseData[dim.dim] * dim.data.scale
  $: sliderPos =
    ((cWidth - 2) * (value - dim.data.extent[0])) / (dim.data.extent[1] - dim.data.extent[0])

  $: {
    if (ctx) {
      ctx.imageSmoothingEnabled = false
      ctx.clearRect(0, 0, cWidth, cHeight)

      let d = Math.min(detail, cWidth - 2)
      let xStep = (cWidth - 2) / d
      let range = dim.data.extent[1] - dim.data.extent[0]

      for (let i = 0; i <= d; i++) {
        const v = ((i / d) * range + dim.data.extent[0]) / dim.data.scale
        const col = alterDimension(colBaseData, dim.dim, v)
        ctx.fillStyle = new TinyColor(col).toHexString()
        ctx.fillRect(Math.round(i * xStep), 0, Math.ceil(xStep), cHeight)
      }

      ctx.fillStyle = "#ffffff"
      ctx.fillRect(sliderPos - 1, 0, 3, cHeight)

      ctx.fillStyle = "#000000"
      ctx.fillRect(sliderPos, 0, 1, cHeight)
    }
  }

  function onMouse(e) {
    if (e.buttons === 1) {
      const pos = relativePosition(e)
      let x = pos.relativeX

      let v = (x / (cWidth - 2)) * (dim.data.extent[1] - dim.data.extent[0]) + dim.data.extent[0]
      if (v > dim.data.extent[1]) {
        v = dim.data.extent[1]
      }
      if (v < dim.data.extent[0]) {
        v = dim.data.extent[0]
      }
      color = new TinyColor(alterDimension(colBaseData, dim.dim, v / dim.data.scale)).toHexString()
    }
  }
</script>

<div class="scrollbar" bind:clientWidth={cWidth} bind:clientHeight={cHeight}>
  <canvas bind:this={canvas} {width} {height} on:mousedown={onMouse} on:mousemove={onMouse}>
  </canvas>
</div>

<style>
  .scrollbar,
  canvas {
    display: inline-block;
    padding: 0;
    margin: 0;
    line-height: 0;
  }

  canvas {
    border: 1px solid #000;
    border-radius: 2px;
    cursor: col-resize;
  }
</style>
