const { AndroidConfig, withAndroidManifest } = require('@expo/config-plugins')
const { getMainApplicationOrThrow } = AndroidConfig.Manifest

const withAddClearTextTrafficAndroid = config => {
  config = withAndroidManifest(config, config => {
    config.modResults = setUsesCleartextTraffic(config, config.modResults)
    return config
  })

  return config
}

function setUsesCleartextTraffic(config, androidManifest) {
  const mainApplication = getMainApplicationOrThrow(androidManifest);
  mainApplication.$['android:usesCleartextTraffic'] = 'true'
  return androidManifest;
}

module.exports = withAddClearTextTrafficAndroid