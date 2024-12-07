<script lang="ts">
  import Link from "~/Link.svelte"
  import { Icon } from "@steeze-ui/svelte-icon"
  import { Bug, House, Maximize2, Palette as PaletteIcon, Settings } from "@steeze-ui/lucide-icons"
  const version = __APP_VERSION__
</script>

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
