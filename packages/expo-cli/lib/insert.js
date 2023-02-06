const { join } = require('path')
const { readFile, writeFile, existsSync } = require('fs')
const { promisify } = require('util')
const { detectInstalledVersion } = require('./detect-installed')
const semver = require('semver')

const importRe = /from ["']@bugsnag\/expo["']/
const requireRe = /require\(["']@bugsnag\/expo["']\)/

module.exports = async (projectRoot) => {

  function checkFileExists(filename) {
    const appPath = join(projectRoot, filename)
    return existsSync(appPath)
  }

  const writeBugsnagImport = async (filename) => {
    // check if import statement has already been added and return
    const appPath = join(projectRoot, filename)
    const app = await promisify(readFile)(appPath, 'utf8')
    if (importRe.test(app) || requireRe.test(app)) {
      return `@bugsnag/expo is already imported in ${filename}`
    }
   // write to file
    await promisify(writeFile)(appPath, `${await getCode(projectRoot)}\n${app}`, 'utf8')
  }

  if (checkFileExists('App.ts')) {
    return await writeBugsnagImport('App.ts')
  } else if (checkFileExists('App.js')) {
    return await writeBugsnagImport('App.js')
  } else {
    throw new Error(`Couldn’t find App.js or App.ts in "${projectRoot}". Is this the root of your Expo project?`)
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
