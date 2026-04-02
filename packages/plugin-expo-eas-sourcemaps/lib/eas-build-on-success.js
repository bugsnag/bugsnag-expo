#!/usr/bin/env node

const { access } = require('fs').promises
const BugsnagCLI = require('@bugsnag/cli')
const { exit } = require('process')
const { getConfig } = require('@expo/config')

const PROJECT_ROOT = process.cwd()

if (process.env.EAS_BUILD_PLATFORM !== 'android') {
  console.log('Skipping Android source map upload: Android build not detected')
  exit(0)
} else if (process.env.EAS_BUILD_PROFILE === 'development') {
  console.log('Skipping Android source map upload: Development build detected')
  exit(0)
}

const uploadSourceMaps = async () => {
  let appConfig, apiKey
  try {
    appConfig = getConfig(PROJECT_ROOT)
    apiKey = appConfig?.exp?.extra?.bugsnag?.apiKey
  } catch (error) {
    console.error(`Error: Failed to read app config in ${PROJECT_ROOT}.\n${error}`)
    exit(1)
  }

  if (!apiKey) {
    console.error('Error: No Bugsnag API key detected in app config')
    exit(1)
  }

  console.log('Uploading Android source map to Bugsnag...')
  try {
    const result = await BugsnagCLI.Upload.ReactNative.Android(
      {
        apiKey: apiKey,
        projectRoot: PROJECT_ROOT
      }
      , PROJECT_ROOT
    )
    console.log(result)
    console.log('Successfully uploaded Android source map to Bugsnag')
  } catch (error) {
    console.error(`Error uploading source map: ${error}`)
    exit(1)
  }
}

uploadSourceMaps()
