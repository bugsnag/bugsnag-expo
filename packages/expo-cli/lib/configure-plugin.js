const { join } = require('path')
const { readFile, writeFile } = require('fs')
const { promisify } = require('util')
const { spawn } = require('child_process')
const { blue } = require('kleur')

const plugin = '@bugsnag/plugin-expo-eas-sourcemaps'

function usingWorkspaces (projectRoot) {
  return new Promise((resolve, reject) => {
    const command = ['workspaces', 'info']
    const proc = spawn('yarn', command, { cwd: projectRoot })

    // buffer output in case of an error
    proc.stdout.on('data', d => {})
    proc.stderr.on('data', d => {})

    proc.on('error', err => { reject(err) })

    proc.on('close', code => {
      resolve(code === 0)
    })
  })
}

module.exports = async (projectRoot) => {
  try {
    const appJsonPath = join(projectRoot, 'app.json')
    const conf = JSON.parse(await promisify(readFile)(appJsonPath, 'utf8'))
    conf.expo.plugins = conf.expo.plugins || []
    if (conf.expo.plugins.includes(plugin)) {
      return plugin + ' is already installed'
    }
    conf.expo.plugins.push(plugin)
    await promisify(writeFile)(appJsonPath, JSON.stringify(conf, null, 2), 'utf8')
  } catch (e) {
    // swallow and rethrow for errors that we can produce better messaging for
    if (e.code === 'ENOENT') {
      throw new Error(`Couldn’t find app.json in "${projectRoot}". Is this the root of your Expo project?`)
    }
    if (e.name === 'SyntaxError') {
      throw new Error(`Couldn’t parse app.json because it wasn’t valid JSON: "${e.message}"`)
    }
    throw e
  }

  // are we in a monorepo?
  const addMonorepoConfig = await usingWorkspaces(projectRoot)

  if (addMonorepoConfig) {
    console.log(blue('> yarn workspaces detected, updating config'))

    try {
      const sourceMaps = '@bugsnag/source-maps'
      const packageJsonPath = join(projectRoot, 'package.json')
      const packageJson = JSON.parse(await promisify(readFile)(packageJsonPath))
      packageJson.workspaces = packageJson.workspaces || {}
      packageJson.workspaces.nohoist = packageJson.workspaces.nohoist || []
      if (!packageJson.workspaces.nohoist.includes(plugin)) {
        packageJson.workspaces.nohoist.push(plugin)
      }
      if (!packageJson.workspaces.nohoist.includes(sourceMaps)) {
        packageJson.workspaces.nohoist.push(sourceMaps)
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
}
