const prompts = require('prompts')
const { promisify } = require('util')
const { readFile } = require('fs')
const { join } = require('path')
const { onCancel } = require('./utils')
const semver = require('semver')
const { getBugsnagVersionForExpoVersion } = require('./version-information')

module.exports = async (directory) => {
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
