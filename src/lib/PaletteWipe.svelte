<script lang="ts">
  import pStore from "../allPalettesStore"
  import { paletteWipe } from "../palette"

  export let toggle: boolean

  const dialogToggle = (_event) => {
    toggle = !toggle
  }

  const wipeClean = (_event) => {
    paletteWipe($pStore.active.id)
    toggle = false
  }

  const wipeDefault = (_event) => {
    paletteWipe($pStore.active.id, true)
    toggle = false
  }
</script>

<div class="bg-slate-200 p-4 rounded prose prose-sm relative">
  <h4>Wipe your palette clean?</h4>
  <p>
    There is no comming back! All colors in your current palette <b>will be deleted</b>.
  </p>
  <p>
    <b>You can't restore them after wipe!</b>
  </p>
  <div class="gap-2 flex flex-wrap">
    <button class="btn btn-sm btn-secondary" on:click={wipeClean}>wipe clean</button>
    <button class="btn btn-sm btn-secondary" on:click={wipeDefault}
      >wipe and add default colors</button
    >
  </div>
  <div class="flex gap-2 items-center mt-2">
    <p>I changed my mind,</p>
    <button class="btn btn-sm btn-primary" on:click={dialogToggle}>leave my colors alone.</button>
  </div>
</div>
