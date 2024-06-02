import browser from "webextension-polyfill"
import { defineExtensionStorage } from "@webext-core/storage"

interface Schema {
  selectedColor: string
}
const extensionStorage = defineExtensionStorage<Schema>(browser.storage.sync)

export default extensionStorage
