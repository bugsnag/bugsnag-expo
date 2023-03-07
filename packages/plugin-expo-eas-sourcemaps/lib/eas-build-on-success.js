#!/usr/bin/env node

const { access, constants } = require('fs')
const { reactNative } = require('@bugsnag/source-maps')
const { exit } = require('process')

if (process.env.EAS_BUILD_PLATFORM !== 'android') {
  console.log('Skipping Android source map upload: iOS build detected')
  exit(0)
} else if (process.env.EAS_BUILD_PROFILE === 'development') {
  console.log('Skipping Android source map upload: Development build detected')
  exit(0)
}

const bundle = `${process.env.EAS_BUILD_WORKINGDIR}/android/app/build/generated/assets/createBundleReleaseJsAndAssets/index.android.bundle`
access(bundle, constants.R_OK, error => {
  if (error) {
    console.log(`Skipping Android source map upload: App bundle ${bundle} could not be found.`)
    exit(0)
  }
})

const sourceMap = `${process.env.EAS_BUILD_WORKINGDIR}/android/app/build/generated/sourcemaps/react/release/index.android.bundle.map`
access(sourceMap, constants.R_OK, error => {
  if (error) {
    console.error(`Error: source map ${sourceMap} could not be found.\n${error}`)
    exit(1)
  }
})

let appConfig, apiKey
try {
  appConfig = require(`${process.env.EAS_BUILD_WORKINGDIR}/app.json`)
  apiKey = appConfig?.expo?.extra?.bugsnag?.apiKey
} catch (error) {
  console.error(`Error: failed to load app.json file at ${process.env.EAS_BUILD_WORKINGDIR}/app.json.\n${error}`)
  exit(1)
}

if (!apiKey) {
  console.error(`Error: No Bugsnag API key detected in ${process.env.EAS_BUILD_WORKINGDIR}/app.json`)
  exit(1)
}

const uploadSourceMaps = async () => {
  console.log('Uploading Android source map to Bugsnag...')
  return await reactNative.uploadOne({
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
