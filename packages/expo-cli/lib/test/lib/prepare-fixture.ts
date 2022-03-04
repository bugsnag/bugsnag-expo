import { v4 as uuidv4 } from 'uuid'

const exec = require('child_process').execSync

export const prepareFixture = async (fixture: string) => {
  const tmp = `${__dirname}/../.tmp${uuidv4()}`

  const target = `${tmp}/${fixture}`

  exec(`mkdir -p ${target}`)
  exec(`cp -r ${__dirname}/../fixtures/${fixture}/* ${target}`)

  // give the target path and a clean up function to the caller
  return { target, clean: () => exec(`rm -r ${tmp}`) }
}
