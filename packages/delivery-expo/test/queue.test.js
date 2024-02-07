const Queue = require('../queue')
const FileSystem = require('expo-file-system')

jest.mock('expo-file-system', () => ({
  cacheDirectory: 'file://var/data/foo.bar.app/',
  downloadAsync: jest.fn(() => Promise.resolve({ md5: 'md5', uri: 'uri' })),
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: true, md5: 'md5', uri: 'uri' })),
  readAsStringAsync: jest.fn(() => Promise.resolve()),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  deleteAsync: jest.fn(() => Promise.resolve()),
  moveAsync: jest.fn(() => Promise.resolve()),
  copyAsync: jest.fn(() => Promise.resolve()),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  readDirectoryAsync: jest.fn(() => Promise.resolve()),
  createDownloadResumable: jest.fn(() => Promise.resolve())
}))

describe('delivery: expo -> queue', () => {
  describe('peek()', () => {
    it('returns null if there are no files', async () => {
      const q = new Queue('stuff')
      expect(await q.peek()).toBe(null)
    })

    it('returns null if there are only files that don’t match the expected pattern', async () => {
      FileSystem.readDirectoryAsync = () => Promise.resolve(['.DS_Store', '.meta', 'something_else'])

      const q = new Queue('stuff')
      expect(await q.peek()).toBe(null)
    })

    it('parses an existing file into JSON', async () => {
      let readPath

      FileSystem.readAsStringAsync = (path) => {
        readPath = path
        return Promise.resolve(JSON.stringify({
          url: 'https://notify.bugsnag.com/',
          opts: { body: '', headers: {} },
          retries: 0
        }))
      }
      FileSystem.readDirectoryAsync = () => {
        return Promise.resolve([Queue.generateFilename('stuff')])
      }

      const q = new Queue('stuff')
      const req = await q.peek()
      expect(req).not.toBe(null)
      expect(req?.payload.url).toBe('https://notify.bugsnag.com/')
      expect(req?.id).toBe(readPath)
    })

    it('calls the onerror callback and returns null if there is an error', async () => {
      FileSystem.readAsStringAsync = (path) => Promise.reject(new Error('beep'))
      FileSystem.readDirectoryAsync = () => Promise.reject(new Error('beep'))

      const q = new Queue('stuff', err => {
        expect(err).not.toBe(null)
      })
      const req = await q.peek()
      expect(req).toBe(null)
    })

    it('removes a file if it’s not valid json', async () => {
      let files = []
      FileSystem.readAsStringAsync = (path) => Promise.resolve('{ not valid json')
      FileSystem.readDirectoryAsync = () => Promise.resolve(files)
      FileSystem.deleteAsync = async (id) => {
        files = files.filter(f => !id.endsWith(f))
        return Promise.resolve()
      }

      files.push(Queue.generateFilename('stuff'))
      const q = new Queue('stuff')
      const req = await q.peek()
      expect(req).toBe(null)
    })
  })

  describe('enqueue()', () => {
    it('ensures the directory exists first', async () => {
      FileSystem.getInfoAsync = (path) => {
        expect(path).toBe('file://var/data/foo.bar.app/bugsnag/stuff')
        return Promise.resolve({ exists: true, isDirectory: true })
      }

      FileSystem.readDirectoryAsync = () => Promise.resolve([])

      const q = new Queue('stuff', err => expect(err).toBe(null))
      await q.enqueue()
    })

    it('creates the directory if it does not exist', async () => {
      FileSystem.getInfoAsync = (path) => {
        expect(path).toBe('file://var/data/foo.bar.app/bugsnag/stuff')
        return Promise.resolve({ exists: false })
      }
      FileSystem.makeDirectoryAsync = (path) => {
        expect(path).toBe('file://var/data/foo.bar.app/bugsnag/stuff')
        return Promise.resolve()
      }

      FileSystem.readDirectoryAsync = () => Promise.resolve([])

      const q = new Queue('stuff', err => expect(err).toBe(null))
      await q.enqueue({})
    })

    it('calls the onerror callback if there is an error', async () => {
      FileSystem.getInfoAsync = () => Promise.resolve({ exists: true, isDirectory: true })
      FileSystem.readDirectoryAsync = () => {
        return Promise.reject(new Error('beep'))
      }

      const q = new Queue('stuff', err => expect(err).not.toBe(null))
      await q.enqueue({})
    })

    it('should purge items that are over the limit', async () => {
      FileSystem.getInfoAsync = () => Promise.resolve({ exists: true, isDirectory: true })
      FileSystem.readDirectoryAsync = () => {
        const files = Array(70).fill(1).map(() => Queue.generateFilename('stuff'))
        return Promise.resolve(files)
      }

      const deleteSpy = jest.spyOn(FileSystem, 'deleteAsync')

      const q = new Queue('stuff')
      await q.enqueue({})
      expect(deleteSpy).toHaveBeenCalledTimes(6)
    })
  })

  describe('update()', () => {
    it('should merge the updates with the existing object', async () => {
      FileSystem.readAsStringAsync = (path) => Promise.resolve('{"retries":2}')
      let update = { retries: 0 }
      FileSystem.writeAsStringAsync = async (path, data) => {
        update = JSON.parse(data)
        return Promise.resolve()
      }

      const q = new Queue('stuff')
      await q.update('file://var/data/foo.bar.app/bugsnag/stuff/bugsnag-stuff-1234.json', {
        retries: 3
      })

      expect(update.retries).toBe(3)
    })
  })

  describe('init()', () => {
    it('should only enter the create logic once for simultaneous calls', async () => {
      const exists = false
      const isDirectory = false
      let makeCount = 0
      FileSystem.getInfoAsync = async () => ({ exists, isDirectory })
      FileSystem.makeDirectoryAsync = () => new Promise((resolve, reject) => {
        makeCount++
        setTimeout(() => resolve(), 20)
      })

      const q = new Queue('stuff')
      const proms = []
      proms.push(() => q.init())
      proms.push(() => q.init())
      proms.push(() => new Promise((resolve, reject) => {
        setTimeout(() => {
          q.init().then(resolve, reject)
        }, 5)
      }))
      proms.push(() => new Promise((resolve, reject) => {
        setTimeout(() => {
          q.init().then(resolve, reject)
        }, 10)
      }))
      await Promise.all(proms.map(p => p()))
      expect(makeCount).toBe(1)
    })

    it('should tolerate errors when the directory was succesfully created', async () => {
      let exists = false
      let isDirectory = false
      FileSystem.getInfoAsync = jest.fn(async () => ({ exists, isDirectory }))
      FileSystem.makeDirectoryAsync = () => new Promise((resolve, reject) => {
        setTimeout(() => {
          exists = true
          isDirectory = true
          reject(new Error('floop'))
        }, 20)
      })

      const q = new Queue('stuff')
      await q.init()
      expect(FileSystem.getInfoAsync).toHaveBeenCalledTimes(2)
    })

    it('should rethrow errors when the directory was not succesfully created', async () => {
      const exists = false
      const isDirectory = false
      FileSystem.getInfoAsync = async () => ({ exists, isDirectory })
      FileSystem.makeDirectoryAsync = () => new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('fleerp'))
        }, 20)
      })

      const q = new Queue('stuff')

      await expect(q.init()).rejects.toThrow('fleerp')
    })

    it('should reject all pending promises', (done) => {
      const exists = false
      const isDirectory = false
      FileSystem.getInfoAsync = async () => ({ exists, isDirectory })
      FileSystem.makeDirectoryAsync = () => new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('fleerp'))
        }, 20)
      })

      const q = new Queue('stuff')
      const errs = []
      Promise.all([
        q.init().catch(e => errs.push(e)),
        q.init().catch(e => errs.push(e)),
        q.init().catch(e => errs.push(e))
      ]).then(() => {
        expect(errs.length).toBe(3)
        done()
      })
    })
  })
})
