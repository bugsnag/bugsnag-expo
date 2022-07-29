const prompts = require('prompts')
const addPlugin = require('../lib/configure-plugin')
const { onCancel } = require('../lib/utils')
const { blue, yellow } = require('kleur')
const installPlugin = require('../lib/install-plugin')
const { promisify } = require('util')
const { readFile } = require('fs')
const { join } = require('path')
const selectVersion = require('../lib/select-version')

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

module.exports = async (argv, globalOpts) => {
  const res = await prompts({
    type: 'confirm',
    name: 'addPlugin',
    message,
    initial: true
  }, { onCancel })
  if (res.addPlugin) {
    const projectRoot = globalOpts['project-root']

    const installedDependencies = getDependencies(projectRoot)
    const installed = !!installedDependencies['@bugsnag/plugin-expo-eas-sourcemaps']

    if (!installed) {
      console.log(blue('> Installing @bugsnag/plugin-expo-eas-sourcemaps.'))

      const options = {
        npm: globalOpts.npm,
        yarn: globalOpts.yarn
      }

      const version = await selectVersion(projectRoot)
      await installPlugin(version, projectRoot, options)
    }

    console.log(blue('> Inserting EAS plugin into app.json'))
    const msg = await addPlugin(projectRoot)
    if (msg) console.log(yellow(`  ${msg}`))
  }
}

const message = 'Do you want to automatically upload source maps to Bugsnag? (this will modify your app.json)'
