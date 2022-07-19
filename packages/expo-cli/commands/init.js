const install = require('./install')
const setApiKey = require('./set-api-key')
const insert = require('./insert')
const addHook = require('./add-hook')
const uploadSourcemaps = require('./upload-sourcemaps')
const { access } = require('fs')
const { join } = require('path')

module.exports = async (argv, globalOpts) => {
  await install(argv, globalOpts)
  await setApiKey(argv, globalOpts)
  await insert(argv, globalOpts)

  const projectRoot = globalOpts['project-root']
  const easPresent = await access(join(projectRoot, 'eas.json'))

  if (easPresent) {
    await uploadSourcemaps(argv, globalOpts)
  } else {
    await addHook(argv, globalOpts)
  }
}
