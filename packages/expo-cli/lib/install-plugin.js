const { spawn } = require('child_process')

function resolveCommand (options) {
  const command = ['install', '@bugsnag/plugin-expo-eas-sourcemaps', '@bugsnag/source-maps']

  if (options.npm) {
    command.push('--npm')
  }

  if (options.yarn) {
    command.push('--yarn')
  }

  // dev dependencies
  command.push('--')
  command.push('-D')

  return command
}

module.exports = (projectRoot, options) => {
  return new Promise((resolve, reject) => {
    const command = resolveCommand(options)
    const proc = spawn('expo', command, { cwd: projectRoot })

    // buffer output in case of an error
    let stdout = ''
    let stderr = ''
    proc.stdout.on('data', d => { stdout += d })
    proc.stderr.on('data', d => { stderr += d })

    proc.on('error', err => { reject(err) })

    proc.on('close', code => {
      if (code === 0) {
        return resolve()
      }

      reject(
        new Error(
          `Command exited with non-zero exit code (${code}) "expo ${command.join(' ')}"\nstdout:\n${stdout}\n\nstderr:\n${stderr}`
        )
      )
    })
  })
}
