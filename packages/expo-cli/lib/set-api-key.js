const { join } = require('path')
const { readFile, writeFile } = require('fs')
const { promisify } = require('util')

module.exports = async (apiKey, projectRoot) => {
  const appJsonPath = join(projectRoot, 'app.json')
  let conf

  try {
    conf = JSON.parse(await promisify(readFile)(appJsonPath, 'utf8'))
  } catch (e) {
    // swallow and rethrow for errors that we can produce better messaging for
    if (e.code === 'ENOENT') {
      conf = {
        expo: {
          extra: {
            bugsnag: {
            }
          }
        }
      }
      // throw new Error(`Couldn’t find app.json in "${projectRoot}". Is this the root of your Expo project?`)
    } else if (e.name === 'SyntaxError') {
      throw new Error(`Couldn’t parse app.json because it wasn’t valid JSON: "${e.message}"`)
    } else {
      throw e
    }
  }

  conf.expo.extra = conf.expo.extra || {}
  conf.expo.extra.bugsnag = conf.expo.extra.bugsnag || {}
  conf.expo.extra.bugsnag.apiKey = apiKey

  await promisify(writeFile)(appJsonPath, JSON.stringify(conf, null, 2), 'utf8')
}
