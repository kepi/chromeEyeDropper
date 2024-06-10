<script lang="ts">
  import Palette from "../lib/Palette.svelte"
  import ColorBox from "../lib/ColorBox.svelte"
  import PickFromWebpageButton from "../lib/PickFromWebpageButton.svelte"
  import { random } from "@ctrl/tinycolor"
  import { selectedColor, newColor } from "../store"

  console.log("Hello from the popup!")
</script>

<div class="container max-w-2xl">
  <div class="flex flex-nowrap p-2">
    <div class="flex-grow min-w-72">
      <div class="p-4">
        <PickFromWebpageButton />
      </div>
      <Palette />
    </div>
    <div>
      <ColorBox label="Selected" color={$selectedColor} />{" "}
      <ColorBox label="New" color={$newColor} />
    </div>
  </div>
  <div
    class="flex p-2 align-middle"
    style="background: linear-gradient(to right, {$selectedColor} 0%, {$newColor} 100%)"
  >
    <code class="rounded bg-white text-black px-1 font-mono text-xs text-nowrap">
      linear-gradient(to right, {$selectedColor} 0%, {$newColor} 100%)
    </code>
  </div>
  <div class="bg-gray-100 p-2">Plus</div>
</div>
