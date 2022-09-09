const semver = require('semver')

// the major version number of the latest Expo SDK we support
const LATEST_SUPPORTED_EXPO_SDK = 46

class Version {
  constructor (expoSdkVersion, bugsnagVersion, isLegacy = false) {
    this.expoSdkVersion = expoSdkVersion
    this.bugsnagVersion = bugsnagVersion
    this.isLegacy = isLegacy
  }
}

// the Expo version here means versions less than expo version, e.g. expo versions
// before v36 use @bugsnag/expo v6.4.4
// Note: this must be in order from lowest Expo SDK version to the highest
const legacyVersions = [
  new Version(36, '6.4.4', true),
  new Version(37, '6.5.3', true),
  new Version(38, '7.1.1', true),
  new Version(39, '7.3.5', true),
  new Version(40, '7.5.5', true),
  new Version(42, '7.11.0', true),
  new Version(43, '7.13.2', true),
  new Version(44, '7.14.2', true)
]

function isEarlierVersionThan (installedVersion, versionToCompare) {
  if (!installedVersion) {
    return false
  }

  return semver.lt(semver.minVersion(installedVersion), versionToCompare)
}

function getBugsnagVersionForExpoVersion (installedExpoVersion) {
  if (isEarlierVersionThan(installedExpoVersion, '33.0.0')) {
    throw new Error('Expo SDK <33 is no longer supported')
  }

  const installedExpoMajorVersion = semver.major(semver.coerce(installedExpoVersion))

  // if this is pre SDK v44, find the legacy version that supported it
  if (isEarlierVersionThan(installedExpoVersion, '44.0.0')) {
    for (const version of legacyVersions) {
      if (isEarlierVersionThan(installedExpoVersion, `${version.expoSdkVersion}.0.0`)) {
        return version
      }
    }
  } else if (installedExpoMajorVersion <= LATEST_SUPPORTED_EXPO_SDK) {
    // if this is a supported SDK version that's also >= v44 then there is a
    // corresponding @bugsnag/expo release with the same major version number
    // i.e. SDK 44 -> @bugsnag/expo v44.0.0
    return new Version(installedExpoMajorVersion, `^${installedExpoMajorVersion}.0.0`)
  }

  // the above loop should always reach the return, but it's possible this is an
  // Expo version that we haven't released support for yet
  return null
}

module.exports = {
  getBugsnagVersionForExpoVersion,
  isEarlierVersionThan
}
