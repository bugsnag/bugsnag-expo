const { join } = require('path')
const { readFile, writeFile, existsSync } = require('fs')
const { promisify } = require('util')
const { detectInstalledVersion } = require('./detect-installed')
const semver = require('semver')

const importRe = /from ["']@bugsnag\/expo["']/
const requireRe = /require\(["']@bugsnag\/expo["']\)/

module.exports = async (projectRoot) => {
  //check if app.ts exists. If it does exist, check for/insert bugsnag in app.ts
  const appTsPath = join(projectRoot, 'App.ts')
  if (existsSync(appTsPath)) {
    const appTs = await promisify(readFile)(appTsPath, 'utf8')
    if (importRe.test(appTs) || requireRe.test(appTs)) {
      return '@bugsnag/expo is already imported in App.ts'
    }
    await promisify(writeFile)(appTsPath, `${await getCode(projectRoot)}\n${appTs}`, 'utf8')

  //if app.ts doesn't exist, check for app.js and check for/insert bugsnag in app.js
  } else {
    try {
      const appJsPath = join(projectRoot, 'App.js')
      const appJs = await promisify(readFile)(appJsPath, 'utf8')
      if (importRe.test(appJs) || requireRe.test(appJs)) {
        return '@bugsnag/expo is already imported in App.js'
      }
      await promisify(writeFile)(appJsPath, `${await getCode(projectRoot)}\n${appJs}`, 'utf8')
    }
    catch (e) {
      // if app.js doesn't exist either, provide appropriate error messsage
      if (e.code === 'ENOENT') {
        throw new Error(`Couldn’t find App.js or App.ts in "${projectRoot}". Is this the root of your Expo project?`)
      }
      throw e
    }
  }
}

const code = {
  preV7: `import bugsnag from '@bugsnag/expo';
const bugsnagClient = bugsnag();
`,
  postV7: `import Bugsnag from '@bugsnag/expo';
Bugsnag.start();
`
}

const getCode = async (projectRoot) => {
  const manifestRange = await detectInstalledVersion(projectRoot)
  const isPostV7 = !manifestRange || semver.ltr('6.99.99', manifestRange)
  return code[isPostV7 ? 'postV7' : 'preV7']
}

module.exports.getCode = getCode
