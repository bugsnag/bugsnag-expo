const prompts = require('prompts')
const addPlugin = require('../lib/configure-plugin')
const installPlugin = require('../lib/install-plugin')
const { onCancel, getDependencies } = require('../lib/utils')
const { isEarlierVersionThan, getBugsnagVersionForExpoVersion } = require('../lib/version-information')
const { blue, yellow } = require('kleur')

const PLUGIN_NAME = '@bugsnag/plugin-expo-eas-sourcemaps'

const MINIMUM_SUPPORTED_EXPO_VERSION = '45.0.0'

module.exports = async (argv, globalOpts) => {
  const projectRoot = globalOpts['project-root']
  const installedDependencies = await getDependencies(projectRoot)

  const installedExpoVersion = installedDependencies.expo

  if (isEarlierVersionThan(installedExpoVersion, MINIMUM_SUPPORTED_EXPO_VERSION)) {
    console.log(yellow('EAS Build is not fully supported in bugsnag-expo before Expo SDK v45. You will need to upgrade for automatic source map uploads to Bugsnag.'))
    return
  }

  const res = await prompts({
    type: 'confirm',
    name: 'addPlugin',
    message: 'Do you want to automatically upload source maps to Bugsnag? (this will modify your app.json and package.json)',
    initial: true
  }, { onCancel })

  if (res.addPlugin) {
    const installed = !!installedDependencies[PLUGIN_NAME]

    if (!installed) {
      console.log(blue(`> Installing ${PLUGIN_NAME}`))

      const options = {
        npm: globalOpts.npm,
        yarn: globalOpts.yarn
      }

      // install a plugin version that matches the SDK version, i.e. SDK 48 -> @bugsnag/plugin-expo-eas-sourcemaps@^48.0.0
      // if there is no suitable bugsnag version we haven't yet released support for this Expo version, so install the latest
      const versionInformation = getBugsnagVersionForExpoVersion(installedExpoVersion)
      const pluginVersion = versionInformation ? versionInformation.bugsnagVersion : 'latest'

      await installPlugin(pluginVersion, projectRoot, options)
    }

    console.log(blue('> Inserting EAS plugin into app.json'))
    const msg = await addPlugin(projectRoot)
    if (msg) console.log(yellow(`  ${msg}`))
  }
}
