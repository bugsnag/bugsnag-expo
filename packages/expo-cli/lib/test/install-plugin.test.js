const withFixture = require('./lib/with-fixture')
const { EventEmitter } = require('events')
const { Readable } = require('stream')

describe('expo-cli: upload-sourcemaps install plugin', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  it('should work on a fresh project', async () => {
    await withFixture('blank-00', async (projectRoot) => {
      const spawn = (cmd, args, opts) => {
        expect(cmd).toBe('expo')
        expect(args).toEqual(['install', '@bugsnag/plugin-expo-eas-sourcemaps'])
        expect(opts).toEqual({ cwd: projectRoot })

        const proc = new EventEmitter()
        proc.stdout = new Readable({
          read () {}
        })
        proc.stderr = new Readable({
          read () {}
        })
        setTimeout(() => proc.emit('close', 0), 10)
        return proc
      }

      jest.doMock('child_process', () => ({ spawn }))
      const installPlugin = require('../install-plugin')

      const msg = await installPlugin('latest', projectRoot, { npm: false, yarn: false })
      expect(msg).toBe(undefined)
    })
  })

  it('should allow forcing install with NPM', async () => {
    await withFixture('blank-00', async (projectRoot) => {
      const spawn = (cmd, args, opts) => {
        expect(cmd).toBe('expo')
        expect(args).toEqual([
          'install',
          '@bugsnag/plugin-expo-eas-sourcemaps',
          '--npm'
        ])
        expect(opts).toEqual({ cwd: projectRoot })

        const proc = new EventEmitter()
        proc.stdout = new Readable({
          read () {}
        })
        proc.stderr = new Readable({
          read () {}
        })
        setTimeout(() => proc.emit('close', 0), 10)
        return proc
      }

      jest.doMock('child_process', () => ({ spawn }))
      const installPlugin = require('../install-plugin')

      const msg = await installPlugin('latest', projectRoot, { npm: true })
      expect(msg).toBe(undefined)
    })
  })

  it('should allow forcing install with Yarn', async () => {
    await withFixture('blank-00', async (projectRoot) => {
      const spawn = (cmd, args, opts) => {
        expect(cmd).toBe('expo')
        expect(args).toEqual([
          'install',
          '@bugsnag/plugin-expo-eas-sourcemaps',
          '--yarn'
        ])
        expect(opts).toEqual({ cwd: projectRoot })

        const proc = new EventEmitter()
        proc.stdout = new Readable({
          read () {}
        })
        proc.stderr = new Readable({
          read () {}
        })
        setTimeout(() => proc.emit('close', 0), 10)
        return proc
      }

      jest.doMock('child_process', () => ({ spawn }))
      const installPlugin = require('../install-plugin')

      const msg = await installPlugin('latest', projectRoot, { yarn: true })
      expect(msg).toBe(undefined)
    })
  })

  it('should allow forcing install with both NPM and Yarn', async () => {
    await withFixture('blank-00', async (projectRoot) => {
      const spawn = (cmd, args, opts) => {
        expect(cmd).toBe('expo')
        expect(args).toEqual([
          'install',
          '@bugsnag/plugin-expo-eas-sourcemaps',
          '--npm',
          '--yarn'
        ])

        expect(opts).toEqual({ cwd: projectRoot })

        const proc = new EventEmitter()
        proc.stdout = new Readable({
          read () {}
        })
        proc.stderr = new Readable({
          read () {}
        })
        setTimeout(() => proc.emit('close', 0), 10)
        return proc
      }

      jest.doMock('child_process', () => ({ spawn }))
      const installPlugin = require('../install-plugin')

      const msg = await installPlugin('latest', projectRoot, { npm: true, yarn: true })
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
    const installPlugin = require('../install-plugin')

    await withFixture('blank-00', async (projectRoot) => {
      const expected = `Command exited with non-zero exit code (1) "expo install @bugsnag/plugin-expo-eas-sourcemaps"
stdout:
some data on stdout

stderr:
some data on stderr`

      await expect(installPlugin('latest', projectRoot, { npm: false })).rejects.toThrow(expected)
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
    const installPlugin = require('../install-plugin')

    await withFixture('blank-00', async (projectRoot) => {
      await expect(installPlugin('latest', projectRoot, { yarn: false })).rejects.toThrow(/floop/)
    })
  })
})
