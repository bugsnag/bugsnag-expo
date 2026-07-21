const prompts = require('prompts')
const insert = require('../lib/insert')
const { onCancel } = require('../lib/utils')
const { blue, yellow } = require('kleur')

/**
 * Validates that a project-root path is safe to use.
 * Rejects values containing path-traversal sequences or shell metacharacters.
 * @param {string} projectRoot
 * @returns {string} the validated path
 * @throws {Error} if the path is invalid
 */
function validateProjectRoot (projectRoot) {
  if (typeof projectRoot !== 'string' || projectRoot.trim() === '') {
    throw new Error('Invalid project root: must be a non-empty string.')
  }
  // Reject path traversal
  if (projectRoot.includes('..')) {
    throw new Error('Invalid project root: path traversal sequences are not allowed.')
  }
  // Reject shell metacharacters that have no place in a filesystem path
  // eslint-disable-next-line no-control-regex
  const UNSAFE_CHARS = /[;&|`$<>'"\\!\x00-\x1f\x7f]/
  if (UNSAFE_CHARS.test(projectRoot)) {
    throw new Error('Invalid project root: path contains disallowed characters.')
  }
  return projectRoot
}

/**
 * Strips ANSI escape sequences and non-printable control characters from a
 * string before it is embedded in terminal output.
 * @param {string} str
 * @returns {string}
 */
function sanitizeForDisplay (str) {
  // Remove ANSI/VT escape sequences
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '').replace(/[^\x20-\x7e\n\r\t]/g, '')
}

module.exports = async (argv, globalOpts) => {
  const projectRoot = validateProjectRoot(globalOpts['project-root'])

  const rawCode = await insert.getCode(projectRoot)
  const safeCode = sanitizeForDisplay(rawCode)

  const message = `The following Bugsnag initialization lines will be added to your application's entry file. Is this ok?

  ${safeCode.replace('\n', '\n  ')}
  `

  const res = await prompts({
    type: 'confirm',
    name: 'insert',
    message,
    initial: true
  }, { onCancel })
  console.log(blue('> Inserting Bugsnag initialization into the entry file'))
  if (res.insert) {
    const msg = await insert(projectRoot)
    if (msg) console.log(yellow(`  ${msg}`))
  }
}