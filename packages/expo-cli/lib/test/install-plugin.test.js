const withFixture = require('./lib/with-fixture')

describe('expo-cli: upload-sourcemaps install plugin', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  it('should work on a fresh project', async () => {
    await withFixture('blank-js', async (projectRoot) => {
      const packageManager = {
        addDevAsync: async (packages) => {
          expect(packages).toEqual(['@bugsnag/plugin-expo-eas-sourcemaps', '@bugsnag/source-maps'])
          return Promise.resolve()
        }
      }

      const createForProject = (root, options) => {
        expect(root).toEqual(projectRoot)
        expect(options).toEqual({ npm: false, yarn: false })
        return packageManager
      }

      jest.doMock('@expo/package-manager', () => ({ createForProject }))
      const installPlugin = require('../install-plugin')

      const msg = await installPlugin('latest', projectRoot, { npm: false, yarn: false })
      expect(msg).toBe(undefined)
    })
  })

  it('should allow forcing install with NPM', async () => {
    await withFixture('blank-js', async (projectRoot) => {
      const packageManager = {
        addDevAsync: async (packages) => {
          expect(packages).toEqual(['@bugsnag/plugin-expo-eas-sourcemaps', '@bugsnag/source-maps'])
          return Promise.resolve()
        }
      }

      const createForProject = (root, options) => {
        expect(root).toEqual(projectRoot)
        expect(options).toEqual({ npm: true })
        return packageManager
      }

      jest.doMock('@expo/package-manager', () => ({ createForProject }))
      const installPlugin = require('../install-plugin')

      const msg = await installPlugin('latest', projectRoot, { npm: true })
      expect(msg).toBe(undefined)
    })
  })

  it('should allow forcing install with Yarn', async () => {
    await withFixture('blank-js', async (projectRoot) => {
      const packageManager = {
        addDevAsync: async (packages) => {
          expect(packages).toEqual(['@bugsnag/plugin-expo-eas-sourcemaps', '@bugsnag/source-maps'])
          return Promise.resolve()
        }
      }

      const createForProject = (root, options) => {
        expect(root).toEqual(projectRoot)
        expect(options).toEqual({ yarn: true })
        return packageManager
      }

      jest.doMock('@expo/package-manager', () => ({ createForProject }))
      const installPlugin = require('../install-plugin')

      const msg = await installPlugin('latest', projectRoot, { yarn: true })
      expect(msg).toBe(undefined)
    })
  })

  // not sure if this test is really necessary any more?
  it('should allow forcing install with both NPM and Yarn', async () => {
    await withFixture('blank-js', async (projectRoot) => {
      const packageManager = {
        addDevAsync: async (packages) => {
          expect(packages).toEqual(['@bugsnag/plugin-expo-eas-sourcemaps', '@bugsnag/source-maps'])
          return Promise.resolve()
        }
      }

      const createForProject = (root, options) => {
        expect(root).toEqual(projectRoot)
        expect(options).toEqual({ npm: true, yarn: true })
        return packageManager
      }

      jest.doMock('@expo/package-manager', () => ({ createForProject }))
      const installPlugin = require('../install-plugin')

      const msg = await installPlugin('latest', projectRoot, { npm: true, yarn: true })
      expect(msg).toBe(undefined)
    })
  })

  it('should allow specifying a package version', async () => {
    await withFixture('blank-js', async (projectRoot) => {
      const packageManager = {
        addDevAsync: async (packages) => {
          expect(packages).toEqual(['@bugsnag/plugin-expo-eas-sourcemaps@^48.0.0', '@bugsnag/source-maps'])
          return Promise.resolve()
        }
      }

      const createForProject = (root, options) => {
        expect(root).toEqual(projectRoot)
        expect(options).toEqual({ yarn: false })
        return packageManager
      }

      jest.doMock('@expo/package-manager', () => ({ createForProject }))
      const installPlugin = require('../install-plugin')
      const msg = await installPlugin('^48.0.0', projectRoot, { yarn: false })
      expect(msg).toBe(undefined)
    })
  })

  it('should throw an error if the command does', async () => {
    await withFixture('blank-js', async (projectRoot) => {
      const packageManager = {
        addDevAsync: async (packages) => {
          expect(packages).toEqual(['@bugsnag/plugin-expo-eas-sourcemaps', '@bugsnag/source-maps'])
          return Promise.reject(new Error('floop'))
        }
      }

      const createForProject = (root, options) => {
        expect(root).toEqual(projectRoot)
        expect(options).toEqual({ yarn: false })
        return packageManager
      }

      jest.doMock('@expo/package-manager', () => ({ createForProject }))
      const installPlugin = require('../install-plugin')
      await expect(installPlugin('latest', projectRoot, { yarn: false })).rejects.toThrow(/floop/)
    })
  })

  it('should add stderr/stdout output onto error if there is one', async () => {
    const packageManager = {
      addDevAsync: async (packages) => {
        expect(packages).toEqual(['@bugsnag/plugin-expo-eas-sourcemaps', '@bugsnag/source-maps'])
        const error = new Error('floop')
        error.stdout = 'some data on stdout'
        error.stderr = 'some data on stderr'
        return Promise.reject(error)
      }
    }

    const createForProject = (root, options) => {
      return packageManager
    }

    jest.doMock('@expo/package-manager', () => ({ createForProject }))
    const installPlugin = require('../install-plugin')

    await withFixture('blank-js', async (projectRoot) => {
      const expected = `floop
stdout:
some data on stdout

stderr:
some data on stderr`

      await expect(installPlugin('latest', projectRoot, { npm: false })).rejects.toThrow(expected)
    })
  })
})
