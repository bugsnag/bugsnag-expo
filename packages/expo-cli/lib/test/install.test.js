const withFixture = require('./lib/with-fixture')
const { EventEmitter } = require('events')
const { Readable } = require('stream')

describe('expo-cli: install', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  it('should work on a fresh project', async () => {
    await withFixture('blank-00', async (projectRoot) => {
      const spawn = (cmd, args, opts) => {
        expect(cmd).toBe('expo')
        expect(args).toEqual([
          'install',
          '@bugsnag/expo',
          '@react-native-community/netinfo',
          'expo-application',
          'expo-constants',
          'expo-crypto',
          'expo-device',
          'expo-file-system'
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
      const install = require('../install')

      const msg = await install('latest', projectRoot, { npm: false, yarn: false })
      expect(msg).toBe(undefined)
    })
  })

  it('should allow forcing install with NPM', async () => {
    await withFixture('blank-00', async (projectRoot) => {
      const spawn = (cmd, args, opts) => {
        expect(cmd).toBe('expo')
        expect(args).toEqual([
          'install',
          '@bugsnag/expo',
          '@react-native-community/netinfo',
          'expo-application',
          'expo-constants',
          'expo-crypto',
          'expo-device',
          'expo-file-system',
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
      const install = require('../install')

      const msg = await install('latest', projectRoot, { npm: true })
      expect(msg).toBe(undefined)
    })
  })

  it('should allow forcing install with Yarn', async () => {
    await withFixture('blank-00', async (projectRoot) => {
      const spawn = (cmd, args, opts) => {
        expect(cmd).toBe('expo')
        expect(args).toEqual([
          'install',
          '@bugsnag/expo',
          '@react-native-community/netinfo',
          'expo-application',
          'expo-constants',
          'expo-crypto',
          'expo-device',
          'expo-file-system',
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
      const install = require('../install')

      const msg = await install('latest', projectRoot, { yarn: true })
      expect(msg).toBe(undefined)
    })
  })

  it('should allow forcing install with both NPM and Yarn', async () => {
    await withFixture('blank-00', async (projectRoot) => {
      const spawn = (cmd, args, opts) => {
        expect(cmd).toBe('expo')
        expect(args).toEqual([
          'install',
          '@bugsnag/expo',
          '@react-native-community/netinfo',
          'expo-application',
          'expo-constants',
          'expo-crypto',
          'expo-device',
          'expo-file-system',
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
      const install = require('../install')

      const msg = await install('latest', projectRoot, { npm: true, yarn: true })
      expect(msg).toBe(undefined)
    })
  })

  it('should add stderr/stdout output onto error if there is one (non-zero exit code)', async () => {
    const spawn = (cmd, args, opts) => {
      const proc = new EventEmitter()
      proc.stdout = new Readable({
        read () {
          this.push('some data on stdout')
          this.push(null)
        }
      })
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
      const expected = `Command exited with non-zero exit code (1) "expo install @bugsnag/expo @react-native-community/netinfo expo-application expo-constants expo-crypto expo-device expo-file-system"
stdout:
some data on stdout

stderr:
some data on stderr`

      await expect(install('latest', projectRoot, { npm: false })).rejects.toThrow(expected)
    })
  })

  it('should throw an error if the command does', async () => {
    const spawn = (cmd, args, opts) => {
      const proc = new EventEmitter()
      proc.stdout = new Readable({
        read () {}
      })
      proc.stderr = new Readable({
        read () {}
      })
      setTimeout(() => proc.emit('error', new Error('floop')), 10)
      return proc
    }

    jest.doMock('child_process', () => ({ spawn }))
    const install = require('../install')

    await withFixture('blank-00', async (projectRoot) => {
      await expect(install('latest', projectRoot, { yarn: false })).rejects.toThrow(/floop/)
    })
  })
})
