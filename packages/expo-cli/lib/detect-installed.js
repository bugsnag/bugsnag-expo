const { promisify } = require('util')
const { readFile } = require('fs')
const { join } = require('path')
const { DEPENDENCIES } = require('./utils')

// cache dependencies to avoid potentially parsing package.json multiple times
// we use a map to store 'directoryName -> parsedJson' to support running against
// different directories, primarily for the tests
const cachedDependencies = new Map()

async function getDependencies (directory) {
  if (!cachedDependencies.has(directory)) {
    try {
      const pkg = JSON.parse(await promisify(readFile)(join(directory, 'package.json'), 'utf8'))

      cachedDependencies.set(directory, Object.assign({}, pkg.dependencies, pkg.devDependencies, pkg.peerDependencies))
    } catch (e) {
      throw new Error('Could not load package.json. Is this the project root?')
    }
  }

  return cachedDependencies.get(directory)
}

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
