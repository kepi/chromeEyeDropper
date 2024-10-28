import { fakeBrowser } from "wxt/testing"

fakeBrowser.browserAction.setBadgeBackgroundColor = async (_details) => {}
fakeBrowser.browserAction.setBadgeText = async (_details) => {}
fakeBrowser.browserAction.setBadgeTextColor = async (_details) => {}

export default fakeBrowser
