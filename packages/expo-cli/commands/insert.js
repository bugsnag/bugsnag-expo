const prompts = require('prompts')
const insert = require('../lib/insert')
const { onCancel } = require('../lib/utils')
const { blue, yellow } = require('kleur')

module.exports = async (argv, globalOpts) => {
  const message = `The following Bugsnag initialization lines will be added to your application's entry file. Is this ok?

  ${(await insert.getCode(globalOpts['project-root'])).replace('\n', '\n  ')}
  `

  const res = await prompts({
    type: 'confirm',
    name: 'insert',
    message,
    initial: true
  }, { onCancel })
  console.log(blue('> Inserting Bugsnag initialization into the entry file'))
  if (res.insert) {
    const msg = await insert(globalOpts['project-root'])
    if (msg) console.log(yellow(`  ${msg}`))
  }
}
