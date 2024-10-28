import { defineExtensionMessaging } from "@webext-core/messaging"

interface ProtocolMap {
  getVersion(): number
  pickupActivate(data: EdropperOptions): void
  pickupDeactivate(): void
  pickFromWeb(data: number): void
  setColor(data: string): void
  capture(): string | null
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>()
