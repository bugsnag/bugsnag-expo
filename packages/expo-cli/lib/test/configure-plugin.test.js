const withFixture = require('./lib/with-fixture')
const configurePlugin = require('../configure-plugin')
const { readFile } = require('fs/promises')
const { blue } = require('kleur')

describe('expo-cli: upload sourcemaps configure-plugin', () => {
  it('should work on a fresh project', async () => {
    await withFixture('blank-js', async (projectRoot) => {
      const msg = await configurePlugin(projectRoot)
      expect(msg).toBe(undefined)

      const appJsonRaw = await readFile(`${projectRoot}/app.json`, 'utf8')
      const appJson = JSON.parse(appJsonRaw)
      expect(appJson.expo.plugins).toContain('@bugsnag/plugin-expo-eas-sourcemaps')

      const packageJsonRaw = await readFile(`${projectRoot}/package.json`, 'utf8')
      const packageJson = JSON.parse(packageJsonRaw)
      expect(packageJson.scripts['eas-build-on-success']).toContain('npx bugsnag-eas-build-on-success')
    })
  })

  it('shouldn’t duplicate the hook config', async () => {
    await withFixture('already-installed-02', async (projectRoot) => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

      await configurePlugin(projectRoot)
      expect(logSpy).toHaveBeenCalledWith(blue('Plugin is already configured in app.json'))

      const appJsonRaw = await readFile(`${projectRoot}/app.json`, 'utf8')
      const appJson = JSON.parse(appJsonRaw)
      expect(appJson.expo.plugins.length).toBe(1)
    })
  })

  it('shouldn’t duplicate the EAS build hook', async () => {
    await withFixture('already-installed-01', async (projectRoot) => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

      await configurePlugin(projectRoot)
      expect(logSpy).toHaveBeenCalledWith(blue('EAS Build hook already configured in package.json'))

      const packageJsonRaw = await readFile(`${projectRoot}/package.json`, 'utf8')
      const packageJson = JSON.parse(packageJsonRaw)
      expect(packageJson.scripts['eas-build-on-success']).toStrictEqual('npx bugsnag-eas-build-on-success')
    })
  })

  it('should chain to an existing EAS build hook if present', async () => {
    await withFixture('already-installed-02', async (projectRoot) => {
      await configurePlugin(projectRoot)

      const packageJsonRaw = await readFile(`${projectRoot}/package.json`, 'utf8')
      const packageJson = JSON.parse(packageJsonRaw)
      expect(packageJson.scripts['eas-build-on-success']).toStrictEqual('pre-existing-command && npx bugsnag-eas-build-on-success')
    })
  })

  it('should provide a reasonable error when there is no package.json', async () => {
    await withFixture('empty-00', async (projectRoot) => {
      await expect(configurePlugin(projectRoot)).rejects.toThrow(/Couldn’t find package\.json/)
    })
  })

  it('should create a basic file when there is no app.json', async () => {
    await withFixture('empty-01', async (projectRoot) => {
      const msg = await configurePlugin(projectRoot)
      expect(msg).toBe(undefined)

      const appJsonRaw = await readFile(`${projectRoot}/app.json`, 'utf8')
      const appJson = JSON.parse(appJsonRaw)
      expect(appJson.expo.plugins).toStrictEqual(['@bugsnag/plugin-expo-eas-sourcemaps'])
    })
  })

  it('should provide a reasonable error when app.json is not valid JSON', async () => {
    await withFixture('malformed-json-00', async (projectRoot) => {
      await expect(configurePlugin(projectRoot)).rejects.toThrow(/it wasn’t valid JSON/)
    })
  })

  it('doesn’t swallow any other errors', async () => {
    await expect(configurePlugin()).rejects.toThrow(/The "path" argument must be of type string/)
  })
})
