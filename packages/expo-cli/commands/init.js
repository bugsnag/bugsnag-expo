const install = require('./install')
const setApiKey = require('./set-api-key')
const insert = require('./insert')
const addHook = require('./add-hook')
const uploadSourcemaps = require('./upload-sourcemaps')
const { access, constants } = require('fs')
const { join } = require('path')

module.exports = async (argv, globalOpts) => {
  await install(argv, globalOpts)
  await setApiKey(argv, globalOpts)
  await insert(argv, globalOpts)

  await access(join(globalOpts['project-root'], 'eas.json'), constants.R_OK, async (err) => {
    if (err) {
      await addHook(argv, globalOpts)
    } else {
      await uploadSourcemaps(argv, globalOpts)
    }
  })
}
