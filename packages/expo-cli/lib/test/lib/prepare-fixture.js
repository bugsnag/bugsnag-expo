const { v4: uuidv4 } = require('uuid')

const exec = require('child_process').execSync

const prepareFixture = async fixture => {
  const tmp = `${__dirname}/../.tmp${uuidv4()}`

  const target = `${tmp}/${fixture}`

  exec(`mkdir -p ${target}`)
  exec(`cp -r ${__dirname}/../fixtures/${fixture}/* ${target}`)

  // give the target path and a clean up function to the caller
  return { target, clean: () => exec(`rm -r ${tmp}`) }
}

module.exports = { prepareFixture }
