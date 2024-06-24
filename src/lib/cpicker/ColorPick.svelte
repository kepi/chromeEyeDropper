<script>
  import { dimensions, getDimension } from "./dimensions"

  import ScrollBar from "./Scrollbar.svelte"
  import Matrix from "./Matrix.svelte"
  import DimInput from "./DimInput.svelte"

  export let color = "#ff9900"

  export let selectedDimension = "hsl.h"
  export let selectedTab = "hsl"
  export let background = "#fff"

  export let collapse = false
  export let tabbed = true

  export let handleWidth = 32
  export let handleHeight = 32

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

  let collapsed = true

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
  $: textboxWidth = matrixWidth - (showLabels ? 50 : 0)
</script>

<div class="color-picker {collapse ? 'collapse' : ''}">
  {#if collapse && !collapsed}
    <div class="color-picker-background" on:click={collapsePicker} />
  {/if}

  {#if collapse}
    <div
      class="color-picker-handle"
      style="width: {handleWidth}px; height: {handleHeight}px; background: {color.toHex()};"
    ></div>
  {/if}

  <div
    class="color-picker-controls {collapse && collapsed ? 'collapsed' : ''}"
    style="background: {background};"
  >
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
              <div
                class="tab {selectedTab === scale ? 'active' : ''}"
                on:click={() => {
                  selectedTab = scale
                  selectedDimension = `${scale}.${Object.keys(dimensions[scale])[0]}`
                }}
              >
                {scale}
              </div>
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
                    <DimInput bind:color dimension="{scale}.{dim}" />
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

  .color-picker-handle {
    border: 1px solid #666;
    border-radius: 5px;
    cursor: pointer;
  }

  .color-picker-background {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.2);
    z-index: 9999999;
  }

  .color-picker.collapse .color-picker-controls {
    position: absolute;
    top: -5px;
    left: -5px;

    border: 1px solid #666;
    border-radius: 5px;
    box-shadow: 2px 2px 5px 0px rgba(0, 0, 0, 0.4);
    padding: 5px;

    z-index: 100000000;
  }

  .color-picker.collapse .color-picker-controls.collapsed {
    display: none;
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

  .slider,
  .text {
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

  .text label {
    padding: 0 5px 0 0;
    width: 45px;
    text-align: right;
  }

  input[type="radio"] {
    display: inline-block;
    margin: 0 5px 0 0;
    width: 20px;
  }
</style>
