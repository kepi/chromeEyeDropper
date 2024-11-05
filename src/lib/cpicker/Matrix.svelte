<script lang="ts">
  import { alterDimension } from "~/color"
  import { TinyColor } from "@ctrl/tinycolor"
  import { onMount } from "svelte"

  import { colorTo, type DimensionData, type DimensionKey, dimensions } from "./dimensions"
  import { relativePosition } from "./event"
  import touchToMouse from "./touch"

  interface Props {
    color: string
    dimensionXKey: DimensionKey
    dimensionYKey: DimensionKey
    width: number
    height: number
  }

  let {
    color = $bindable("#00ff00"),
    dimensionXKey,
    dimensionYKey,
    width,
    height,
  }: Props = $props()

  let canvas: HTMLCanvasElement | undefined = $state()
  let ctx: CanvasRenderingContext2D | null = $state(null)
  let cWidth = $state(0)
  let cHeight = $state(0)

  const detailX = 100
  const detailY = 100

  let dimX = $derived(dimensions[dimensionXKey])
  let dimY = $derived(dimensions[dimensionYKey])

  // colorspace is same for both dimensions, so convert color just once
  let colorInColorspace = $derived(colorTo(color, dimY.colorspace))

  onMount(() => {
    if (canvas) {
      ctx = canvas.getContext("2d")
      touchToMouse(canvas)
    }
  })

  function fillRect(dimX: DimensionData, dimY: DimensionData) {
    let valueX = colorInColorspace[dimX.dimension] * dimX.scale
    let valueY = colorInColorspace[dimY.dimension] * dimY.scale

    let sliderPosX = (cWidth * (valueX - dimX.extent[0])) / (dimX.extent[1] - dimX.extent[0])
    let sliderPosY =
      cHeight - (cHeight * (valueY - dimY.extent[0])) / (dimY.extent[1] - dimY.extent[0])

    if (ctx) {
      ctx.clearRect(0, 0, cWidth, cHeight)
      ctx.imageSmoothingEnabled = false

      let dX = Math.min(detailX, cWidth - 2)
      let dY = Math.min(detailY, cHeight - 2)
      let xStep = (cWidth - 2) / dX
      let yStep = (cHeight - 2) / dY
      let rangeX = dimX.extent[1] - dimX.extent[0]
      let rangeY = dimY.extent[1] - dimY.extent[0]

      for (let y = 0; y <= dY; y++) {
        const vY = ((y / detailY) * rangeY + dimY.extent[0]) / dimY.scale
        const colY = alterDimension(colorInColorspace, dimY.dimension, vY)

        for (let x = 0; x <= dX; x++) {
          const vX = ((x / detailX) * rangeX + dimX.extent[0]) / dimX.scale
          const colYX = alterDimension(colY, dimX.dimension, vX)
          ctx.fillStyle = new TinyColor(colYX).toHexString()
          ctx.fillRect(
            Math.round(x * xStep),
            Math.round(cHeight - 2 - y * yStep),
            Math.ceil(xStep),
            Math.ceil(yStep),
          )
        }
      }

      ctx.fillStyle = "#ffffff"
      ctx.fillRect(sliderPosX - 2, sliderPosY - 2, 5, 5)

      ctx.fillStyle = "#000000"
      ctx.fillRect(sliderPosX - 1, sliderPosY - 1, 3, 3)
    }
  }

  $effect(() => {
    fillRect(dimX, dimY)
  })

  function onMouse(e: MouseEvent) {
    if (e.buttons === 1) {
      const pos = relativePosition(e)

      if (pos && dimX && dimY) {
        let x = pos.relativeX
        let y = cHeight - 2 - pos.relativeY

        let vX = (x / (cWidth - 2)) * (dimX.extent[1] - dimX.extent[0]) + dimX.extent[0]
        if (vX > dimX.extent[1]) {
          vX = dimX.extent[1]
        }
        if (vX < dimX.extent[0]) {
          vX = dimX.extent[0]
        }

        let vY = (y / (cHeight - 2)) * (dimY.extent[1] - dimY.extent[0]) + dimY.extent[0]
        if (vY > dimY.extent[1]) {
          vY = dimY.extent[1]
        }
        if (vY < dimY.extent[0]) {
          vY = dimY.extent[0]
        }

        const colY = alterDimension(colorInColorspace, dimY.dimension, vY / dimY.scale)
        const colYX = alterDimension(colY, dimX.dimension, vX / dimX.scale)
        color = new TinyColor(colYX).toHexString()
      }
    }
  }
</script>

<div class="inline-block shadow-lg" bind:clientWidth={cWidth} bind:clientHeight={cHeight}>
  <canvas
    class="inline-block rounded cursor-crosshair"
    bind:this={canvas}
    {width}
    {height}
    onmousedown={onMouse}
    onmousemove={onMouse}
  >
  </canvas>
</div>
