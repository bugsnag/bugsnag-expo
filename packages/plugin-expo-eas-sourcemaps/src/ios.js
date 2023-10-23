const {
  withInfoPlist,
  withXcodeProject
} = require('@expo/config-plugins')
const { readFileSync } = require('fs');
const { dirname, join } = require('path');

const buildPhaseName = 'PBXShellScriptBuildPhase'
const buildPhaseComment = 'Bundle React Native code and images'

function withIosPlugin (config, onPremConfig) {
  // 01. Update InfoPlist with apiKey
  config = withInfoPlist(config, config => {
    const apiKey = config?.extra?.bugsnag?.apiKey
    config.modResults.bugsnag = {
      apiKey: apiKey
    }
    return config
  })

  config = withXcodeProject(config, config => {
    const xcodeProject = config.modResults

    const shellScript = readFileSync(join(__dirname, '../lib/bugsnag-xcode-build-phase'), 'utf8')

    xcodeProject.addBuildPhase([], buildPhaseName, 'Upload source maps to Bugsnag', null, {
      shellPath: '/bin/sh',
      shellScript: shellScript
    })

    return config
  })

  return config
}

module.exports = { withIosPlugin }
