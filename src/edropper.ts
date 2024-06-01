import browser from "webextension-polyfill"
export const EDROPPER_VERSION = 14

// type SimpleMessage = {
//   command: string
// }

// type PickupMessage = {
//   command: "pickup-activate"
//   options: EDropperPageOptions
// }
// type UpdateMessage = {
//   command: "update-image"
//   data: string
// }

// type Message = SimpleMessage | PickupMessage | UpdateMessage

type Message = {
  command: string
  options?: EDropperPageOptions
  data?: string
}

export async function messageHandler(message: Message) {
  // Listen for pickup activate
  console.log("dropper: got message", message)
  switch (message.command) {
    case "version":
      return EDROPPER_VERSION
    // case "pickup-activate":
    //   if (message.options) {
    //     page.options = message.options
    //   }
    //   page.dropperActivate()
    //   break
    // case "pickup-deactivate":
    //   page.dropperDeactivate()
    //   break
    // case "update-image":
    //   console.log("dropper: background send me updated screenshot")
    //   page.imageData = message.data
    //   page.capture()
    //   break
  }
}
