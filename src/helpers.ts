// module "helpers"
import { match, P } from "ts-pattern"

interface ElementAttributes {
  [key: string]: string
}

export function createNode(node: string, attributes: ElementAttributes): HTMLElement {
  const el = document.createElement(node)
  for (let key in attributes) {
    el.setAttribute(key, attributes[key])
  }
  return el
}

export const toString = (value: unknown): string =>
  match(value)
    .with(P.string, (str) => str)
    .with(P.number, (num) => num.toFixed(2))
    .with(P.boolean, (bool) => `${bool}`)
    .otherwise(() => "Unknown")

export const capitalize = (str: string = "", lowerRest = false): Capitalize<string> =>
  (str.slice(0, 1).toUpperCase() +
    (lowerRest ? str.slice(1).toLowerCase() : str.slice(1))) as Capitalize<string>

function getRestrictedProtocols(browser: string) {
  const firefoxProtos = ["about", "moz", "resource", "chrome", "jar"]

  const chromeProtos = ["chrome", "data", "devtools"]

  const edgeProtos = chromeProtos.concat("edge")

  if (browser === "firefox") {
    return firefoxProtos
  } else if (browser === "edge") {
    return edgeProtos
  }

  return chromeProtos
}

export function isProtoRestricted(protocol: string, browser = import.meta.env.BROWSER) {
  const restrictedProtocols = getRestrictedProtocols(browser)

  for (let restrictedProtocol of restrictedProtocols) {
    if (protocol.startsWith(restrictedProtocol)) {
      return true
    }
  }

  return false
}

export function isSiteRestricted(url: URL, browser = import.meta.env.BROWSER) {
  const firefoxSites = [
    "accounts-static.cdn.mozilla.net",
    "accounts.firefox.com",
    "addons.cdn.mozilla.net",
    "addons.mozilla.org",
    "api.accounts.firefox.com",
    "content.cdn.mozilla.net",
    "discovery.addons.mozilla.org",
    "install.mozilla.org",
    "oauth.accounts.firefox.com",
    "profile.accounts.firefox.com",
    "support.mozilla.org",
    "sync.services.mozilla.com",
  ]

  const chromeURLs = ["https://chrome.google.com/webstore", "https://chromewebstore.google.com"]

  const edgeURLs = chromeURLs.concat("https://microsoftedge.microsoft.com/addons")

  if (browser === "firefox") {
    for (let restrictedSite of firefoxSites) {
      if (url.hostname === restrictedSite) {
        return true
      }
    }
  } else {
    const urls = browser === "edge" ? edgeURLs : chromeURLs

    for (let restrictedURL of urls) {
      if (url.toString().startsWith(restrictedURL)) {
        return true
      }
    }
  }
}

export function isNumber(input: unknown): input is number {
  return !isNaN(Number(input))
}
