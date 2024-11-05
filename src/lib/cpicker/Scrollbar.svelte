<script lang="ts">
  import { alterDimension } from "~/color"
  import { TinyColor } from "@ctrl/tinycolor"
  import { onMount } from "svelte"
  import { relativePosition } from "./event"
  import touchToMouse from "./touch"
  import { colorTo, type DimensionData, type DimensionKey, dimensions } from "./dimensions"

  interface Props {
    color: string
    dimensionKey: DimensionKey
    width: any
    height: any
  }

  let {
    color = $bindable("#00fff00"),
    dimensionKey = "hsl.h",
    width = null,
    height = null,
  }: Props = $props()

  let canvas: HTMLCanvasElement | undefined = $state()
  let ctx: CanvasRenderingContext2D | null = $state(null)
  let cWidth = $state(0)
  let cHeight = $state(0)

  const detail = 100

  let dim = $derived(dimensions[dimensionKey])
  let colorInColorspace = $derived(colorTo(color, dim.colorspace))

  onMount(() => {
    if (canvas) {
      ctx = canvas.getContext("2d")
      touchToMouse(canvas)
    }
  })

  function fillRect(dim: DimensionData) {
    let value = colorInColorspace[dim.dimension] * dim.scale
    let sliderPos = ((cWidth - 2) * (value - dim.extent[0])) / (dim.extent[1] - dim.extent[0])

    if (ctx) {
      ctx.clearRect(0, 0, cWidth, cHeight)
      ctx.imageSmoothingEnabled = false

      let d = Math.min(detail, cWidth - 2)
      let xStep = (cWidth - 2) / d
      let range = dim.extent[1] - dim.extent[0]

      for (let i = 0; i <= d; i++) {
        const v = ((i / d) * range + dim.extent[0]) / dim.scale
        const col = alterDimension(colorInColorspace, dim.dimension, v)
        ctx.fillStyle = new TinyColor(col).toHexString()
        ctx.fillRect(Math.round(i * xStep), 0, Math.ceil(xStep), cHeight)
      }

      ctx.fillStyle = "#ffffff"
      ctx.fillRect(sliderPos - 1, 0, 3, cHeight)

      ctx.fillStyle = "#000000"
      ctx.fillRect(sliderPos, 0, 1, cHeight)
    }
  }

  $effect(() => {
    fillRect(dim)
  })

  function onMouse(e: MouseEvent) {
    if (e.buttons === 1) {
      const pos = relativePosition(e)

      if (pos && dim) {
        let x = pos.relativeX

        let v = (x / (cWidth - 2)) * (dim.extent[1] - dim.extent[0]) + dim.extent[0]
        if (v > dim.extent[1]) {
          v = dim.extent[1]
        }
        if (v < dim.extent[0]) {
          v = dim.extent[0]
        }
        color = new TinyColor(
          alterDimension(colorInColorspace, dim.dimension, v / dim.scale),
        ).toHexString()
      }
    }
  }
</script>

<div class="scrollbar" bind:clientWidth={cWidth} bind:clientHeight={cHeight}>
  <canvas bind:this={canvas} {width} {height} onmousedown={onMouse} onmousemove={onMouse}> </canvas>
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
