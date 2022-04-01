const prompts = require('prompts')
const { promisify } = require('util')
const { readFile } = require('fs')
const { join } = require('path')
const install = require('../lib/install')
const { onCancel } = require('../lib/utils')
const { blue } = require('kleur')
const semver = require('semver')
const { detectInstalledState, InstalledState } = require('../lib/detect-installed')

module.exports = async (argv, globalOpts) => {
  const projectRoot = globalOpts['project-root']
  const installedState = await detectInstalledState(projectRoot)

  if (await isWanted(installedState)) {
    const version = await selectVersion(projectRoot)

    console.log(blue('> Installing @bugsnag/expo. This could take a while!'))

    const options = {
      npm: globalOpts.npm,
      yarn: globalOpts.yarn
    }

    await install(version, projectRoot, options)
  }
}

const messages = {}
// bugsnag is not installed and at least one dependency is missing
messages[InstalledState.NONE] = '@bugsnag/expo does not appear to be installed, do you want to install it and its dependencies?'
// bugsnag is not installed but all dependencies are
messages[InstalledState.ALL_DEPENDENCIES] = messages[InstalledState.NONE]
// bugsnag is installed but at least one dependency is missing
messages[InstalledState.BUGSNAG_EXPO] = '@bugsnag/expo already appears to be installed, but is missing dependencies. Do you want to install them?'
// bugsnag is installed and so are all its dependencies
messages[InstalledState.BUGSNAG_EXPO | InstalledState.ALL_DEPENDENCIES] = '@bugsnag/expo already appears to be installed, do you want to install it and its dependencies anyway?'

const isWanted = async installedState => {
  let initial = true

  // if bugsnag is already installed set the default answer to 'no', otherwise use 'yes'
  if (installedState & InstalledState.BUGSNAG_EXPO) {
    initial = false
  }

  return (await prompts({
    type: 'confirm',
    name: 'install',
    message: messages[installedState],
    initial
  }, { onCancel })).install
}

const selectVersion = async (dir) => {
  try {
    const pkg = JSON.parse(await promisify(readFile)(join(dir, 'package.json'), 'utf8'))
    const expoVersion = pkg.dependencies.expo

    let message = 'If you want the latest version of @bugsnag/expo hit enter, otherwise type the version you want'
    let defaultVersion = 'latest'

    // help select compatible versions of @bugsnag/expo for older expo releases
    const isPre33 = (expoVersion && !semver.gte(semver.minVersion(expoVersion), '33.0.0'))
    const isPre36 = (expoVersion && !semver.gte(semver.minVersion(expoVersion), '36.0.0'))
    const isPre37 = (expoVersion && !semver.gte(semver.minVersion(expoVersion), '37.0.0'))
    const isPre38 = (expoVersion && !semver.gte(semver.minVersion(expoVersion), '38.0.0'))
    const isPre39 = (expoVersion && !semver.gte(semver.minVersion(expoVersion), '39.0.0'))
    const isPre40 = (expoVersion && !semver.gte(semver.minVersion(expoVersion), '40.0.0'))
    const isPre42 = (expoVersion && !semver.gte(semver.minVersion(expoVersion), '42.0.0'))
    const isPre43 = (expoVersion && !semver.gte(semver.minVersion(expoVersion), '43.0.0'))
    const isPre44 = (expoVersion && !semver.gte(semver.minVersion(expoVersion), '44.0.0'))

    if (isPre33) {
      throw new Error('Expo SDK <33 is no longer supported')
    } else if (isPre36) {
      message = 'It looks like you’re using a version of Expo SDK <36. The last version of Bugsnag that supported your version of Expo is v6.4.4'
      defaultVersion = '6.4.4'
    } else if (isPre37) {
      message = 'It looks like you’re using a version of Expo SDK <37. The last version of Bugsnag that supported your version of Expo is v6.5.3'
      defaultVersion = '6.5.3'
    } else if (isPre38) {
      message = 'It looks like you’re using a version of Expo SDK <38. The last version of Bugsnag that supported your version of Expo is v7.1.1'
      defaultVersion = '7.1.1'
    } else if (isPre39) {
      message = 'It looks like you’re using a version of Expo SDK <39. The last version of Bugsnag that supported your version of Expo is v7.3.5'
      defaultVersion = '7.3.5'
    } else if (isPre40) {
      message = 'It looks like you’re using a version of Expo SDK <40. The last version of Bugsnag that supported your version of Expo is v7.5.5'
      defaultVersion = '7.5.5'
    } else if (isPre42) {
      message = 'It looks like you’re using a version of Expo SDK <42. The last version of Bugsnag that supported your version of Expo is v7.11.0'
      defaultVersion = '7.11.0'
    } else if (isPre43) {
      message = 'It looks like you’re using a version of Expo SDK <43. The last version of Bugsnag that supported your version of Expo is v7.13.2'
      defaultVersion = '7.13.2'
    } else if (isPre44) {
      message = 'It looks like you’re using a version of Expo SDK <44. The last version of Bugsnag that supported your version of Expo is v7.14.2'
      defaultVersion = '7.14.2'
    }

    const { version } = await prompts({
      type: 'text',
      name: 'version',
      message: message,
      initial: defaultVersion,
      validate: str => {
        if (str === 'latest') return true
        if (semver.valid(str)) return true
        if (semver.validRange(str)) return true
        return 'Version must be: a valid semver version/range or "latest"'
      }
    }, { onCancel })
    return version
  } catch (e) {
    throw new Error(`Could not detect Expo version in package.json: ${e.message}`)
  }
}
