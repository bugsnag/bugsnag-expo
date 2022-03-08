/* eslint-disable jest/no-try-expect */
const withFixture = require('./lib/with-fixture')
const { EventEmitter } = require('events')
const { Readable } = require('stream')

describe('expo-cli: install', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  it('should work on a fresh project (npm)', async () => {
    await withFixture('blank-00', async (projectRoot) => {
      const spawn = (cmd, args, opts) => {
        expect(cmd).toBe('npm')
        expect(args).toEqual(['install', '@bugsnag/expo@latest'])
        expect(opts).toEqual({ cwd: projectRoot })
        const proc = new EventEmitter()
        // @ts-ignore
        proc.stdout = new Readable({
          read () {
            this.push('some data on stdout')
            this.push(null)
          }
        })
        // @ts-ignore
        proc.stderr = new Readable({
          read () {
            this.push('some data on stderr')
            this.push(null)
          }
        })
        setTimeout(() => proc.emit('close', 0), 10)
        return proc
      }

      jest.doMock('child_process', () => ({ spawn }))
      const install = require('../install')

      const msg = await install('npm', 'latest', projectRoot)
      expect(msg).toBe(undefined)
    })
  })

  it('should work on a fresh project (yarn)', async () => {
    await withFixture('blank-00', async (projectRoot) => {
      const spawn = (cmd, args, opts) => {
        expect(cmd).toBe('yarn')
        expect(args).toEqual(['add', '@bugsnag/expo@6.3.1'])
        expect(opts).toEqual({ cwd: projectRoot })
        const proc = new EventEmitter()
        // @ts-ignore
        proc.stdout = new Readable({
          read () {
            this.push('some data on stdout')
            this.push(null)
          }
        })
        // @ts-ignore
        proc.stderr = new Readable({
          read () {
            this.push('some data on stderr')
            this.push(null)
          }
        })
        setTimeout(() => proc.emit('close', 0), 10)
        return proc
      }

      jest.doMock('child_process', () => ({ spawn }))
      const install = require('../install')

      const msg = await install('yarn', '6.3.1', projectRoot)
      expect(msg).toBe(undefined)
    })
  })

  it('should add stderr/stdout output onto error if there is one (non-zero exit code)', async () => {
    const spawn = (cmd, args, opts) => {
      const proc = new EventEmitter()
      // @ts-ignore
      proc.stdout = new Readable({
        read () {
          this.push('some data on stdout')
          this.push(null)
        }
      })
      // @ts-ignore
      proc.stderr = new Readable({
        read () {
          this.push('some data on stderr')
          this.push(null)
        }
      })
      setTimeout(() => proc.emit('close', 1), 10)
      return proc
    }

    jest.doMock('child_process', () => ({ spawn }))
    const install = require('../install')

    await withFixture('blank-00', async (projectRoot) => {
      try {
        await install('yarn', 'latest', projectRoot)
        expect('should not be here').toBe(false)
      } catch (e) {
        expect(e.message).toMatch(/Command exited with non-zero exit code/)
        expect(e.message).toMatch(/some data on stdout/)
        expect(e.message).toMatch(/some data on stderr/)
      }
    })
  })

  it('should throw an error if the command does', async () => {
    const spawn = (cmd, args, opts) => {
      const proc = new EventEmitter()
      // @ts-ignore
      proc.stdout = new Readable({
        read () {
          this.push('some data on stdout')
          this.push(null)
        }
      })
      // @ts-ignore
      proc.stderr = new Readable({
        read () {
          this.push('some data on stderr')
          this.push(null)
        }
      })
      setTimeout(() => proc.emit('error', new Error('floop')), 10)
      return proc
    }

    jest.doMock('child_process', () => ({ spawn }))
    const install = require('../install')

    await withFixture('blank-00', async (projectRoot) => {
      try {
        await install('yarn', 'latest', projectRoot)
        expect('should not be here').toBe(false)
      } catch (e) {
        expect(e.message).toMatch(/floop/)
      }
    })
  })

  it('should throw an error if the packageManager option is missing', async () => {
    const spawn = (cmd, args, opts) => {}

    jest.doMock('child_process', () => ({ spawn }))
    const install = require('../install')

    await withFixture('blank-00', async (projectRoot) => {
      try {
        await install(undefined, 'latest', projectRoot)
        expect('should not be here').toBe(false)
      } catch (e) {
        expect(e.message).toMatch(/Don’t know what command to use for /)
      }
    })
  })
})
