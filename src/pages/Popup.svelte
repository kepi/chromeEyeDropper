<script lang="ts">
  import Palette from "../lib/Palette.svelte"
  import ColorBox from "../lib/ColorBox.svelte"
  import PickFromWebpageButton from "../lib/PickFromWebpageButton.svelte"
  import { selectedColor, newColor } from "../store"
  import Link from "../Link.svelte"
</script>

<div class="container max-w-2xl">
  <div class="flex flex-nowrap p-2 gap-4">
    <div class="flex-grow min-w-72 pl-2">
      <div class="py-4">
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
  <div class="bg-gray-100 p-2 flex gap-4 justify-between">
    <div class="font-bold">Eye Dropper</div>
    <div class="flex gap-2">
      <Link href="https://eyedropper.org">hp</Link>
      <Link href="https://github.com/kepi/chromeEyeDropper/issues">bugs</Link>
      <Link href="/src/popup.html">popup</Link>
      <Link href="/src/options.html">options</Link>
    </div>
  </div>
</div>
