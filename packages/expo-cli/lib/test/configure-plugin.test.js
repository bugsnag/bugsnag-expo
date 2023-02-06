const withFixture = require('./lib/with-fixture')
const configurePlugin = require('../configure-plugin')
const { readFile } = require('fs/promises')

describe('expo-cli: upload sourcemaps configure-plugin', () => {
  it('should work on a fresh project', async () => {
    await withFixture('blank-js', async (projectRoot) => {
      const msg = await configurePlugin(projectRoot)
      expect(msg).toBe(undefined)

      const appJsonRaw = await readFile(`${projectRoot}/app.json`, 'utf8')
      const appJson = JSON.parse(appJsonRaw)

      expect(appJson.expo.plugins).toContain('@bugsnag/plugin-expo-eas-sourcemaps')
    })
  })

  it('shouldn’t duplicate the hook config', async () => {
    await withFixture('already-installed-02', async (projectRoot) => {
      const msg = await configurePlugin(projectRoot)
      expect(msg).toMatch(/ is already installed/)

      const appJsonRaw = await readFile(`${projectRoot}/app.json`, 'utf8')
      const appJson = JSON.parse(appJsonRaw)

      expect(appJson.expo.plugins.length).toBe(1)
    })
  })

  it('should create a basic file when there is no app.json', async () => {
    await withFixture('empty-00', async (projectRoot) => {
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
