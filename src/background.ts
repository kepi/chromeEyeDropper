import browser, { type Runtime } from "webextension-polyfill"

const BG_VERSION = 25
const NEED_DROPPER_VERSION = 14

console.log(`bg version ${BG_VERSION}`)

async function pickFromWeb(tabId?: number) {
  console.log("picking from webpage")

  if (!tabId) {
    tabId = await getTabId()
  }

  if (tabId == undefined) {
    return
  }

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
  if (!tabId) {
    tabId = await getTabId()
  }
  if (tabId) {
    return browser.tabs.sendMessage(tabId, message)
  }
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

export async function getTabId() {
  let tabs = await browser.tabs.query({ active: true, currentWindow: true })
  return tabs[0].id
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

async function setBadgeColor(color: string) {
  console.info(`Setting badge color to ${color}`)
  await browser.action.setBadgeBackgroundColor({
    color,
  })
}

async function setColor(color: string) {
  console.log(`Setting color to ${color}`)
  await browser.storage.sync.set({
    selectedColor: color,
  })
  await setBadgeColor(color)
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
}

async function init() {
  await browser.action.setBadgeText({
    text: " ",
  })
}

browser.commands.onCommand.addListener(commandHandler)
browser.runtime.onInstalled.addListener(onInstalledHandler)
browser.runtime.onMessage.addListener(messageHandler)

init()
