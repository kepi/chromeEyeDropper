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

  export let matrixWidth = 300
  export let matrixHeight = 200
  export let scrollbarHeight = 20

  let dimX = null
  let dimY = null

  $: {
    let [scale, dim] = selectedDimension.split(".", 2)
    let dims = Object.keys(dimensions[scale])
    dims.splice(dims.indexOf(dim), 1)
    dimX = `${scale}.${dims[0]}`
    dimY = `${scale}.${dims[1]}`
  }

  $: sliderWidth =
    matrixWidth - (selectDimensions ? 25 : 0) - (showLabels ? 25 : 0) - (showNumeric ? 65 : 0)
</script>

<div class="color-picker">
  <div class="color-picker-controls" style="background: {background};">
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
        <div class="tab-bar">
          {#each Object.keys(dimensions) as scale}
            {#if Object.keys(dimensions[scale]).some((dim) => showSliders[`${scale}.${dim}`])}
              <button
                class="tab {selectedTab === scale ? 'active' : ''}"
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
          <div class="group">
            {#each Object.keys(dimensions[scale]) as dim}
              {#if showSliders[`${scale}.${dim}`]}
                <div class="slider">
                  {#if selectDimensions}
                    <input
                      type="radio"
                      bind:group={selectedDimension}
                      value="{scale}.{dim}"
                      id="{scale}-{dim}"
                    />
                  {/if}
                  {#if showLabels}
                    <label for="{scale}-{dim}">{dim.toUpperCase()}</label>
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

<style>
  .color-picker {
    display: inline-block;
    position: relative;
  }
  .tab-bar {
    display: flex;
    height: 30px;
    line-height: 30px;
  }

  .tab {
    margin: 0 5px;
    padding: 0 3px;
    border-bottom: 1px solid #aaa;
    cursor: pointer;
    text-transform: uppercase;
    font-weight: bold;
  }

  .tab.active {
    border-bottom-width: 3px;
  }

  .group {
    margin: 5px 0 0 0;
  }

  .slider {
    display: flex;
    align-items: center;
  }

  label {
    display: inline;
    vertical-align: middle;
    margin: 0;
  }

  .slider label {
    padding: 0 5px 0 0;
    width: 20px;
  }

  input[type="radio"] {
    display: inline-block;
    margin: 0 5px 0 0;
    width: 20px;
  }
</style>
