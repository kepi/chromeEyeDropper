import browser, { type Runtime } from "webextension-polyfill"
import { checkStorage } from "~/storage"
import { paletteGetColor, paletteSetBadge, paletteSetColor } from "~/palette"
import { getSprintFromVersion, isBigUpdate, storeAppVersion } from "~/version"
import { settingsGet } from "~/settings"
import { onMessage, sendMessage } from "~/messaging"

const NEED_DROPPER_VERSION = 14

export type EdropperRequest = {
  type: string
  options: EdropperOptions
}

async function pickFromWeb(tabId?: number): Promise<PickResponse> {
  console.log("picking from webpage")

  tabId ??= await getTabId()
  if (tabId === null || tabId === undefined) return { status: "noTab" }

  await injectDrop(tabId)

  const options: EdropperOptions = {
    cursor: "default",
    enableColorToolbox: true,
    enableColorTooltip: true,
    enableRightClickDeactivate: true,
  }

  const timeoutDuration = 3000

  const timeoutPromise = new Promise<PickResponse>((resolve) =>
    setTimeout(() => resolve({ status: "timeout" }), timeoutDuration),
  )

  try {
    return await Promise.race([sendMessage("pickupActivate", options, tabId), timeoutPromise])
  } catch (error) {
    if (error instanceof Error) {
      if (error.message == "Could not establish connection. Receiving end does not exist.") {
        return { status: "injectFailed", error: error.message }
      }
      console.error(error)
      return { status: "unknownError", error: error.message }
    }
    console.error(error)
    return { status: "unknownError", error: `${error}` }
  }
}

async function needInject(tabId: number) {
  console.log("needInject?")
  try {
    const eDropperVersion = await sendMessage("getVersion", undefined, tabId)
    console.log("checking", eDropperVersion)

    if (eDropperVersion < NEED_DROPPER_VERSION) {
      console.log(`eDropper is ${eDropperVersion} which is lower than ${NEED_DROPPER_VERSION}`)
      return true
    } else {
      console.log(`eDropper version is already ${eDropperVersion}`)
      return false
    }
  } catch (error) {
    console.log("not injected")
    return true
  }
}

export async function getTab() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true })
  return tabs[0]
}

export async function getTabId() {
  const tab = await getTab()
  return tab.id
}

async function injectDrop(tabId: number) {
  console.log("want to inject")
  if (await needInject(tabId)) {
    console.log("need inject, injecting...")
    await browser.scripting.executeScript({
      target: { tabId },
      files: ["edropper.js"],
    })
  }
}

type Message = {
  command: string
  tabId?: number
  color?: string
  // args?: {
  //   [key: string]: string | number
  // }
}

async function capture() {
  let capturing = browser.tabs.captureVisibleTab()

  return capturing.then(
    (dataUri) => dataUri,
    (error) => {
      console.log("error when trying to capture screenshot", error)
      return null
    },
  )
}

async function setColor(color: string) {
  console.log(`Setting color to ${color}`)
  paletteSetColor(color, "ed")
}

async function messageHandler() {
  onMessage("pickFromWeb", (message) => {
    return pickFromWeb(message.data)
  })

  onMessage("setColor", (message) => {
    setColor(message.data)
  })

  onMessage("capture", () => capture())
}

function commandHandler(command: string) {
  console.log(`commandHandler: ${command}`)
  switch (command) {
    case "pick-from-webpage":
      pickFromWeb()
      break
  }
}

async function onInstalledHandler(details: Runtime.OnInstalledDetailsType) {
  console.log("Extension installed:", details)
  await checkStorage()

  /**
   * When Eye Dropper is just installed, we want to display nice
   * page to new users.
   */
  if (details.reason === "install") {
    console.info("Extension has been installed.")
    browser.tabs.create({
      url: `https://eyedropper.org/${import.meta.env.BROWSER}/installed/`,
      active: true,
    })

    /**
     * When Eye Dropper is updated, we want to display update page on
     * major updates.
     **/
  } else if (details.reason === "update") {
    console.info("Extension has been updated")

    const bigUpdate = await isBigUpdate()
    const sprint = getSprintFromVersion(__APP_VERSION__)
    const isOnUpdateEnabled = await settingsGet("enablePromoOnUpdate")

    // we always want to store new version first in case some unexpected thing
    // happens later, like browser crash, so we don't open tab twice
    await storeAppVersion()

    // if we have everything and this is big update, we can safely display
    // update page
    if (__APP_VERSION__ && bigUpdate && sprint !== null && isOnUpdateEnabled) {
      console.info("This is big update, show update tab.")
      browser.tabs.create({
        url: `https://eyedropper.org/${import.meta.env.BROWSER}/updated/${sprint}/`,
        active: true,
      })
    }
  }
}

async function initBadge() {
  console.log("init badge")

  // we have to set some badge text first
  //
  // on Firefox we are changing color of unicode character which we set as badge
  // text. Background is set as transparent.
  if (import.meta.env.FIREFOX) {
    await browser.browserAction.setBadgeText({
      // empty string doesn't work so I chose this unicode character
      text: "⏹",
    })

    await browser.browserAction.setBadgeBackgroundColor({
      color: [0, 0, 0, 0],
    })
    // on Chrome (and hopefully all chrome based) we are changing badge
    // background color and leaving text color default as string is empty
  } else {
    await browser.action.setBadgeText({ text: " " })
  }

  const color = await paletteGetColor()
  if (color) {
    paletteSetBadge(color)
  }
}

async function init() {
  console.log("worker init")
  initBadge()
}

export default defineBackground({
  type: "module",
  main() {
    browser.commands.onCommand.addListener(commandHandler)
    browser.runtime.onInstalled.addListener(onInstalledHandler)
    messageHandler()

    init()
  },
})
