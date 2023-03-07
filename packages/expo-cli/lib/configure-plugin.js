const { join } = require('path')
const { readFile, writeFile } = require('fs')
const { promisify } = require('util')
const { spawn } = require('child_process')
const { blue } = require('kleur')

const plugin = '@bugsnag/plugin-expo-eas-sourcemaps'

function usingYarnClassic (projectRoot) {
  return new Promise((resolve, reject) => {
    const proc = spawn('yarn', ['-v'], { cwd: projectRoot })
    proc.stdout.on('data', chunk => resolve(chunk < '2'))
    proc.stderr.on('data', chunk => reject(chunk))
  })
}

function usingWorkspaces (projectRoot, usingYarnClassic) {
  return new Promise((resolve, reject) => {
    if (usingYarnClassic) {
      const proc = spawn('yarn', ['workspaces', 'info'], { cwd: projectRoot })
      proc.stdout.on('data', chunk => {})
      proc.stderr.on('data', chunk => {})
      proc.on('error', err => { reject(err) })
      proc.on('close', (code, signal) => { resolve(code === 0) })
    } else {
      const paths = []
      const proc = spawn('yarn', ['workspaces', 'list'], { cwd: projectRoot })
      proc.stdout.on('data', chunk => paths.push(chunk))
      proc.stderr.on('data', chunk => {})
      proc.on('error', (err) => { reject(err) })
      proc.on('close', (code, signal) => { resolve(paths.length > 2) })
    }
  })
}

module.exports = async (projectRoot) => {
  const appJsonPath = join(projectRoot, 'app.json')
  let conf

  // read in existing app.json
  try {
    conf = JSON.parse(await promisify(readFile)(appJsonPath, 'utf8'))
  } catch (e) {
    // swallow and rethrow for errors that we can produce better messaging for
    if (e.code === 'ENOENT') {
      conf = {
        expo: {
          plugins: []
        }
      }
    } else if (e.name === 'SyntaxError') {
      throw new Error(`Couldn’t parse app.json because it wasn’t valid JSON: "${e.message}"`)
    } else {
      throw e
    }
  }

  // update config
  conf.expo = conf.expo || {}
  conf.expo.plugins = conf.expo.plugins || []
  if (conf.expo.plugins.includes(plugin)) {
    console.log(blue('Plugin is already configured in app.json'))
  } else {
    conf.expo.plugins.push(plugin)
    await promisify(writeFile)(appJsonPath, JSON.stringify(conf, null, 2), 'utf8')
  }

  // update package.json
  try {
    const packageJsonPath = join(projectRoot, 'package.json')
    const packageJson = JSON.parse(await promisify(readFile)(packageJsonPath))

    // add the post-build hook (if it doesn't already exist)
    const sourceMapBuildHook = 'npx bugsnag-eas-build-on-success'
    packageJson.scripts = packageJson.scripts || {}
    const existingBuildHook = packageJson.scripts['eas-build-on-success']

    if (existingBuildHook && existingBuildHook.includes(sourceMapBuildHook)) {
      console.log(blue('EAS Build hook already configured in package.json'))
    } else if (existingBuildHook) {
      packageJson.scripts['eas-build-on-success'] = `${existingBuildHook} && ${sourceMapBuildHook}`
    } else {
      packageJson.scripts['eas-build-on-success'] = sourceMapBuildHook
    }

    // do we need to add monorepo configuration?
    const withYarnClassic = await usingYarnClassic(projectRoot)
    const addMonorepoConfig = await usingWorkspaces(projectRoot, withYarnClassic)

    if (addMonorepoConfig) {
      console.log(blue('> yarn workspaces detected, updating config'))

      const sourceMaps = '@bugsnag/source-maps'

      if (withYarnClassic) {
        packageJson.workspaces = packageJson.workspaces || {}
        packageJson.workspaces.nohoist = packageJson.workspaces.nohoist || []
        if (!packageJson.workspaces.nohoist.includes(plugin)) packageJson.workspaces.nohoist.push(plugin)
        if (!packageJson.workspaces.nohoist.includes(sourceMaps)) packageJson.workspaces.nohoist.push(sourceMaps)
      } else {
        packageJson.installConfig = packageJson.installConfig || {}
        packageJson.installConfig.hoistingLimits = 'workspaces'
      }
    }

    await promisify(writeFile)(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8')
  } catch (e) {
    // swallow and rethrow for errors that we can produce better messaging
    if (e.code === 'ENOENT') {
      throw new Error(`Couldn’t find package.json in "${projectRoot}".`)
    }
    if (e.name === 'SyntaxError') {
      throw new Error(`Couldn’t parse package.json because it wasn’t valid JSON: "${e.message}"`)
    }
    throw e
  }
}
