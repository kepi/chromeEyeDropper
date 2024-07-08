import { localExtStorage } from "@webext-core/storage"

/**
 * Simply returns first part (sprint) of version string
 *
 * Returns null if version format isn't valid
 *
 * @remarks
 * Only valid version is string with sprint.feature.fix.build schema
 *
 **/
export function getSprintFromVersion(version: string) {
  try {
    const parts = version.split(".")
    // sprint.feature.fix.build schema is only valid
    if (parts.length === 4 || parts.length === 3) {
      return Number(parts[0])
    }
  } catch {
    return null
  }

  return null
}

export async function getStoredAppVersion() {
  return await localExtStorage.getItem("app_version")
}

export async function storeAppVersion(version: string = __APP_VERSION__) {
  await localExtStorage.setItem("app_version", version)
}

/**
 * This function should display tab with news about update when appropriate.
 *
 * @remarks
 * It is crucial to not open updated tab multiple times. So let's be on safe
 * side and don't do anything when there is some edge case.
 *
 * Updated tab should be opened only if there is new sprint version. For now we
 *  won't be opening it on feature versions only.
 **/
export async function isBigUpdate() {
  // this shouldn't happen but if it does, just quit and do nothing
  if (__APP_VERSION__ === undefined) return false

  // versions are same, no need to get sprint
  const previousAppVersion = await getStoredAppVersion()
  if (__APP_VERSION__ === previousAppVersion) return false

  const previousSprint = getSprintFromVersion(previousAppVersion)
  const currentSprint = getSprintFromVersion(__APP_VERSION__)

  // check for null - happens when version is wrong
  if (previousSprint === null) return false
  if (currentSprint === null) return false

  // only reason to update tab
  if (previousSprint < currentSprint) return true

  return false
}
