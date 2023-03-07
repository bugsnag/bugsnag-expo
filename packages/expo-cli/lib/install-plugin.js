const { createForProject } = require('@expo/package-manager')
const { resolvePackageName } = require('./utils')

module.exports = (version, projectRoot, options) => {
  const packages = [resolvePackageName('@bugsnag/plugin-expo-eas-sourcemaps', version), '@bugsnag/source-maps']

  // Expo's package manager will reject with an error if the child process exits with a non-zero code
  // it also buffers the output and attaches it to any errors - https://github.com/expo/spawn-async/blob/main/src/spawnAsync.ts
  const packageManager = createForProject(projectRoot, options)
  return packageManager.addDevAsync(packages).catch(error => {
    error.message += `\nstdout:\n${error.stdout}\n\nstderr:\n${error.stderr}`
    throw error
  })
}
