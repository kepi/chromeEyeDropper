<script lang="ts">
  import pStore from "~/allPalettesStore"
  import { Icon } from "@steeze-ui/svelte-icon"
  import { Palette as PaletteIcon } from "@steeze-ui/lucide-icons"
  import { popupDialog } from "~/store"
  import PaletteTab from "./PaletteTab.svelte"

  const toggle = (what: string) => {
    $popupDialog = $popupDialog === what ? "palette" : what
  }

  let palettesActive = $derived($popupDialog === "palettes")

  const close = () => {
    $popupDialog = "palette"
  }

  let ids = $derived(
    Object.keys($pStore)
      .filter((key) => /^[0-9]+$/.test(key))
      .map((key) => $pStore[Number(key)])
      .sort((a, b) => a.weight - b.weight)
      .map((meta) => meta.id),
  )
</script>

{#if $pStore.active}
  <div class="mr-4 mt-6 flex justify-between w-full">
    <div class="flex items-center gap-1 bg-slate-100 rounded-t pt-1">
      <div role="tablist" class="tabs tabs-lifted tabs-xs">
        <div
          class="h-6 tab [--tab-border-color:#cbd5e1]"
          class:tab-active={palettesActive}
          role="tab"
        >
          <button
            class="flex"
            onclick={() => {
              toggle("palettes")
            }}
          >
            <Icon src={PaletteIcon} class="w-4 h-4 stroke-slate-600 hover:stroke-primary" />
          </button>
        </div>
        {#each ids as id}
          <PaletteTab paletteId={Number(id)} />
        {/each}
      </div>
    </div>
    {#if $popupDialog !== "palette"}
      <!-- 147px is here so poup doesn't rescale when switching between wide and normal dialog -->
      <div class="w-[147px] flex flex-row-reverse">
        <button class="p-1 px-2 bg-slate-100 rounded" onclick={close}> ✖ </button>
      </div>
    {/if}
  </div>
{/if}
