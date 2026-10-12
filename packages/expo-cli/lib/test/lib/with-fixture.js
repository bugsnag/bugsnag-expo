const fs = require('fs/promises')
const os = require('os')

module.exports = async (fixture, callback) => {
  const tmp = await fs.mkdtemp(`${os.tmpdir()}/bugsnag-js-${fixture}`)

  await fs.cp(`${__dirname}/../fixtures/${fixture}`, tmp, { recursive: true })

  try {
    await callback(tmp)
  } finally {
    await fs.rm(tmp, { recursive: true, force: true })
  }
}
