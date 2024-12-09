<script lang="ts">
  import pStore from "~/allPalettesStore"
  import { Icon } from "@steeze-ui/svelte-icon"
  import { Move, Trash2 } from "@steeze-ui/lucide-icons"
  import { popupDialog } from "~/store"
  import { sortByInfo } from "~/palette"

  let sortBy = $derived($pStore.active?.sortBy ?? "m:asc")
  let sortInfo = $derived(sortByInfo[sortBy])

  const toggle = (what: string) => {
    $popupDialog = $popupDialog === what ? "palette" : what
  }
</script>

<div class="flex items-center justify-end gap-1">
  <div class="tooltip tooltip-bottom" data-tip="Change sorting of active Palette">
    <button class="flex gap-1 group" onclick={() => toggle("sort")}>
      <Icon src={sortInfo.icon} class="w-4 h-4 stroke-slate-600 group-hover:stroke-primary" />
      <Icon src={sortInfo.iconOrder} class="w-4 h-4 stroke-slate-600 group-hover:stroke-primary" />
    </button>
  </div>
  <div class="text-slate-300">|</div>
  <div class="tooltip tooltip-bottom" data-tip="Rearrange or trash colors in Palette">
    <button
      class="flex"
      onclick={() => {
        toggle("edit")
      }}
    >
      <Icon src={Move} class="w-4 h-4 stroke-slate-600 hover:stroke-primary" />
    </button>
  </div>
  <div class="text-slate-300">|</div>
  <div class="tooltip tooltip-bottom" data-tip="Wipe colors from active Palette">
    <button
      class="flex"
      onclick={() => {
        toggle("wipe")
      }}
    >
      <Icon src={Trash2} class="w-4 h-4 stroke-slate-600 hover:stroke-primary" />
    </button>
  </div>
</div>
