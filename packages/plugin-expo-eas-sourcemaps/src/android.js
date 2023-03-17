const { AndroidConfig, withAndroidManifest } = require('@expo/config-plugins')

// Using helpers keeps error messages unified and helps cut down on XML format changes.
const { addMetaDataItemToMainApplication, getMainApplicationOrThrow } = AndroidConfig.Manifest

const withAndroidPlugin = (config, onPremConfig) => {
// Set the Bugsnag API key in the android manifest - note that this isn't required for source map uploads
// but is added here to support reporting builds using the fastlane plugin
  config = withAndroidManifest(config, config => {
    config.modResults = setBugsnagConfig(config, config.modResults)
    return config
  })

  return config
}

// Splitting this function out of the mod makes it easier to test.
function setBugsnagConfig (config, androidManifest) {
  const apiKeyName = 'com.bugsnag.android.API_KEY'
  const apiKeyValue = config?.extra?.bugsnag?.apiKey

  // Get the <application /> tag and assert if it doesn't exist.
  const mainApplication = getMainApplicationOrThrow(androidManifest)

  if (apiKeyValue) {
    addMetaDataItemToMainApplication(
      mainApplication,
      apiKeyName,
      apiKeyValue
    )
  }

  return androidManifest
}

module.exports = {
  withAndroidPlugin
}
