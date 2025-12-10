const { join } = require('path')
const { readFile, writeFile } = require('fs')
const { promisify } = require('util')
const { detectInstalledVersion } = require('./detect-installed')
const { findAppEntry } = require('./utils')
const semver = require('semver')

const importRe = /from ["']@bugsnag\/expo["']/
const requireRe = /require\(["']@bugsnag\/expo["']\)/
const entrypoints = ['App.ts',
  'App.tsx',
  'App.js',
  'App.jsx',
  join('src', 'App.ts'),
  join('src', 'App.tsx'),
  join('src', 'App.js'),
  join('src', 'App.jsx'),
  join('app', '_layout.tsx')
]

module.exports = async (projectRoot) => {
  // find app entry file
  const appPath = findAppEntry(projectRoot, entrypoints)
  if (!appPath) {
    throw new Error(`Could not find app entry file. Searched: ${entrypoints.join(', ')}`)
  }
  // check if import statement has already been added and return
  const app = await promisify(readFile)(appPath, 'utf8')
  if (importRe.test(app) || requireRe.test(app)) {
    return `@bugsnag/expo is already imported in ${appPath}`
  }
  // write to file
  await promisify(writeFile)(appPath, `${await getCode(projectRoot)}\n${app}`, 'utf8')
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
