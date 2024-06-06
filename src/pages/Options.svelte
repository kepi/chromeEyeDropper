<script lang="ts">
  import Palette from "../lib/Palette.svelte"
  import ColorBox from "../lib/ColorBox.svelte"
  import PickFromWebpageButton from "../lib/PickFromWebpageButton.svelte"
  import { random } from "@ctrl/tinycolor"
  import { autoClipboard } from "../store"
</script>

<div class="navbar bg-base-100">
  <div class="navbar-start">
    <div class="dropdown">
      <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h8m-8 6h16"
          /></svg
        >
      </div>
      <ul
        tabindex="0"
        class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
      >
        <li><a>Options</a></li>
        <li><a>Palettes</a></li>
      </ul>
    </div>
    <a class="btn btn-ghost text-xl">Eye Dropper</a>
  </div>
  <div class="navbar-center hidden lg:flex">
    <ul class="menu menu-horizontal px-1">
      <li><a>Options</a></li>
      <li><a>Palettes</a></li>
    </ul>
  </div>
  <div class="navbar-end">
    <a class="btn">About</a>
  </div>
</div>

<div>
  <h1 class="text-3xl px-6 pb-4">Options</h1>
  <h2 class="text-2xl px-6 py-2 my-2 bg-primary text-black">Copy to clipboard</h2>

  <div class="w-max px-6">
    <div class="form-control">
      <label class="label cursor-pointer">
        <input
          type="checkbox"
          name="autoClipboard"
          bind:checked={$autoClipboard}
          class="checkbox checkbox-primary mr-3"
        />
        <span class="label-text">Copy color to clipboard</span>
      </label>

      <div class="pl-6">
        <label class="label cursor-pointer">
          <input type="radio" name="radio-2" class="radio radio-primary mr-3" checked />
          <span class="label-text"
            ># RGB Hex color<code class="badge badge-accent">#aabbcc</code></span
          >
        </label>
        <label class="label cursor-pointer">
          <input type="radio" name="radio-2" class="radio radio-primary mr-3" checked />
          <span class="label-text">RGB Hex color<code class="badge badge-accent">aabbcc</code></span
          >
        </label>
      </div>
    </div>
  </div>

  <h2 class="text-2xl px-6 py-2 my-2 bg-primary text-black">Keyboard shortcuts</h2>
  <div class="w-max px-6">
    <div>
      <span class="text-xl">Pick color from current webpage:</span>
      <span class="text-xl kbd">Alt+P</span>
      <p class="prose">
        You can change this shortcut at <a href="chrome://extensions/shortcuts"
          >Chrome's Extensions Keyboard Shortcut page</a
        >.
      </p>
    </div>
    <div>
      <span class="text-xl">Cancel Pick:</span>
      <span class="kbd text-xl">Esc</span>
      <p class="prose">
        Simply cancel active picking color from web page. No color will be stored in history.
      </p>

      <div class="pl-6 form-control">
        <label class="label cursor-pointer">
          <input type="checkbox" checked="checked" class="checkbox checkbox-primary mr-3" />
          <span class="label-text">also cancel with <span class="kbd">Mouse Right Click</span></span
          >
        </label>
      </div>
    </div>
  </div>
</div>
