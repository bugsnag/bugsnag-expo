const process = require('process')
const { promisify } = require('util')
const { readFile, existsSync } = require('fs')
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

function checkFileExists (projectRoot, filename) {
  const appPath = join(projectRoot, filename)
  return existsSync(appPath)
}

function findAppEntry (projectRoot, filenames) {
  for (const filename of filenames) {
    const appPath = join(projectRoot, filename)
    if (existsSync(appPath)) {
      return appPath
    }
  }
  return null
}

function resolvePackageName (packageName, version) {
  if (version === 'latest') {
    return packageName
  }

  return `${packageName}@${version}`
}

module.exports = {
  onCancel: () => process.exit(),
  getDependencies,
  resolvePackageName,
  checkFileExists,
  findAppEntry,
  DEPENDENCIES: [
    '@react-native-community/netinfo',
    'expo-application',
    'expo-constants',
    'expo-crypto',
    'expo-device',
    'expo-file-system',
    'expo-secure-store'
  ]
}
