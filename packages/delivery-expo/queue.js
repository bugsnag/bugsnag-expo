const { File, Directory, Paths } = require('expo-file-system')

const MAX_ITEMS = 64
const PAYLOAD_PATH = `${Paths.cache.uri}/bugsnag`
const filenameRe = /^bugsnag-.*\.json$/

/*
 * This class resembles FIFO queue in which to store undelivered payloads.
 */
module.exports = class UndeliveredPayloadQueue {
  constructor (resource, onerror = () => {}) {
    this._resource = resource
    this._path = `${PAYLOAD_PATH}/${this._resource}`
    this._onerror = onerror
  }

  /*
   * Ensure the persistent cache directory exists
   */
  init () {
    if (this._checkCacheDirExists()) return
    try {
      const dir = new Directory(this._path)
      dir.create({ intermediates: true })
    } catch (e) {
      // Expo has a bug where directory creation can error, even though it succesfully
      // created the directory. See:
      //   https://github.com/expo/expo/issues/2050
      //   https://forums.expo.io/t/makedirectoryasync-error-could-not-be-created/11916
      //
      // To tolerate this, after getting an error, we check whether the directory
      // now exist, swallowing the error if so, rethrowing if not.
      if (this._checkCacheDirExists()) return
      throw e
    }
  }

  /*
   * Check if the cache directory exists
   */
  _checkCacheDirExists () {
    const dir = new Directory(this._path)
    return dir.exists
  }

  /*
   * Keeps the queue size bounded by MAX_LENGTH
   */
  _truncate () {
    try {
      // list the payloads in order
      const dir = new Directory(this._path)
      const entries = dir.list()
      const payloads = entries
        .filter(entry => entry instanceof File && filenameRe.test(entry.name))
        .map(entry => entry.name)
        .sort()

      // figure out how many over MAX_ITEMS we are
      const diff = payloads.length - MAX_ITEMS

      // do nothing if within the limit
      if (diff < 0) return

      // remove items over the limit
      payloads.slice(0, diff).forEach(f => this.remove(`${this._path}/${f}`))
    } catch (e) {
      this._onerror(e)
    }
  }

  /*
   * Adds an item to the end of the queue
   */
  enqueue (req) {
    try {
      this.init()
      const file = new File(this._path, generateFilename(this._resource))
      file.write(JSON.stringify({ ...req, retries: 0 }))
      this._truncate()
    } catch (e) {
      this._onerror(e)
    }
  }

  /*
   * Returns the oldest item in the queue without removing it
   */
  peek () {
    try {
      const dir = new Directory(this._path)
      const entries = dir.list()
      const payloadFileName = entries
        .filter(entry => entry instanceof File && filenameRe.test(entry.name))
        .map(entry => entry.name)
        .sort()[0]
      if (!payloadFileName) return null
      const id = `${this._path}/${payloadFileName}`

      try {
        const file = new File(id)
        const payloadJson = file.textSync()
        const payload = JSON.parse(payloadJson)
        return { id, payload }
      } catch (e) {
        // if we got here it's because
        // a) JSON.parse failed or
        // b) the file can no longer be read (maybe it was truncated?)
        // in both cases we want to speculatively remove it and try peeking again
        this.remove(id)
        return this.peek()
      }
    } catch (e) {
      this._onerror(e)
      return null
    }
  }

  /*
   * Removes an item from the queue by its id (full path).
   * Tolerant of errors while removing.
   */
  remove (id) {
    try {
      const file = new File(id)
      file.delete()
    } catch (e) {
      this._onerror(e)
    }
  }

  /*
   * Applies the provided updates to an item. This does a 1-level shallow merge on
   * an object, i.e. it replaces top level keys
   */
  update (id, updates) {
    try {
      const file = new File(id)
      const payloadJson = file.textSync()
      const payload = JSON.parse(payloadJson)
      const updatedPayload = { ...payload, ...updates }
      file.write(JSON.stringify(updatedPayload))
    } catch (e) {
      this._onerror(e)
    }
  }
}

// create a random 16 byte uri
const uid = () => {
  return Array(16).fill(1).reduce((accum, val) => {
    return accum + Math.floor(Math.random() * 10).toString()
  }, '')
}

const generateFilename = module.exports.generateFilename = resource =>
  `bugsnag-${resource}-${(new Date()).toISOString()}-${uid()}.json`
