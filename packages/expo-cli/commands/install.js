const prompts = require('prompts')
const { promisify } = require('util')
const { readFile } = require('fs')
const { join } = require('path')
const install = require('../lib/install')
const { onCancel } = require('../lib/utils')
const { blue } = require('kleur')
const semver = require('semver')
const { detectInstalledState, InstalledState } = require('../lib/detect-installed')
const { getBugsnagVersionForExpoVersion } = require('../lib/version-information')

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

export async function selectVersion (directory) {
  let installedExpoVersion

  try {
    const pkg = JSON.parse(await promisify(readFile)(join(directory, 'package.json'), 'utf8'))
    installedExpoVersion = pkg.dependencies.expo
  } catch (e) {
    throw new Error(`Could not detect Expo version in package.json: ${e.message}`)
  }

  let versionInformation

  try {
    versionInformation = getBugsnagVersionForExpoVersion(installedExpoVersion)
  } catch (e) {
    throw new Error(`Could not detect @bugsnag/expo version for Expo ${installedExpoVersion}: ${e.message}`)
  }

  let defaultVersion
  let message

  if (!versionInformation) {
    // if we were unable to find a suitable @bugsnag/expo version, then we don't
    // support this Expo version yet
    defaultVersion = 'latest'
    message = `@bugsnag/expo does not yet officially support Expo ${installedExpoVersion}. Do you want to install the most recent available version of @bugsnag/expo instead?`
  } else if (versionInformation.isLegacy) {
    defaultVersion = versionInformation.bugsnagVersion
    message = `It looks like you’re using a version of Expo SDK <${versionInformation.expoSdkVersion}. The last version of Bugsnag that supported your version of Expo is v${versionInformation.bugsnagVersion}`
  } else {
    defaultVersion = versionInformation.bugsnagVersion
    message = `If you want to install @bugsnag/expo ${defaultVersion} hit enter, otherwise type the version you want`
  }

  const { version } = await prompts({
    type: 'text',
    name: 'version',
    message: message,
    initial: defaultVersion,
    validate: str => {
      if (str === 'latest' || semver.valid(str) || semver.validRange(str)) {
        return true
      }

      return 'Version must be: a valid semver version/range or "latest"'
    }
  }, { onCancel })

  return version
}
