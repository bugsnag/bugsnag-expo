const fs = require('fs/promises')
const os = require('os')
const exec = require('child_process').execSync

module.exports = async (fixture, callback) => {
  const tmp = await fs.mkdtemp(`${os.tmpdir()}/bugsnag-js-${fixture}`)

  exec(`cp -r ${__dirname}/../fixtures/${fixture}/* ${tmp}`)

  try {
    await callback(tmp)
  } finally {
    exec(`rm -r ${tmp}`)
  }
}
