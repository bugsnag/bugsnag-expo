// Shared mock filesystem state — tests manipulate these directly
let mockFiles = {} // full path -> string content
let mockDirExists = {} // dir path -> boolean
let mockDirEntries = {} // dir path -> [filename strings]
let mockCreateShouldError = null // set to an Error to make create() throw
let mockCreateSideEffect = null // function to run when create() is called

const resetMockFs = () => {
  mockFiles = {}
  mockDirExists = {}
  mockDirEntries = {}
  mockCreateShouldError = null
  mockCreateSideEffect = null
}

// Must define inside jest.mock factory to avoid hoisting issues
jest.mock('expo-file-system', () => {
  class MockFile {
    constructor (...args) {
      if (args.length === 2) {
        this._path = `${args[0]}/${args[1]}`
        this._name = args[1]
      } else {
        this._path = args[0]
        this._name = args[0].split('/').pop()
      }
    }

    get name () { return this._name }

    async write (data) {
      mockFiles[this._path] = data
    }

    async text () {
      const content = mockFiles[this._path]
      if (content === undefined) throw new Error('File not found: ' + this._path)
      return content
    }

    textSync () {
      const content = mockFiles[this._path]
      if (content === undefined) throw new Error('File not found: ' + this._path)
      return content
    }

    delete () {
      delete mockFiles[this._path]
      for (const dir in mockDirEntries) {
        mockDirEntries[dir] = mockDirEntries[dir].filter(f => `${dir}/${f}` !== this._path)
      }
    }
  }

  class MockDirectory {
    constructor (path) { this._path = path }

    get exists () { return !!mockDirExists[this._path] }

    create (opts) {
      if (mockCreateSideEffect) mockCreateSideEffect()
      if (mockCreateShouldError) {
        const e = mockCreateShouldError
        mockCreateShouldError = null
        throw e
      }
      mockDirExists[this._path] = true
    }

    // Synchronous list to match implementation
    list () {
      const entries = mockDirEntries[this._path] || []
      return entries.map(name => new MockFile(`${this._path}/${name}`))
    }
  }

  return {
    File: MockFile,
    Directory: MockDirectory,
    Paths: { cache: { uri: 'file://var/data/foo.bar.app' } }
  }
})

const Queue = require('../queue')
const { Directory } = require('expo-file-system')

const QUEUE_PATH = 'file://var/data/foo.bar.app/bugsnag/stuff'

describe('delivery: expo -> queue', () => {
  beforeEach(() => {
    resetMockFs()
  })

  describe('peek()', () => {
    it('returns null if there are no files', async () => {
      mockDirEntries[QUEUE_PATH] = []
      const q = new Queue('stuff')
      const result = await q.peek()
      expect(result).toBe(null)
    })

    it('returns null if there are only files that don\'t match the expected pattern', async () => {
      mockDirEntries[QUEUE_PATH] = ['.DS_Store', '.meta', 'something_else']

      const q = new Queue('stuff')
      const result = await q.peek()
      expect(result).toBe(null)
    })

    it('parses an existing file into JSON', async () => {
      const filename = Queue.generateFilename('stuff')
      mockDirEntries[QUEUE_PATH] = [filename]
      mockFiles[`${QUEUE_PATH}/${filename}`] = JSON.stringify({
        url: 'https://notify.bugsnag.com/',
        opts: { body: '', headers: {} },
        retries: 0
      })

      const q = new Queue('stuff')
      const req = await q.peek()
      expect(req).not.toBe(null)
      expect(req?.payload.url).toBe('https://notify.bugsnag.com/')
      expect(req?.id).toBe(`${QUEUE_PATH}/${filename}`)
    })

    it('calls the onerror callback and returns null if there is an error', async () => {
      const origList = Directory.prototype.list
      Directory.prototype.list = function () { throw new Error('beep') }

      const onerror = jest.fn()
      const q = new Queue('stuff', onerror)
      const result = await q.peek()
      expect(result).toBe(null)
      expect(onerror).toHaveBeenCalled()

      Directory.prototype.list = origList
    })

    it('removes a file if it\'s not valid json', async () => {
      const filename = Queue.generateFilename('stuff')
      mockDirEntries[QUEUE_PATH] = [filename]
      mockFiles[`${QUEUE_PATH}/${filename}`] = '{ not valid json'

      const q = new Queue('stuff')
      // Should return null after removing invalid file
      const req = await q.peek()
      expect(req).toBe(null)
      expect(mockDirEntries[QUEUE_PATH]).toEqual([])
    })
  })

  describe('enqueue()', () => {
    it('ensures the directory exists first', async () => {
      mockDirExists[QUEUE_PATH] = true
      mockDirEntries[QUEUE_PATH] = []

      const q = new Queue('stuff', err => expect(err).toBe(null))
      await q.enqueue({})
    })

    it('creates the directory if it does not exist', async () => {
      mockDirExists[QUEUE_PATH] = false
      mockDirEntries[QUEUE_PATH] = []

      const q = new Queue('stuff', err => expect(err).toBe(null))
      await q.enqueue({})

      expect(mockDirExists[QUEUE_PATH]).toBe(true)
    })

    it('calls the onerror callback if there is an error', async () => {
      mockDirExists[QUEUE_PATH] = true

      const origList = Directory.prototype.list
      Directory.prototype.list = function () { throw new Error('beep') }

      const onerror = jest.fn()
      const q = new Queue('stuff', onerror)
      await q.enqueue({})

      Directory.prototype.list = origList
      expect(onerror).toHaveBeenCalled()
    })

    it('should purge items that are over the limit', async () => {
      mockDirExists[QUEUE_PATH] = true
      const files = Array(70).fill(1).map(() => Queue.generateFilename('stuff'))
      mockDirEntries[QUEUE_PATH] = [...files]
      files.forEach(f => { mockFiles[`${QUEUE_PATH}/${f}`] = '{}' })

      const q = new Queue('stuff')
      await q.enqueue({})

      // After truncation, only MAX_ITEMS should remain
      const remaining = mockDirEntries[QUEUE_PATH].filter(f => /^bugsnag-.*\.json$/.test(f)).length
      expect(remaining).toBeLessThanOrEqual(64)
    })
  })

  describe('update()', () => {
    it('should merge the updates with the existing object', async () => {
      const filePath = `${QUEUE_PATH}/bugsnag-stuff-1234.json`
      mockFiles[filePath] = JSON.stringify({ retries: 2 })

      const q = new Queue('stuff')
      await q.update(filePath, { retries: 3 })

      const updated = JSON.parse(mockFiles[filePath])
      expect(updated.retries).toBe(3)
    })
  })

  describe('init()', () => {
    // Removed test for deduplication of init(), as sync init cannot deduplicate concurrent calls

    it('should tolerate errors when the directory was succesfully created', () => {
      mockDirExists[QUEUE_PATH] = false
      mockCreateShouldError = new Error('floop')
      mockCreateSideEffect = () => { mockDirExists[QUEUE_PATH] = true }

      const q = new Queue('stuff')
      q.init()
      expect(mockDirExists[QUEUE_PATH]).toBe(true)
    })

    it('should rethrow errors when the directory was not succesfully created', () => {
      mockDirExists[QUEUE_PATH] = false
      const q = new Queue('stuff')
      mockCreateShouldError = new Error('fleerp')
      expect(() => q.init()).toThrow('fleerp')
    })

    // Removed test for rejecting all pending promises, as init is now synchronous
  })
})
