const {
  withInfoPlist,
  withXcodeProject
} = require('@expo/config-plugins')

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

    // 02. Update react native bundle phase with sourcemap filepath
    const bundleReactNativePhase = xcodeProject.pbxItemByComment(buildPhaseComment, buildPhaseName)

    const initialScript = bundleReactNativePhase.shellScript

    const additionalExports = '"export EXTRA_PACKAGER_ARGS=\\"--sourcemap-output $TMPDIR/$(md5 -qs \\"$CONFIGURATION_BUILD_DIR\\")-main.jsbundle.map\\"\\n'

    if (initialScript.indexOf(additionalExports) < 0) {
      const modifiedScript = additionalExports + initialScript.substr(1)
      bundleReactNativePhase.shellScript = modifiedScript
    }

    // 03. Configure the new build phase
    const uploadBuildPhaseComment = 'Upload source maps to Bugsnag'

    const uploadBuildPhase = xcodeProject.pbxItemByComment(uploadBuildPhaseComment, buildPhaseName)

    if (!uploadBuildPhase) {
      const shellScript = 'SOURCE_MAP="$TMPDIR/$(md5 -qs "$CONFIGURATION_BUILD_DIR")-main.jsbundle.map" ../node_modules/@bugsnag/plugin-expo-eas-sourcemaps/lib/bugsnag-expo-xcode.sh'

      xcodeProject.addBuildPhase([], buildPhaseName, uploadBuildPhaseComment, null, {
        shellPath: '/bin/sh',
        shellScript: shellScript
      })
    }

    return config
  })

  return config
}

module.exports = { withIosPlugin }
