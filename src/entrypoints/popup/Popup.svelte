<script lang="ts">
  import Palette from "~/lib/Palette.svelte"
  import ColorBox from "~/lib/ColorBox.svelte"
  import PickFromWebpageButton from "~/lib/PickFromWebpageButton.svelte"
  import { selectedColor, newColor, wideDialog, popupDialog } from "~/store"
  import { Icon } from "@steeze-ui/svelte-icon"
  import Link from "~/Link.svelte"
  import {
    SlidersHorizontal as Mixer,
    Bug,
    House,
    Maximize2,
    Palette as PaletteIcon,
    Settings,
  } from "@steeze-ui/lucide-icons"
  import { copyToClipboard } from "~/clipboard"
  import WideDialog from "~/lib/WideDialog.svelte"
  import PaletteHeader from "~/lib/PaletteHeader.svelte"
  import ManualInput from "~/lib/ManualInput.svelte"

  $: value = `linear-gradient(to right, ${$selectedColor} 0%, ${$newColor} 100%)`

  const copy = () => {
    copyToClipboard(value)
  }

  const close = () => {
    $popupDialog = "palette"
  }

  const colorPicker = () => {
    $popupDialog = "picker"
  }

  const version = __APP_VERSION__
</script>

<div class="container min-w-[464px] max-w-[600px] relative m-auto">
  <div class="flex flex-nowrap p-1 gap-2">
    <div class="flex-grow w-full">
      <div class="pt-2">
        <PickFromWebpageButton />
      </div>
      {#if $wideDialog}
        <PaletteHeader />
      {:else}
        <Palette />
      {/if}
    </div>
    <div>
      {#if $wideDialog}
        <div class="absolute top-[70px] right-0">
          <button
            class="text-sm w-8 h-8 bg-slate-100 rounded hover:text-red-500 items-center justify-center flex cursor-pointer"
            on:click={close}
          >
            ✖
          </button>
        </div>
      {:else}
        <ColorBox label="Selected" color={$selectedColor} />{" "}
        <ColorBox label="New" color={$newColor} />
        {#if $popupDialog === "picker"}
          <ManualInput />
        {:else}
          <div class="flex justify-end pb-2">
            <button
              class="btn btn-xs font-normal btn-neutral hover:btn-info shadow-md"
              on:click={colorPicker}
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
  {/if}
  <div
    class="flex p-2 align-middle tooltip tooltip-bottom"
    data-tip="Click to copy to clipboard"
    style="background: linear-gradient(to right, {$selectedColor} 0%, {$newColor} 100%)"
  >
    <button
      class="hover:bg-neutral hover:text-white rounded bg-white text-black px-1 font-mono text-xs text-nowrap"
      on:click={copy}
    >
      {value}
    </button>
  </div>
  <div class="bg-gray-100 p-2 flex gap-4 justify-between">
    <div class="font-bold flex gap-1 items-center">
      <Link
        data-tip="Open ED Home Page"
        href="https://eyedropper.org"
        class="tooltip tooltip-right flex items-center gap-1 hover:text-primary"
      >
        <Icon src={PaletteIcon} class="w-6 h-6 hover:stroke-primary" />
        <div>Eye Dropper</div>
      </Link>
    </div>
    <div class="flex items-end text-gray-400 text-[0.65rem]">v{version}</div>
    <div class="flex gap-3">
      <Link class="tooltip tooltip-top" data-tip="ED Home Page" href="https://eyedropper.org"
        ><Icon src={House} class="stroke-normal w-4 h-4 hover:stroke-primary" /></Link
      >
      <Link
        class="tooltip tooltip-left"
        data-tip="Found a Bug? Have an Idea?"
        href="https://github.com/kepi/chromeEyeDropper/issues"
        ><Icon src={Bug} class="stroke-normal w-4 h-4 hover:stroke-primary" /></Link
      >
      <Link class="tooltip tooltip-left" data-tip="Open ED in a tab" href="/popup.html"
        ><Icon src={Maximize2} class="stroke-normal w-4 h-4 hover:stroke-primary" /></Link
      >
      <Link class="tooltip tooltip-left" data-tip="Customize ED behaviour" href="/options.html"
        ><Icon src={Settings} class="stroke-normal w-4 h-4 hover:stroke-primary" /></Link
      >
    </div>
  </div>
</div>
