const withFixture = require('./lib/with-fixture')
const setApiKey = require('../set-api-key')
const { readFile } = require('fs/promises')

describe('expo-cli: set-api-key', () => {
  it('should work on a fresh project', async () => {
    await withFixture('blank-00', async (projectRoot) => {
      const msg = await setApiKey('AABBCCDD', projectRoot)
      expect(msg).toBe(undefined)

      const appJsonRaw = await readFile(`${projectRoot}/app.json`, 'utf8')
      const appJson = JSON.parse(appJsonRaw)
      expect(appJson.expo.extra.bugsnag.apiKey).toBe('AABBCCDD')
    })
  })

  it('shouldn’t replaces an existing API key', async () => {
    await withFixture('already-configured-00', async (projectRoot) => {
      const msg = await setApiKey('AABBCCDD', projectRoot)
      expect(msg).toBe(undefined)

      const appJsonRaw = await readFile(`${projectRoot}/app.json`, 'utf8')
      const appJson = JSON.parse(appJsonRaw)
      expect(appJson.expo.extra.bugsnag.apiKey).toBe('AABBCCDD')
    })
  })

  it('should provide a reasonable error when there is no app.json', async () => {
    await withFixture('empty-00', async (projectRoot) => {
      await expect(setApiKey('AABBCCDD', projectRoot)).rejects.toThrow(/^Couldn’t find app\.json in/)
    })
  })

  it('should provide a reasonable error when app.json is not valid JSON', async () => {
    await withFixture('malformed-json-00', async (projectRoot) => {
      await expect(setApiKey('AABBCCDD', projectRoot)).rejects.toThrow(/it wasn’t valid JSON/)
    })
  })

  it('doesn’t swallow any other errors', async () => {
    await expect(setApiKey('AABBCCDD')).rejects.toThrow(/The "path" argument must be of type string/)
  })
})
