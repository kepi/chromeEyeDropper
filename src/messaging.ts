import { defineExtensionMessaging } from "@webext-core/messaging"

interface ProtocolMap {
  getVersion(): number
  pickupActivate(data: EdropperOptions): PickResponse
  pickupDeactivate(): void
  pickFromWeb(data: number): PickResponse
  setColor(data: string): void
  capture(): string | null
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>()
