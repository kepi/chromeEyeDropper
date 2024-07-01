<script>
  import { dimensions } from "./dimensions"

  import ScrollBar from "./Scrollbar.svelte"
  import Matrix from "./Matrix.svelte"
  import DimensionInput from "./DimensionInput.svelte"

  export let color = "#ff9900"

  export let selectedDimension = "hsl.h"
  export let selectedTab = "hsl"
  export let background = "#fff"

  export let tabbed = true

  export let showMatrix = true
  export let showSliders = {}

  if (Object.keys(showSliders).length === 0) {
    for (const scale in dimensions) {
      for (const dim in dimensions[scale]) {
        showSliders[`${scale}.${dim}`] = true
      }
    }
  }

  export let showNumeric = true
  export let showLabels = true

  export let selectDimensions = true

  export let matrixWidth = 280
  export let matrixHeight = 100
  export let scrollbarHeight = 14

  let dimX = null
  let dimY = null

  $: {
    let [scale, dim] = selectedDimension.split(".", 2)
    let dims = Object.keys(dimensions[scale])
    dims.splice(dims.indexOf(dim), 1)
    dimX = `${scale}.${dims[0]}`
    dimY = `${scale}.${dims[1]}`
  }

  $: sliderWidth = matrixWidth - 74
</script>

<div class="">
  <div class="" style="background: {background};">
    {#if showMatrix}
      <Matrix
        bind:color
        dimensionX={dimX}
        dimensionY={dimY}
        width={matrixWidth}
        height={matrixHeight}
      />
    {/if}

    {#if showSliders}
      {#if tabbed}
        <div class="flex mt-1">
          {#each Object.keys(dimensions) as scale}
            {#if Object.keys(dimensions[scale]).some((dim) => showSliders[`${scale}.${dim}`])}
              <button
                class="uppercase font-bold px-1 mx-1 border-b border-gray-600"
                class:border-b-2={selectedTab === scale}
                on:click={() => {
                  selectedTab = scale
                  selectedDimension = `${scale}.${Object.keys(dimensions[scale])[0]}`
                }}
              >
                {scale}
              </button>
            {/if}
          {/each}
        </div>
      {/if}

      {#each Object.keys(dimensions) as scale}
        {#if !tabbed || selectedTab === scale}
          <div class="mt-1">
            {#each Object.keys(dimensions[scale]) as dim}
              {#if showSliders[`${scale}.${dim}`]}
                <div class="flex items-center h-6">
                  {#if selectDimensions}
                    <input
                      class="inline-block mr-1 w-4"
                      type="radio"
                      bind:group={selectedDimension}
                      value="{scale}.{dim}"
                      id="{scale}-{dim}"
                    />
                  {/if}
                  {#if showLabels}
                    <label class="w-4" for="{scale}-{dim}">{dim.toUpperCase()}</label>
                  {/if}
                  <ScrollBar
                    width={sliderWidth}
                    height={scrollbarHeight}
                    dimension="{scale}.{dim}"
                    bind:color
                  />

                  {#if showNumeric}
                    <DimensionInput bind:color dimension="{scale}.{dim}" />
                  {/if}
                </div>
              {/if}
            {/each}
          </div>
        {/if}
      {/each}
    {/if}
  </div>
</div>
