<script lang="ts">
  import {
    autoClipboard,
    autoClipboardType,
    enableColorToolbox,
    enableColorTooltip,
    enableRightClickDeactivate,
    dropperCursor,
  } from "../store"
  import cursorDefault from "/img/cursor_default.png"
  import cursorCrosshair from "/img/cursor_crosshair.png"
  import Link from "../Link.svelte"
</script>

<div>
  <h1 class="text-3xl px-6 pb-4 pt-4">Eye Dropper Options</h1>
  <h2 class="text-2xl px-6 py-2 my-2 bg-primary text-black">Copy to clipboard</h2>

  <div class="w-max px-6">
    <div class="form-control">
      <label class="label justify-start cursor-pointer">
        <input
          type="checkbox"
          name="autoClipboard"
          bind:checked={$autoClipboard}
          class="checkbox checkbox-primary mr-3"
        />
        <span class="label-text">Copy color to clipboard</span>
      </label>

      <div class="pl-12">
        <label class="label justify-start cursor-pointer">
          <input
            type="radio"
            name="autoClipboardType"
            value="hex6"
            bind:group={$autoClipboardType}
            disabled={!$autoClipboard}
            class="radio radio-primary mr-3"
          />
          <span class="label-text"
            ># RGB Hex color <code class="badge badge-accent">#aabbcc</code></span
          >
        </label>
        <label class="label justify-start cursor-pointer">
          <input
            type="radio"
            name="autoClipboardType"
            value="nhex6"
            bind:group={$autoClipboardType}
            disabled={!$autoClipboard}
            class="radio radio-primary mr-3"
          />
          <span class="label-text"
            >RGB Hex color <code class="badge badge-accent">aabbcc</code></span
          >
        </label>
      </div>
    </div>
  </div>

  <h2 class="text-2xl px-6 py-2 my-2 bg-primary text-black">Keyboard shortcuts</h2>
  <div class="px-6">
    <div class="pb-3 border-b border-b-primary mb-3">
      <span class="text-xl">Pick color from current webpage:</span>
      <span class="text-xl ml-2 kbd">Alt+P</span>
      <p class="prose">
        You can change this shortcut at <Link href="chrome://extensions/shortcuts"
          >Chrome's Extensions Keyboard Shortcut page</Link
        >.
      </p>
    </div>
    <div>
      <span class="text-xl">Cancel Pick:</span>
      <span class="kbd ml-2 text-xl">Esc</span>
      <p class="prose">
        When are you in process of picking color from a web page, you can cancel it with Esc. No
        color will be stored in history.
      </p>

      <div class="pl-6 form-control">
        <label class="label justify-start cursor-pointer">
          <input
            type="checkbox"
            bind:checked={$enableRightClickDeactivate}
            class="checkbox checkbox-primary mr-3"
          />
          <span class="label-text">also cancel with <span class="kbd">Mouse Right Click</span></span
          >
        </label>
      </div>
    </div>
  </div>

  <h2 class="text-2xl px-6 py-2 my-2 bg-primary text-black">Pick from Web Page</h2>
  <div class="px-6 form-control">
    <div class="pb-3 border-b border-b-primary mb-3">
      <div class="text-xl pb-2">Features</div>
      <label class="label justify-start cursor-pointer">
        <input
          type="checkbox"
          name="autoClipboard"
          bind:checked={$enableColorToolbox}
          class="checkbox checkbox-primary mr-3"
        />
        <span class="label-text">Enable box with color information in right bottom corner.</span>
      </label>
      <label class="label justify-start cursor-pointer">
        <input
          type="checkbox"
          name="autoClipboard"
          bind:checked={$enableColorTooltip}
          class="checkbox checkbox-primary mr-3"
        />
        <span class="label-text">Enable color tooltip next to the mouse cursor.</span>
      </label>
    </div>
    <div>
      <div class="text-xl">Eye Dropper Cursor</div>
      <p class="text-base py-2 italic">
        Hover over option text to see how it really would look like on your system.
      </p>
      <label class="label justify-start cursor-default">
        <input
          type="radio"
          name="dropperCursor"
          value="default"
          bind:group={$dropperCursor}
          class="radio radio-primary mr-3"
        />
        <span class="label-text flex gap-2"><img alt="default" src={cursorDefault} /> default</span>
      </label>
      <label class="label justify-start cursor-crosshair">
        <input
          type="radio"
          name="dropperCursor"
          value="crosshair"
          bind:group={$dropperCursor}
          class="radio radio-primary mr-3"
        />
        <span class="label-text flex gap-2"
          ><img alt="crosshair" src={cursorCrosshair} /> crosshair</span
        >
      </label>
    </div>
  </div>
</div>
