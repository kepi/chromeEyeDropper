import browser, { type Runtime } from "webextension-polyfill"
import { checkStorage } from "./storage"
import { paletteGetColor, paletteSetColor } from "./palette"

const NEED_DROPPER_VERSION = 14

async function pickFromWeb(tabId?: number) {
  console.log("picking from webpage")

  tabId ??= await getTabId()
  if (tabId == null) return

  await injectDrop(tabId)

  const options: EdropperOptions = {
    cursor: "default",
    enableColorToolbox: true,
    enableColorTooltip: true,
    enableRightClickDeactivate: true,
  }

  sendMessage(
    {
      type: "pickup-activate",
      options,
    },
    tabId,
  )
}

async function sendMessage(message: unknown, tabId?: number) {
  tabId ??= await getTabId()
  if (tabId == null) return

  return browser.tabs.sendMessage(tabId, message)
}

async function needInject(tabId: number) {
  console.log("needInject?")
  try {
    const eDropperVersion = await sendMessage({ command: "version" }, tabId)
    console.log("checking", eDropperVersion)
    if (eDropperVersion < NEED_DROPPER_VERSION) {
      console.log(`eDropper is ${eDropperVersion} which is lower than ${NEED_DROPPER_VERSION}`)
    } else {
      console.log(`eDropper version is already ${eDropperVersion}`)
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
      files: ["src/injects/edropper.js"],
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

async function messageHandler(message: Message, sender: Runtime.MessageSender) {
  console.log(
    sender.tab ? "from a content script:" + sender.tab.url : "from the extension",
    message,
  )

  switch (message.command) {
    case "pick-from-web":
      pickFromWeb(message.tabId)
      break

    case "capture":
      return capture()

    case "set-color":
      if (message.color) {
        setColor(message.color)
      }
  }

  return { result: "passed" }
}

function commandHandler(command: string) {
  console.log(`commandHandler: ${command}`)
  switch (command) {
    case "pick-from-webpage":
      pickFromWeb()
      break
  }
}

function onInstalledHandler(details: Runtime.OnInstalledDetailsType) {
  console.log("Extension installed:", details)
  checkStorage()

  /**
   * When Eye Dropper is just installed, we want to display nice
   * page to new users.
   */
  if (details.reason === "install") {
    console.info("Extension has been installed.")
    browser.tabs.create({
      url: "https://eyedropper.org/installed",
      active: true,
    })
  }
}

async function initBadge() {
  console.log("init badge")
  await browser.action.setBadgeText({
    text: " ",
  })
  const color = await paletteGetColor()
  console.log("badge color", color)
  if (color) {
    await browser.action.setBadgeBackgroundColor({
      color,
    })
  }
}

async function init() {
  initBadge()
}

browser.commands.onCommand.addListener(commandHandler)
browser.runtime.onInstalled.addListener(onInstalledHandler)
browser.runtime.onMessage.addListener(messageHandler)

init()
