const { spawn } = require('child_process')

function resolvePackageName (version) {
  if (version === 'latest') {
    return '@bugsnag/expo'
  }

  return `@bugsnag/expo@${version}`
}

module.exports = (version, projectRoot) => {
  return new Promise((resolve, reject) => {
    const command = ['install', resolvePackageName(version)]
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
