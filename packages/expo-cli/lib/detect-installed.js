const { DEPENDENCIES, getDependencies } = require('./utils')

const InstalledState = {
  NONE: 0,
  BUGSNAG_EXPO: 1 << 0,
  ALL_DEPENDENCIES: 1 << 1
}

module.exports = {
  InstalledState,
  detectInstalledState: async directory => {
    const allDependencies = await getDependencies(directory)

    let installedState = InstalledState.NONE

    if (allDependencies['@bugsnag/expo']) {
      installedState |= InstalledState.BUGSNAG_EXPO
    }

    const allDependenciesInstalled = DEPENDENCIES.every(dependency => !!allDependencies[dependency])

    if (allDependenciesInstalled) {
      installedState |= InstalledState.ALL_DEPENDENCIES
    }

    return installedState
  },
  detectInstalledVersion: async directory => {
    const allDependencies = await getDependencies(directory)

    return allDependencies['@bugsnag/expo']
  }
}
