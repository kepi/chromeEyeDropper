import browser from "webextension-polyfill"
import {
  paletteGetActive,
  paletteSetActive,
  palettesIds,
  getPalette,
  type Palette,
  paletteCreate,
  paletteDelete,
  paletteSetColors,
} from "./palette"
import { writable } from "svelte/store"
import type Browser from "webextension-polyfill"
import { toString } from "./helpers"

type AllPalettesStore = Record<number, Palette> & {
  active?: Palette
}

function createAllPalettesStore() {
  const { subscribe, update } = writable<AllPalettesStore>({
    active: {
      id: -1,
      name: "loading palettes...",
      createdAt: Date.now(),
      sortBy: "t:asc",
      colors: [],
      unsorted: [],
      deleted: [],
    },
  })

  function getValueFromChange(change: Browser.Storage.StorageChange) {
    if (change) {
      try {
        return JSON.parse(toString(change.newValue))
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

  function manualSort(
    active: Palette,
    fromTrash: boolean,
    toTrash: boolean,
    oldIndex: number,
    newIndex: number,
  ) {
    if (fromTrash) {
      oldIndex += active.unsorted.length
    }

    if (toTrash) {
      newIndex += active.unsorted.length
    }

    const colors = active.unsorted.concat(active.deleted)

    const movedColor = colors[oldIndex]

    // handle deleted flag
    if (toTrash) {
      if (movedColor.d === undefined) {
        movedColor.d = Date.now()
      }
    } else {
      movedColor.d = undefined
    }

    colors.splice(oldIndex, 1)
    colors.splice(newIndex, 0, movedColor)

    paletteSetColors(active.id, colors)
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
    manualSort,
  }
}

const pStore = createAllPalettesStore()
export default pStore
