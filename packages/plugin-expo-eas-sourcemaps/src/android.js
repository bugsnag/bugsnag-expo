const {
  AndroidConfig,
  withAppBuildGradle,
  withAndroidManifest
} = require('@expo/config-plugins')

// Using helpers keeps error messages unified and helps cut down on XML format changes.
const { addMetaDataItemToMainApplication, getMainApplicationOrThrow } = AndroidConfig.Manifest

const withAndroidPlugin = (config, onPremConfig) => {
  // Update android manifest with bugsnag config
  config = withAndroidManifest(config, config => {
    config.modResults = setBugsnagConfig(config, config.modResults)
    return config
  })

  // Inject gradle dependencies
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents = injectDependencies(config.modResults.contents)
    } else {
      throw new Error(
        'Cannot configure Bugsnag in the app gradle because the build.gradle is not groovy'
      )
    }
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

  addMetaDataItemToMainApplication(
    mainApplication,
    apiKeyName,
    apiKeyValue
  )

  return androidManifest
}

function injectDependencies (script) {
  return `buildscript {
        repositories {
            mavenCentral()
        }
        dependencies {
            classpath 'com.bugsnag:bugsnag-android-gradle-plugin:[7.3.0,)'
        }
    }

    ${script}

    apply plugin: 'com.bugsnag.android.gradle'

    bugsnag {
        uploadReactNativeMappings = true
    }`
}

module.exports = {
  withAndroidPlugin
}
