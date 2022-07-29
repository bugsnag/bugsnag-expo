const prompts = require('prompts')
const install = require('../lib/install')
const selectVersion = require('../lib/select-version')
const { onCancel } = require('../lib/utils')
const { blue } = require('kleur')
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
