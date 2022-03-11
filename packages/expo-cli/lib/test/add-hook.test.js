/* eslint-disable jest/no-try-expect */
const withFixture = require('./lib/with-fixture')
const addHook = require('../add-hook')
const { readFile } = require('fs/promises')

describe('expo-cli: add-hook', () => {
  it('should work on a fresh project', async () => {
    await withFixture('blank-00', async (projectRoot) => {
      const msg = await addHook(projectRoot)
      expect(msg).toBe(undefined)

      const appJsonRaw = await readFile(`${projectRoot}/app.json`, 'utf8')
      const appJson = JSON.parse(appJsonRaw)

      expect(appJson.expo.hooks.postPublish[0].file).toBe('@bugsnag/expo/hooks/post-publish.js')
    })
  })

  it('shouldn’t duplicate the hook config', async () => {
    await withFixture('already-configured-00', async (projectRoot) => {
      const msg = await addHook(projectRoot)
      expect(msg).toMatch(/already/)

      const appJsonRaw = await readFile(`${projectRoot}/app.json`, 'utf8')
      const appJson = JSON.parse(appJsonRaw)

      expect(appJson.expo.hooks.postPublish.length).toBe(1)
    })
  })

  it('should provide a reasonable error when there is no app.json', async () => {
    await withFixture('empty-00', async (projectRoot) => {
      try {
        await addHook(projectRoot)
        expect('should not be here').toBe(false)
      } catch (e) {
        expect(e.message).toMatch(/^Couldn’t find app\.json in/)
      }
    })
  })

  it('should provide a reasonable error when app.json is not valid JSON', async () => {
    await withFixture('malformed-json-00', async (projectRoot) => {
      try {
        await addHook(projectRoot)
        expect('should not be here').toBe(false)
      } catch (e) {
        expect(e.message).toMatch(/it wasn’t valid JSON/)
      }
    })
  })

  it('doesn’t swallow any other errors', async () => {
    try {
      await addHook(/* projectRoot is required */)
      expect('should not be here').toBe(false)
    } catch (e) {
      expect(e.message).toMatch(/The "path" argument must be of type string/)
    }
  })
})
