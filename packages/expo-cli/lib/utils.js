const process = require('process')
const { promisify } = require('util')
const { readFile } = require('fs')
const { join } = require('path')

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

module.exports = {
  onCancel: () => process.exit(),
  getDependencies,
  DEPENDENCIES: [
    '@react-native-community/netinfo',
    'expo-application',
    'expo-constants',
    'expo-crypto',
    'expo-device',
    'expo-file-system'
  ]
}
