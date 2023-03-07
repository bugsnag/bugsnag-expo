#!/usr/bin/env node

const { access } = require('fs').promises
const { reactNative } = require('@bugsnag/source-maps')
const { exit } = require('process')

const PROJECT_ROOT = process.cwd()

if (process.env.EAS_BUILD_PLATFORM !== 'android') {
  console.log('Skipping Android source map upload: iOS build detected')
  exit(0)
} else if (process.env.EAS_BUILD_PROFILE === 'development') {
  console.log('Skipping Android source map upload: Development build detected')
  exit(0)
}

const uploadSourceMaps = async () => {
  const bundle = `${PROJECT_ROOT}/android/app/build/generated/assets/createBundleReleaseJsAndAssets/index.android.bundle`
  await access(bundle).catch((error) => {
    console.log(`Skipping Android source map upload: App bundle ${bundle} could not be found.\n${error}`)
    exit(0)
  })

  const sourceMap = `${PROJECT_ROOT}/android/app/build/generated/sourcemaps/react/release/index.android.bundle.map`
  await access(sourceMap).catch((error) => {
    console.error(`Error: source map ${sourceMap} could not be found.\n${error}`)
    exit(1)
  })

  let appConfig, apiKey
  try {
    appConfig = require(`${PROJECT_ROOT}/app.json`)
    apiKey = appConfig?.expo?.extra?.bugsnag?.apiKey
  } catch (error) {
    console.error(`Error: Failed to load app.json file ${PROJECT_ROOT}/app.json.\n${error}`)
    exit(1)
  }

  if (!apiKey) {
    console.error('Error: No Bugsnag API key detected in app.json')
    exit(1)
  }

  console.log('Uploading Android source map to Bugsnag...')
  await reactNative.uploadOne({
    apiKey,
    bundle,
    sourceMap,
    platform: 'android',
    appVersion: appConfig?.expo?.version,
    appVersionCode: appConfig?.expo?.android?.versionCode?.toString()
  }).then(() => {
    console.log(`Successfully uploaded the following files:\n${[bundle, sourceMap].join('\n')}`)
  }).catch(error => {
    console.error(`Error uploading source map: ${error}`)
    exit(1)
  })
}

uploadSourceMaps()
