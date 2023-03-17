const { withAndroidPlugin } = require('./src/android')
const { withIosPlugin } = require('./src/ios')

const { createRunOncePlugin, WarningAggregator } = require('@expo/config-plugins')

const pkg = require('./package.json')

function withSourcemapUploads (config) {
  const onPremConfig = getOnPremConfig(config)
  config = withAndroidPlugin(config, onPremConfig)
  config = withIosPlugin(config, onPremConfig)
  return config
}

function getOnPremConfig (config) {
  const apiKey = config?.extra?.bugsnag?.apiKey

  if (!apiKey) {
    WarningAggregator.addWarningAndroid(
      pkg.name,
      'no apiKey found'
    )
    WarningAggregator.addWarningIOS(
      pkg.name,
      'no apiKey found'
    )
    return null
  }

  const hook = [
    ...(config.hooks?.postPublish ?? []),
    ...(config.hooks?.postExport ?? [])
  ].filter((hook) => hook.file === '@bugsnag/expo/hooks/post-publish.js')[0]

  if (!hook) return null

  if (!hook.config) {
    WarningAggregator.addWarningAndroid(
      pkg.name,
      'no config found'
    )
    WarningAggregator.addWarningIOS(
      pkg.name,
      'no config found'
    )
    return null
  }

  return hook.config
}

module.exports = createRunOncePlugin(withSourcemapUploads, pkg.name, pkg.version)
