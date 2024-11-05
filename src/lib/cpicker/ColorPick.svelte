<script lang="ts">
  import ScrollBar from "./Scrollbar.svelte"
  import Matrix from "./Matrix.svelte"
  import DimensionInput from "./DimensionInput.svelte"
  import {
    colorspace,
    colorspaceDimensions,
    otherDimensions,
    type ColorspaceName,
    type DimensionKey,
  } from "./dimensions"

  interface Props {
    color?: string
  }

  let { color = $bindable("#ff9900") }: Props = $props()
  let selectedDimension: DimensionKey = $state("hsl.h")
  let selectedTab = $state("hsl")

  const matrixWidth = 280
  const sliderWidth = matrixWidth - 74
  const matrixHeight = 100
  const scrollbarHeight = 14

  let [dimX, dimY] = $derived(otherDimensions(selectedDimension))
</script>

<div>
  <div>
    <Matrix
      bind:color
      dimensionXKey={dimX}
      dimensionYKey={dimY}
      width={matrixWidth}
      height={matrixHeight}
    />

    <div class="flex mt-1">
      {#each Object.keys(colorspaceDimensions) as colorspaceName}
        <button
          class="uppercase font-bold px-1 mx-1 border-b border-gray-600"
          class:border-b-2={selectedTab === colorspaceName}
          onclick={() => {
            selectedTab = colorspaceName
            selectedDimension =
              `${colorspaceName}.${Object.keys(colorspaceDimensions[colorspaceName as ColorspaceName])[0]}` as DimensionKey
          }}
        >
          {colorspaceName}
        </button>
      {/each}
    </div>

    {#each Object.keys(colorspaceDimensions) as colorspaceName}
      {#if selectedTab === colorspaceName}
        <div class="mt-1">
          {#each Object.keys(colorspaceDimensions[colorspaceName as ColorspaceName]) as dimensionName}
            {@const dimensionKey = `${colorspaceName}.${dimensionName}` as DimensionKey}
            <div class="flex items-center h-6">
              <input
                class="inline-block mr-1 w-4"
                type="radio"
                bind:group={selectedDimension}
                value={dimensionKey}
                id="{colorspaceName}-{dimensionName}"
              />
              <label class="w-4" for="{colorspaceName}-{dimensionName}"
                >{dimensionName.toUpperCase()}</label
              >
              <ScrollBar width={sliderWidth} height={scrollbarHeight} {dimensionKey} bind:color />

              <DimensionInput bind:color {dimensionKey} />
            </div>
          {/each}
        </div>
      {/if}
    {/each}
  </div>
</div>
