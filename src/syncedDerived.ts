import storage, { type Schema } from "./storage"
import browser from "webextension-polyfill"
import { derived, type Readable } from "svelte/store"
import { toString } from "./helpers"

export default function syncedDerived<K extends keyof Schema>(
  key: Readable<K>,
  initialValue: Schema[K],
) {
  let guard: {}

  return derived(
    key,
    ($key, set) => {
      const inner = (guard = {})

      set(initialValue)

      browser.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === "sync") {
          const change = changes[$key]
          if (change) {
            if (change.newValue === null) {
              set(initialValue)
              return
            }

            try {
              set(JSON.parse(toString(change.newValue)))
            } catch {
              set(change.newValue as Schema[K])
            }
          }
        }
      })

      Promise.resolve(storage.getItem($key)).then((value) => {
        if (guard === inner) {
          if (value !== null) {
            set(value)
          }
        }
      })
    },
    initialValue,
  )
}
