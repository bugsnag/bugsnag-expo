const install = require('./install')
const setApiKey = require('./set-api-key')
const insert = require('./insert')
const uploadSourcemaps = require('./upload-sourcemaps')

module.exports = async (argv, globalOpts) => {
  await install(argv, globalOpts)
  await setApiKey(argv, globalOpts)
  await insert(argv, globalOpts)
  await uploadSourcemaps(argv, globalOpts)
}
