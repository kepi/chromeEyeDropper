<script lang="ts">
  export let toggle: boolean

  const close = () => {
    toggle = !toggle
  }
</script>

<div class="bg-slate-200 py-1 px-1 rounded prose prose-sm relative">
  <slot />
  <button
    class="absolute right-0 top-0 w-8 h-8 hover:text-red-500 items-center justify-center flex cursor-pointer"
    on:click={close}
  >
    ✖
  </button>
</div>
