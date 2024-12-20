import storage, { type Schema } from "./storage"
import browser from "webextension-polyfill"
import { writable, get, type Writable } from "svelte/store"
import { toString } from "./helpers"

type SyncedWritable<T> = Writable<T> & {
  clear: () => void
}

async function initializeSyncedWritable<K extends keyof Schema>(
  key: K,
  initialValue: Schema[K],
  w: Writable<Schema[K]>,
) {
  const stored = await storage.getItem(key)
  w.set(stored ?? initialValue)

  /**
   * Listen for sync store changes and update value of store
   */
  browser.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "sync") {
      const change = changes[key]
      if (change) {
        if (change.newValue === null) {
          w.set(initialValue)
          return
        }

        try {
          w.set(JSON.parse(toString(change.newValue)))
        } catch {
          w.set(change.newValue as Schema[K])
        }
      }
    }
  })
}

export default function syncedWritable<K extends keyof Schema>(
  key: K,
  initialValue: Schema[K],
): SyncedWritable<Schema[K]> {
  const w = writable(initialValue)

  /**
   * Set writable value and inform subscribers.
   * */
  function set(...args: Parameters<typeof w.set>) {
    w.set(...args)
    const val = get(w)
    if (val !== null) {
      storage.setItem(key, val)
    }
  }

  /**
   * Update writable value using a callback and inform subscribers.
   * */
  function update(...args: Parameters<typeof w.update>) {
    w.update(...args)
    const val = get(w)
    if (val !== null) {
      storage.setItem(key, val)
    }
  }

  /**
   * Set initial value and remove item from storage.
   */
  function clear() {
    w.set(initialValue)
    storage.removeItem(key)
  }

  initializeSyncedWritable(key, initialValue, w).catch(console.error)

  return {
    subscribe: w.subscribe,
    set,
    update,
    clear,
  }
}
