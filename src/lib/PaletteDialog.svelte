<script lang="ts">
  export let toggle

  const close = (_event) => {
    toggle = !toggle
  }
</script>

<div class="bg-slate-200 p-4 rounded prose prose-sm relative">
  <slot />
  <div
    class="absolute right-0 top-0 w-8 h-8 hover:text-red-500 items-center justify-center flex cursor-pointer"
    on:click={close}
  >
    ✖
  </div>
</div>
