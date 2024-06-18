import browser from "webextension-polyfill"
import {
  paletteGetActive,
  paletteSetActive,
  palettesIds,
  getPalette,
  type Palette,
  paletteCreate,
  paletteDelete,
} from "./palette"
import { writable } from "svelte/store"
import type Browser from "webextension-polyfill"

type AllPalettesStore = Record<number, Palette> & {
  active?: Palette
}

function createAllPalettesStore() {
  const { subscribe, update } = writable<AllPalettesStore>({
    active: {
      id: -1,
      name: "loading palettes...",
      createdAt: Date.now(),
      sortBy: "def",
      colors: [],
    },
  })

  function getValueFromChange(change: Browser.Storage.StorageChange) {
    if (change) {
      try {
        return JSON.parse(change.newValue)
      } catch {
        return change.newValue
      }
    }
  }

  browser.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "sync") {
      // - active palette
      const paletteChange = changes["p"]
      if (paletteChange) {
        const id = getValueFromChange(paletteChange)
        setActive(id)
      }

      // - palette changes
      Object.keys(changes).forEach((key) => {
        const match = key.match(/^p([0-9]+)[cm]$/)
        if (match) {
          const change = changes[key]
          const paletteId = Number(match[1])

          const type = key.slice(-1)

          // palette colors update - if newValue is undefined, it means that
          // palette was deleted
          if (type === "c" && change.newValue) {
            updatePalette(paletteId)
            // sortBy changed?
          } else if (type === "m" && change.newValue) {
            updatePalette(paletteId)
          }
        }
      })
    }
  })

  async function createPalette(name: string) {
    const id = await paletteCreate(null, name, [])
    await updatePalette(id)
    switchPalette(id)
    return id
  }

  async function updatePalette(id: number) {
    const palette = await getPalette(id)
    addPalette(id, palette)
  }

  function addPalette(id: number, palette: Palette) {
    update((st) => {
      const active = st.active?.id === id ? { active: palette } : {}
      const n = {
        ...st,
        [id]: palette,
        ...active,
      }
      return n
    })
  }

  function destroyPalette(id: number) {
    update((st) => {
      const { [id]: removed, ...rest } = st
      return rest
    })

    paletteDelete(id)
  }

  function setActive(id: number) {
    update((st) => ({
      ...st,
      active: st[id],
    }))
  }

  function switchPalette(id: number) {
    paletteSetActive(id)
  }

  async function loadState() {
    const ids = await palettesIds()
    const updatePromises = ids.map(async (id) => {
      await updatePalette(id)
    })

    const activeId = await paletteGetActive()

    // we have to have palettes in place before setting active one
    await Promise.all(updatePromises)

    setActive(activeId)
  }

  loadState()

  return {
    subscribe,
    addPalette,
    destroyPalette,
    switchPalette,
    createPalette,
  }
}

const pStore = createAllPalettesStore()
export default pStore
