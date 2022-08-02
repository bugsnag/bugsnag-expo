const prompts = require('prompts')
const addPlugin = require('../lib/configure-plugin')
const installPlugin = require('../lib/install-plugin')
const { onCancel, getDependencies } = require('../lib/utils')
const { isEarlierVersionThan } = require('../lib/version-information')
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
    message: 'Do you want to automatically upload source maps to Bugsnag? (this will modify your app.json)',
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

      await installPlugin(projectRoot, options)
    }

    console.log(blue('> Inserting EAS plugin into app.json'))
    const msg = await addPlugin(projectRoot)
    if (msg) console.log(yellow(`  ${msg}`))
  }
}
