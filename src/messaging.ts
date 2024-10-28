import { defineExtensionMessaging } from "@webext-core/messaging"

interface ProtocolMap {
  getVersion(): number
  pickupActivate(data: EdropperOptions): pickResponse
  pickupDeactivate(): void
  pickFromWeb(data: number): pickResponse
  setColor(data: string): void
  capture(): string | null
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>()
