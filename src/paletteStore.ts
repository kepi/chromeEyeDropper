// TODO listen for store changes (like in syncedWriteable)
// TODO function to wipePalette
// TODO finish palette sorting in palette.ts
import { getPalette, type Palette } from "./palette"
import { writable, type Writable } from "svelte/store"

type PaletteWritableStore = Writable<Palette>
export interface PaletteStore extends PaletteWritableStore {
  destroy: () => void
}

export default function paletteStore(id?: number) {
  const { set, update, subscribe } = writable<Palette>({
    id: 0,
    name: "nothing here",
    createdAt: Date.now(),
    sortBy: "def",
    colors: [],
  })

  function destroy() {
    update((st) => {
      st.name = "deleted"

      // TODO
      // unsubscribe from listening to store changes
      // reset palette somehow?
      // delete in syncedstorage
      console.log("deleting", st.id)

      return st
    })
  }

  function loadState() {
    Promise.resolve(getPalette(id)).then((value) => {
      set(value)
    })
  }
  loadState()

  return { subscribe, set, update, destroy }
}
