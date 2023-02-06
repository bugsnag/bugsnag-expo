const withFixture = require('./lib/with-fixture')
const insert = require('../insert')
const { readFile } = require('fs/promises')

describe('expo-cli: insert', () => {
  it('should work on a fresh javascript project', async () => {
    await withFixture('blank-js', async (projectRoot) => {
      const msg = await insert(projectRoot)
      expect(msg).toBe(undefined)

      const appJs = await readFile(`${projectRoot}/App.js`, 'utf8')
      expect(appJs).toMatch(/^import Bugsnag from '@bugsnag\/expo';\sBugsnag.start\(\);\s/)
    })
  })

  it('should work on a fresh typescript project and prioritise .ts over .js', async () => {
    await withFixture('blank-ts-and-js', async (projectRoot) => {
      const appJsBefore = await readFile(`${projectRoot}/App.js`, 'utf8')
      const msg = await insert(projectRoot)
      expect(msg).toBe(undefined)

      const appTs = await readFile(`${projectRoot}/App.ts`, 'utf8')
      const appJsAfter = await readFile(`${projectRoot}/App.js`, 'utf8')
      expect(appTs).toMatch(/^import Bugsnag from '@bugsnag\/expo';\sBugsnag.start\(\);\s/)
      expect(appJsAfter).toBe(appJsBefore)
    })
  })

  it('shouldn’t insert if @bugsnag/expo is already imported (import, js)', async () => {
    await withFixture('already-configured-js-import', async (projectRoot) => {
      const appJsBefore = await readFile(`${projectRoot}/App.js`, 'utf8')
      const msg = await insert(projectRoot)
      expect(msg).toMatch(/already/)

      const appJsAfter = await readFile(`${projectRoot}/App.js`, 'utf8')
      expect(appJsAfter).toBe(appJsBefore)
    })
  })

  it('shouldn’t insert if @bugsnag/expo is already imported (require, js)', async () => {
    await withFixture('already-configured-js-require', async (projectRoot) => {
      const appJsBefore = await readFile(`${projectRoot}/App.js`, 'utf8')
      const msg = await insert(projectRoot)
      expect(msg).toMatch(/already/)

      const appJsAfter = await readFile(`${projectRoot}/App.js`, 'utf8')
      expect(appJsAfter).toBe(appJsBefore)
    })
  })

  it('shouldn’t insert if @bugsnag/expo is already imported (import, ts)', async () => {
    await withFixture('already-configured-ts-import', async (projectRoot) => {
      const appTsBefore = await readFile(`${projectRoot}/App.ts`, 'utf8')
      const msg = await insert(projectRoot)
      expect(msg).toMatch(/already/)

      const appTsAfter = await readFile(`${projectRoot}/App.ts`, 'utf8')
      expect(appTsAfter).toBe(appTsBefore)
    })
  })

  it('shouldn’t insert if @bugsnag/expo is already imported (require, ts)', async () => {
    await withFixture('already-configured-ts-require', async (projectRoot) => {
      const appTsBefore = await readFile(`${projectRoot}/App.ts`, 'utf8')
      const msg = await insert(projectRoot)
      expect(msg).toMatch(/already/)

      const appTsAfter = await readFile(`${projectRoot}/App.ts`, 'utf8')
      expect(appTsAfter).toBe(appTsBefore)
    })
  })

  it('should provide a reasonable error when there is no App.js or App.ts', async () => {
    await withFixture('empty-00', async (projectRoot) => {
      await expect(insert(projectRoot)).rejects.toThrow(/^Couldn’t find App\.js or App\.ts in/)
    })
  })

  it('doesn’t swallow any other errors', async () => {
    await expect(insert(/* projectRoot is required */)).rejects.toThrow(/The "path" argument must be of type string/)
  })

  it('inserts correct code for pre v7 versions of Bugsnag (js)', async () => {
    await withFixture('already-installed-prev7-js', async (projectRoot) => {
      const msg = await insert(projectRoot)
      expect(msg).toBe(undefined)

      const appJs = await readFile(`${projectRoot}/App.js`, 'utf8')
      expect(appJs).toMatch(/^import bugsnag from '@bugsnag\/expo';\sconst bugsnagClient = bugsnag\(\);\s/)
    })
  })

  it('inserts correct code for post v7.0.0 versions of Bugsnag (js)', async () => {
    await withFixture('already-installed-postv7-js', async (projectRoot) => {
      const msg = await insert(projectRoot)
      expect(msg).toBe(undefined)

      const appJs = await readFile(`${projectRoot}/App.js`, 'utf8')
      expect(appJs).toMatch(/^import Bugsnag from '@bugsnag\/expo';\sBugsnag\.start\(\);\s/)
    })
  })

  it('inserts correct code for pre v7 versions of Bugsnag (ts)', async () => {
    await withFixture('already-installed-prev7-ts', async (projectRoot) => {
      const msg = await insert(projectRoot)
      expect(msg).toBe(undefined)

      const appJs = await readFile(`${projectRoot}/App.ts`, 'utf8')
      expect(appJs).toMatch(/^import bugsnag from '@bugsnag\/expo';\sconst bugsnagClient = bugsnag\(\);\s/)
    })
  })

  it('inserts correct code for post v7.0.0 versions of Bugsnag (ts)', async () => {
    await withFixture('already-installed-postv7-ts', async (projectRoot) => {
      const msg = await insert(projectRoot)
      expect(msg).toBe(undefined)

      const appJs = await readFile(`${projectRoot}/App.ts`, 'utf8')
      expect(appJs).toMatch(/^import Bugsnag from '@bugsnag\/expo';\sBugsnag\.start\(\);\s/)
    })
  })

})
