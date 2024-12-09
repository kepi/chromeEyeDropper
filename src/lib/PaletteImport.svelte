<script lang="ts">
  import { importPalette, type PaletteJson } from "~/palette"
  import { Upload } from "@steeze-ui/lucide-icons"
  import { Icon } from "@steeze-ui/svelte-icon"

  let jsonToImport = $state("")

  let files: FileList | undefined = $state()
  let imported: number[] = $state([])
  let error = $state(false)
  let errorText = $state("")

  const tryImportPalette = async (paletteJson: unknown) => {
    try {
      const newId = await importPalette(paletteJson as PaletteJson)
      imported.push(newId)
    } catch {
      error = true
    }
  }

  const tryImport = async (value: string) => {
    error = false

    if (!value || value.trim() === "") {
      errorText = "Nothing to import, JSON is empty."
    }
    try {
      const parsedJson = JSON.parse(value)

      if (Array.isArray(parsedJson)) {
        for (let paletteJson of parsedJson) {
          await tryImportPalette(paletteJson)
        }
      } else {
        await tryImportPalette(parsedJson)
      }
    } catch {
      error = true
    }
  }

  const handleUpload = async (event: Event) => {
    event.preventDefault()
    error = false

    if (files !== undefined) {
      // traverse all files and import them
      Object.values(files).forEach(async (file) => {
        const fileText = await file.text()
        tryImport(fileText)
      })
    } else {
      error = true
      errorText = "No file to import."
    }
  }
</script>

<div class="prose">
  <h4 class="font-bold pt-2">Import Palettes</h4>
  {#if error}
    <div role="alert" class="alert alert-error">
      {#if errorText === ""}
        Import failed. Only valid JSON palettes can be imported. JSON has to have same format as one
        you get from Export.
      {:else}
        {errorText}
      {/if}
    </div>
  {/if}
  <form onsubmit={handleUpload}>
    <div class="flex items-center mb-8">
      <input
        name="uploadedFile"
        type="file"
        multiple
        accept="application/JSON"
        bind:files
        class="w-64 bg-red-200"
      />

      <button class="btn">
        <Icon class="hover:stroke-primary w-4 h-4" src={Upload} />
        Import from file
      </button>
    </div>
  </form>
  <textarea
    class="w-full h-48 font-mono text-xs bg-black text-white rounded p-2"
    name="jsonToImport"
    bind:value={jsonToImport}
    placeholder="Paste Palette JSON here">text</textarea
  >
  <button
    class="btn"
    onclick={() => {
      tryImport(jsonToImport)
    }}
  >
    <Icon class="hover:stroke-primary w-4 h-4" src={Upload} />
    Import from JSON
  </button>
</div>

<div class="toast toast-top toast-start">
  {#each imported as id (id)}
    <div class="alert alert-success">
      Palette #{id} imported!
    </div>
  {/each}
</div>
