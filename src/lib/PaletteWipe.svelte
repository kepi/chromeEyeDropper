<script lang="ts">
  import pStore from "~/allPalettesStore"
  import { paletteWipe } from "~/palette"
  import { popupDialog } from "~/store"

  const close = () => {
    $popupDialog = "palette"
  }

  const wipeClean = () => {
    if ($pStore.active === undefined) return

    paletteWipe($pStore.active.id)
    close()
  }

  const wipeDefault = () => {
    if ($pStore.active === undefined) return

    paletteWipe($pStore.active.id, { colors: "default" })
    close()
  }

  const wipeRandom = () => {
    if ($pStore.active === undefined) return

    paletteWipe($pStore.active.id, { colors: "random" })
    close()
  }
</script>

<h4>Wipe your palette clean?</h4>
<p>
  There is no comming back! All colors in your current palette <b>will be deleted</b>.
</p>
<p>
  <b>You can't restore them after wipe!</b>
</p>
<div class="gap-2 flex flex-wrap">
  <button class="btn btn-sm btn-secondary" onclick={wipeClean}>wipe clean</button>
  <button class="btn btn-sm btn-secondary" onclick={wipeDefault}
    >wipe and add default colors</button
  >
  <button class="btn btn-sm btn-secondary" onclick={wipeRandom}
    >wipe and add some random colors</button
  >
</div>
<div class="flex gap-2 items-center mt-2">
  <p>I changed my mind,</p>
  <button class="btn btn-sm btn-primary" onclick={close}>leave my colors alone.</button>
</div>
