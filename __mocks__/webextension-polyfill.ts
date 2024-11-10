import { fakeBrowser } from "wxt/testing"

// MV3
fakeBrowser.action.setBadgeBackgroundColor = async (_details) => {}

// MV2
fakeBrowser.browserAction.setBadgeBackgroundColor = async (_details) => {}
fakeBrowser.browserAction.setBadgeText = async (_details) => {}
fakeBrowser.browserAction.setBadgeTextColor = async (_details) => {}

export default fakeBrowser
