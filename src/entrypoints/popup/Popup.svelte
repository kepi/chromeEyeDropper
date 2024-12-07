<script lang="ts">
  import ColorBox from "~/lib/ColorBox.svelte"
  import PickFromWebpageButton from "~/lib/PickFromWebpageButton.svelte"
  import { selectedColor, newColor, wideDialog, popupDialog } from "~/store"
  import { Icon } from "@steeze-ui/svelte-icon"
  import { SlidersHorizontal as Mixer } from "@steeze-ui/lucide-icons"
  import { copyToClipboard } from "~/clipboard"
  import WideDialog from "~/lib/WideDialog.svelte"
  import PaletteHeader from "~/lib/PaletteHeader.svelte"
  import ManualInput from "~/lib/ManualInput.svelte"
  import Palette from "@/lib/Palette.svelte"
  import PopupFooter from "./PopupFooter.svelte"

  let value = $derived(`linear-gradient(to right, ${$selectedColor} 0%, ${$newColor} 100%)`)

  const copy = () => {
    copyToClipboard(value)
  }

  const colorPicker = () => {
    $popupDialog = "picker"
  }
</script>

<div class="container min-w-[464px] max-w-[600px] m-auto">
  <div class="flex justify-between flex-nowrap p-1 w-full">
    <div class="w-full">
      <div class="pt-2">
        <PickFromWebpageButton />
      </div>
      <PaletteHeader />
      {#if !$wideDialog}
        <Palette />
      {/if}
    </div>
    <div class="">
      {#if !$wideDialog}
        <ColorBox label="Selected" color={$selectedColor} />{" "}
        <ColorBox label="New" color={$newColor} />
        {#if $popupDialog === "picker"}
          <ManualInput />
        {:else}
          <div class="flex justify-end pb-2">
            <button
              class="btn btn-xs font-normal btn-neutral hover:btn-info shadow-md"
              onclick={colorPicker}
            >
              <Icon class="hover:stroke-primary w-4 h-4 hover:scale-125" src={Mixer} />
              mix a color</button
            >
          </div>
        {/if}
      {/if}
    </div>
  </div>
  {#if $wideDialog}
    <WideDialog />
  {:else}
    <div
      class="flex p-2 align-middle tooltip tooltip-bottom"
      data-tip="Click to copy to clipboard"
      style="background: linear-gradient(to right, {$selectedColor} 0%, {$newColor} 100%)"
    >
      <button
        class="hover:bg-neutral hover:text-white rounded bg-white text-black px-1 font-mono text-xs text-nowrap"
        onclick={copy}
      >
        {value}
      </button>
    </div>
  {/if}
  <PopupFooter />
</div>
