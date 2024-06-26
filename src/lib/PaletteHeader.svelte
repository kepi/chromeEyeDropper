<script lang="ts">
  import pStore from "../allPalettesStore"
  import { Icon } from "@steeze-ui/svelte-icon"
  import { Download, Move, Palette as PaletteIcon, Trash2 } from "@steeze-ui/lucide-icons"
  import { sortByInfo } from "../palette"
  import { popupDialog } from "../store"

  const toggle = (what: string) => {
    $popupDialog = $popupDialog === what ? "palette" : what
  }

  $: sortBy = $pStore.active?.sortBy ?? "m:asc"
  $: sortInfo = sortByInfo[sortBy]
</script>

{#if $pStore.active}
  <div class="mr-4 mt-6 flex justify-between">
    <div class="flex items-center gap-1">
      <div class="tooltip tooltip-right" data-tip="Manage Palettes">
        <button
          class="flex"
          on:click={() => {
            toggle("palettes")
          }}
        >
          <Icon src={PaletteIcon} class="w-4 h-4 stroke-slate-600 hover:stroke-primary" />
        </button>
      </div>
      <div class="text-nowrap max-w-28">
        <button
          class="text-sm hover:text-primary tooltip tooltip-bottom flex gap-1 items-center"
          data-tip={$pStore.active.name}
          on:click={() => {
            toggle("palettes")
          }}
        >
          <div class="text-xs">#{$pStore.active.id}:</div>
          <div class="font-bold">
            <div class="truncate max-w-[104px]">{$pStore.active.name}</div>
          </div>
        </button>
      </div>
    </div>
    <div class="flex items-center gap-1">
      <div class="tooltip tooltip-bottom" data-tip="Change sorting of active Palette">
        <button class="flex gap-1 group" on:click={() => toggle("sort")}>
          <Icon src={sortInfo.icon} class="w-4 h-4 stroke-slate-600 group-hover:stroke-primary" />
          <Icon
            src={sortInfo.iconOrder}
            class="w-4 h-4 stroke-slate-600 group-hover:stroke-primary"
          />
        </button>
      </div>
      <div class="text-slate-300">|</div>
      <div class="tooltip tooltip-bottom" data-tip="Rearrange or trash colors in Palette">
        <button
          class="flex"
          on:click={() => {
            toggle("edit")
          }}
        >
          <Icon src={Move} class="w-4 h-4 stroke-slate-600 hover:stroke-primary" />
        </button>
      </div>
      <div class="text-slate-300">|</div>
      <div class="tooltip tooltip-bottom" data-tip="Export your Palettes">
        <button
          class="flex"
          on:click={() => {
            toggle("export")
          }}
        >
          <Icon src={Download} class="w-4 h-4 stroke-slate-600 hover:stroke-primary" />
        </button>
      </div>
      <div class="text-slate-300">|</div>
      <div class="tooltip tooltip-bottom" data-tip="Wipe colors from active Palette">
        <button
          class="flex"
          on:click={() => {
            toggle("wipe")
          }}
        >
          <Icon src={Trash2} class="w-4 h-4 stroke-slate-600 hover:stroke-primary" />
        </button>
      </div>
    </div>
  </div>
{/if}
