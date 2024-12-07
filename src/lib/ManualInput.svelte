<script lang="ts">
  import { TinyColor } from "@ctrl/tinycolor"
  import { selectedColor, newColor } from "~/store"
  import { noColor } from "~/palette"

  let hexColor = $state("")
  let acceptedHexColor = $state(noColor())

  const onInput = (e: Event) => {
    const inputColor = new TinyColor((e.target as HTMLInputElement).value)
    if (inputColor.isValid) {
      $newColor = inputColor.toString()
      acceptedHexColor = inputColor.toString()
    }
  }

  const onSubmit = (event: Event) => {
    event.preventDefault()
    if ($newColor) {
      $selectedColor = $newColor
    }
  }
</script>

<div class="mb-2 flex flex-row-reverse w-[9.2rem]">
  <div
    class="shadow-lg flex w-full flex-wrap gap-2 rounded p-2 text-xs"
    style="background-color: {acceptedHexColor}"
  >
    <form onsubmit={onSubmit}>
      <!-- svelte-ignore a11y_autofocus -->
      <input
        class="input input-xs input-bordered w-24 rounded"
        type="text"
        autofocus
        name="hexinput"
        bind:value={hexColor}
        oninput={onInput}
      />
    </form>
    <div class="bg-white rounded w-full p-1">
      <div>Input color ↑ as:</div>
      <ul class="my-2 ml-2">
        <li>‣ RGB hex</li>
        <li>‣ Named Color</li>
        <li>‣ HSL, HSV</li>
        <li>‣ CMYK</li>
      </ul>
      <div><span class="kbd kbd-xs">Enter</span> to add.</div>
    </div>
  </div>
  <div class="text-xs w-4 [writing-mode:vertical-lr] text-center rotate-180 font-mono">
    Quick input
  </div>
</div>
